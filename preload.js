console.log('--- preload.js VERSION: [2025-06-16-1647] ---');
const { contextBridge, ipcRenderer } = require('electron');

console.log('[Preload] Preload script loaded');

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => 'pong',
  getCurrentLocation: () => ipcRenderer.invoke('getCurrentLocation'),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  getDefaultPrinter: () => ipcRenderer.invoke('get-default-printer'),
  print: (html, deviceName) => ipcRenderer.invoke('print', html, deviceName),
});