import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getCurrentLanguage, changeLanguage } from '../utils/i18n';
import SystemSetupPopup from '../components/ui/SystemSetupPopup';
import { 
  Terminal, Book, Shield, Zap, Globe, 
  ChevronDown, HelpCircle, CheckCircle,
  Mail, MapPin, Code, UtensilsCrossed,
  Trash2, AlertTriangle, FileCheck, Volume2,
  HardHat, LogIn
} from 'lucide-react';

const LabRules = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuthStore();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage().toUpperCase());
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
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
      title: 'LABORATUVAR KURALLARI',
      subtitle: 'Alanya MTAL Innovation Lab kullanım, güvenlik ve etik kurallar bütünü. Lütfen laboratuvarı kullanmadan önce dikkatlice okuyunuz.',
      guidelines: 'Innovation Lab Yönergeleri',
      allRules: 'Tüm Kurallar',
      generalConduct: 'Genel Davranış',
      safetyProcedures: 'Güvenlik Prosedürleri',
      digitalEthics: 'Dijital Etik',
      home: 'Ana Sayfa',
      rules: 'Kurallar',
      equipment: 'Ekipmanlar',
      contact: 'İletişim',
      noFoodDrink: 'Yiyecek ve İçecek Yasak',
      noFoodDrinkDesc: 'Laboratuvar içerisinde yiyecek ve içecek tüketmek kesinlikle yasaktır. Ekipman güvenliği için lütfen dışarıda tüketiniz.',
      electricalSafety: 'Elektrik Güvenliği',
      electricalSafetyDesc: 'Açık kablolarla temas etmeyiniz. Prizleri aşırı yüklemeyiniz ve kullanım sonrası tüm cihazları güvenli bir şekilde kapatınız.',
      digitalPrivacy: 'Dijital Gizlilik',
      digitalPrivacyDesc: 'Kullanım sonrası oturumunuzu kapatmayı unutmayınız. Başkalarının kişisel verilerine ve dosyalarına saygı gösteriniz.',
      cleanWorkspace: 'Temiz Çalışma Alanı',
      cleanWorkspaceDesc: 'Çalışma alanınızı bulduğunuz gibi temiz bırakınız. Çöplerinizi uygun geri dönüşüm kutularına atınız.',
      emergencyExits: 'Acil Çıkışlar',
      emergencyExitsDesc: 'Acil çıkış kapılarını ve yollarını her zaman açık tutunuz. Acil durum planını inceleyiniz.',
      licensedSoftware: 'Lisanslı Yazılım',
      licensedSoftwareDesc: 'Sadece lisanslı ve izin verilen yazılımları kullanınız. Korsan yazılım indirmek ve kurmak kesinlikle yasaktır.',
      keepSilence: 'Sessiz Olun',
      keepSilenceDesc: 'Diğer öğrencilerin odaklanmasını engellememek için sessiz olunuz. Gürültülü çalışmalarda kulaklık kullanınız.',
      respectEquipment: 'Ekipmanlara Saygı',
      respectEquipmentDesc: 'Donanımlara zarar vermeyiniz. Arızalı olduğunu düşündüğünüz ekipmanları derhal yetkiliye bildiriniz.',
      moreQuestions: 'Daha Fazla Soru?',
      moreQuestionsDesc: 'Eğer kurallar hakkında sorunuz varsa, laboratuvar sorumlusuna danışın.',
      contactInstructor: 'Öğretmene Ulaşın',
      platform: 'PLATFORM',
      resources: 'KAYNAKLAR',
      contact: 'İletişim',
      labRules: 'Laboratuvar Kuralları',
      systemStatus: 'Sistem Durumu',
      documentation: 'Dokümantasyon',
      documentationLink: 'Dokümantasyon',
      allRightsReserved: 'Tüm hakları saklıdır.',
      designedBy: 'TASARIM & KODLAMA',
      features: 'Özellikler',
      labRulesNav: 'Laboratuvar Kuralları',
      login: 'Giriş Yap',
      getStarted: 'Hemen Başla',
      studentPortal: 'Öğrenci Portalı',
      instructorPortal: 'Öğretmen Portalı',
      examSchedule: 'Sınav Takvimi',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'Bütün Ümidim',
      ataturkQuote2: 'Gençliktedir',
      polyosExpansion: 'Pardus Okul Laboratuvar Yönetim ve Ödev Sistemi',
      dashboard: 'Panel'
    },
    EN: {
      title: 'LABORATORY RULES',
      subtitle: 'Alanya MTAL Innovation Lab usage, safety and ethical rules. Please read carefully before using the laboratory.',
      guidelines: 'Innovation Lab Guidelines',
      allRules: 'All Rules',
      generalConduct: 'General Conduct',
      safetyProcedures: 'Safety Procedures',
      digitalEthics: 'Digital Ethics',
      home: 'Home',
      rules: 'Rules',
      noFoodDrink: 'No Food or Drink',
      noFoodDrinkDesc: 'Food and beverages are strictly prohibited in the laboratory. Please consume outside for equipment safety.',
      electricalSafety: 'Electrical Safety',
      electricalSafetyDesc: 'Do not touch exposed wires. Do not overload outlets and safely turn off all devices after use.',
      digitalPrivacy: 'Digital Privacy',
      digitalPrivacyDesc: 'Do not forget to log out after use. Respect others\' personal data and files.',
      cleanWorkspace: 'Clean Workspace',
      cleanWorkspaceDesc: 'Leave your workspace as clean as you found it. Dispose of trash in appropriate recycling bins.',
      emergencyExits: 'Emergency Exits',
      emergencyExitsDesc: 'Always keep emergency exit doors and paths clear. Review the emergency plan.',
      licensedSoftware: 'Licensed Software',
      licensedSoftwareDesc: 'Use only licensed and authorized software. Downloading and installing pirated software is strictly prohibited.',
      keepSilence: 'Keep Silence',
      keepSilenceDesc: 'Be quiet to avoid disrupting other students. Use headphones for noisy work.',
      respectEquipment: 'Respect Equipment',
      respectEquipmentDesc: 'Do not damage equipment. Report any equipment you suspect is faulty to authorities immediately.',
      moreQuestions: 'More Questions?',
      moreQuestionsDesc: 'If you have questions about the rules, consult the lab supervisor.',
      contactInstructor: 'Contact Instructor',
      platform: 'Platform',
      resources: 'Resources',
      contact: 'Contact',
      labRules: 'Lab Rules',
      systemStatus: 'System Status',
      documentation: 'Documentation',
      documentationLink: 'Documentation',
      allRightsReserved: 'All rights reserved.',
      designedBy: 'DESIGNED & DEVELOPED',
      features: 'Features',
      labRulesNav: 'Lab Rules',
      login: 'Login',
      getStarted: 'Get Started',
      studentPortal: 'Student Portal',
      instructorPortal: 'Instructor Portal',
      examSchedule: 'Exam Schedule',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'All My Hope',
      ataturkQuote2: 'Is In Youth',
      polyosExpansion: 'Pardus School Laboratory Management and Homework System',
      dashboard: 'Dashboard'
    },
    DE: {
      title: 'LABORREGELN',
      subtitle: 'Innovation Lab Nutzungs-, Sicherheits- und Ethikregeln. Bitte vor der Nutzung sorgfältig lesen.',
      guidelines: 'Innovation Lab Richtlinien',
      allRules: 'Alle Regeln',
      generalConduct: 'Allgemeines Verhalten',
      safetyProcedures: 'Sicherheitsverfahren',
      digitalEthics: 'Digitale Ethik',
      home: 'Startseite',
      rules: 'Regeln',
      noFoodDrink: 'Keine Speisen oder Getränke',
      noFoodDrinkDesc: 'Speisen und Getränke sind im Labor streng verboten. Aus Gründen der Gerätesicherheit bitte draußen verzehren.',
      electricalSafety: 'Elektrische Sicherheit',
      electricalSafetyDesc: 'Berühren Sie keine blanken Drähte. Überlasten Sie keine Steckdosen und schalten Sie alle Geräte nach Gebrauch sicher aus.',
      digitalPrivacy: 'Digitale Privatsphäre',
      digitalPrivacyDesc: 'Vergessen Sie nicht, sich nach Gebrauch abzumelden. Respektieren Sie die persönlichen Daten und Dateien anderer.',
      cleanWorkspace: 'Sauberer Arbeitsplatz',
      cleanWorkspaceDesc: 'Hinterlassen Sie Ihren Arbeitsplatz so sauber, wie Sie ihn vorgefunden haben. Entsorgen Sie Abfall in geeigneten Recyclingbehältern.',
      emergencyExits: 'Notausgänge',
      emergencyExitsDesc: 'Halten Sie Notausgangstüren und -wege immer frei. Überprüfen Sie den Notfallplan.',
      licensedSoftware: 'Lizenzierte Software',
      licensedSoftwareDesc: 'Verwenden Sie nur lizenzierte und autorisierte Software. Das Herunterladen und Installieren von Raubkopien ist strengstens untersagt.',
      keepSilence: 'Ruhe bewahren',
      keepSilenceDesc: 'Seien Sie leise, um andere Schüler nicht zu stören. Verwenden Sie Kopfhörer für geräuschintensive Arbeiten.',
      respectEquipment: 'Ausrüstung respektieren',
      respectEquipmentDesc: 'Beschädigen Sie keine Ausrüstung. Melden Sie vermutete defekte Geräte sofort den Behörden.',
      moreQuestions: 'Weitere Fragen?',
      moreQuestionsDesc: 'Bei Fragen zu den Regeln wenden Sie sich an den Laborleiter.',
      contactInstructor: 'Lehrer kontaktieren',
      platform: 'Plattform',
      resources: 'Ressourcen',
      contact: 'Kontakt',
      labRules: 'Laborregeln',
      systemStatus: 'Systemstatus',
      documentation: 'Dokumentation',
      documentationLink: 'Dokumentation',
      allRightsReserved: 'Alle Rechte vorbehalten.',
      designedBy: 'DESIGN & ENTWICKLUNG',
      features: 'Funktionen',
      labRulesNav: 'Laborregeln',
      login: 'Anmelden',
      getStarted: 'Loslegen',
      studentPortal: 'Studentenportal',
      instructorPortal: 'Dozentenportal',
      examSchedule: 'Prüfungsplan',
      ataturk: 'Mustafa Kemal Atatürk',
      ataturkQuote1: 'Meine ganze Hoffnung',
      ataturkQuote2: 'liegt in der Jugend',
      polyosExpansion: 'Pardus Schul-Laborverwaltungs- und Hausaufgabensystem',
      dashboard: 'Dashboard'
    },
    RU: {
      title: 'ПРАВИЛА ЛАБОРАТОРИИ',
      subtitle: 'Innovation Lab правила использования, безопасности и этики. Пожалуйста, внимательно ознакомьтесь перед использованием лаборатории.',
      guidelines: 'Innovation Lab Руководство',
      allRules: 'Все Правила',
      generalConduct: 'Общее Поведение',
      safetyProcedures: 'Процедуры Безопасности',
      digitalEthics: 'Цифровая Этика',
      home: 'Главная',
      rules: 'Правила',
      noFoodDrink: 'Без Еды и Напитков',
      noFoodDrinkDesc: 'Еда и напитки в лаборатории строго запрещены. Пожалуйста, употребляйте их на улице для безопасности оборудования.',
      electricalSafety: 'Электробезопасность',
      electricalSafetyDesc: 'Не прикасайтесь к оголенным проводам. Не перегружайте розетки и надежно выключайте все устройства после использования.',
      digitalPrivacy: 'Цифровая Конфиденциальность',
      digitalPrivacyDesc: 'Не забывайте выходить из системы после использования. Уважайте личные данные и файлы других.',
      cleanWorkspace: 'Чистое Рабочее Место',
      cleanWorkspaceDesc: 'Оставляйте свое рабочее место таким же чистым, каким вы его нашли. Выбрасывайте мусор в соответствующие контейнеры для вторичной переработки.',
      emergencyExits: 'Аварийные Выходы',
      emergencyExitsDesc: 'Всегда держите двери и пути аварийного выхода свободными. Ознакомьтесь с планом чрезвычайных ситуаций.',
      licensedSoftware: 'Лицензионное ПО',
      licensedSoftwareDesc: 'Используйте только лицензионное и разрешенное программное обеспечение. Загрузка и установка пиратского ПО строго запрещены.',
      keepSilence: 'Соблюдайте Тишину',
      keepSilenceDesc: 'Соблюдайте тишину, чтобы не мешать другим студентам. Используйте наушники для шумной работы.',
      respectEquipment: 'Уважение к Оборудованию',
      respectEquipmentDesc: 'Не повреждайте оборудование. Немедленно сообщайте властям о любом оборудовании, которое вы подозреваете в неисправности.',
      moreQuestions: 'Еще вопросы?',
      moreQuestionsDesc: 'Если у вас есть вопросы по правилам, обратитесь к руководителю лаборатории.',
      contactInstructor: 'Связаться с Преподавателем',
      platform: 'Платформа',
      resources: 'Ресурсы',
      contact: 'Контакты',
      labRules: 'Правила Лаборатории',
      systemStatus: 'Статус Системы',
      documentation: 'Документация',
      documentationLink: 'Документация',
      allRightsReserved: 'Все права защищены.',
      designedBy: 'ДИЗАЙН И РАЗРАБОТКА',
      features: 'Функции',
      labRulesNav: 'Правила Лаборатории',
      login: 'Войти',
      getStarted: 'Начать',
      studentPortal: 'Портал Студента',
      instructorPortal: 'Портал Преподавателя',
      examSchedule: 'Расписание Экзаменов',
      ataturk: 'Мустафа Кемаль Ататюрк',
      ataturkQuote1: 'Вся моя надежда',
      ataturkQuote2: 'на молодежь',
      polyosExpansion: 'Система управления школьной лабораторией и домашними заданиями Pardus',
      dashboard: 'Панель'
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

  const rules = [
    { icon: UtensilsCrossed, title: t.noFoodDrink, description: t.noFoodDrinkDesc, color: 'orange', category: 'general' },
    { icon: Zap, title: t.electricalSafety, description: t.electricalSafetyDesc, color: 'red', category: 'safety' },
    { icon: Shield, title: t.digitalPrivacy, description: t.digitalPrivacyDesc, color: 'blue', category: 'digital' },
    { icon: Trash2, title: t.cleanWorkspace, description: t.cleanWorkspaceDesc, color: 'teal', category: 'general' },
    { icon: AlertTriangle, title: t.emergencyExits, description: t.emergencyExitsDesc, color: 'yellow', category: 'safety' },
    { icon: FileCheck, title: t.licensedSoftware, description: t.licensedSoftwareDesc, color: 'indigo', category: 'digital' },
    { icon: Volume2, title: t.keepSilence, description: t.keepSilenceDesc, color: 'purple', category: 'general' },
    { icon: HardHat, title: t.respectEquipment, description: t.respectEquipmentDesc, color: 'pink', category: 'safety' }
  ];

  const colorClasses = {
    orange: { bg: '#fff7ed', text: '#ea580c' },
    red: { bg: '#fef2f2', text: '#dc2626' },
    blue: { bg: '#eff6ff', text: '#2563eb' },
    teal: { bg: '#f0fdfa', text: '#0d9488' },
    yellow: { bg: '#fefce8', text: '#ca8a04' },
    indigo: { bg: '#eef2ff', text: '#4f46e5' },
    purple: { bg: '#faf5ff', text: '#9333ea' },
    pink: { bg: '#fdf2f8', text: '#db2777' }
  };

  const filteredRules = activeFilter === 'all' 
    ? rules 
    : rules.filter(rule => rule.category === activeFilter);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Lexend', sans-serif", color: '#1e293b' }}>
      {isSetupRequired && <SystemSetupPopup />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');
        body { font-family: 'Lexend', sans-serif !important; }
        .glass-nav { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.3); }
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); }
        .hero-mesh { background: radial-gradient(circle at 15% 50%, rgba(36, 99, 235, 0.1), transparent 25%), radial-gradient(circle at 85% 30%, rgba(124, 58, 237, 0.1), transparent 25%); background-color: #f8fafc; }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .rule-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .rule-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.1); border-color: rgba(36, 99, 235, 0.2); }
      `}</style>

      {/* Navigation */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'all 0.3s' }}>
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
              <a style={{ fontSize: '14px', fontWeight: '600', color: '#2463eb', textDecoration: 'none', cursor: 'default' }}>{t.labRulesNav}</a>
              <a onClick={() => navigate('/dokumantasyon')} style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>{t.documentation}</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowLangMenu(!showLangMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.8)', color: '#64748b', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: '1px solid rgba(226, 232, 240, 0.8)', cursor: 'pointer' }}>
                  <Globe style={{ width: '16px', height: '16px' }} />
                  <span>{currentLang}</span>
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                </button>
                {showLangMenu && (
                  <div onMouseLeave={() => setShowLangMenu(false)} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)', padding: '8px', minWidth: '160px', zIndex: 100 }}>
                    {languages.map(lang => (
                      <button key={lang.code} onClick={() => { changeLanguage(lang.code.toLowerCase()); setCurrentLang(lang.code); setShowLangMenu(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', background: currentLang === lang.code ? 'rgba(36, 99, 235, 0.08)' : 'transparent', color: currentLang === lang.code ? '#2463eb' : '#64748b', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
                        <span>{lang.name}</span>
                        {currentLang === lang.code && <CheckCircle style={{ width: '14px', height: '14px' }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => navigate(isAuthenticated ? (userType === 'student' ? '/ogrenci/panel' : '/ogretmen/panel') : '/ogrenci/giris')} style={{ background: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                {isAuthenticated ? t.dashboard : t.login}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-mesh" style={{ padding: '160px 24px 80px', textAlign: 'center' }}>
        <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#2463eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>{t.guidelines}</p>
          <h1 style={{ fontSize: '56px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.03em', color: '#0f172a' }}>{t.title}</h1>
          <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>{t.subtitle}</p>
        </div>
      </div>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 100px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', justifyContent: 'center', overflowX: 'auto', paddingBottom: '8px' }}>
          {['all', 'general', 'safety', 'digital'].map(filter => (
            <button key={filter} onClick={() => setActiveFilter(filter)} style={{ padding: '10px 24px', background: activeFilter === filter ? '#0f172a' : 'white', color: activeFilter === filter ? 'white' : '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {filter === 'all' ? t.allRules : filter === 'general' ? t.generalConduct : filter === 'safety' ? t.safetyProcedures : t.digitalEthics}
            </button>
          ))}
        </div>

        {/* Rules Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '64px' }}>
          {filteredRules.map((rule, idx) => {
            const Icon = rule.icon;
            const colors = colorClasses[rule.color];
            return (
              <div key={idx} className="glass-card rule-card" style={{ borderRadius: '24px', padding: '32px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <Icon size={28} color={colors.text} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>{rule.title}</h3>
                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6' }}>{rule.description}</p>
              </div>
            );
          })}

          <div className="glass-card" style={{ borderRadius: '24px', padding: '32px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'rgba(36, 99, 235, 0.02)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <HelpCircle size={28} color="#2463eb" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{t.moreQuestions}</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>{t.moreQuestionsDesc}</p>
            <button style={{ color: '#2463eb', fontWeight: '700', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>{t.contactInstructor}</button>
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
                      <a style={{ color: 'white', fontSize: '14px', textDecoration: 'underline', textDecorationColor: '#ef4444', transition: 'all 0.2s', display: 'inline-block' }}>
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

export default LabRules;
