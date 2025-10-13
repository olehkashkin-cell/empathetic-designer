const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../public/icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    backgroundColor: '#0A0A0F',
    show: false,
    autoHideMenuBar: true
  });

  // В production загружаем собранное приложение
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // В dev режиме загружаем с локального сервера
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
