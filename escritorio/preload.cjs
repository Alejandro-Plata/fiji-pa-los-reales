// Puente mínimo y explícito entre la web y Electron (contextIsolation + sandbox).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fplrEscritorio', {
  plataforma: process.platform,
  /** Abre una dirección https en el navegador del sistema (p. ej. el instalador de una versión nueva). */
  abrirEnNavegador: (url) => ipcRenderer.invoke('abrir-externo', url),
});
