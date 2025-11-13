// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  print: (html, deviceName) => ipcRenderer.invoke("print", html, deviceName),
});
