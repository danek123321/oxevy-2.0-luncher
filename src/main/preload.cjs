const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  close: () => ipcRenderer.send('close-window'),
  minimize: () => ipcRenderer.send('minimize-window'),
  launch: (data) => ipcRenderer.invoke('launch-game', data),
  forceStop: () => ipcRenderer.invoke('force-stop'),
  getLauncherConfig: () => ipcRenderer.invoke('get-launcher-config'),
  checkInstallation: () => ipcRenderer.invoke('check-installation'),
  getUserConfig: () => ipcRenderer.invoke('get-user-config'),
  saveUserConfig: (config) => ipcRenderer.invoke('save-user-config', config),
  closeLauncher: () => ipcRenderer.send('close-window'),
  checkOxevyInstalled: () => ipcRenderer.invoke('check-oxevy-installed'),
  downloadOxevy: () => ipcRenderer.invoke('download-oxevy'),
  onProgress: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('launch-progress', listener);
    return () => ipcRenderer.removeListener('launch-progress', listener);
  },
  onLaunchState: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('launch-state', listener);
    return () => ipcRenderer.removeListener('launch-state', listener);
  }
});
