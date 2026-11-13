/**
 * Recuento rápido y orientativo de esferas en el navegador (spec §13).
 * Pipeline equivalente al del macro de Fiji, en TypeScript sin librerías:
 *   gris → gaussiano → (bordes: varianza local + umbral | contraste: fondo + umbral)
 *   → rellenar huecos → apertura → componentes conexas (8-vecindad)
 *   → filtros de área, circularidad (4π·área/perímetro²) y borde.
 * No incluye «separar esferas pegadas» (watershed): solo se aplica en Fiji.
 */

export type MetodoUmbral = 'Otsu' | 'Default' | 'Huang' | 'Li' | 'Triangle' | 'Mean' | 'MaxEntropy' | 'Yen';

export interface ParametrosRapido {
  metodo: 'bordes' | 'umbral';
  suavizado: number;
  radioBordes: number;
  restarFondo: { activo: boolean; radio: number };
  metodoUmbral: MetodoUmbral;
  rellenarHuecos: boolean;
  limpiarRuido: boolean;
}

export interface Objeto {
  id: number;
  area: number; // píxeles
  perimetro: number; // píxeles
  circularidad: number;
  tocaBorde: boolean;
  /** Índices de los píxeles del contorno (para dibujarlo). */
  contorno: Uint32Array;
}

export interface ResultadoRapido {
  ancho: number;
  alto: number;
  objetos: Objeto[];
  /** Método de umbral usado de verdad (los no implementados caen en Otsu). */
  umbralUsado: MetodoUmbral;
  milisegundos: number;
}

/** Luminancia de RGBA (como «8-bit» de ImageJ con pesos sin ponderar: (R+G+B)/3). */
export function aGris(rgba: Uint8ClampedArray | Uint8Array, n: number): Float32Array {
  const g = new Float32Array(n);
  for (let i = 0, j = 0; i < n; i++, j += 4) g[i] = (rgba[j]! + rgba[j + 1]! + rgba[j + 2]!) / 3;
  return g;
}

/** Desenfoque gaussiano separable (sigma en píxeles; núcleo hasta 3σ). */
export function gaussiano(src: Float32Array, w: number, h: number, sigma: number): Float32Array {
  if (sigma <= 0) return src;
  const r = Math.max(1, Math.ceil(sigma * 3));
  const k = new Float32Array(2 * r + 1);
  let s = 0;
  for (let i = -r; i <= r; i++) s += k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma));
  for (let i = 0; i < k.length; i++) k[i]! /= s;
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const fila = y * w;
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) {
        const xx = x + i < 0 ? 0 : x + i >= w ? w - 1 : x + i;
        acc += src[fila + xx]! * k[i + r]!;
      }
      tmp[fila + x] = acc;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) {
        const yy = y + i < 0 ? 0 : y + i >= h ? h - 1 : y + i;
        acc += tmp[yy * w + x]! * k[i + r]!;
      }
      out[y * w + x] = acc;
    }
  }
  return out;
}

/**
 * Varianza local con núcleo circular (como RankFilters de ImageJ: r² + 1).
 * Sumas acumuladas por fila: O(n · (2r+1)).
 */
export function varianza(src: Float32Array, w: number, h: number, radio: number): Float32Array {
  const r = Math.round(radio);
  const r2 = radio * radio + 1;
  const media = (w + 1) * h;
  const s1 = new Float64Array(media);
  const s2 = new Float64Array(media);
  for (let y = 0; y < h; y++) {
    const b = y * (w + 1);
    for (let x = 0; x < w; x++) {
      const v = src[y * w + x]!;
      s1[b + x + 1] = s1[b + x]! + v;
      s2[b + x + 1] = s2[b + x]! + v * v;
    }
  }
  const semiancho = new Int32Array(2 * r + 1);
  for (let dy = -r; dy <= r; dy++) semiancho[dy + r] = Math.floor(Math.sqrt(Math.max(0, r2 - dy * dy)));
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let n = 0;
      let a = 0;
      let b2 = 0;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        const sw = semiancho[dy + r]!;
        const x0 = Math.max(0, x - sw);
        const x1 = Math.min(w - 1, x + sw);
        const base = yy * (w + 1);
        n += x1 - x0 + 1;
        a += s1[base + x1 + 1]! - s1[base + x0]!;
        b2 += s2[base + x1 + 1]! - s2[base + x0]!;
      }
      const m = a / n;
      out[y * w + x] = Math.max(0, b2 / n - m * m);
    }
  }
  return out;
}

/** Histograma de 256 clases entre el mínimo y el máximo (como ImageJ con imágenes de 32 bits). */
function histograma(v: Float32Array): { h: Float64Array; min: number; paso: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const x of v) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  const paso = max > min ? (max - min) / 256 : 1;
  const h = new Float64Array(256);
  for (const x of v) h[Math.min(255, Math.floor((x - min) / paso))]!++;
  return { h, min, paso };
}

