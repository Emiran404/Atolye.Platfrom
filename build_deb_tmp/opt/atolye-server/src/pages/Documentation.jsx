import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getCurrentLanguage, changeLanguage } from '../utils/i18n';
import SystemSetupPopup from '../components/ui/SystemSetupPopup';
import { 
  Terminal, Shield, Zap, Globe, 
  ChevronDown, ArrowLeft, Info, Server, 
  Monitor, Layers, CheckCircle,
  Mail, MapPin, Code, LogIn
} from 'lucide-react';

const Documentation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuthStore();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage().toUpperCase());
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSetupRequired, setIsSetupRequired] = useState(false);

  React.useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch('/api/auth/setup-status');
        const data = await response.json();
        if (data.success && data.isSetupRequired) {
          setIsSetupRequired(true);
        }
      } catch (error) {
        console.error('Setup status check failed:', error);
      }
    };
    checkSetupStatus();
  }, []);

  const languages = [
    { code: 'TR', name: 'Türkçe' },
    { code: 'EN', name: 'English' },
    { code: 'DE', name: 'Deutsch' },
    { code: 'RU', name: 'Русский' }
  ];

  const translations = {
    TR: {
      title: 'DOKÜMANTASYON',
      subtitle: 'Atölye.Platform ve PolyOS Ekosistemi Teknik Rehberi',
      back: 'Ana Sayfaya Dön',
      polyosTitle: 'PolyOS Nedir?',
      polyosDesc: 'PolyOS, Alanya Mesleki ve Teknik Anadolu Lisesi için geliştirilmiş, Pardus işletim sistemi ile %100 uyumlu bir laboratuvar yönetim ve ödev dağıtım ekosistemidir.',
      pardusLogo: 'Pardus Uyumlu',
      pardusDesc: 'Sistemimiz yerli ve milli işletim sistemimiz Pardus (Debian tabanlı) üzerinde en yüksek performansta çalışacak şekilde optimize edilmiştir.',
      modulesTitle: 'Sistem Modülleri',
      lnaTitle: 'PolyOS LNA (Laboratory Network Assistant)',
      lnaDesc: 'Laboratuvar ağındaki veri trafiğini ve öğrenci gönderimlerini yöneten çekirdek asistan.',
      ogaTitle: 'PolyOS OGA (Online Grading Assistant)',
      ogaDesc: 'Sınavların otomatik veya manuel olarak değerlendirilmesini sağlayan öğretmen asistanı.',
      odsTitle: 'Ödev Dağıtım Sistemi',
      odsDesc: 'Öğrencilere anlık ödev gönderme ve geri toplama mekanizması.',
      securityTitle: 'Güvenlik ve Gizlilik',
      passkeyTitle: 'Biyometrik Giriş (Passkey)',
      passkeyDesc: 'Windows Hello ve Pardus biyometrik sistemleriyle entegre, şifresiz güvenli giriş.',
      obfuscationTitle: 'Kod Karıştırma (Obfuscation)',
      obfuscationDesc: 'Kaynak kodun F12 gibi araçlarla okunmasını imkansız hale getiren gelişmiş şifreleme.',
      setupTitle: 'Kurulum Rehberi',
      setupDesc: 'Sistemi kendi sunucunuzda veya yerel ağınızda çalıştırmak için gerekli adımlar.',
      requirements: 'Sistem Gereksinimleri',
      reqNode: 'Node.js v18+',
      reqDocker: 'Docker (Opsiyonel)',
      reqPardus: 'Pardus 21+ / Debian tabanlı OS',
      contactTitle: 'Destek ve İletişim',
      developer: 'Geliştirici',
      institution: 'Kurum',
      platform: 'PLATFORM',
      resources: 'KAYNAKLAR',
      contact: 'İLETİŞİM',
      labRules: 'Laboratuvar Kuralları',
      systemStatus: 'Sistem Durumu',
      documentation: 'Dokümantasyon',
      documentationLink: 'Dokümantasyon',
      allRightsReserved: 'Tüm hakları saklıdır.',
      designedBy: 'TASARIM & KODLAMA',
      features: 'Özellikler',
      labRulesNav: 'Laboratuvar Kuralları',
      login: 'Giriş Yap',
      dashboard: 'Panel',
      getStarted: 'Hemen Başla',
      studentPortal: 'Öğrenci Portalı',
      instructorPortal: 'Öğretmen Portalı',
      examSchedule: 'Sınav Takvimi',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'Bütün Ümidim',
      ataturkQuote2: 'Gençliktedir',
      platform: 'Platform',
      resources: 'Kaynaklar',
      contact: 'İletişim',
      documentationLink: 'Dokümantasyon',
      labRules: 'Laboratuvar Kuralları',
      systemStatus: 'Sistem Durumu',
      allRightsReserved: 'Tüm hakları saklıdır.',
      polyosExpansion: 'Pardus Okul Laboratuvar Yönetim ve Ödev Sistemi',
      labRulesNav: 'Laboratuvar Kuralları',
      poweredBy1: 'Atölye.Platform bir ',
      poweredBy2: ' ürünüdür.',
      pardusIntegrated: 'Pardus Eğitim Eko-sistemi ile tam entegre çalışır.'
    },
    EN: {
      title: 'DOCUMENTATION',
      subtitle: 'Technical Guide for Atölye.Platform and PolyOS Ecosystem',
      back: 'Back to Home',
      polyosTitle: 'What is PolyOS?',
      polyosDesc: 'PolyOS is a laboratory management and assignment distribution ecosystem developed for Alanya Vocational and Technical Anatolian High School, 100% compatible with the Pardus operating system.',
      pardusLogo: 'Pardus Compatible',
      pardusDesc: 'Our system is optimized to run at peak performance on our national operating system Pardus (Debian-based).',
      modulesTitle: 'System Modules',
      lnaTitle: 'PolyOS LNA (Laboratory Network Assistant)',
      lnaDesc: 'The core assistant managing data traffic and student submissions in the lab network.',
      ogaTitle: 'PolyOS OGA (Online Grading Assistant)',
      ogaDesc: 'Teacher assistant for automatic or manual evaluation of exams.',
      odsTitle: 'Assignment Distribution System',
      odsDesc: 'Mechanism for instant assignment delivery and collection for students.',
      securityTitle: 'Security and Privacy',
      passkeyTitle: 'Biometric Login (Passkey)',
      passkeyDesc: 'Secure, passwordless login integrated with Windows Hello and Pardus biometric systems.',
      obfuscationTitle: 'Code Obfuscation',
      obfuscationDesc: 'Advanced encryption that makes source code unreadable via tools like F12.',
      setupTitle: 'Setup Guide',
      setupDesc: 'Necessary steps to run the system on your own server or local network.',
      requirements: 'System Requirements',
      reqNode: 'Node.js v18+',
      reqDocker: 'Docker (Optional)',
      reqPardus: 'Pardus 21+ / Debian-based OS',
      contactTitle: 'Support and Contact',
      developer: 'Developer',
      institution: 'Institution',
      platform: 'Platform',
      resources: 'Resources',
      contact: 'Contact',
      documentation: 'Documentation',
      documentationLink: 'Documentation',
      labRules: 'Lab Rules',
      systemStatus: 'System Status',
      allRightsReserved: 'All rights reserved.',
      designedBy: 'DESIGNED & DEVELOPED',
      features: 'Features',
      labRulesNav: 'Lab Rules',
      login: 'Login',
      getStarted: 'Get Started',
      dashboard: 'Dashboard',
      studentPortal: 'Student Portal',
      instructorPortal: 'Instructor Portal',
      examSchedule: 'Exam Schedule',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'All My Hope',
      ataturkQuote2: 'Is In Youth',
      polyosExpansion: 'Pardus School Laboratory Management and Homework System',
      labRulesNav: 'Lab Rules',
      poweredBy1: 'Atölye.Platform is a ',
      poweredBy2: ' product.',
      pardusIntegrated: 'Fully integrated with the Pardus Education Ecosystem.'
    },
    DE: {
      title: 'DOKUMENTATION',
      subtitle: 'Technischer Leitfaden für Atölye.Platform und das PolyOS-Ökosystem',
      back: 'Zurück zur Startseite',
      polyosTitle: 'Was ist PolyOS?',
      polyosDesc: 'PolyOS ist ein für die Alanya Mesleki ve Teknik Anadolu Lisesi entwickeltes Laborverwaltungs- und Aufgabenverteilungs-Ökosystem, das zu 100% mit dem Pardus-Betriebssystem kompatibel ist.',
      pardusLogo: 'Pardus Kompatibel',
      pardusDesc: 'Unser System ist dafür optimiert, auf unserem nationalen Betriebssystem Pardus (Debian-basiert) mit höchster Leistung zu laufen.',
      modulesTitle: 'Systemmodule',
      lnaTitle: 'PolyOS LNA (Labor-Netzwerkassistent)',
      lnaDesc: 'Der Kernassistent, der den Datenverkehr und die Schülereinreichungen im Labornetzwerk verwaltet.',
      ogaTitle: 'PolyOS OGA (Online-Bewertungsassistent)',
      ogaDesc: 'Lehrerassistent zur automatischen oder manuellen Bewertung von Prüfungen.',
      odsTitle: 'Aufgabenverteilungssystem',
      odsDesc: 'Mechanismus zur sofortigen Aufgabenverteilung und -abholung für Schüler.',
      securityTitle: 'Sicherheit und Datenschutz',
      passkeyTitle: 'Biometrische Anmeldung (Passkey)',
      passkeyDesc: 'Sichere, passwortlose Anmeldung, integriert in Windows Hello und biometrische Pardus-Systeme.',
      obfuscationTitle: 'Code-Obfuskation',
      obfuscationDesc: 'Fortschrittliche Verschlüsselung, die den Quellcode über Tools wie F12 unlesbar macht.',
      setupTitle: 'Installationsanleitung',
      setupDesc: 'Notwendige Schritte, um das System auf Ihrem eigenen Server oder lokalen Netzwerk auszuführen.',
      requirements: 'Systemanforderungen',
      reqNode: 'Node.js v18+',
      reqDocker: 'Docker (Optional)',
      reqPardus: 'Pardus 21+ / Debian-basiertes Betriebssystem',
      contactTitle: 'Support und Kontakt',
      developer: 'Entwickler',
      institution: 'Institution',
      platform: 'Plattform',
      resources: 'Ressourcen',
      contact: 'Kontakt',
      documentation: 'Dokumentation',
      documentationLink: 'Dokumentation',
      labRules: 'Laborregeln',
      systemStatus: 'Systemstatus',
      allRightsReserved: 'Alle Rechte vorbehalten.',
      designedBy: 'DESIGN & ENTWICKLUNG',
      login: 'Anmelden',
      dashboard: 'Dashboard',
      features: 'Funktionen',
      studentPortal: 'Studentenportal',
      instructorPortal: 'Dozentenportal',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'Meine ganze Hoffnung',
      ataturkQuote2: 'liegt in der Jugend',
      polyosExpansion: 'Pardus Schul-Laborverwaltungs- und Hausaufgabensystem',
      labRulesNav: 'Laborregeln',
      poweredBy1: 'Atölye.Platform ist ein ',
      poweredBy2: ' Produkt.',
      pardusIntegrated: 'Vollständig in das Pardus Education Ecosystem integriert.'
    },
    RU: {
      title: 'ДОКУМЕНТАЦИЯ',
      subtitle: 'Техническое руководство по Atölye.Platform и экосистеме PolyOS',
      back: 'На главную',
      polyosTitle: 'Что такое PolyOS?',
      polyosDesc: 'PolyOS — это экосистема управления лабораторией и распределения заданий, разработанная для Alanya Mesleki ve Teknik Anadolu Lisesi, на 100% совместимая с операционной системой Pardus.',
      pardusLogo: 'Совместимость с Pardus',
      pardusDesc: 'Наша система оптимизирована для работы с максимальной производительностью на нашей национальной операционной системе Pardus (на базе Debian).',
      modulesTitle: 'Модули системы',
      lnaTitle: 'PolyOS LNA (Лабораторный сетевой помощник)',
      lnaDesc: 'Основной помощник, управляющий трафиком данных и загрузками студентов в лабораторной сети.',
      ogaTitle: 'PolyOS OGA (Помощник онлайн-оценки)',
      ogaDesc: 'Помощник преподавателя для автоматической или ручной оценки экзаменов.',
      odsTitle: 'Система распределения заданий',
      odsDesc: 'Механизм мгновенной доставки и сбора заданий для студентов.',
      securityTitle: 'Безопасность и конфиденциальность',
      passkeyTitle: 'Биометрический вход (Passkey)',
      passkeyDesc: 'Безопасный вход без пароля, интегрированный с Windows Hello и биометрическими системами Pardus.',
      obfuscationTitle: 'Обфускация кода',
      obfuscationDesc: 'Усовершенствованное шифрование, которое делает исходный код нечитаемым с помощью таких инструментов, как F12.',
      setupTitle: 'Руководство по установке',
      setupDesc: 'Необходимые шаги для запуска системы на собственном сервере или в локальной сети.',
      requirements: 'Системные требования',
      reqNode: 'Node.js v18+',
      reqDocker: 'Docker (опционально)',
      reqPardus: 'Pardus 21+ / ОС на базе Debian',
      contactTitle: 'Поддержка и контакты',
      developer: 'Разработчик',
      institution: 'Учреждение',
      platform: 'Платформа',
      resources: 'Ресурсы',
      contact: 'Контакты',
      documentation: 'Документация',
      documentationLink: 'Документация',
      labRules: 'Правила Лаборатории',
      systemStatus: 'Статус Системы',
      allRightsReserved: 'Все права защищены.',
      designedBy: 'ДИЗАЙН И РАЗРАБОТКА',
      login: 'Войти',
      dashboard: 'Панель',
      features: 'Функции',
      studentPortal: 'Студенческий портал',
      instructorPortal: 'Портал для преподавателей',
      ataturk: 'Мустафа Кемаль Ататюрк',
      ataturkQuote1: 'Вся моя надежда',
      ataturkQuote2: 'на молодежь',
      polyosExpansion: 'Система управления школьной лабораторией и домашними заданиями Pardus',
      labRulesNav: 'Правила Лаборатории',
      poweredBy1: 'Atölye.Platform — это продукт ',
      poweredBy2: '.',
      pardusIntegrated: 'Полная интеграция с образовательной экосистемой Pardus.'
    }
  };

  const t = translations[currentLang] || translations.TR;

  const PolyOSBadge = ({ color = '#2463eb' }) => (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', paddingRight: '14px' }}>
      <span style={{ fontWeight: '800', color: color }}>PolyOS</span>
      <div 
        title={t.polyosExpansion}
        style={{ 
          width: '12px', 
          height: '12px', 
          borderRadius: '50%', 
          background: color, 
          color: 'white', 
          fontSize: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'help',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'absolute',
          top: '-2px',
          right: '0'
        }}
      >
        i
      </div>
    </span>
  );

  const sections = [
    {
      icon: Layers,
      title: t.modulesTitle,
      items: [
        { name: t.lnaTitle, desc: t.lnaDesc },
        { name: t.ogaTitle, desc: t.ogaDesc },
        { name: t.odsTitle, desc: t.odsDesc }
      ]
    },
    {
      icon: Shield,
      title: t.securityTitle,
      items: [
        { name: t.passkeyTitle, desc: t.passkeyDesc },
        { name: t.obfuscationTitle, desc: t.obfuscationDesc }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Lexend', sans-serif", color: '#1e293b' }}>
      {/* Sistem Kurulum Popup */}
      {isSetupRequired && <SystemSetupPopup />}

      {/* CSS Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');
        
        body {
          font-family: 'Lexend', sans-serif !important;
        }
        
        .glass-nav {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        
        .btn-3d-primary {
          transition: all 0.1s;
          box-shadow: 0px 4px 0px 0px #1d4ed8;
        }
        
        .btn-3d-primary:active {
          transform: translateY(4px);
          box-shadow: 0px 0px 0px 0px #1d4ed8;
        }
        
        .hero-mesh {
          background: radial-gradient(circle at 15% 50%, rgba(37, 99, 235, 0.1), transparent 25%), 
                      radial-gradient(circle at 85% 30%, rgba(124, 58, 237, 0.1), transparent 25%);
          background-color: #f8fafc;
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .section-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .section-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.1);
          border-color: rgba(36, 99, 235, 0.2);
        }
      `}</style>

      {/* Navigation */}
      <nav className="glass-nav" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all 0.3s'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div style={{ background: 'rgba(36, 99, 235, 0.1)', padding: '8px', borderRadius: '8px' }}>
                <Terminal style={{ width: '28px', height: '28px', color: '#2463eb' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  Atölye<span style={{ color: '#2463eb' }}>.Platform</span>
                </span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500', letterSpacing: '0.05em', marginTop: '2px' }}>
                  Developed by Emirhan Gök
                </span>
              </div>
            </div>

            {/* Center Links */}
            <div className="hidden md:flex items-center gap-8">
              <a onClick={() => navigate('/')} style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2463eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                {t.features}
              </a>
              <a onClick={() => navigate('/lab-rules')} style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2463eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                {t.labRulesNav}
              </a>
              <a style={{ fontSize: '14px', fontWeight: '600', color: '#2463eb', textDecoration: 'none', cursor: 'default' }}>
                {t.documentation}
              </a>
            </div>

            {/* Right Side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Language Selector */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    color: '#64748b',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    setShowLangMenu(true);
                    e.currentTarget.style.borderColor = 'rgba(36, 99, 235, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                  }}
                >
                  <Globe style={{ width: '16px', height: '16px' }} />
                  <span>{currentLang}</span>
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                </button>

                {showLangMenu && (
                  <div
                    onMouseLeave={() => setShowLangMenu(false)}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)',
                      padding: '8px',
                      minWidth: '160px',
                      zIndex: 100
                    }}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          const langCode = lang.code.toLowerCase();
                          changeLanguage(langCode);
                          setCurrentLang(lang.code);
                          setShowLangMenu(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '10px 12px',
                          background: currentLang === lang.code ? 'rgba(36, 99, 235, 0.08)' : 'transparent',
                          color: currentLang === lang.code ? '#2463eb' : '#64748b',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'left'
                        }}
                      >
                        <span>{lang.name}</span>
                        {currentLang === lang.code && (
                           <CheckCircle style={{ width: '14px', height: '14px' }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <button
                  onClick={() => navigate(userType === 'student' ? '/ogrenci/panel' : '/ogretmen/panel')}
                  style={{
                    background: '#0f172a',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 16px rgba(15, 23, 42, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0f172a'}
                >
                  {t.dashboard}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/ogrenci/giris')}
                  style={{
                    background: '#0f172a',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 16px rgba(15, 23, 42, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0f172a'}
                >
                  {t.login}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-mesh" style={{ 
        padding: '160px 24px 80px',
        textAlign: 'center'
      }}>
        <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.03em', color: '#0f172a' }}>{t.title}</h1>
          <p style={{ fontSize: '20px', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>{t.subtitle}</p>
        </div>
      </div>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 100px' }}>
        {/* PolyOS Info Box */}
        <div className="glass-card" style={{ 
          borderRadius: '24px', 
          padding: '48px', 
          marginBottom: '64px',
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 2fr) 1fr',
          gap: '48px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(36, 99, 235, 0.1)', padding: '12px', borderRadius: '14px' }}>
                <Monitor style={{ width: '32px', height: '32px', color: '#2463eb' }} />
              </div>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t.polyosTitle.replace('PolyOS', '')} <PolyOSBadge />
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', marginBottom: '16px', marginTop: '-12px' }}>
              ({t.polyosExpansion})
            </p>
            <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.8', marginBottom: '32px' }}>
              {t.polyosDesc}
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              background: 'white',
              padding: '20px 24px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <CheckCircle size={24} color="#10b981" />
              <span style={{ fontWeight: '600', fontSize: '16px', color: '#0f172a' }}>
                {t.poweredBy1}<PolyOSBadge />{t.poweredBy2}
              </span>
            </div>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '24px',
            padding: '40px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🐱</div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>{t.pardusLogo}</h3>
            <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.6' }}>
              {t.pardusIntegrated}
            </p>
          </div>
        </div>

        {/* Sections Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px' }}>
          {sections.map((section, idx) => (
            <div key={idx} className="glass-card section-hover" style={{ borderRadius: '24px', padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '14px', borderRadius: '14px' }}>
                  <section.icon style={{ width: '28px', height: '28px', color: '#0f172a' }} />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{section.title}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {section.items.map((item, iIdx) => (
                  <div key={iIdx}>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#2463eb', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap style={{ width: '16px', height: '16px', fill: '#2463eb' }} />
                      {item.name}
                    </h4>
                    <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Setup Section */}
        <div style={{ marginTop: '64px', background: '#0f172a', borderRadius: '32px', padding: '64px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(36, 99, 235, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px', position: 'relative' }}>
            <Server style={{ width: '40px', height: '40px', color: '#2463eb' }} />
            <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-0.02em' }}>{t.setupTitle}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6' }}>{t.setupDesc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', fontSize: '14px', color: '#38bdf8' }}>
                  git clone https://github.com/Emiran404/Atoyle.Platfrom.git
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', fontSize: '14px', color: '#38bdf8' }}>
                  ./kurulum.sh
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', fontSize: '18px', fontWeight: '700' }}>
                <Info style={{ width: '24px', height: '24px', color: '#2463eb' }} />
                {t.requirements}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[t.reqNode, t.reqPardus, t.reqDocker].map((req, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1' }}>
                    <CheckCircle style={{ width: '18px', height: '18px', color: '#10b981' }} />
                    <span style={{ fontSize: '16px' }}>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer (Same as LandingPage) */}
      <footer style={{
        position: 'relative',
        background: '#0f172a',
        color: 'white',
        padding: '80px 0 40px',
        borderTop: '1px solid #1e293b',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT8BDosZAdYpO1D8TJENw227Lgkgfp89G-wpv21Y9EKewKf5Mw30jhg0SVZUPBI0dfLZ5Wu0g3vcZEkQDSqYu9aMSJi0RMCLvDK_AbAF8Abu7scXqMTtKB8wRe9a1VG7ANoo9xBXts0Mym_eTnF0Wz8RFWhbxdwMGL1bzRP2I2HaV6QZXJ9RZIAnePtRp1y-WdTWZXZ6KmsCpWE-CIhzbHQ2XALGeRO-IYCRr-u8L8Mc7joeDVMJFRJg9-5egL9JQj_Kw_2ZTbvzVk"
            alt="Turkish Flag"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(127,29,29,0.95), rgba(127,29,29,0.9), rgba(15,23,42,0.95))', mixBlendMode: 'multiply' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgb(2,6,23), rgba(15,23,42,0.5), transparent)' }} />
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16 items-start">
            {/* Atatürk Section */}
            <div className="flex flex-col items-center text-center col-span-1 lg:col-span-1">
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ position: 'absolute', inset: '-16px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.3 }} />
                <div style={{ width: '112px', height: '112px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative', background: '#1e293b' }}>
                  <img src="/ataturk.png" alt="Mustafa Kemal Atatürk" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.25)' }} />
                </div>
              </div>
              <h2 style={{ fontSize: '28px', fontFamily: 'serif', fontStyle: 'italic', fontWeight: 500, color: 'white', marginBottom: '12px', lineHeight: '1.3', letterSpacing: '0.02em' }}>
                "{t.ataturkQuote1} <br />
                <span style={{ color: '#fca5a5' }}>{t.ataturkQuote2}</span>"
              </h2>
              <div style={{ height: '1px', width: '48px', background: 'rgba(239,68,68,0.5)', marginBottom: '12px' }} />
              <p style={{ color: '#cbd5e1', fontWeight: 500, letterSpacing: '0.1em', fontSize: '12px', textTransform: 'uppercase', opacity: 0.8 }}>{t.ataturk}</p>
            </div>

            {/* Other Columns */}
            <div className="flex flex-col gap-8 col-span-1 lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fca5a5', marginBottom: '16px' }}>{t.platform}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>
                      <a onClick={() => navigate('/ogrenci/giris')} style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s', display: 'inline-block', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textDecorationColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {t.studentPortal}
                      </a>
                    </li>
                    <li>
                      <a onClick={() => navigate('/ogretmen/giris')} style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s', display: 'inline-block', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textDecorationColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {t.instructorPortal}
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fca5a5', marginBottom: '16px' }}>{t.resources}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>
                      <a onClick={() => navigate('/lab-rules')} style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s', display: 'inline-block', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textDecorationColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {t.labRules}
                      </a>
                    </li>
                    <li>
                      <a style={{ color: 'white', fontSize: '14px', textDecoration: 'underline', textDecorationColor: '#ef4444', transition: 'all 0.2s', display: 'inline-block' }}>
                        {t.documentationLink}
                      </a>
                    </li>
                    <li>
                      <a onClick={() => navigate('/sistem-durumu')} style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s', display: 'inline-block', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textDecorationColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {t.systemStatus}
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fca5a5', marginBottom: '16px' }}>{t.contact}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                      <MapPin style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0, color: '#fca5a5' }} />
                      <span>Alanya MTAL<br />Antalya, Turkey</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <Mail style={{ width: '18px', height: '18px', color: '#fca5a5' }} />
                      <a href="https://alanyamtal.meb.k12.tr/tema/iletisim.php" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                      >
                        alanyamtal.meb.k12.tr
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: '32px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ margin: 0 }}>© 2026 Atölye Platform. {t.allRightsReserved} - <PolyOSBadge color="#94a3b8" /></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 20px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, opacity: 0.7 }}>{t.designedBy}</span>
              <div style={{ height: '16px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code style={{ width: '18px', height: '18px', color: '#fca5a5' }} />
                Emirhan Gök
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Documentation;
