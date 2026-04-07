# 🎓 PolyOS Sınav Gönderme Platformu

<div align="center">

![PolyOS Banner](https://img.shields.io/badge/PolyOS-Exam_Platform-6366f1?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-2.2.1-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Passkey](https://img.shields.io/badge/Passkey-Secure-yellow?style=for-the-badge&logo=fingerprint)
![I18n](https://img.shields.io/badge/i18n-4_Languages-red?style=for-the-badge&logo=google-translate)
![Repo Size](https://img.shields.io/github/repo-size/Emiran404/Atoyle.Platfrom)
![Stars](https://img.shields.io/github/stars/Emiran404/Atoyle.Platfrom)
![Last Commit](https://img.shields.io/github/last-commit/Emiran404/Atoyle.Platfrom)

**Eğitim kurumları için modern, hızlı ve güvenli sınav yönetim ve dosya gönderim platformu.**

[Özellikler](#-özellikler) • [Ekran Görüntüleri](#-görüntü-galerisi) • [Kurulum](#-kurulum) • [Teknik Detaylar](#-teknik-detaylar)

</div>

<p align="center">
  <b>Atölye.Platform, PolyOS tarafından geliştirilen bir üründür.</b>
</p>


![GitHub Repo Banner](https://banner-api-and-website-production-6dcd.up.railway.app/banner?header=%21%5Bnodedotjs%5D+At%C3%B6lye.Platform&subheader=%21%5Bvite%5DA%C3%A7%C4%B1k+kaynakl%C4%B1+bir+s%C4%B1nav+g%C3%B6nderme+ve+e%C4%9Fitim+y%C3%B6netim+platformu&bg=00000000&color=FFFFFF&subheadercolor=FFFFFF&headerfont=Roboto&subheaderfont=Open+Sans&support=false)

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

[⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!](https://github.com/Emiran404/Atolye.Platfrom)

</div>
