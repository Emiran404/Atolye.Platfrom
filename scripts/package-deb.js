import path from 'path';
import fs from 'fs-extra';
import tar from 'tar';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

const VERSION = "2.4.9";
const PKG_NAME = "atolye-platform-server";
const STAGE_DIR = path.join(root, 'build_deb_stage');

/**
 * .deb dosyası bir "ar" arşividir. Bu fonksiyon basit bir ar arşivleyici görevi görür.
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

  try {
    // 1. Sahneyi temizle
    if (await fs.pathExists(STAGE_DIR)) {
      await fs.emptyDir(STAGE_DIR);
    } else {
      await fs.ensureDir(STAGE_DIR);
    }

    // 2. Klasör yapısını oluştur
    const optPath = path.join(STAGE_DIR, 'opt', 'atolye-server');
    const etcPath = path.join(STAGE_DIR, 'etc', 'systemd', 'system');
    const debianPath = path.join(STAGE_DIR, 'DEBIAN');

    await fs.ensureDir(optPath);
    await fs.ensureDir(etcPath);
    await fs.ensureDir(debianPath);

    // 3. Dosyaları kopyala
    console.log("📂 Kaynak kodlar kopyalanıyor...");
    await fs.copy(path.join(root, 'server'), path.join(optPath, 'server'));
    await fs.copy(path.join(root, 'src'), path.join(optPath, 'src'));
    await fs.copy(path.join(root, 'dist'), path.join(optPath, 'dist')); // Frontend dist dahil
    await fs.copy(path.join(root, 'package.json'), path.join(optPath, 'package.json'));
    
    if (await fs.pathExists(path.join(root, '.env'))) {
      await fs.copy(path.join(root, '.env'), path.join(optPath, '.env'));
    }

    // Meta veriler
    const controlSrc = path.join(root, 'deploy', 'deb-server', 'DEBIAN', 'control');
    const postinstSrc = path.join(root, 'deploy', 'deb-server', 'DEBIAN', 'postinst');
    const serviceSrc = path.join(root, 'deploy', 'deb-server', 'etc', 'systemd', 'system', 'atolye-server.service');

    await fs.copy(controlSrc, path.join(debianPath, 'control'));
    await fs.copy(postinstSrc, path.join(debianPath, 'postinst'));
    await fs.copy(serviceSrc, path.join(etcPath, 'atolye-server.service'));

    // 4. Tarball'ları oluştur
    console.log("🛠️  Tarball'lar hazırlanıyor...");
    const controlTar = path.join(root, 'control.tar.gz');
    const dataTar = path.join(root, 'data.tar.gz');

    // control.tar.gz
    await tar.c({
      gzip: true,
      cwd: debianPath,
      file: controlTar,
      portable: true
    }, ['.']);

    // data.tar.gz
    await tar.c({
      gzip: true,
      cwd: STAGE_DIR,
      file: dataTar,
      portable: true,
      filter: (path) => !path.includes('DEBIAN') // DEBIAN klasörünü datadan çıkar
    }, ['./opt', './etc']);

    // debian-binary dosyası
    const debianBinary = Buffer.from("2.0\n");

    // 5. Final .deb (ar) paketini birleştir
    console.log("🎁 .deb arşivi birleştiriliyor...");
    const dest = path.join(root, `${PKG_NAME}_${VERSION}_all.deb`);
    
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
    if (controlBuffer.length % 2 !== 0) await fs.write(fd, Buffer.from("\n")); // Padding

    // data.tar.gz entry
    await fs.write(fd, createArHeader('data.tar.gz', dataBuffer.length));
    await fs.write(fd, dataBuffer);
    if (dataBuffer.length % 2 !== 0) await fs.write(fd, Buffer.from("\n")); // Padding

    await fs.close(fd);

    // 6. Temizlik
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
