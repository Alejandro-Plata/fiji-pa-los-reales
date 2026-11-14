// Publica una versión nueva: web oficial en Vercel, APK e instalador de Windows en GitHub Releases.
//
//   1. Subir "version" en package.json y añadir sus novedades en scripts/novedades.json.
//   2. npm run publicar      (opciones: --sin-desplegar, --sin-windows, --sin-netlify)
//
// Pasos:
//   - Pruebas, compilación web con VITE_URL_PUBLICA, APK firmado (assembleRelease) e instalador.
//   - Release vX.Y.Z en GitHub con el APK y el instalador (`gh`, sesión iniciada con gh auth login).
//   - public/descargas/version.json con las direcciones de la release → commit y push: Vercel
//     recompila la web desde GitHub y sirve version.json en /descargas/ (lo leen las apps).
//   - Netlify (dirección anterior): solo version.json para que las apps antiguas encuentren la
//     actualización, y redirección de todo lo demás a Vercel.
//
// Las actualizaciones solo se instalan sobre la app existente si el APK está firmado con la misma
// clave: la clave propia de ~/.fiji-pa-los-reales/firma/ (fuera del repositorio; ver CLAUDE.md).
import { execFileSync, execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO = 'Alejandro-Plata/fiji-pa-los-reales';
export const URL_PUBLICA = process.env.VITE_URL_PUBLICA ?? 'https://fiji-pa-los-reales.vercel.app/';
const desplegar = !process.argv.includes('--sin-desplegar');
const conNetlify = desplegar && !process.argv.includes('--sin-netlify');
const conWindows = process.platform === 'win32' && !process.argv.includes('--sin-windows');
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const etiqueta = `v${version}`;
const novedades = JSON.parse(readFileSync('scripts/novedades.json', 'utf8'))[version];
if (!Array.isArray(novedades) || novedades.length === 0) {
  console.error(`Faltan las novedades de la versión ${version} en scripts/novedades.json`);
  process.exit(1);
}

const ejecutar = (cmd, cwd = '.') => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, VITE_URL_PUBLICA: URL_PUBLICA } });
};
const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

if (desplegar) {
  try {
    gh('auth', 'status');
  } catch {
    console.error('Falta iniciar sesión en GitHub: gh auth login');
    process.exit(1);
  }
}

// ---------- 1. Compilación ----------
rmSync('android/app/build/outputs/apk/release', { recursive: true, force: true });
ejecutar('npm test');
ejecutar('npm run build');
ejecutar('npx cap sync android');
ejecutar(process.platform === 'win32' ? '.\\gradlew.bat assembleRelease' : './gradlew assembleRelease', 'android');

// Firmado con la clave propia: sin ella Gradle deja un APK «unsigned» que no se puede instalar
const apkCompilado = 'android/app/build/outputs/apk/release/app-release.apk';
if (!existsSync(apkCompilado)) {
  console.error(
    'No se ha generado app-release.apk firmado. Falta la clave de firma: ' +
      '~/.fiji-pa-los-reales/firma/firma.properties (o la ruta de FPLR_FIRMA).',
  );
  process.exit(1);
}
if (conWindows) ejecutar('node scripts/empaquetar-windows.mjs --sin-compilar');

// ---------- 2. Artefactos y version.json ----------
const carpeta = join('release', 'publicacion');
rmSync(carpeta, { recursive: true, force: true });
mkdirSync(carpeta, { recursive: true });
const descarga = (nombre) => `https://github.com/${REPO}/releases/download/${etiqueta}/${nombre}`;

const nombreApk = `fiji-pa-los-reales-${version}.apk`;
copyFileSync(apkCompilado, join(carpeta, nombreApk));
const artefactos = [join(carpeta, nombreApk)];
const publicacion = {
  version,
  apk: descarga(nombreApk),
  tamano: statSync(join(carpeta, nombreApk)).size,
  publicada: new Date().toISOString().slice(0, 10),
  novedades,
};
if (conWindows) {
  const instalador = `fiji-pa-los-reales-${version}-instalador.exe`;
  copyFileSync(join('release', instalador), join(carpeta, instalador));
  artefactos.push(join(carpeta, instalador));
  publicacion.windows = { instalador: descarga(instalador), tamano: statSync(join(carpeta, instalador)).size };
}
const json = JSON.stringify(publicacion, null, 2) + '\n';
console.log(`\nVersión ${version} lista: ${artefactos.join(', ')}`);
if (!desplegar) process.exit(0);

// ---------- 3. Release en GitHub ----------
const notas = join(carpeta, 'notas.md');
writeFileSync(
  notas,
  `${novedades.map((n) => `- ${n}`).join('\n')}\n\nWeb: ${URL_PUBLICA}\n\n` +
    '- **Android**: archivo `.apk`. Android solicita autorización para instalar aplicaciones de esa fuente.\n' +
    '- **Windows 10/11**: instalador `.exe`. SmartScreen puede mostrar un aviso la primera vez: *Más información › Ejecutar de todas formas*.\n',
);
let existe = true;
try {
  gh('release', 'view', etiqueta, '--repo', REPO);
} catch {
  existe = false;
}
if (existe) {
  console.log(`\n> gh release upload ${etiqueta} (sustituye los archivos)`);
  execFileSync('gh', ['release', 'upload', etiqueta, ...artefactos, '--clobber', '--repo', REPO], { stdio: 'inherit' });
} else {
  console.log(`\n> gh release create ${etiqueta}`);
  execFileSync(
    'gh',
    ['release', 'create', etiqueta, ...artefactos, '--repo', REPO, '--title', `Fiji pa los reales ${version}`, '--notes-file', notas, '--target', 'main'],
    { stdio: 'inherit' },
  );
}

// ---------- 4. version.json en el repositorio → Vercel ----------
mkdirSync('public/descargas', { recursive: true });
writeFileSync('public/descargas/version.json', json);
ejecutar('git add public/descargas/version.json package.json scripts/novedades.json');
try {
  ejecutar(`git commit -m "Versión ${version}"`);
} catch {
  console.log('(sin cambios que confirmar)');
}
ejecutar('git push');

// ---------- 5. Netlify (dirección anterior): puente para las apps ≤ 1.1.2 ----------
if (conNetlify) {
  const puente = join('release', 'netlify');
  rmSync(puente, { recursive: true, force: true });
  mkdirSync(join(puente, 'descargas'), { recursive: true });
  writeFileSync(join(puente, 'descargas', 'version.json'), json);
  writeFileSync(
    join(puente, '_redirects'),
    `/descargas/version.json  /descargas/version.json  200\n/*  ${URL_PUBLICA.replace(/\/$/, '')}/:splat  301!\n`,
  );
  copyFileSync('netlify.toml', join(puente, 'netlify.toml'));
  ejecutar(`netlify deploy --prod --no-build --dir "${puente}" --message "Puente a Vercel ${version}"`);
}

console.log(`\nPublicado: ${URL_PUBLICA} · https://github.com/${REPO}/releases/tag/${etiqueta}`);
