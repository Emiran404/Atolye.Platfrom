#!/bin/bash
set -e

VERSION="2.3.0"
PKG_NAME="atolye-platform-server"
BUILD_DIR="build_deb_tmp"

echo "📦 ${PKG_NAME} v${VERSION} Paketleniyor..."

# Temizlik ve Klasör Yapısı
rm -rf ${BUILD_DIR}
mkdir -p ${BUILD_DIR}/DEBIAN
mkdir -p ${BUILD_DIR}/opt/atolye-server
mkdir -p ${BUILD_DIR}/etc/systemd/system

# Kontrol ve Servis Dosyasını Kopyala
cp deploy/deb-server/DEBIAN/* ${BUILD_DIR}/DEBIAN/
cp deploy/deb-server/etc/systemd/system/atolye-server.service ${BUILD_DIR}/etc/systemd/system/

# Kaynak Kodunu Kopyala (Sadece gerekli olanları)
echo "📂 Kaynak kodlar kopyalanıyor..."
cp -r server ${BUILD_DIR}/opt/atolye-server/
cp -r src ${BUILD_DIR}/opt/atolye-server/
cp package.json ${BUILD_DIR}/opt/atolye-server/
cp .env ${BUILD_DIR}/opt/atolye-server/ 2>/dev/null || :

# İzinleri Düzenle
chmod 755 ${BUILD_DIR}/DEBIAN/postinst
chmod 644 ${BUILD_DIR}/etc/systemd/system/atolye-server.service

# .deb Paketini Oluştur
dpkg-deb --build --root-owner-group ${BUILD_DIR} ${PKG_NAME}_${VERSION}_all.deb

# Temizlik
rm -rf ${BUILD_DIR}

echo "✅ Başarılı! ${PKG_NAME}_${VERSION}_all.deb dosyası oluşturuldu."
