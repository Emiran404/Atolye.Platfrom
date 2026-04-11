import { Bonjour } from 'bonjour-service';
import os from 'os';

const instance = new Bonjour();
let service = null;

// Fiziksel ağ arayüzlerini ve IP'lerini bul (Yalnızca IPv4)
const getNetworkAddresses = () => {
  const addresses = [];
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Sadece IPv4 ve dahili (loopback) olmayanları al
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
};

export const startDiscovery = (port = 3001) => {
  try {
    const allIps = getNetworkAddresses();
    const mainIp = allIps.find(ip => ip.startsWith('192.168.')) || allIps[0];
    
    // mDNS yayını için hostname belirle
    const hostname = os.hostname().toLowerCase();

    const uniqueId = Math.floor(Math.random() * 10000);
    // v2.5.3: Yayını sadece local değil, tüm fiziksel adresleri kapsayacak şekilde mühürle
    service = instance.publish({
      name: `Atolye Platform Server (${hostname}-${uniqueId})`,
      type: 'atolye',
      protocol: 'tcp',
      port: port,
      host: `${hostname}.local`, // Bazı sistemler için host name zorunlu
      txt: {
        version: '2.5.3',
        id: 'atolye-master',
        ips: allIps.join(','),
        primary: mainIp,
        timestamp: Date.now().toString()
      }
    });

    console.log(`[Discovery] mDNS yayını v2.5.3 başlatıldı (${hostname}.local)`);
    console.log(`[Discovery] Birincil IP: ${mainIp} | Tüm IP'ler: ${allIps.join(', ')}`);

    service.on('up', () => {
      console.log('[Discovery] Servis ağda DIŞARIYA açıldı. mDNS sinyali yayılıyor...');
    });

    service.on('error', (err) => {
      console.error('[Discovery] mDNS hatası:', err);
    });

  } catch (err) {
    console.error('[Discovery] Başlatılamadı:', err);
  }
};

export const stopDiscovery = () => {
  if (service) {
    service.stop(() => {
      console.log('[Discovery] mDNS yayını durduruldu.');
      instance.destroy();
    });
  }
};

// Beklenmedik kapanmalarda temizlik yap
process.on('SIGINT', stopDiscovery);
process.on('SIGTERM', stopDiscovery);
