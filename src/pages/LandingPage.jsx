/**
 * Sınav Gönderme Platformu - Landing Page
 * 
 * Copyright (c) 2026-2027 Emirhan Gök (@Emiran404)
 * Alanya Mesleki ve Teknik Anadolu Lisesi
 * 
 * Licensed under the MIT License
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getCurrentLanguage, changeLanguage } from '../utils/i18n';
import SystemSetupPopup from '../components/ui/SystemSetupPopup';
import {
  Terminal, Globe, ChevronDown, Menu, GraduationCap, Users,
  ShieldCheck, Zap, Calendar, Award, SearchCheck, CloudUpload,
  Code, Wifi, Cpu, School, ArrowRight, MapPin, Mail, Twitter,
  Github, Lock, CheckCircle, Rocket, LogIn
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuthStore();
  const [currentLang, setCurrentLang] = React.useState(getCurrentLanguage().toUpperCase());
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const [isSetupRequired, setIsSetupRequired] = React.useState(false);

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
      features: 'Özellikler',
      labRulesNav: 'Laboratuvar Kuralları',
      documentation: 'Dokümantasyon',
      login: 'Giriş Yap',
      getStarted: 'Başlayın',
      dashboard: 'Panel',
      badge: 'v2.0 Şimdi Kullanılabilir',
      heroTitle: 'Siber Güvenlik Uzmanları',
      heroSubtitle: 'Güçlendiriyoruz',
      nextGen: 'Yeni Nesil',
      heroDescription: 'Alanya Mesleki ve Teknik Anadolu Lisesi için resmi güvenli gönderi ve laboratuvar yönetim platformu.',
      studentPortal: 'Öğrenci Portalı',
      instructorPortal: 'Öğretmen Portalı',
      secureEnvironment: 'Güvenli Ortam',
      realtime: 'Gerçek Zamanlı',
      feedbackSystem: 'Geri Bildirim Sistemi',
      cloudAccess: 'Bulut Erişimi',
      coreCapabilities: 'Temel Yetenekler',
      advancedLabFeatures: 'Gelişmiş Laboratuvar Özellikleri',
      featuresDescription: 'Modern siber güvenlik eğitimi ve yüksek performanslı bilgi işlem ihtiyaçları için tasarlandı.',
      examLockdown: 'Sınav Kilitleme',
      examLockdownDesc: 'Yüksek riskli siber güvenlik sertifika sınavları sırasında bütünlüğü sağlayan tarayıcı kilitleme özellikleri.',
      syntaxHighlighting: 'Sözdizimi Vurgulama',
      syntaxHighlightingDesc: 'Python, C++ ve Java için yerel destek ile daha hızlı kodlama için akıllı otomatik tamamlama.',
      smartScheduling: 'Akıllı Zamanlama',
      smartSchedulingDesc: 'Bilgisayar laboratuvarı slotlarını sorunsuz bir şekilde rezerve edin. Paylaşılan kaynaklar için otomatik çakışma çözümü.',
      instantGrading: 'Anında Notlandırma',
      instantGradingDesc: 'Otomatik test senaryoları kod gönderileri hakkında anında geri bildirim sağlar, öğrenmeyi hızlandırır.',
      plagiarismCheck: 'İntihal Kontrolü',
      plagiarismCheckDesc: 'Orijinalliği sağlamak için öğrenci veritabanları ve çevrimiçi depolara karşı kontrol eden gelişmiş algoritmalar.',
      cloudStorage: 'Bulut Depolama',
      cloudStorageDesc: 'Tüm ödevler için güvenli, şifrelenmiş bulut yedeklemesi. İlerlemenizi asla kaybetmeyin.',
      ourInstitution: 'Kurumumuz',
      institutionTitle: 'Alanya Mesleki ve Teknik Anadolu Lisesi',
      institutionDesc: 'Yeni nesil teknoloji liderleri için donatılmış son teknoloji bilgisayar laboratuvarları. Tesislerimiz ağ güvenliği, etik hackleme ve yazılım geliştirmede uygulamalı öğrenmeyi destekler.',
      highPerformanceHardware: 'Yüksek Performanslı Donanım',
      highPerformanceHardwareDesc: 'Sanallaştırma laboratuvarları için en son nesil işlemciler.',
      gigabitInfrastructure: 'Güvenli Altyapı',
      gigabitInfrastructureDesc: 'Anında dağıtım için fiber optik omurga.',
      learnMore: 'Tesislerimiz hakkında daha fazla bilgi edinin',
      readyToLaunch: 'Kariyerinizi başlatmaya hazır mısınız?',
      readyToLaunchDesc: 'En iyi öğretmenler ve öğrenciler tarafından kullanılan platforma katılın. Teknolojideki geleceğinizi bugün güvence altına alın.',
      loginToDashboard: 'Panele Giriş Yap',
      viewCourseCatalog: 'Kayıt Ol',
      builtWithPride: 'Alanya Mesleki ve Teknik Anadolu Lisesi için gururla yapılmıştır',
      builtBy: 'tarafından',
      platform: 'Platform',
      resources: 'Kaynaklar',
      contact: 'İletişim',
      studentPortal: 'Öğrenci Portalı',
      instructorPortal: 'Öğretmen Portalı',
      examSchedule: 'Sınav Programı',
      gradebook: 'Not Defteri',
      documentationLink: 'Dokümantasyon',
      labRules: 'Laboratuvar Kuralları',
      supportTicket: 'Destek Talebi',
      systemStatus: 'Sistem Durumu',
      location: 'Alanya, Antalya\nTürkiye',
      allRightsReserved: 'Tüm hakları saklıdır.',
      designedBy: 'Tasarım & Geliştirme',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'Bütün Ümidim',
      ataturkQuote2: 'Gençliktedir',
      polyosExpansion: 'Pardus Okul Laboratuvar Yönetim ve Ödev Sistemi'
    },
    EN: {
      features: 'Features',
      labRulesNav: 'Lab Rules',
      documentation: 'Documentation',
      login: 'Log In',
      getStarted: 'Get Started',
      dashboard: 'Dashboard',
      badge: 'v2.0 Now Available',
      heroTitle: 'Cybersecurity Experts',
      heroSubtitle: 'Empowering the',
      nextGen: 'Next Gen',
      heroDescription: 'The official secure submission & lab management platform for Alanya Mesleki ve Teknik Anadolu Lisesi.',
      studentPortal: 'Student Portal',
      instructorPortal: 'Instructor Portal',
      secureEnvironment: 'Secure Environment',
      realtime: 'Real-time',
      feedbackSystem: 'Feedback System',
      cloudAccess: 'Cloud Access',
      coreCapabilities: 'Core Capabilities',
      advancedLabFeatures: 'Advanced Lab Features',
      featuresDescription: 'Designed for the rigorous needs of modern cybersecurity education and high-performance computing.',
      examLockdown: 'Exam Lockdown',
      examLockdownDesc: 'Browser lockdown capabilities ensuring integrity during high-stakes cybersecurity certification exams.',
      syntaxHighlighting: 'Syntax Highlighting',
      syntaxHighlightingDesc: 'Native support for Python, C++, and Java with intelligent autocomplete for faster coding.',
      smartScheduling: 'Smart Scheduling',
      smartSchedulingDesc: 'Book computer lab slots seamlessly. Automatic conflict resolution for shared resources.',
      instantGrading: 'Instant Grading',
      instantGradingDesc: 'Automated test cases provide immediate feedback on code submissions, accelerating learning.',
      plagiarismCheck: 'Plagiarism Check',
      plagiarismCheckDesc: 'Advanced algorithms check against student databases and online repositories to ensure originality.',
      cloudStorage: 'Cloud Storage',
      cloudStorageDesc: 'Secure, encrypted cloud backup for all assignments. Never lose your progress again.',
      ourInstitution: 'Our Institution',
      institutionTitle: 'Alanya Mesleki ve Teknik Anadolu Lisesi',
      institutionDesc: 'State-of-the-art computer labs equipped for the next generation of tech leaders. Our facilities support hands-on learning in network security, ethical hacking, and software development.',
      highPerformanceHardware: 'High-Performance Hardware',
      highPerformanceHardwareDesc: 'Latest gen processors for virtualization labs.',
      gigabitInfrastructure: 'Secure Infrastructure',
      gigabitInfrastructureDesc: 'Fiber-optic backbone for instant deployment.',
      learnMore: 'Learn more about our facilities',
      readyToLaunch: 'Ready to launch your career?',
      readyToLaunchDesc: 'Join the platform used by top instructors and students. Secure your future in technology today.',
      loginToDashboard: 'Log In to Dashboard',
      viewCourseCatalog: 'Register',
      builtWithPride: 'Built with pride for Alanya Mesleki ve Teknik Anadolu Lisesi by',
      builtBy: 'by',
      platform: 'Platform',
      resources: 'Resources',
      contact: 'Contact',
      studentPortal: 'Student Portal',
      instructorPortal: 'Instructor Portal',
      examSchedule: 'Exam Schedule',
      gradebook: 'Gradebook',
      documentationLink: 'Documentation',
      labRules: 'Lab Rules',
      supportTicket: 'Support Ticket',
      systemStatus: 'System Status',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'All My Hope',
      ataturkQuote2: 'Is In Youth',
      location: 'Alanya, Antalya\nTurkey',
      allRightsReserved: 'All rights reserved.',
      designedBy: 'Designed & Built by',
      polyosExpansion: 'Pardus School Laboratory Management and Homework System'
    },
    DE: {
      features: 'Funktionen',
      labRulesNav: 'Laborregeln',
      documentation: 'Dokumentation',
      login: 'Anmelden',
      getStarted: 'Loslegen',
      dashboard: 'Dashboard',
      badge: 'v2.0 Jetzt Verfügbar',
      heroTitle: 'Cybersicherheitsexperten',
      heroSubtitle: 'Stärken der',
      nextGen: 'Nächsten Generation',
      heroDescription: 'Die offizielle sichere Einreichungs- und Laborverwaltungsplattform für Alanya Mesleki ve Teknik Anadolu Lisesi.',
      studentPortal: 'Studentenportal',
      instructorPortal: 'Lehrerportal',
      secureEnvironment: 'Sichere Umgebung',
      realtime: 'Echtzeit',
      feedbackSystem: 'Feedback-System',
      cloudAccess: 'Cloud-Zugriff',
      coreCapabilities: 'Kernfunktionen',
      advancedLabFeatures: 'Erweiterte Laborfunktionen',
      featuresDescription: 'Entwickelt für die strengen Anforderungen moderner Cybersicherheitsausbildung und Hochleistungsrechner.',
      examLockdown: 'Prüfungssperre',
      examLockdownDesc: 'Browser-Sperrfunktionen zur Gewährleistung der Integrität bei wichtigen Cybersicherheitszertifizierungsprüfungen.',
      syntaxHighlighting: 'Syntax-Hervorhebung',
      syntaxHighlightingDesc: 'Native Unterstützung für Python, C++ und Java mit intelligenter Autovervollständigung für schnelleres Codieren.',
      smartScheduling: 'Intelligente Planung',
      smartSchedulingDesc: 'Buchen Sie nahtlos Computerlaborplätze. Automatische Konfliktlösung für gemeinsam genutzte Ressourcen.',
      instantGrading: 'Sofortige Bewertung',
      instantGradingDesc: 'Automatisierte Testfälle bieten sofortiges Feedback zu Code-Einreichungen und beschleunigen das Lernen.',
      plagiarismCheck: 'Plagiatsprüfung',
      plagiarismCheckDesc: 'Fortschrittliche Algorithmen prüfen gegen Studentendatenbanken und Online-Repositorys, um Originalität sicherzustellen.',
      cloudStorage: 'Cloud-Speicher',
      cloudStorageDesc: 'Sichere, verschlüsselte Cloud-Sicherung für alle Aufgaben. Verlieren Sie nie wieder Ihren Fortschritt.',
      ourInstitution: 'Unsere Institution',
      institutionTitle: 'Alanya Mesleki ve Teknik Anadolu Lisesi',
      institutionDesc: 'Hochmoderne Computerlabore für die nächste Generation von Technologieführern. Unsere Einrichtungen unterstützen praktisches Lernen in Netzwerksicherheit, ethischem Hacking und Softwareentwicklung.',
      highPerformanceHardware: 'Hochleistungshardware',
      highPerformanceHardwareDesc: 'Prozessoren der neuesten Generation für Virtualisierungslabore.',
      gigabitInfrastructure: 'Sichere Infrastruktur',
      gigabitInfrastructureDesc: 'Glasfaser-Backbone für sofortige Bereitstellung.',
      learnMore: 'Erfahren Sie mehr über unsere Einrichtungen',
      readyToLaunch: 'Bereit, Ihre Karriere zu starten?',
      readyToLaunchDesc: 'Treten Sie der Plattform bei, die von Top-Lehrern und Studenten genutzt wird. Sichern Sie sich Ihre Zukunft in der Technologie noch heute.',
      loginToDashboard: 'Zum Dashboard anmelden',
      viewCourseCatalog: 'Registrieren',
      builtWithPride: 'Mit Stolz für Alanya Mesleki ve Teknik Anadolu Lisesi erstellt von',
      builtBy: 'von',
      platform: 'Plattform',
      resources: 'Ressourcen',
      contact: 'Kontakt',
      studentPortal: 'Studentenportal',
      instructorPortal: 'Lehrerportal',
      examSchedule: 'Prüfungsplan',
      gradebook: 'Notenbuch',
      documentationLink: 'Dokumentation',
      labRules: 'Laborregeln',
      supportTicket: 'Support-Ticket',
      systemStatus: 'Systemstatus',
      location: 'Alanya, Antalya\nTürkei',
      allRightsReserved: 'Alle Rechte vorbehalten.',
      designedBy: 'Entworfen & Erstellt von',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'Meine ganze Hoffnung',
      ataturkQuote2: 'liegt in der Jugend',
      polyosExpansion: 'Pardus Schul-Laborverwaltungs- und Hausaufgabensystem'
    },
    RU: {
      features: 'Функции',
      labRulesNav: 'Правила Лаборатории',
      documentation: 'Документация',
      login: 'Войти',
      getStarted: 'Начать',
      dashboard: 'Панель',
      badge: 'v2.0 Теперь Доступно',
      heroTitle: 'Экспертов по Кибербезопасности',
      heroSubtitle: 'Расширяем Возможности',
      nextGen: 'Следующего Поколения',
      heroDescription: 'Официальная платформа безопасной отправки и управления лабораториями для Alanya Mesleki ve Teknik Anadolu Lisesi.',
      studentPortal: 'Портал Студента',
      instructorPortal: 'Портал Преподавателя',
      secureEnvironment: 'Безопасная Среда',
      realtime: 'В реальном времени',
      feedbackSystem: 'Система Обратной Связи',
      cloudAccess: 'Облачный Доступ',
      coreCapabilities: 'Основные Возможности',
      advancedLabFeatures: 'Расширенные Функции Лаборатории',
      featuresDescription: 'Разработано для строгих требований современного образования в области кибербезопасности и высокопроизводительных вычислений.',
      examLockdown: 'Блокировка Экзамена',
      examLockdownDesc: 'Возможности блокировки браузера, обеспечивающие целостность во время важных сертификационных экзаменов по кибербезопасности.',
      syntaxHighlighting: 'Подсветка Синтаксиса',
      syntaxHighlightingDesc: 'Встроенная поддержка Python, C++ и Java с интеллектуальным автозаполнением для более быстрого кодирования.',
      smartScheduling: 'Умное Планирование',
      smartSchedulingDesc: 'Бесшовное бронирование мест в компьютерной лаборатории. Автоматическое разрешение конфликтов для общих ресурсов.',
      instantGrading: 'Мгновенная Оценка',
      instantGradingDesc: 'Автоматизированные тестовые случаи обеспечивают немедленную обратную связь по отправкам кода, ускоряя обучение.',
      plagiarismCheck: 'Проверка на Плагиат',
      plagiarismCheckDesc: 'Продвинутые алгоритмы проверяют базы данных студентов и онлайн-репозитории для обеспечения оригинальности.',
      cloudStorage: 'Облачное Хранилище',
      cloudStorageDesc: 'Безопасное, зашифрованное облачное резервное копирование для всех заданий. Никогда не теряйте свой прогресс.',
      ourInstitution: 'Наше Учреждение',
      institutionTitle: 'Alanya Mesleki ve Teknik Anadolu Lisesi',
      institutionDesc: 'Современные компьютерные лаборатории, оснащенные для следующего поколения технологических лидеров. Наши помещения поддерживают практическое обучение в области сетевой безопасности, этичного взлома и разработки программного обеспечения.',
      highPerformanceHardware: 'Высокопроизводительное Оборудование',
      highPerformanceHardwareDesc: 'Процессоры последнего поколения для лабораторий виртуализации.',
      gigabitInfrastructure: 'Безопасная Инфраструктура',
      gigabitInfrastructureDesc: 'Оптоволоконная магистраль для мгновенного развертывания.',
      learnMore: 'Узнайте больше о наших помещениях',
      readyToLaunch: 'Готовы начать свою карьеру?',
      readyToLaunchDesc: 'Присоединяйтесь к платформе, используемой лучшими преподавателями и студентами. Обеспечьте свое будущее в технологиях сегодня.',
      loginToDashboard: 'Войти в Панель',
      viewCourseCatalog: 'Зарегистрироваться',
      builtWithPride: 'Создано с гордостью для Alanya Mesleki ve Teknik Anadolu Lisesi',
      builtBy: '',
      platform: 'Платформа',
      resources: 'Ресурсы',
      contact: 'Контакты',
      studentPortal: 'Портал Студента',
      instructorPortal: 'Портал Преподавателя',
      examSchedule: 'Расписание Экзаменов',
      gradebook: 'Журнал Оценок',
      documentationLink: 'Документация',
      labRules: 'Правила Лаборатории',
      supportTicket: 'Заявка в Поддержку',
      systemStatus: 'Статус Системы',
      location: 'Аланья, Анталья\nТурция',
      allRightsReserved: 'Все права защищены.',
      designedBy: 'Разработано и Создано',
      ataturk: 'Мустафа Кемаль Ататюрк',
      ataturkQuote1: 'Вся моя надежда',
      ataturkQuote2: 'на молодежь',
      polyosExpansion: 'Система управления школьной лабораторией и домашними заданиями Pardus'
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

  const features = [
    {
      icon: Lock,
      title: t.examLockdown,
      description: t.examLockdownDesc,
      color: '#2463eb'
    },
    {
      icon: Code,
      title: t.syntaxHighlighting,
      description: t.syntaxHighlightingDesc,
      color: '#7c3aed'
    },
    {
      icon: Calendar,
      title: t.smartScheduling,
      description: t.smartSchedulingDesc,
      color: '#10b981'
    },
    {
      icon: Award,
      title: t.instantGrading,
      description: t.instantGradingDesc,
      color: '#f59e0b'
    },
    {
      icon: SearchCheck,
      title: t.plagiarismCheck,
      description: t.plagiarismCheckDesc,
      color: '#ef4444'
    },
    {
      icon: CloudUpload,
      title: t.cloudStorage,
      description: t.cloudStorageDesc,
      color: '#0ea5e9'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Lexend, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      overflowX: 'hidden'
    }}>
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
        
        .btn-3d-secondary {
          transition: all 0.1s;
          box-shadow: 0px 4px 0px 0px #6d28d9;
        }
        
        .btn-3d-secondary:active {
          transform: translateY(4px);
          box-shadow: 0px 0px 0px 0px #6d28d9;
        }
        
        .hero-mesh {
          background: radial-gradient(circle at 15% 50%, rgba(37, 99, 235, 0.25), transparent 25%), 
                      radial-gradient(circle at 85% 30%, rgba(124, 58, 237, 0.25), transparent 25%);
          background-color: #f8fafc;
        }
        
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        
        @keyframes rotate-icon {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(12deg); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        .group:hover .group-hover-rotate {
          animation: rotate-icon 0.3s ease-in-out;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
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
              <a href="#features" style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
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
              <a onClick={() => navigate('/dokumantasyon')} style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2463eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
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

                {/* Language Dropdown */}
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
                        onMouseEnter={(e) => {
                          if (currentLang !== lang.code) {
                            e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentLang !== lang.code) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <span>{lang.name}</span>
                        {currentLang === lang.code && (
                          <CheckCircle style={{ width: '16px', height: '16px' }} />
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
                <>
                  <button
                    onClick={() => navigate('/ogrenci/giris')}
                    style={{
                      background: 'transparent',
                      color: '#64748b',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#2463eb'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => navigate('/ogrenci/kayit')}
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
                    {t.getStarted}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-mesh" style={{ position: 'relative', paddingTop: '128px', paddingBottom: '80px', overflow: 'hidden' }}>
        <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 10 }}>
          {/* Badge */}
          <div className="animate-fade-in-up" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '100px',
            background: 'rgba(36, 99, 235, 0.1)',
            color: '#2463eb',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '32px'
          }}>
            <span className="animate-pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2463eb' }}></span>
            {t.badge}
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-slate-900 mb-6" style={{
            letterSpacing: '-0.02em',
            lineHeight: '1.1'
          }}>
            {t.heroSubtitle} <br />
            <span style={{
              background: 'linear-gradient(to right, #2463eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {t.nextGen}
            </span> {t.heroTitle}
          </h1>

          {/* Subtitle */}
          <p style={{
            marginTop: '16px',
            maxWidth: '800px',
            fontSize: '18px',
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '40px'
          }}>
            {t.heroDescription}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/ogrenci/giris')}
                className="btn-3d-primary group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: '#2463eb',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: '200px'
                }}
              >
                <GraduationCap className="group-hover-rotate" style={{ width: '22px', height: '22px' }} />
                {t.studentPortal}
              </button>
              <button
                onClick={() => navigate('/ogretmen/giris')}
                className="btn-3d-secondary group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: '#7c3aed',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: '200px'
                }}
              >
                <Users className="group-hover-rotate" style={{ width: '22px', height: '22px' }} />
                {t.instructorPortal}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-[1000px] mt-16 mx-auto">
            <div className="glass-card" style={{
              padding: '24px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <ShieldCheck style={{ width: '32px', height: '32px', color: '#2463eb', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>100%</h3>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>{t.secureEnvironment}</p>
            </div>
            <div className="glass-card" style={{
              padding: '24px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Zap style={{ width: '32px', height: '32px', color: '#7c3aed', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>{t.realtime}</h3>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>{t.feedbackSystem}</p>
            </div>
            <div className="glass-card" style={{
              padding: '24px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Globe style={{ width: '32px', height: '32px', color: '#10b981', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>24/7</h3>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>{t.cloudAccess}</p>
            </div>
          </div>
        </div>

        {/* Background Blobs */}
        <div style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', width: '384px', height: '384px', background: 'rgba(36, 99, 235, 0.2)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, pointerEvents: 'none' }}></div>
      </div>

      {/* Features Section */}
      <section id="features" style={{ padding: '96px 24px', background: 'white', position: 'relative' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '768px', margin: '0 auto 64px' }}>
            <h2 style={{ color: '#2463eb', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '14px', marginBottom: '12px' }}>
              {t.coreCapabilities}
            </h2>
            <h3 style={{ fontSize: '48px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              {t.advancedLabFeatures}
            </h3>
            <p style={{ color: '#64748b', fontSize: '18px' }}>
              {t.featuresDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group"
                style={{
                  background: '#f8fafc',
                  borderRadius: '16px',
                  padding: '32px',
                  transition: 'all 0.3s',
                  border: '1px solid #f1f5f9',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = `${feature.color}4D`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `${feature.color}1A`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  transition: 'transform 0.3s'
                }}
                  className="group-hover-scale"
                >
                  {React.createElement(feature.icon, { style: { width: '24px', height: '24px', color: feature.color } })}
                </div>
                <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                  {feature.title}
                </h4>
                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institution Section */}
      <section id="labs" style={{ padding: '96px 24px', background: '#f8fafc', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <div className="flex-1 flex flex-col gap-8 w-full">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ height: '1px', width: '32px', background: '#2463eb' }}></span>
                  <span style={{ color: '#2463eb', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '14px' }}>
                    {t.ourInstitution}
                  </span>
                </div>
                <h2 style={{ fontSize: '48px', fontWeight: '700', color: '#0f172a', lineHeight: '1.2', marginBottom: '24px' }}>
                  {t.institutionTitle}
                </h2>
                <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
                  {t.institutionDesc}
                </p>

                {/* Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(36, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Cpu style={{ width: '20px', height: '20px', color: '#2463eb' }} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '700', color: '#0f172a' }}>{t.highPerformanceHardware}</h4>
                      <p style={{ fontSize: '14px', color: '#64748b' }}>{t.highPerformanceHardwareDesc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Wifi style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '700', color: '#0f172a' }}>{t.gigabitInfrastructure}</h4>
                      <p style={{ fontSize: '14px', color: '#64748b' }}>{t.gigabitInfrastructureDesc}</p>
                    </div>
                  </div>
                </div>
              </div>

              <a onClick={() => navigate('/okul-ozellikleri')} style={{ color: '#2463eb', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#2463eb'}
              >
                {t.learnMore}
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </a>
            </div>

            {/* Right Image */}
            <div className="flex-1 relative w-full group">
              <div style={{ position: 'absolute', inset: '-16px', background: 'linear-gradient(to right, #2463eb, #7c3aed)', borderRadius: '32px', opacity: 0.3, filter: 'blur(32px)', transition: 'opacity 0.5s' }}
                className="group-hover-glow"
              ></div>
              <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)', border: '4px solid white' }}>
                <div style={{
                  width: '100%',
                  height: '400px',
                  background: 'linear-gradient(135deg, #2463eb, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  <School style={{ width: '120px', height: '120px', color: 'white' }} />
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Alanya MTAL</h3>
                    <p style={{ fontSize: '14px', opacity: 0.9 }}>Cybersecurity Center</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 16px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
          {/* Background */}
          <div style={{ position: 'absolute', inset: 0, background: '#0f172a' }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.2,
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}></div>
            <div style={{ position: 'absolute', top: '-96px', right: '-96px', width: '256px', height: '256px', background: 'rgba(36, 99, 235, 0.4)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-96px', left: '-96px', width: '256px', height: '256px', background: 'rgba(124, 58, 237, 0.4)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Rocket style={{ width: '48px', height: '48px', color: 'white', marginBottom: '24px' }} />
            <h2 style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '24px', letterSpacing: '-0.02em' }}>
              {t.readyToLaunch}
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '18px', maxWidth: '800px', marginBottom: '40px' }}>
              {t.readyToLaunchDesc}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/ogrenci/giris')}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'white',
                  color: '#0f172a',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(36, 99, 235, 0.5)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 30px rgba(36, 99, 235, 0.7)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(36, 99, 235, 0.5)'}
              >
                {t.loginToDashboard}
                <LogIn style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                onClick={() => navigate('/ogrenci/kayit')}
                style={{
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white',
                  border: '1px solid #475569',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {t.viewCourseCatalog}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Credits Bar */}
      <div style={{ background: '#020617', borderTop: '1px solid #1e293b', padding: '12px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(36, 99, 235, 0.05), rgba(124, 58, 237, 0.05), rgba(36, 99, 235, 0.05))', opacity: 0.5 }}></div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
              Built with pride for <span style={{ color: '#e2e8f0' }}>Alanya Mesleki ve Teknik Anadolu Lisesi</span> by <span style={{ color: '#2463eb', fontWeight: '700' }}>Emirhan Gök</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        background: '#0f172a',
        color: 'white',
        padding: '80px 0 40px',
        borderTop: '1px solid #1e293b',
        overflow: 'hidden'
      }}>
        {/* Background Image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT8BDosZAdYpO1D8TJENw227Lgkgfp89G-wpv21Y9EKewKf5Mw30jhg0SVZUPBI0dfLZ5Wu0g3vcZEkQDSqYu9aMSJi0RMCLvDK_AbAF8Abu7scXqMTtKB8wRe9a1VG7ANoo9xBXts0Mym_eTnF0Wz8RFWhbxdwMGL1bzRP2I2HaV6QZXJ9RZIAnePtRp1y-WdTWZXZ6KmsCpWE-CIhzbHQ2XALGeRO-IYCRr-u8L8Mc7joeDVMJFRJg9-5egL9JQj_Kw_2ZTbvzVk"
            alt="Turkish Flag"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(127,29,29,0.95), rgba(127,29,29,0.9), rgba(15,23,42,0.95))',
            mixBlendMode: 'multiply'
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgb(2,6,23), rgba(15,23,42,0.5), transparent)'
          }} />
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16 items-start">
            {/* Atatürk Section */}
            <div className="flex flex-col items-center text-center col-span-1 lg:col-span-1">
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-16px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  filter: 'blur(20px)',
                  opacity: 0.3
                }} />
                <div style={{
                  width: '112px',
                  height: '112px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  position: 'relative',
                  background: '#1e293b'
                }}>
                  <img
                    src="/ataturk.png"
                    alt="Mustafa Kemal Atatürk"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.25)' }}
                  />
                </div>
              </div>
              <h2 style={{
                fontSize: '28px',
                fontFamily: 'serif',
                fontStyle: 'italic',
                fontWeight: 500,
                color: 'white',
                marginBottom: '12px',
                lineHeight: '1.3',
                letterSpacing: '0.02em'
              }}>
                "{t.ataturkQuote1} <br />
                <span style={{ color: '#fca5a5' }}>{t.ataturkQuote2}</span>"
              </h2>
              <div style={{ height: '1px', width: '48px', background: 'rgba(239,68,68,0.5)', marginBottom: '12px' }} />
              <p style={{
                color: '#cbd5e1',
                fontWeight: 500,
                letterSpacing: '0.1em',
                fontSize: '12px',
                textTransform: 'uppercase',
                opacity: 0.8
              }}>
                {t.ataturk}
              </p>
            </div>

            {/* Other Columns */}
            <div className="flex flex-col gap-8 col-span-1 lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {/* Platform */}
                <div>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#fca5a5',
                    marginBottom: '16px'
                  }}>
                    {t.platform}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>
                      <a onClick={() => navigate('/ogrenci/giris')} style={{
                        color: '#cbd5e1',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        display: 'inline-block',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textDecorationColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {t.studentPortal}
                      </a>
                    </li>
                    <li>
                      <a onClick={() => navigate('/ogretmen/giris')} style={{
                        color: '#cbd5e1',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        display: 'inline-block',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textDecorationColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {t.instructorPortal}
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#fca5a5',
                    marginBottom: '16px'
                  }}>
                    {t.resources}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>
                      <a onClick={() => navigate('/lab-rules')} style={{
                        color: '#cbd5e1',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        display: 'inline-block',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textDecorationColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {t.labRules}
                      </a>
                    </li>
                    <li>
                      <a onClick={() => navigate('/dokumantasyon')} style={{
                        color: '#cbd5e1',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        display: 'inline-block',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textDecorationColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {t.documentationLink}
                      </a>
                    </li>
                    <li>
                      <a onClick={() => navigate('/sistem-durumu')} style={{
                        color: '#cbd5e1',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        display: 'inline-block',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textDecorationColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {t.systemStatus}
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#fca5a5',
                    marginBottom: '16px'
                  }}>
                    {t.contact}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                      <MapPin style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0, color: '#fca5a5' }} />
                      <span>Alanya MTAL<br />Antalya, Turkey</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <Mail style={{ width: '18px', height: '18px', color: '#fca5a5' }} />
                      <a href="https://alanyamtal.meb.k12.tr/tema/iletisim.php" style={{
                        color: '#cbd5e1',
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                      }}
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

          {/* Bottom Bar */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)',
            marginBottom: '32px'
          }} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '14px',
            color: '#94a3b8'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                animation: 'pulse 2s infinite'
              }} />
              <div style={{ margin: 0 }}>© 2026 Atölye Platform. {t.allRightsReserved} - <PolyOSBadge color="#94a3b8" /></div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.05)',
              padding: '8px 20px 8px 16px',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)'
            }}>
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

export { LandingPage };
