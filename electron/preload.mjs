import { contextBridge, ipcRenderer } from 'electron';

// Import electron-log preload injection to enable log forwarding from clients (i.e. the renderer process) to the server
// (i.e. the main process).
import 'electron-log/preload.js';

contextBridge.exposeInMainWorld('electronAPI', {
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },
  send: (channel, args) => {
    ipcRenderer.send(channel, args);
  },
});