function otsu(h: Float64Array): number {
  let total = 0;
  let suma = 0;
  for (let i = 0; i < 256; i++) {
    total += h[i]!;
    suma += i * h[i]!;
  }
  let sB = 0;
  let wB = 0;
  let mejor = 0;
  let k = 0;
  for (let i = 0; i < 256; i++) {
    wB += h[i]!;
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sB += i * h[i]!;
    const mB = sB / wB;
    const mF = (suma - sB) / wF;
    const entre = wB * wF * (mB - mF) ** 2;
    if (entre > mejor) {
      mejor = entre;
      k = i;
    }
  }
  return k;
}

function triangulo(h: Float64Array): number {
  let min = 0;
  while (min < 255 && h[min] === 0) min++;
  let max = 255;
  while (max > 0 && h[max] === 0) max--;
  let pico = 0;
  for (let i = 0; i < 256; i++) if (h[i]! > h[pico]!) pico = i;
  const lejos = pico - min > max - pico ? min : max;
  const nx = h[pico]! ;
  const ny = lejos - pico;
  const d = Math.hypot(nx, ny);
  let mejor = -1;
  let k = pico;
  const [a, b] = lejos < pico ? [lejos, pico] : [pico, lejos];
  for (let i = a; i <= b; i++) {
    const dist = Math.abs(nx * (i - pico) - ny * (h[i]! - h[pico]!)) / d;
    if (dist > mejor) {
      mejor = dist;
      k = i;
    }
  }
  return k;
}

function mediaHist(h: Float64Array): number {
  let t = 0;
  let s = 0;
  for (let i = 0; i < 256; i++) {
    t += h[i]!;
    s += i * h[i]!;
  }
  return Math.floor(s / t);
}

export function umbralAutomatico(
  v: Float32Array,
  metodo: MetodoUmbral,
): { valor: number; usado: MetodoUmbral } {
  const { h, min, paso } = histograma(v);
  let k: number;
  let usado: MetodoUmbral = metodo;
  if (metodo === 'Triangle') k = triangulo(h);
  else if (metodo === 'Mean') k = mediaHist(h);
  else {
    k = otsu(h);
    usado = 'Otsu';
  }
  return { valor: min + (k + 1) * paso, usado };
}

/** Rellena huecos: lo que no se alcanza desde el borde por el fondo pasa a objeto. */
export function rellenarHuecos(m: Uint8Array, w: number, h: number): void {
  const alcanzado = new Uint8Array(w * h);
  const pila: number[] = [];
  const empujar = (i: number) => {
    if (!m[i] && !alcanzado[i]) {
      alcanzado[i] = 1;
      pila.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    empujar(x);
    empujar((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    empujar(y * w);
    empujar(y * w + w - 1);
  }
  while (pila.length) {
    const i = pila.pop()!;
    const x = i % w;
    if (x > 0) empujar(i - 1);
    if (x < w - 1) empujar(i + 1);
    if (i >= w) empujar(i - w);
    if (i < w * (h - 1)) empujar(i + w);
  }
  for (let i = 0; i < w * h; i++) if (!m[i] && !alcanzado[i]) m[i] = 1;
}

/** Apertura binaria 3×3 (erosión + dilatación, como «Open» de ImageJ con count = 1). */
export function apertura(m: Uint8Array, w: number, h: number): Uint8Array {
  const vecinos = (src: Uint8Array, x: number, y: number, valor: number) => {
    let c = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const xx = x + dx;
        const yy = y + dy;
        // Fuera de la imagen cuenta como fondo (BlackBackground)
        const v = xx < 0 || yy < 0 || xx >= w || yy >= h ? 0 : src[yy * w + xx]!;
        if (v === valor) c++;
      }
    return c;
  };
  const er = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      er[i] = m[i] && vecinos(m, x, y, 0) < 1 ? 1 : 0;
    }
  const di = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      di[i] = er[i] || vecinos(er, x, y, 1) >= 1 ? 1 : 0;
    }
  return di;
}

/** Componentes conexas (8-vecindad) con área, perímetro, borde y contorno. */
export function componentes(m: Uint8Array, w: number, h: number): Objeto[] {
  const etiqueta = new Int32Array(w * h);
  const objetos: Objeto[] = [];
  const pila: number[] = [];
  let id = 0;
  for (let s = 0; s < w * h; s++) {
    if (!m[s] || etiqueta[s]) continue;
    id++;
    etiqueta[s] = id;
    pila.push(s);
    let area = 0;
    let aristas = 0;
    let tocaBorde = false;
    const contorno: number[] = [];
    while (pila.length) {
      const i = pila.pop()!;
      area++;
      const x = i % w;
      const y = (i - x) / w;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) tocaBorde = true;
      // Aristas con el fondo (4-vecindad) para el perímetro
      let enContorno = false;
      const lados = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
      for (const j of lados) {
        if (j < 0 || !m[j]) {
          aristas++;
          enContorno = true;
        }
      }
      if (enContorno) contorno.push(i);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const j = yy * w + xx;
          if (m[j] && !etiqueta[j]) {
            etiqueta[j] = id;
            pila.push(j);
          }
        }
    }
    // Corrección de Crofton: las aristas de píxel sobrestiman el perímetro en 4/π
    const perimetro = (aristas * Math.PI) / 4;
    objetos.push({
      id,
      area,
      perimetro,
      circularidad: Math.min(1, (4 * Math.PI * area) / (perimetro * perimetro)),
      tocaBorde,
      contorno: Uint32Array.from(contorno),
    });
  }
  return objetos;
}

