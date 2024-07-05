const electron = require('electron')

electron.contextBridge.exposeInMainWorld("electronAPI", {
    on: (channel, callback) => {
        electron.ipcRenderer.on(channel, callback);
    },
    send: (channel, args) => {
        electron.ipcRenderer.send(channel, args);
    }
});
