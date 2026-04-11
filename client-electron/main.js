import { app, BrowserWindow, ipcMain } from 'electron';
import { Bonjour } from 'bonjour-service';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let splashWindow;
let currentServerUrl = null;
let isDiscoveryFound = false;
const bonjour = new Bonjour();

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 450, // Biraz daha geniş ve yüksek (Yeni tasarım için)
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
  if (mainWindow) {
    mainWindow.loadURL(url);
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    title: "Atolye Platform",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true, // Hata sayfasında IP girmek için geçici gerekli, React için kısıtlayacağız
      contextIsolation: false
    }
  });

  mainWindow.loadURL(url);

  // Sayfa yükleme hatası (Sunucu kapalıyken reload veya drop)
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log(`⚠️ Yükleme Hatası (${errorCode}): ${errorDescription}`);
    // -105, -102 gibi network hatalarında error.html göster
    if (errorCode !== -3) { // -3 is user aborted (intentional)
      mainWindow.loadFile('error.html');
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    
    // Eğer error.html yüklenmemişse göster
    if (!mainWindow.webContents.getURL().includes('error.html')) {
      mainWindow.show();
      mainWindow.maximize();
    } else {
      mainWindow.show(); // Hata sayfasını da göster
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // MANUEL BAĞLANTI İÇİN IPC DİSTRİBÜTÖRÜ
  ipcMain.on('manual-connect', (event, host) => {
    const url = host.startsWith('http') ? host : `http://${host}:3001`;
    console.log(`🔌 Manuel bağlantı isteği: ${url}`);
    currentServerUrl = url;
    isDiscoveryFound = true;
    
    if (!mainWindow) {
      createMainWindow(url);
    } else {
      mainWindow.loadURL(url);
    }

    // Ekranı anında zorla geçiş yap (Splash'te asılı kalmayı engelle)
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.maximize();
      }
      if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
      }
    }, 500); // 500ms geçiş animasyonu payı
  });
}

// mDNS Taraması Başlat (Sürekli Çalışır)
function startDiscovery() {
  console.log('🔍 Sunucu aranıyor...');
  const browser = bonjour.find({ type: 'atolye' });

  browser.on('up', (service) => {
    // Sunucunun yayınladığı tüm adresleri dene (Önemli: referrer yerine addresses daha garantidir)
    const addresses = service.addresses || [service.referer.address];
    console.log(`🔍 mDNS Servis Bulundu (${service.name}), adresler: ${addresses.join(', ')}`);

    for (const ip of addresses) {
      // IPv6 adreslerini şimdilik atla (Genelde sorun çıkarır)
      if (ip.includes(':')) continue;
      
      const url = `http://${ip}:${service.port}`;
      
      if (!isDiscoveryFound || (mainWindow && mainWindow.webContents.getURL().includes('error.html'))) {
          console.log(`✅ Sunucu Deneniyor: ${url}`);
          currentServerUrl = url;
          isDiscoveryFound = true;
          createMainWindow(url);
          // 1.0.0'da stop vardı ama resilience için açık bırakıyoruz, ancak createMainWindow içinde kontrol var
          break;
      }
    }
  });

  // Hata durumunda Periyodik Kontrol (Fallback & Localhost check)
  setInterval(async () => {
    if (!isDiscoveryFound || (mainWindow && mainWindow.webContents.getURL().includes('error.html'))) {
      const targets = ['http://localhost:3001', currentServerUrl].filter(Boolean);
      
      for (const target of targets) {
        try {
          const response = await fetch(`${target}/api/system/status`, { signal: AbortSignal.timeout(1000) });
          if (response.ok) {
            console.log(`🚀 Sunucu aktif: ${target}`);
            isDiscoveryFound = true;
            if (!mainWindow) {
              createMainWindow(target);
            } else {
              mainWindow.loadURL(target);
            }
            break;
          }
        } catch (e) {
          // ignore failures
        }
      }
    }
  }, 5000);
}

app.whenReady().then(() => {
  createSplash();
  startDiscovery();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (isDiscoveryFound && currentServerUrl) {
      createMainWindow(currentServerUrl);
    } else {
      createSplash();
    }
  }
});
