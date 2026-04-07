import { Bonjour } from 'bonjour-service';
import { exec } from 'child_process';

const bonjour = new Bonjour();

console.log('🔍 Atolye Platform Sunucusu aranıyor...');

const browser = bonjour.find({ type: 'atolye' });

browser.on('up', (service) => {
  const url = `http://${service.referer.address}:${service.port}`;
  console.log(`\n✅ Sunucu Bulundu!`);
  console.log(`📍 İsim: ${service.name}`);
  console.log(`🌐 Adres: ${url}`);
  console.log(`📦 Versiyon: ${service.txt.version || 'Bilinmiyor'}\n`);

  console.log('🚀 Tarayıcı açılıyor...');
  
  // Platforma göre tarayıcı açma komutu
  const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
  exec(`${start} ${url}`);
  
  // Bulduktan sonra dur (opsiyonel, çoklu sunucu varsa açık kalabilir)
  process.exit(0);
});

// Arama süresi (10 saniye sonra bulamazsa hata ver)
setTimeout(() => {
  console.log('\n❌ Sunucu bulunamadı. Lütfen sunucunun açık ve aynı ağda olduğundan emin olun.');
  process.exit(1);
}, 10000);
