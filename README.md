# 🎓 PolyOS Sınav Gönderme Platformu

<div align="center">

![PolyOS Banner](https://img.shields.io/badge/PolyOS-Exam_Platform-6366f1?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-2.5.5-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Passkey](https://img.shields.io/badge/Passkey-Secure-yellow?style=for-the-badge&logo=fingerprint)
![I18n](https://img.shields.io/badge/i18n-4_Languages-red?style=for-the-badge&logo=google-translate)
![Repo Size](https://img.shields.io/github/repo-size/Emiran404/Atolye.Platform)
![Stars](https://img.shields.io/github/stars/Emiran404/Atolye.Platform)
![Last Commit](https://img.shields.io/github/last-commit/Emiran404/Atolye.Platform)

**Eğitim kurumları için modern, hızlı ve güvenli sınav yönetim ve dosya gönderim platformu.**

[Özellikler](#-özellikler) • [Ekran Görüntüleri](#-görüntü-galerisi) • [Kurulum](#-kurulum) • [Teknik Detaylar](#-teknik-detaylar)

</div>

<p align="center">
  <b>Atölye.Platform, PolyOS tarafından geliştirilen bir üründür.</b>
</p>


![GitHub Repo Banner](https://banner-api-and-website-production-6dcd.up.railway.app/banner?header=%21%5Bnodedotjs%5D+At%C3%B6lye.Platform&subheader=%21%5Bvite%5DA%C3%A7%C4%B1k+kaynakl%C4%B1+bir+s%C4%B1nav+g%C3%B6nderme+ve+e%C4%9Fitim+y%C3%B6netim+platformu&bg=00000000&color=FFFFFF&subheadercolor=FFFFFF&headerfont=Roboto&subheaderfont=Open+Sans&support=false)

## 📥 İndir (v2.5.5 Hazır Paketler)

Sistemi derlemekle uğraşmadan aşağıdaki hazır paketleri GitHub üzerinden indirerek hemen kullanmaya başlayabilirsiniz:

> [!TIP]
| **Öğretmen Sunucusu** | Pardus / Linux | [📥 atolye-platform-server.deb](https://github.com/Emiran404/Atolye.Platform/releases) |
| **Masaüstü İstemci** | Windows | [📥 Atolye-Platform-Setup.exe](https://github.com/Emiran404/Atolye.Platform/releases) |
| **Masaüstü İstemci** | Pardus / Linux | [📥 atolye-platform-client.deb](https://github.com/Emiran404/Atolye.Platform/releases) |

---

## 📑 Sürüm Geçmişi

### v2.5.5 (11 Nisan 2026) - Ultimate Network Stability Patch
*   **Zero Collision mDNS:** Sunucu isimlerine benzersiz rastgele kimlikler atanarak "Service name is already in use" hatası ve çökme problemleri tamamen giderildi.
*   **Splash Screen Manual Override:** Bağlantı bulunamadığında sonsuz "Ağ Taranıyor" döngüsüne giren açılış ekranına (Splash), direkt kurtarma sağlayan "Manuel IP" giriş özelliği eklendi.
*   **Resilient IPC Flow:** Erken aşama bağlantı senaryoları için Electron ana süreci içerisindeki manuel bağlantı köprüsü onarıldı.

### v2.5.3 (9 Nisan 2026) - Universal Discovery & External Broadcast
*   **External IP Visibility:** mDNS yayını artık sadece local loopback üzerinde değil, tüm fiziksel ağ arayüzleri üzerinde aktif.
*   **Hostname Binding:** Sunucu yayını `.local` hostname'i ile standart hale getirildi, Windows-Linux arası tanınma sorunu giderildi.

### v2.5.2 (9 Nisan 2026) - Legacy Discovery & Multi-Address Support
*   **Robust mDNS (v1.0.0 Style):** Sunucu keşfi artık sadece referer IP'sine değil, yayınlanan tüm adreslere bakıyor ve IPv4 öncelikli tarama yapıyor.
*   **Multi-IP Logic:** VPN veya sanal ağlar olsa dahi gerçek sunucu IP'sini bulma ihtimali maksimize edildi.

### v2.5.1 (9 Nisan 2026) - Network Resilience & Manual IP Update
*   **Manual IP Connection:** mDNS (Bonjour) ağda bulunamadığında kullanıcıların IP adresi girerek manuel bağlanabilmesi için yeni bir UI ve altyapı eklendi.
*   **Discovery Fix:** Ağ üzerindeki keşif süreci daha esnek hale getirildi. 
*   **UI Polish:** "Hata" sayfasındaki teknik metinler sadeleştirildi.

### v2.5.0 (9 Nisan 2026) - Cinematic UI & Resilience Update
*   **Cinematic Splash Screen:** Uygulama açılışı tamamen yenilendi. Glassmorphism, gelişmiş SVG spinner ve cinematic animasyonlar eklendi.
*   **Connection Resilience:** Sunucu bağlantısı koptuğunda ekranı buzlayan (blur) ve sağ altta modern "Bağlantı Koptu" uyarısı gösteren sistem devreye alındı.
*   **Heartbeat Monitoring:** Global kalp atışı takip sistemiyle sunucu erişilebilirliği anlık izlenmeye başlandı.

### v2.4.9 (9 Nisan 2026) - Live Updates & Data Resilience
*   **Update Engine:** "Güncellemeleri Kontrol Et" butonu artık sunucu tarafındaki cache'i zorla (force) geçerek GitHub'dan anlık veri çekiyor.
*   **Storage Fix:** `storage.js` artık dosya başındaki gizli karakterleri (BOM) otomatik temizleyerek "Unexpected token" hatalarını kalıcı olarak çözdü.
*   **Version Sync:** Sunucu ve sayfa aramotorları artık restart gerekmeden en güncel sürüm bilgisini yansıtıyor.

### v2.4.8 (9 Nisan 2026) - UX & Data Integrity Fix
*   **Teacher Panel:** Yan menüye (sidebar) "Ana Sayfaya Dön" butonu eklendi.
*   **Data Security:** `server/data/` altındaki dinamik JSON dosyaları kalıcı olarak Git takibinden çıkarıldı (.gitignore).
*   **JSON Repair:** Paketleme ve veri temizliği sırasında oluşan "Unexpected token" hataları UTF-8 onarımı ile giderildi.

### v2.4.5 (7 Nisan 2026) - UI İyileştirmesi & Depo Temizliği
*   **UI Fix:** Öğretmen panelindeki "Düzenleme İzni Ver" modalı sadeleştirildi, mükerrer onay kutuları kaldırıldı.
*   **Depo Optimizasyonu:** Büyük `.deb` ve `.exe` dosyaları git geçmişinden temizlendi, GitHub Releases sistemine geçildi.
*   **Hata Yönetimi:** Dosya silme işlemlerindeki izin karmaşası giderildi.

### v2.4.0 (7 Nisan 2026) - Çift Paket Mimari & Otomatik Keşif
*   **Akıllı İstemci:** Windows (.exe) ve Pardus (.deb) için hazır Electron istemcisi eklendi.
*   **Otomatik Keşif (mDNS):** İstemciler ağdaki sunucuyu artık otomatik buluyor.
*   **Sunucu Paketleme:** Linux servis destekli `.deb` paketi hazırlandı.

### v2.3.0 (7 Nisan 2026) - Akademik Filtreleme & Görsel Yenilikler
*   **Gelişmiş Filtreleme:** Arşiv ve Değerlendirme sayfalarına sınıf ve kategori bazlı filtreleme eklendi.
*   **Modern UI:** Glassmorphism ve yapışkan filtre panelleri ile arayüz güncellendi.

---

## ✨ Özellikler

### 👨‍🏫 Öğretmen Paneli
*   **Gelişmiş Dashboard:** İstatistik kartları ve anlık aktivite akışı ile sistemi takip edin.
*   **Sınav Yönetimi:** Kolayca yeni sınavlar oluşturun, süreleri yönetin ve ek süre tanımlayın.
*   **Akıllı Değerlendirme:** Öğrenci yüklemelerini yan yana (split-view) inceleyin ve anında notlandırın.
*   **Geri Bildirim:** Öğrencilere özel notlar ve düzeltmeler iletin.
*   **Güvenli Sıfırlama:** Çift onaylı ve bakım scriptli güvenli sistem sıfırlama mekanizması.

### 👨‍🎓 Öğrenci Paneli
*   **Odaklanmış Arayüz:** Sadece aktif sınavlara ve kendi başarısına odaklanan sade tasarım.
*   **Sürükle-Bırak:** Gelişmiş dosya yükleme sistemi ile hızlı teslim.
*   **Dil Desteği:** TR, EN, RU ve DE dillerinde tam uyumlu arayüz.
*   **Passkey Giriş:** Şifre derdi olmadan biyometrik (parmak izi/yüz tanıma) güvenli giriş.

---

## 📸 Görüntü Galerisi

<div align="center">

### 🖥️ Öğretmen Dashboard
![Teacher Dashboard](screenshots/Teacher/Dashboard.png)
*Modern istatistik kartları ve canlı sistem takibi*

<br/>

### 📝 Sınav Giriş Ekranı
![Student Page](screenshots/Student/Dashboard.png)
*Öğrenciler için sade ve anlaşılır sınav katılım arayüzü*

<br/>

### ➕ Sınav Oluşturma Paneli
![Create Exam](screenshots/Teacher/CreateExam.png)
*Esnek süre ve soru seçenekleri ile hızlı sınav hazırlama*

<br/>

### 🎓 Notlandırma ve Değerlendirme
![Grading](screenshots/Teacher/Evaluation.png)
*Öğrenci dosyalarını inceleme ve anlık geri bildirim ekranı*

<br/>

### 👥 Kullanıcı Yönetimi
![User Management](screenshots/Teacher/UserManagement.png)
*Öğrenci ve öğretmen hesaplarını toplu yönetme arayüzü*

<br/>

### 🚩 Öğrenci Sınavı
![Support](screenshots/Student/Exam.png)
*Öğrenciler için sade ve anlaşılır sınav arayüzü*

<br/>

### 🔐 Güvenlik ve Ayarlar
![Security](screenshots/Teacher/Settings.png)
*Passkey desteği ve gelişmiş güvenlik yapılandırmaları*

</div>

---

## 🚀 Kurulum *git'de kurulması önerilir

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/Emiran404/Atolye.Platform.git
    cd Atolye.Platform
    ```

2.  **Bağımlılıkları Yükleyin:** (Gerekli Kontrolleri Yapacaktır.) 
    ```bash
    chmod +x kurulum.sh
    ./kurulum.sh
     ```

3.  **Başlatın:**
    ```bash
    chmod +x baslat.sh
    ./baslat.sh
    ```

---

## 🛠️ Teknik Detaylar

| Alan | Teknoloji |
| :--- | :--- |
| **Frontend** | React 18, Vite, Zustand |
| **Styling** | Vanilla CSS, Tailwind, Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express.js |
| **Veri** | JSON tabanlı (Database gerektirmez) |
| **Bakım** | .bat (Windows) & .sh (Linux/Pardus) |

---

## 🧹 Bakım ve Temizlik

Sistem sıfırlama sonrası kilitli dosyalar kalırsa, kök dizindeki şu güçlü araçları kullanabilirsiniz:

*   **Windows:** `cleanup_windows.bat`
*   **Linux/Pardus:** `cleanup_linux.sh`

Bu araçlar otomatik olarak kilitli süreçleri sonlandırır ve sistemi "Fabrika Ayarlarına" döndürür.

---

## 📄 Lisans

Bu proje **MIT** lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

---

<div align="center">

**Geliştiren: Emirhan Gök**  
Coded with love for educators worldwide. ❤️

[⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!](https://github.com/Emiran404/Atolye.Platform)

</div>