/** Fondo aproximado de «rolling ball light»: la imagen muy desenfocada; se resta para aplanar. */
function restarFondoClaro(g: Float32Array, w: number, h: number, radio: number): Float32Array {
  const fondo = gaussiano(g, w, h, radio / 2);
  const out = new Float32Array(g.length);
  for (let i = 0; i < g.length; i++) out[i] = g[i]! - fondo[i]! + 255;
  return out;
}

export function procesar(
  gris: Float32Array,
  w: number,
  h: number,
  p: ParametrosRapido,
): ResultadoRapido {
  const t0 = performance.now();
  let img = gris;
  let mascara: Uint8Array;
  let usado: MetodoUmbral;

  if (p.metodo === 'bordes') {
    img = gaussiano(img, w, h, p.suavizado);
    const v = varianza(img, w, h, p.radioBordes);
    const u = umbralAutomatico(v, p.metodoUmbral);
    usado = u.usado;
    mascara = new Uint8Array(w * h);
    for (let i = 0; i < v.length; i++) mascara[i] = v[i]! >= u.valor ? 1 : 0;
  } else {
    if (p.restarFondo.activo) img = restarFondoClaro(img, w, h, p.restarFondo.radio);
    img = gaussiano(img, w, h, p.suavizado);
    const u = umbralAutomatico(img, p.metodoUmbral);
    usado = u.usado;
    mascara = new Uint8Array(w * h);
    // Sin «dark»: los objetos son los píxeles oscuros
    for (let i = 0; i < img.length; i++) mascara[i] = img[i]! < u.valor ? 1 : 0;
  }

  if (p.rellenarHuecos) rellenarHuecos(mascara, w, h);
  if (p.limpiarRuido) mascara = apertura(mascara, w, h);
  const objetos = componentes(mascara, w, h);
  return { ancho: w, alto: h, objetos, umbralUsado: usado, milisegundos: performance.now() - t0 };
}

export interface Filtros {
  micrasPorPixel: number;
  diametroMin: number;
  diametroMax: number | null;
  circularidadMin: number;
  excluirBordes: boolean;
}

/** Diámetro equivalente en µm de un objeto (círculo de la misma área). */
export function diametroEquivalente(o: Objeto, micrasPorPixel: number): number {
  return 2 * Math.sqrt((o.area * micrasPorPixel * micrasPorPixel) / Math.PI);
}

/** Filtra los objetos como Analyze Particles (área en µm² por diámetro equivalente). */
export function filtrar(objetos: Objeto[], f: Filtros): Objeto[] {
  const areaMin = Math.PI * (f.diametroMin / 2) ** 2;
  const areaMax = f.diametroMax === null ? Infinity : Math.PI * (f.diametroMax / 2) ** 2;
  const k = f.micrasPorPixel * f.micrasPorPixel;
  return objetos.filter((o) => {
    const a = o.area * k;
    return (
      a >= areaMin &&
      a <= areaMax &&
      o.circularidad >= f.circularidadMin &&
      !(f.excluirBordes && o.tocaBorde)
    );
  });
}

/** Reescala a un máximo de `maximo` px en el lado largo (vecino más cercano por bloques). */
export function reescalar(
  gris: Float32Array,
  w: number,
  h: number,
  maximo = 2048,
): { gris: Float32Array; ancho: number; alto: number; factor: number } {
  const lado = Math.max(w, h);
  if (lado <= maximo) return { gris, ancho: w, alto: h, factor: 1 };
  const factor = lado / maximo;
  const nw = Math.round(w / factor);
  const nh = Math.round(h / factor);
  const out = new Float32Array(nw * nh);
  // Promedio de área (mantiene el ruido bajo control)
  for (let y = 0; y < nh; y++) {
    const y0 = Math.floor(y * factor);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * factor));
    for (let x = 0; x < nw; x++) {
      const x0 = Math.floor(x * factor);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * factor));
      let s = 0;
      let n = 0;
      for (let yy = y0; yy < y1 && yy < h; yy++)
        for (let xx = x0; xx < x1 && xx < w; xx++) {
          s += gris[yy * w + xx]!;
          n++;
        }
      out[y * nw + x] = s / n;
    }
  }
  return { gris: out, ancho: nw, alto: nh, factor };
}

/** Normaliza 16 bits a 8 por percentiles 0,1–99,9 (spec §13). */
export function normalizar16(datos: Uint16Array | Float32Array): Float32Array {
  const ordenados = Float32Array.from(datos).sort();
  const lo = ordenados[Math.floor(ordenados.length * 0.001)]!;
  const hi = ordenados[Math.min(ordenados.length - 1, Math.floor(ordenados.length * 0.999))]!;
  const out = new Float32Array(datos.length);
  const rango = hi > lo ? hi - lo : 1;
  for (let i = 0; i < datos.length; i++) out[i] = Math.max(0, Math.min(255, ((datos[i]! - lo) / rango) * 255));
  return out;
}
