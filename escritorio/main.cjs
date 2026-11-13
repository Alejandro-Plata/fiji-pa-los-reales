// App de escritorio (Windows) con Electron: la misma web compilada (dist/), sin conexión.
//
// Se sirve por un protocolo propio y seguro (app://fplr/) en lugar de file://: así funcionan los
// workers del análisis rápido, el portapapeles y fetch como en la web. Los enlaces externos se
// abren en el navegador del sistema; la ventana nunca navega fuera de la app.
const { app, BrowserWindow, Menu, ipcMain, net, protocol, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ORIGEN = 'app://fplr';
const DIST = path.join(__dirname, '..', 'dist');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true },
  },
]);

// Una sola ventana: abrir la app otra vez enfoca la existente
if (!app.requestSingleInstanceLock()) app.quit();

let ventana = null;

const esExterna = (url) => url.startsWith('https://') || url.startsWith('mailto:');

function crearVentana() {
  ventana = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 360,
    minHeight: 480,
    backgroundColor: '#ffffff',
    title: 'Fiji pa los reales',
    icon: path.join(__dirname, 'icono.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  ventana.webContents.setWindowOpenHandler(({ url }) => {
    if (esExterna(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  ventana.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith(ORIGEN)) return;
    e.preventDefault();
    if (esExterna(url)) void shell.openExternal(url);
  });

  void ventana.loadURL(`${ORIGEN}/index.html`);
}

app.on('second-instance', () => {
  if (!ventana) return;
  if (ventana.isMinimized()) ventana.restore();
  ventana.focus();
});

app.whenReady().then(() => {
  protocol.handle('app', (peticion) => {
    const { pathname } = new URL(peticion.url);
    const relativa = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    const archivo = path.normalize(path.join(DIST, relativa));
    if (!archivo.startsWith(DIST)) return new Response('', { status: 403 });
    return net.fetch(pathToFileURL(archivo).toString());
  });

  ipcMain.handle('abrir-externo', (_e, url) => {
    if (typeof url === 'string' && esExterna(url)) return shell.openExternal(url);
  });

  Menu.setApplicationMenu(null);
  crearVentana();
});

app.on('window-all-closed', () => app.quit());
