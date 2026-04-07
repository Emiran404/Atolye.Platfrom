import { app, BrowserWindow } from 'electron';
import { Bonjour } from 'bonjour-service';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let splashWindow;
const bonjour = new Bonjour();

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  splashWindow.loadFile('splash.html');
}

function createMainWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // found olana kadar kapalı
    title: "Atolye Platform",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(url);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// mDNS Taraması Başlat
function startDiscovery() {
  console.log('🔍 Sunucu aranıyor...');
  const browser = bonjour.find({ type: 'atolye' });

  browser.on('up', (service) => {
    const url = `http://${service.referer.address}:${service.port}`;
    console.log(`✅ Sunucu Bulundu: ${url}`);
    
    if (!mainWindow) {
      createMainWindow(url);
    }
    
    browser.stop();
  });
}

app.whenReady().then(() => {
  createSplash();
  startDiscovery();
});

// 15 saniye içinde bulamazsa hata göster (opsiyonel)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSplash();
  }
});
