import { Bonjour } from 'bonjour-service';

const instance = new Bonjour();
let service = null;

export const startDiscovery = (port = 3001) => {
  try {
    service = instance.publish({
      name: 'Atolye Platform Server',
      type: 'atolye',
      protocol: 'tcp',
      port: port,
      txt: {
        version: '2.3.0',
        id: 'atolye-master'
      }
    });

    console.log(`[Discovery] mDNS yayını başlatıldı: atolye-server.local (Port: ${port})`);

    service.on('up', () => {
      console.log('[Discovery] Servis ağda görünür hale geldi.');
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
