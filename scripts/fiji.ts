/**
 * Lanza Fiji real con un macro (spec §14). En Windows se usa Fiji con interfaz (minimizado):
 * WSL2 no está disponible en este equipo (virtualización desactivada en la BIOS).
 * En Linux se puede usar `xvfb-run` con FIJI_EXE apuntando al ejecutable de Linux.
 */
import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const RAIZ = resolve(import.meta.dirname, '..');

export function rutaFiji(): string {
  const candidatas = [
    process.env.FIJI_EXE,
    join(RAIZ, '.fiji', 'Fiji', 'fiji-windows-x64.exe'),
    join(RAIZ, '.fiji', 'Fiji', 'fiji-linux-x64'),
    join(RAIZ, '.fiji', 'Fiji.app', 'ImageJ-linux64'),
  ].filter(Boolean) as string[];
  const f = candidatas.find((c) => existsSync(c));
  if (!f) throw new Error('No se encuentra Fiji. Ejecuta scripts/instalar-fiji.ps1 (o .sh en Linux).');
  return f;
}

export function fijiDisponible(): boolean {
  try {
    rutaFiji();
    return true;
  } catch {
    return false;
  }
}

export interface ResultadoFiji {
  salida: string;
  codigo: number | null;
  agotado: boolean;
}

/**
 * Ejecuta `macro` con argumento `arg`. Un macro envoltorio llama a runMacro() y cierra Fiji.
 * `batch`: usa -batch (sin interfaz); los mensajes de exit() salen por la consola.
 */
export function ejecutarMacro(
  macro: string,
  arg: string,
  { batch = false, tiempoMs = 240_000 }: { batch?: boolean; tiempoMs?: number } = {},
): Promise<ResultadoFiji> {
  const dir = mkdtempSync(join(tmpdir(), 'fpr-'));
  const rutaMacro = join(dir, 'macro.ijm');
  writeFileSync(rutaMacro, macro, 'utf8');

  let args: string[];
  if (batch) {
    args = ['--headless', '--console', '-batch', rutaMacro, arg];
  } else {
    const envoltorio = join(dir, 'envoltorio.ijm');
    const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    writeFileSync(
      envoltorio,
      `runMacro("${esc(rutaMacro)}", "${esc(arg)}");\nrun("Quit");\n`,
      'utf8',
    );
    args = ['--console', '-macro', envoltorio];
  }

  // Fiji funciona como instancia única: si queda una colgada, el siguiente macro iría a ella
  matarFiji();

  return new Promise((ok) => {
    const proc = spawn(rutaFiji(), args, { windowsHide: true });
    let salida = '';
    proc.stdout.on('data', (d) => (salida += d));
    proc.stderr.on('data', (d) => (salida += d));
    const t = setTimeout(() => {
      matarFiji(proc.pid);
      ok({ salida, codigo: null, agotado: true });
    }, tiempoMs);
    proc.on('close', (codigo) => {
      clearTimeout(t);
      ok({ salida, codigo, agotado: false });
    });
  });
}

/** Cierra Fiji y su proceso Java (árbol completo). */
export function matarFiji(pid?: number): void {
  try {
    if (process.platform === 'win32') {
      if (pid) execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
      // Java de Fiji que haya quedado suelto (solo el de esta instalación)
      const raiz = join(RAIZ, '.fiji').replace(/'/g, "''");
      execSync(
        `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -like '${raiz}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"`,
        { stdio: 'ignore' },
      );
    } else if (pid) {
      process.kill(-pid, 'SIGKILL');
    }
  } catch {
    /* ya estaba cerrado */
  }
  // Espera a que se libere el bloqueo de instancia única antes de abrir otra
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3000);
}

/** Lee un CSV de Fiji (coma, punto decimal) como lista de objetos. */
export function leerCsv(ruta: string): Record<string, string>[] {
  const lineas = readFileSync(ruta, 'utf8').trim().split(/\r?\n/);
  const cab = (lineas.shift() ?? '').split(',').map((c) => c.replace(/^"|"$/g, '').trim());
  return lineas.map((l) => {
    const v = l.split(',');
    return Object.fromEntries(cab.map((c, i) => [c, (v[i] ?? '').replace(/^"|"$/g, '').trim()]));
  });
}

export const SINTETICAS = join(RAIZ, 'scripts', 'sinteticas');
export const SALIDAS = join(RAIZ, 'scripts', 'salida');
