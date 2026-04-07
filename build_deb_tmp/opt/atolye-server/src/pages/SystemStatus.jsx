import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getCurrentLanguage, changeLanguage } from '../utils/i18n';
import SystemSetupPopup from '../components/ui/SystemSetupPopup';
import { 
  Terminal, Shield, Zap, Globe, 
  ChevronDown, ArrowLeft, CheckCircle,
  Activity, Server, Database, Cpu,
  Wifi, HardDrive, RefreshCw, Layers,
  Mail, MapPin, Code
} from 'lucide-react';

const SystemStatus = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuthStore();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage().toUpperCase());
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSetupRequired, setIsSetupRequired] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isOperational, setIsOperational] = useState(true);
  
  // Simulated data
  const [metrics, setMetrics] = useState({
    cpu: 0,
    ram: 0,
    latency: 0,
    uptime: { days: 0, hours: 0, minutes: 0 },
    sessions: 0,
    breakdown: { teachers: 0, students: 0 }
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/system/metrics');
        const data = await response.json();
        if (data.success) {
          setMetrics(data.metrics);
          setLastUpdated(new Date());
          setIsOperational(true);
        }
      } catch (error) {
        console.error('Metrics fetch failed:', error);
        setIsOperational(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch('/api/auth/setup-status');
        const data = await response.json();
        if (data.success) {
          setIsOperational(true);
          if (data.isSetupRequired) {
            setIsSetupRequired(true);
          }
        }
      } catch (error) {
        console.error('Setup status check failed:', error);
        setIsOperational(false);
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
      title: 'SİSTEM DURUMU',
      subtitle: 'PolyOS Ekosistemi Gerçek Zamanlı Operasyonel Durum Paneli',
      back: 'Geri Dön',
      allSystemsOperational: 'Tüm Sistemler Sorunsuz Çalışıyor',
      operational: 'Operasyonel',
      degraded: 'Düşük Performans',
      outage: 'Kesinti',
      lastUpdate: 'Son Güncelleme',
      serverLoad: 'Sunucu Yükü',
      latency: 'Gecikme',
      uptime: 'Çalışma Süresi',
      activeSessions: 'Aktif Oturumlar',
      memoryUsage: 'Bellek Kullanımı',
      services: 'Servis Durumları',
      lnaDesc: 'Laboratuvar Network Asistanı - Veri trafiği ve öğrenci gönderimleri.',
      ogaDesc: 'Online Grading Assistant - Sınav değerlendirme ve analiz servisleri.',
      odsDesc: 'Ödev Dağıtım Sistemi - İçerik dağıtım ve senkronizasyon.',
      apiServices: 'API Servisleri',
      dbServices: 'Veritabanı Servisleri',
      authServices: 'Kimlik Doğrulama',
      platform: 'Platform',
      resources: 'Kaynaklar',
      contact: 'İletişim',
      documentationLink: 'Dokümantasyon',
      labRules: 'Laboratuvar Kuralları',
      systemStatus: 'Sistem Durumu',
      allRightsReserved: 'Tüm hakları saklıdır.',
      designedBy: 'TASARIM & KODLAMA',
      login: 'Giriş Yap',
      features: 'Özellikler',
      studentPortal: 'Öğrenci Portalı',
      instructorPortal: 'Öğretmen Portalı',
      polyosExpansion: 'Pardus Okul Laboratuvar Yönetim ve Ödev Sistemi',
      labRulesNav: 'Laboratuvar Kuralları',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'Bütün Ümidim',
      ataturkQuote2: 'Gençliktedir',
      dashboard: 'Panel',
      authDesc: 'JWT ve Biyometrik Passkey servisleri.',
      dbDesc: 'PostgreSQL ve Redis önbellekleme katmanları.',
      teachers: 'Öğretmen',
      students: 'Öğrenci'
    },
    EN: {
      title: 'SYSTEM STATUS',
      subtitle: 'Real-time Operational Status Dashboard for PolyOS Ecosystem',
      back: 'Go Back',
      allSystemsOperational: 'All Systems Are Operational',
      operational: 'Operational',
      degraded: 'Degraded Performance',
      outage: 'Outage',
      lastUpdate: 'Last Update',
      serverLoad: 'Server Load',
      latency: 'Latency',
      uptime: 'Uptime',
      activeSessions: 'Active Sessions',
      memoryUsage: 'Memory Usage',
      services: 'Service Status',
      lnaDesc: 'Laboratory Network Assistant - Data traffic and student submissions.',
      ogaDesc: 'Online Grading Assistant - Exam evaluation and analysis services.',
      odsDesc: 'Assignment Distribution System - Content distribution and sync.',
      apiServices: 'API Services',
      dbServices: 'Database Services',
      authServices: 'Authentication Services',
      platform: 'Platform',
      resources: 'Resources',
      contact: 'Contact',
      documentation: 'Documentation',
      documentationLink: 'Documentation',
      labRules: 'Lab Rules',
      systemStatus: 'System Status',
      allRightsReserved: 'All rights reserved.',
      designedBy: 'DESIGN & CODING',
      login: 'Login',
      features: 'Features',
      studentPortal: 'Student Portal',
      instructorPortal: 'Instructor Portal',
      polyosExpansion: 'Pardus School Laboratory Management and Homework System',
      labRulesNav: 'Lab Rules',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'All My Hope',
      ataturkQuote2: 'Is In Youth',
      dashboard: 'Dashboard',
      authDesc: 'JWT & Biometric Passkey services.',
      dbDesc: 'PostgreSQL & Redis caching layers.',
      teachers: 'Teachers',
      students: 'Students'
    },
    DE: {
      title: 'SYSTEMSTATUS',
      subtitle: 'Echtzeit-Betriebsstatus-Dashboard für das PolyOS-Ökosystem',
      back: 'Zurück',
      allSystemsOperational: 'Alle Systeme sind betriebsbereit',
      operational: 'Betriebsbereit',
      degraded: 'Reduzierte Leistung',
      outage: 'Ausfall',
      lastUpdate: 'Letztes Update',
      serverLoad: 'Serverlast',
      latency: 'Latenz',
      uptime: 'Betriebszeit',
      activeSessions: 'Aktive Sitzungen',
      memoryUsage: 'Speichernutzung',
      services: 'Dienststatus',
      lnaDesc: 'Labor-Netzwerkassistent - Datenverkehr und Schülereinreichungen.',
      ogaDesc: 'Online Grading Assistant - Prüfungsbewertungs- und Analysedienste.',
      odsDesc: 'Aufgabenverteilungssystem - Inhaltsverteilung und Synchronisation.',
      apiServices: 'API-Dienste',
      dbServices: 'Datenbankdienste',
      authServices: 'Authentifizierungsdienste',
      platform: 'Plattform',
      resources: 'Ressourcen',
      contact: 'Kontakt',
      documentation: 'Dokumentation',
      documentationLink: 'Dokumentation',
      labRules: 'Laborregeln',
      systemStatus: 'Systemstatus',
      allRightsReserved: 'Alle Rechte vorbehalten.',
      designedBy: 'DESIGN & CODIERUNG',
      login: 'Anmelden',
      features: 'Funktionen',
      studentPortal: 'Studentenportal',
      instructorPortal: 'Dozentenportal',
      polyosExpansion: 'Pardus Schul-Laborverwaltungs- und Hausaufgabensystem',
      labRulesNav: 'Laborregeln',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'Meine ganze Hoffnung',
      ataturkQuote2: 'liegt in der Jugend',
      dashboard: 'Dashboard',
      authDesc: 'JWT & biometrische Passkey-Dienste.',
      dbDesc: 'PostgreSQL & Redis Caching-Ebenen.',
      teachers: 'Lehrer',
      students: 'Schüler'
    },
    RU: {
      title: 'СТАТУС СИСТЕМЫ',
      subtitle: 'Панель оперативного состояния экосистемы PolyOS в реальном времени',
      back: 'Назад',
      allSystemsOperational: 'Все системы работают нормально',
      operational: 'Работает',
      degraded: 'Сниженная производительность',
      outage: 'Отключение',
      lastUpdate: 'Последнее обновление',
      serverLoad: 'Загрузка сервера',
      latency: 'Задержка',
      uptime: 'Время работы',
      activeSessions: 'Активные сессии',
      memoryUsage: 'Использование памяти',
      services: 'Статус сервисов',
      lnaDesc: 'Лабораторный сетевой помощник - трафик данных и загрузки студентов.',
      ogaDesc: 'Помощник онлайн-оценки - сервисы оценки и анализа экзаменов.',
      odsDesc: 'Система распределения заданий - распределение и синхронизация контента.',
      apiServices: 'API сервисы',
      dbServices: 'Сервисы БД',
      authServices: 'Сервисы аутентификации',
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
      features: 'Функции',
      studentPortal: 'Студенческий портал',
      instructorPortal: 'Портал для преподавателей',
      polyosExpansion: 'Система управления школьной лабораторией и домашними заданиями Pardus',
      labRulesNav: 'Правила Лаборатории',
      ataturk: 'Мустафа Кемаль Ататюрк',
      ataturkQuote1: 'Вся моя надежда',
      ataturkQuote2: 'на молодежь',
      dashboard: 'Панель',
      authDesc: 'Сервисы JWT и биометрических ключей доступа.',
      dbDesc: 'Слои кэширования PostgreSQL и Redis.',
      teachers: 'Учителя',
      students: 'Ученики'
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

  const formatUptime = (uptime) => {
    if (!uptime || typeof uptime === 'string') return uptime;
    const { days, hours, minutes } = uptime;
    let parts = [];
    if (days > 0) parts.push(`${days}${currentLang === 'TR' ? 'g' : 'd'}`);
    if (hours > 0) parts.push(`${hours}${currentLang === 'TR' ? 's' : 'h'}`);
    parts.push(`${minutes}${currentLang === 'TR' ? 'dk' : 'm'}`);
    return parts.join(' ');
  };

  const StatusCard = ({ icon: Icon, title, value, unit, color }) => (
    <div className="glass-card" style={{ borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle, ${color}15 0%, transparent 70%)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', borderRadius: '12px', background: `${color}10` }}>
          <Icon size={24} color={color} />
        </div>
        <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a' }}>{value}</span>
        <span style={{ color: '#64748b', fontWeight: '600' }}>{unit}</span>
      </div>
    </div>
  );

  const ServiceStatus = ({ name, status, description }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{name}</h4>
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: '99px', 
            fontSize: '11px', 
            fontWeight: '700', 
            background: status === 'operational' ? '#f0fdf4' : '#fef2f2', 
            color: status === 'operational' ? '#10b981' : '#ef4444',
            textTransform: 'uppercase'
          }}>
            {status === 'operational' ? t.operational : t.outage}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b' }}>{description}</p>
      </div>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status === 'operational' ? '#10b981' : '#ef4444', boxShadow: `0 0 10px ${status === 'operational' ? '#10b981' : '#ef4444'}` }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Lexend', sans-serif", color: '#1e293b' }}>
      {isSetupRequired && <SystemSetupPopup />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');
        body { font-family: 'Lexend', sans-serif !important; }
        .glass-nav { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.3); }
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .glass-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.1); }
        .hero-mesh { background: radial-gradient(circle at 15% 50%, rgba(36, 99, 235, 0.1), transparent 25%), radial-gradient(circle at 85% 30%, rgba(124, 58, 237, 0.1), transparent 25%); background-color: #f8fafc; }
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        .status-pulse { animation: pulse-green 2s infinite; }
      `}</style>

      {/* Navigation */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div style={{ background: 'rgba(36, 99, 235, 0.1)', padding: '8px', borderRadius: '8px' }}>
                <Terminal style={{ width: '28px', height: '28px', color: '#2463eb' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>Atölye<span style={{ color: '#2463eb' }}>.Platform</span></span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500', letterSpacing: '0.05em', marginTop: '2px' }}>Developed by Emirhan Gök</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a onClick={() => navigate('/')} style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>{t.features}</a>
              <a onClick={() => navigate('/lab-rules')} style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>{t.labRulesNav}</a>
              <a onClick={() => navigate('/dokumantasyon')} style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>{t.documentation}</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowLangMenu(!showLangMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}>
                  <Globe size={16} color="#64748b" />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{currentLang}</span>
                  <ChevronDown size={14} color="#64748b" />
                </button>
                {showLangMenu && (
                  <div onMouseLeave={() => setShowLangMenu(false)} style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', minWidth: '160px', zIndex: 100, padding: '8px' }}>
                    {languages.map(lang => (
                      <button key={lang.code} onClick={() => { changeLanguage(lang.code.toLowerCase()); setCurrentLang(lang.code); setShowLangMenu(false); }} style={{ display: 'flex', width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: currentLang === lang.code ? '#f1f5f9' : 'transparent', cursor: 'pointer', fontSize: '14px', textAlign: 'left', color: currentLang === lang.code ? '#2463eb' : '#64748b' }}>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => navigate(isAuthenticated ? (userType === 'student' ? '/ogrenci/panel' : '/ogretmen/panel') : '/ogrenci/giris')} style={{ background: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                {isAuthenticated ? t.dashboard : t.login}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="hero-mesh" style={{ padding: '160px 24px 100px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: '#f0fdf4', 
              padding: '12px 24px', 
              borderRadius: '999px', 
              border: '1px solid #bbf7d0',
              marginBottom: '32px',
              color: '#10b981',
              fontWeight: '700',
              fontSize: '15px'
            }} className="status-pulse">
              <CheckCircle size={20} />
              {t.allSystemsOperational}
            </div>
            <h1 style={{ fontSize: '56px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '16px' }}>{t.title}</h1>
            <p style={{ fontSize: '18px', color: '#64748b', fontWeight: '500' }}>{t.subtitle}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '64px' }}>
            <StatusCard icon={Cpu} title={t.serverLoad} value={metrics.cpu} unit="%" color="#2463eb" />
            <StatusCard icon={Wifi} title={t.latency} value={metrics.latency} unit="ms" color="#10b981" />
            <StatusCard icon={RefreshCw} title={t.uptime} value={formatUptime(metrics.uptime)} unit="" color="#8b5cf6" />
            <div style={{ position: 'relative' }}>
              <StatusCard icon={Activity} title={t.activeSessions} value={metrics.sessions} unit="" color="#f59e0b" />
              {(metrics.breakdown.teachers > 0 || metrics.breakdown.students > 0) && (
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '24px',
                  display: 'flex',
                  gap: '8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#94a3b8'
                }}>
                  {metrics.breakdown.teachers > 0 && (
                    <span style={{ color: '#2463eb' }}>{metrics.breakdown.teachers} {t.teachers}</span>
                  )}
                  {metrics.breakdown.students > 0 && (
                    <span style={{ color: '#2463eb' }}>{metrics.breakdown.students} {t.students}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
            {/* Core Services */}
            <div className="glass-card" style={{ borderRadius: '24px', padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(15,23,42,0.05)' }}>
                  <Layers size={28} color="#0f172a" />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{t.services}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ServiceStatus name="PolyOS LNA" status="operational" description={t.lnaDesc} />
                <ServiceStatus name="PolyOS OGA" status="operational" description={t.ogaDesc} />
                <ServiceStatus name="PolyOS ODS" status="operational" description={t.odsDesc} />
              </div>
            </div>

            {/* Infrastructure Status */}
            <div className="glass-card" style={{ borderRadius: '24px', padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(15,23,42,0.05)' }}>
                  <Server size={28} color="#0f172a" />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{t.apiServices}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ServiceStatus name={t.authServices} status="operational" description={t.authDesc} />
                <ServiceStatus name={t.dbServices} status="operational" description={t.dbDesc} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15,23,42,0.02)', padding: '20px', borderRadius: '16px', border: '1px forestgreen dashed' }}>
                  <RefreshCw size={20} color="#64748b" />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{t.lastUpdate}: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer (Standardized) */}
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
                      <a onClick={() => navigate('/dokumantasyon')} style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s', display: 'inline-block', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textDecorationColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {t.documentationLink}
                      </a>
                    </li>
                    <li>
                      <a style={{ color: 'white', fontSize: '14px', textDecoration: 'underline', textDecorationColor: '#ef4444', transition: 'all 0.2s', display: 'inline-block' }}>
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
              <span style={{ width: '8px', height: '8px', background: isOperational ? '#22c55e' : '#ef4444', borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 10px ${isOperational ? '#22c55e' : '#ef4444'}` }} />
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

export default SystemStatus;
