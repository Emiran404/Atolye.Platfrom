import path from 'path';
import fs from 'fs-extra';
import tar from 'tar';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

const VERSION = "2.5.5";
const PKG_NAME = "atolye-platform-client";
const STAGE_DIR = path.join(root, 'build_client_deb_stage');

/**
 * .deb dosyası bir "ar" arşividir.
 */
function createArHeader(filename, size) {
    const buf = Buffer.alloc(60, ' ');
    buf.write(filename.padEnd(16), 0); // Filename
    buf.write(Math.floor(Date.now() / 1000).toString().padEnd(12), 16); // Timestamp
    buf.write('0'.padEnd(6), 28); // Owner ID
    buf.write('0'.padEnd(6), 34); // Group ID
    buf.write('100644'.padEnd(8), 40); // Mode
    buf.write(size.toString().padEnd(10), 48); // Size
    buf.write('\x60\x0A', 58); // End signature (`\n)
    return buf;
}

async function build() {
  console.log(`📦 ${PKG_NAME} v${VERSION} Paketleniyor (Manual Ar Mode)...`);

  const clientDist = path.join(root, 'client-electron', 'dist', 'linux-unpacked');

  try {
    // 1. Önce Electron Linux-unpacked var mı kontrol et
    if (!await fs.pathExists(clientDist)) {
      console.error("❌ Hata: 'client-electron/dist/linux-unpacked' bulunamadı.");
      console.log("💡 Önce şunu çalıştırın: cd client-electron && npm run build:linux-dir");
      process.exit(1);
    }

    // 2. Sahneyi temizle
    if (await fs.pathExists(STAGE_DIR)) {
      await fs.emptyDir(STAGE_DIR);
    } else {
      await fs.ensureDir(STAGE_DIR);
    }

    // 3. Klasör yapısını oluştur
    const optPath = path.join(STAGE_DIR, 'opt', 'atolye-client');
    const appsPath = path.join(STAGE_DIR, 'usr', 'share', 'applications');
    const iconsPath = path.join(STAGE_DIR, 'usr', 'share', 'icons', 'hicolor', '512x512', 'apps');
    const debianPath = path.join(STAGE_DIR, 'DEBIAN');

    await fs.ensureDir(optPath);
    await fs.ensureDir(appsPath);
    await fs.ensureDir(iconsPath);
    await fs.ensureDir(debianPath);

    // 4. Dosyaları kopyala
    console.log("📂 İstemci dosyaları kopyalanıyor...");
    await fs.copy(clientDist, optPath);

    // İkon kopyala
    const logoSrc = path.join(root, 'public', 'polyos_izma_sirküsü.png');
    if (await fs.pathExists(logoSrc)) {
      await fs.copy(logoSrc, path.join(iconsPath, 'atolye-platform.png'));
    }

    // 5. Meta verileri oluştur
    console.log("📝 Meta veriler oluşturuluyor...");
    
    // Control dosyası
    const controlContent = `Package: ${PKG_NAME}
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: amd64
Maintainer: Emirhan Gok <emirhangok@example.com>
Description: Atolye Platform Smart Client for students and teachers.
`;
    await fs.writeFile(path.join(debianPath, 'control'), controlContent);

    // Desktop dosyası
    const desktopContent = `[Desktop Entry]
Name=Atolye Platform
Exec=/opt/atolye-client/atolye-platform-client --no-sandbox
Icon=atolye-platform
Type=Application
Categories=Education;
Terminal=false
`;
    await fs.writeFile(path.join(appsPath, 'atolye-platform.desktop'), desktopContent);

    // postinst (Kurulum sonrası yetki ve menü yenileme)
    const postinstContent = `#!/bin/bash
chmod +x /opt/atolye-client/atolye-platform-client
update-desktop-database /usr/share/applications || true
gtk-update-icon-cache /usr/share/icons/hicolor || true
exit 0
`;
    await fs.writeFile(path.join(debianPath, 'postinst'), postinstContent);

    // 6. Tarball'ları oluştur
    console.log("🛠️  Tarball'lar hazırlanıyor...");
    const controlTar = path.join(root, 'client_control.tar.gz');
    const dataTar = path.join(root, 'client_data.tar.gz');

    // control.tar.gz
    await tar.c({
      gzip: true,
      cwd: debianPath,
      file: controlTar,
      portable: true,
      noPax: true,
      mtime: new Date(0)
    }, ['.']);

    // data.tar.gz
    await tar.c({
      gzip: true,
      cwd: STAGE_DIR,
      file: dataTar,
      portable: true,
      noPax: true,
      mtime: new Date(0),
      filter: (path) => !path.includes('DEBIAN')
    }, ['./opt', './usr']);

    // debian-binary dosyası
    const debianBinary = Buffer.from("2.0\n");

    // 7. Final .deb (ar) paketini birleştir
    console.log("🎁 .deb arşivi birleştiriliyor...");
    const dest = path.join(root, `${PKG_NAME}_${VERSION}_amd64.deb`);
    
    const controlBuffer = await fs.readFile(controlTar);
    const dataBuffer = await fs.readFile(dataTar);

    const fd = await fs.open(dest, 'w');
    await fs.write(fd, Buffer.from("!<arch>\n"));

    // debian-binary entry
    await fs.write(fd, createArHeader('debian-binary', debianBinary.length));
    await fs.write(fd, debianBinary);

    // control.tar.gz entry
    await fs.write(fd, createArHeader('control.tar.gz', controlBuffer.length));
    await fs.write(fd, controlBuffer);
    if (controlBuffer.length % 2 !== 0) await fs.write(fd, Buffer.from("\n"));

    // data.tar.gz entry
    await fs.write(fd, createArHeader('data.tar.gz', dataBuffer.length));
    await fs.write(fd, dataBuffer);
    if (dataBuffer.length % 2 !== 0) await fs.write(fd, Buffer.from("\n"));

    await fs.close(fd);

    // 8. Temizlik
    await fs.remove(STAGE_DIR);
    await fs.remove(controlTar);
    await fs.remove(dataTar);

    console.log(`✅ Başarılı! \n📍 Dosya: ${dest}`);
  } catch (err) {
    console.error("❌ Paketleme başarısız:", err);
    process.exit(1);
  }
}

build();
