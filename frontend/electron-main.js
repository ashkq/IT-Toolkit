const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');

let mainWindow;
let backendProcess;
let frontendServer;

// Create Express server to serve the React build
function createFrontendServer() {
  const expressApp = express();
  const PORT = 3000;
  
  // Serve static files from React build
  expressApp.use(express.static(path.join(__dirname, 'build')));
  
  // Handle React Router routes
  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
  
  return new Promise((resolve) => {
    frontendServer = expressApp.listen(PORT, 'localhost', () => {
      console.log(`Frontend server running on http://localhost:${PORT}`);
      resolve(`http://localhost:${PORT}`);
    });
  });
}

// Start the Python backend
function startBackend() {
  return new Promise((resolve, reject) => {
    const backendPath = path.join(__dirname, '..', 'backend');
    const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
    
    // Start the backend server
    backendProcess = spawn(pythonPath, ['-m', 'uvicorn', 'server:app', '--host', '127.0.0.1', '--port', '8001'], {
      cwd: backendPath,
      stdio: 'inherit'
    });
    
    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });
    
    // Give the backend a moment to start
    setTimeout(() => {
      resolve();
    }, 3000);
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // App icon
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Remove default menu bar
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    // Start backend first
    console.log('Starting backend server...');
    await startBackend();
    
    // Start frontend server
    console.log('Starting frontend server...');
    const frontendUrl = await createFrontendServer();
    
    // Create window and load the app
    createWindow();
    mainWindow.loadURL(frontendUrl);
    
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Clean up servers
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendServer) {
    frontendServer.close();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app termination
process.on('SIGINT', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendServer) {
    frontendServer.close();
  }
  app.quit();
});