// Publica una versión nueva de la web y de la app Android en Netlify.
//
//   1. Subir "version" en package.json y añadir sus novedades en scripts/novedades.json.
//   2. npm run publicar            (o: npm run publicar -- --sin-desplegar)
//
// Compila la web con VITE_URL_PUBLICA, sincroniza Capacitor, compila el APK y lo deja en
// dist/descargas/ junto con version.json (que lee Ajustes › Actualizaciones). El APK se copia a
// dist DESPUÉS de sincronizar Android: así no acaba dentro del propio APK.
//
// Las actualizaciones solo se instalan sobre la app existente si el APK está firmado con la misma
// clave: la clave propia de ~/.fiji-pa-los-reales/firma/ (fuera del repositorio; ver CLAUDE.md).
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const URL_PUBLICA = process.env.VITE_URL_PUBLICA ?? 'https://fiji-pa-los-reales.netlify.app/';
const desplegar = !process.argv.includes('--sin-desplegar');
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const novedades = JSON.parse(readFileSync('scripts/novedades.json', 'utf8'))[version];
if (!Array.isArray(novedades) || novedades.length === 0) {
  console.error(`Faltan las novedades de la versión ${version} en scripts/novedades.json`);
  process.exit(1);
}

const ejecutar = (cmd, cwd = '.') => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, VITE_URL_PUBLICA: URL_PUBLICA } });
};

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

const nombreApk = `fiji-pa-los-reales-${version}.apk`;
mkdirSync('dist/descargas', { recursive: true });
const destino = join('dist/descargas', nombreApk);
copyFileSync(apkCompilado, destino);
const publicacion = {
  version,
  apk: nombreApk,
  tamano: statSync(destino).size,
  publicada: new Date().toISOString().slice(0, 10),
  novedades,
};
writeFileSync('dist/descargas/version.json', JSON.stringify(publicacion, null, 2));
console.log(`\nAPK ${version} listo: ${destino} (${(publicacion.tamano / 1048576).toFixed(1)} MB)`);

if (desplegar) {
  // --no-build: subir dist tal cual (una compilación de Netlify borraría dist/descargas)
  ejecutar('netlify deploy --prod --no-build --dir dist --message "Version ' + version + '"');
  console.log(`\nPublicado en ${URL_PUBLICA}`);
}
