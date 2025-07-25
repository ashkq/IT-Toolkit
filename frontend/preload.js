// Preload script for Electron security
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add any APIs that need to be exposed to the renderer process
  platform: process.platform
});