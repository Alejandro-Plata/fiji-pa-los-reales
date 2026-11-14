// Empaqueta la app de escritorio para Windows (Electron): instalador NSIS y versión portátil en
// release/. Uso: npm run windows   (npm run publicar también lo hace y sube el instalador).
//
// La web se compila con VITE_URL_PUBLICA para que «Compartir» genere enlaces a la web pública y
// Ajustes › Actualizaciones consulte version.json.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const URL_PUBLICA = process.env.VITE_URL_PUBLICA ?? 'https://fiji-pa-los-reales.vercel.app/';
const compilar = !process.argv.includes('--sin-compilar');
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

const ejecutar = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, VITE_URL_PUBLICA: URL_PUBLICA } });
};

if (!existsSync('node_modules/electron/dist')) ejecutar('node node_modules/electron/install.js');
if (compilar) ejecutar('npm run build');
ejecutar('npx electron-builder --win --x64 --publish never');

export const instalador = `release/fiji-pa-los-reales-${version}-instalador.exe`;
export const portable = `release/fiji-pa-los-reales-${version}-portable.exe`;
console.log(`\nWindows ${version}:\n  ${instalador}\n  ${portable}`);
