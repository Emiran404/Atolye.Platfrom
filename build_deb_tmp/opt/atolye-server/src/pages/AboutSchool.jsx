import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, Globe, ChevronDown, ArrowLeft, 
  Users, School, BookOpen, Trophy, 
  Target, Compass, Clock, MapPin,
  Cpu, Layout, Coffee, Dumbbell,
  Wifi, Home, Award, Star, Mail, Code
} from 'lucide-react';
import { getCurrentLanguage, changeLanguage } from '../utils/i18n';
import SystemSetupPopup from '../components/ui/SystemSetupPopup';

const AboutSchool = () => {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage().toUpperCase());
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSetupRequired, setIsSetupRequired] = useState(false);

  React.useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch('/api/auth/setup-status');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
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
      title: 'OKUL ÖZELLİKLERİ',
      subtitle: 'Alanya Mesleki ve Teknik Anadolu Lisesi Tesisleri ve Başarıları',
      back: 'Ana Sayfaya Dön',
      statsTitle: 'Sayılarla Okulumuz',
      visionMission: 'Vizyon & Misyon',
      awardsTitle: 'Başarılarımız',
      facilitiesTitle: 'Tesislerimiz',
      detailsTitle: 'Genel Bilgiler',
      classrooms: 'Derslik Sayısı',
      teachers: 'Öğretmen Sayısı',
      students: 'Öğrenci Sayısı',
      workshops: 'Atölye/İşlik',
      halls: 'Çok Amaçlı Salon',
      gym: 'Spor Salonu',
      labs: 'Fen Laboratuvarı',
      itClasses: 'BT Sınıfı',
      library: 'Kütüphane',
      books: 'Kitap Sayısı',
      cafeteria: 'Yemekhane',
      teachingType: 'Öğretim Şekli',
      address: 'Adres',
      hours: 'Okul Saatleri',
      heating: 'Isınma',
      connection: 'Bağlantı',
      housing: 'Lojman',
      awards: 'Ödüller & Projeler',
      vision: 'Vizyonumuz',
      visionText: 'Bilgi çağının değişen ihtiyaçları doğrultusunda öğrencilerimize çağdaş dünyanın standartlarında gerekli olan bilgi, beceri, donanım ve davranışları kazandırmak. Herkesin her gün daha iyiye ulaşmak için çalıştıkları bir ortam hazırlamaktır.',
      mission: 'Misyonumuz',
      missionText: 'Türk Milli Eğitimini hedef ve stratejisine uygun Mesleki ve Teknik Eğitim Kurumu olarak bütün öğrencilerimizin demokratik, laik, mesleklerinde bilgili, becerili ve kendine güvenen bireyler olarak yetişmelerini sağlamak, fırsat vermek ve 21. yüzyılın gelişen ihtiyaçlarına cevap verebilecek, ülkesini ve milletini seven çalışmalarından heyecan duyan insanlar olarak yetiştirmektir.',
      ataturkQuote1: 'Bütün Ümidim',
      ataturkQuote2: 'Gençliktedir',
      allRightsReserved: 'Tüm hakları saklıdır.',
      designedBy: 'TASARIM & KODLAMA',
      ataturk: 'Mustafa Kemal Atatürk',
      studentPortal: 'Öğrenci Portalı',
      instructorPortal: 'Öğretmen Portalı',
      labRules: 'Laboratuvar Kuralları',
      documentationLink: 'Dokümantasyon',
      systemStatus: 'Sistem Durumu',
      platform: 'Platform',
      resources: 'Kaynaklar',
      contact: 'İletişim',
      fullDay: 'Tam Gün - Tam Yıl',
      fiber: 'Fatih Projesi Fiber İnternet',
      housingUnits: '10 Dairelik Lojman',
      ac: 'Klima',
      officialAddress: 'Cumhuriyet Mah. Sanayi Cd. No.45 Alanya',
      futureTech: 'Geleceğin Teknolojisi',
      futureDesc: 'Alanya MTAL kampüsünde modern eğitim araçları ve atölyelerle donatılmış 21. yüzyıl becerileri kazandırılmaktadır.',
      achievements: [
        { year: '2024', title: '16. Uluslararası MEB Robot Yarışması', desc: 'İleri Seviye Çizgi İzleyen kategorisinde başarıyla yarışıldı.' },
        { year: '2024', title: 'STEM Okul Etiketi (STEM School Label)', desc: 'STEM okulu unvanı kazanan sınırlı sayıdaki Avrupa okulundan biri.' },
        { year: '2024', title: 'eTwinning Kalite Etiketleri', desc: '"Countries and Their Cultures" ve "Dont Be Dependent Be Alive" projeleri ulusal kalite etiketi aldı.' },
        { year: '2021', title: 'Patent ve Faydalı Model başarısı', desc: 'Antalya ilinde patenti onaylanan iki okuldan biri.' },
        { year: '2021', title: 'Teknofest İstabul Finalleri', desc: 'Alya Türk Takımı "Yaban Projesi" ile finallere katıldı.' },
        { year: '2019', title: '13. Uluslararası MEB Robot Yarışması', desc: 'Samsun\'daki yarışmada ikinci tura yükselme başarısı.' },
        { year: '2018', title: 'TÜBİTAK 49. Lise Öğrencileri Araştırma Projesi', desc: 'KONYA Bölge Birinciliği - "Anla Beni!" Projesi.' },
        { year: '2017', title: 'TÜBİTAK 48. Lise Öğrencileri Araştırma Projesi', desc: 'KONYA Bölge Birinciliği ve Türkiye Finali TEŞVİK ödülü.' },
        { year: '2012', title: 'e-biko Bilişim Olimpiyatları', desc: 'Gümüş Madalya - "Fantommobil Projesi".' }
      ]
    },
    EN: {
      title: 'SCHOOL FEATURES',
      subtitle: 'Alanya Vocational and Technical Anatolian High School Facilities and Achievements',
      back: 'Back to Home',
      statsTitle: 'Our School in Numbers',
      visionMission: 'Vision & Mission',
      awardsTitle: 'Our Achievements',
      facilitiesTitle: 'Our Facilities',
      detailsTitle: 'General Information',
      classrooms: 'Number of Classrooms',
      teachers: 'Number of Teachers',
      students: 'Number of Students',
      workshops: 'Workshops',
      halls: 'Multi-purpose Halls',
      gym: 'Gymnasium',
      labs: 'Science Lab',
      itClasses: 'IT Classes',
      library: 'Library',
      books: 'Number of Books',
      cafeteria: 'Dining Hall',
      teachingType: 'Teaching Type',
      address: 'Address',
      hours: 'School Hours',
      heating: 'Heating',
      connection: 'Connection',
      housing: 'Faculty Housing',
      awards: 'Awards & Projects',
      vision: 'Our Vision',
      visionText: 'To provide students with the necessary knowledge, skills, and attitudes for the contemporary world in line with the changing needs of the information age, creating an environment where everyone strives for continuous improvement.',
      mission: 'Our Mission',
      missionText: 'To raise students as democratic, secular, knowledgeable, skilled, and confident individuals, providing opportunities for them to meet the demands of the 21st century and to be individuals who love their country and nation and are enthusiastic about their work.',
      ataturkQuote1: 'All My Hope',
      ataturkQuote2: 'Is In Youth',
      allRightsReserved: 'All rights reserved.',
      designedBy: 'DESIGN & CODING',
      ataturk: 'Mustafa Kemal Atatürk',
      studentPortal: 'Student Portal',
      instructorPortal: 'Instructor Portal',
      labRules: 'Lab Rules',
      documentationLink: 'Documentation',
      systemStatus: 'System Status',
      platform: 'Platform',
      resources: 'Resources',
      contact: 'Contact',
      fullDay: 'Full Day - Full Year',
      fiber: 'Fatih Project Fiber Internet',
      housingUnits: '10-unit Staff Housing',
      ac: 'Air Conditioning',
      officialAddress: 'Cumhuriyet Mah. Sanayi Cd. No.45 Alanya',
      polyosExpansion: 'Pardus School Laboratory Management and Homework System',
      futureTech: 'Technology of the Future',
      futureDesc: 'Alanya MTAL campus provides 21st-century skills equipped with modern education tools and workshops.',
      achievements: [
        { year: '2024', title: '16th International MEB Robot Competition', desc: 'Successfully competed in the Advanced Line Follower category.' },
        { year: '2024', title: 'STEM School Label', desc: 'One of the few European schools titled as a STEM school.' },
        { year: '2024', title: 'eTwinning Quality Labels', desc: '"Countries and Their Cultures" and "Dont Be Dependent Be Alive" projects received national quality labels.' },
        { year: '2021', title: 'Patent and Utility Model Success', desc: 'One of only two schools in Antalya with approved patents.' },
        { year: '2021', title: 'Teknofest Istanbul Finals', desc: 'Participated in the finals with the "Yaban Project".' },
        { year: '2019', title: '13th International MEB Robot Competition', desc: 'Promoted to the second round in Samsun competition.' },
        { year: '2018', title: 'TÜBİTAK 49th High School Research Projects', desc: 'KONYA Regional Winner - "Anla Beni!" Project.' },
        { year: '2017', title: 'TÜBİTAK 48th High School Research Projects', desc: 'KONYA Regional Winner and Turkey Finals INCENTIVE award.' },
        { year: '2012', title: 'e-biko Informatics Olympiad', desc: 'Silver Medal - "Fantommobil Project".' }
      ]
    },
    DE: {
      title: 'SCHULMERKMALE',
      subtitle: 'Ausstattung und Erfolge der Alanya Beruflichen und Technischen Anatolischen Oberschule',
      back: 'Zurück zur Startseite',
      statsTitle: 'Unsere Schule in Zahlen',
      visionMission: 'Vision & Mission',
      awardsTitle: 'Unsere Erfolge',
      facilitiesTitle: 'Unsere Einrichtungen',
      detailsTitle: 'Allgemeine Informationen',
      classrooms: 'Anzahl der Klassenzimmer',
      teachers: 'Anzahl der Lehrer',
      students: 'Anzahl der Schüler',
      workshops: 'Werkstätten',
      halls: 'Mehrzweckhallen',
      gym: 'Sporthalle',
      labs: 'Naturwissenschaftliches Labor',
      itClasses: 'IT-Klassen',
      library: 'Bibliothek',
      books: 'Anzahl der Bücher',
      cafeteria: 'Kantine',
      teachingType: 'Unterrichtsform',
      address: 'Adresse',
      hours: 'Schulzeiten',
      heating: 'Heizung',
      connection: 'Verbindung',
      housing: 'Personalwohnungen',
      awards: 'Auszeichnungen & Projekte',
      vision: 'Unsere Vision',
      visionText: 'In Übereinstimmung mit den sich ändernden Bedürfnissen des Informationszeitalters unseren Schülern die notwendigen Kenntnisse, Fähigkeiten, Ausrüstungen und Verhaltensweisen in den Standards der zeitgenössischen Welt zu vermitteln. Ein Umfeld zu schaffen, in dem jeder daran arbeitet, jeden Tag besser zu werden.',
      mission: 'Unsere Mission',
      missionText: 'Als Berufs- und technische Bildungseinrichtung gemäß den Zielen und Strategien der türkischen nationalen Bildung sicherzustellen, dass alle unsere Schüler als demokratische, säkulare, sachkundige, fähige und selbstbewusste Persönlichkeiten aufwachsen, ihnen die Chance geben und sie als Menschen erziehen, die auf die sich entwickelnden Bedürfnisse des 21. Jahrhunderts reagieren können, ihr Land und ihre Nation lieben und von ihrer Arbeit begeistert sind.',
      ataturkQuote1: 'Meine ganze Hoffnung',
      ataturkQuote2: 'liegt in der Jugend',
      allRightsReserved: 'Alle Rechte vorbehalten.',
      designedBy: 'DESIGN & CODIERUNG',
      ataturk: 'Mustafa Kemal Atatürk',
      studentPortal: 'Studentenportal',
      instructorPortal: 'Lehrerportal',
      labRules: 'Laborregeln',
      documentationLink: 'Dokumentation',
      systemStatus: 'Systemstatus',
      platform: 'Plattform',
      resources: 'Ressourcen',
      contact: 'Kontakt',
      fullDay: 'Ganztagsschule',
      fiber: 'Fatih Projekt Glasfaser Internet',
      housingUnits: '10 Personalwohneinheiten',
      ac: 'Klimaanlage',
      officialAddress: 'Cumhuriyet Mah. Sanayi Cd. No.45 Alanya',
      polyosExpansion: 'Pardus Schul-Laborverwaltungs- und Hausaufgabensystem',
      futureTech: 'Technologie der Zukunft',
      futureDesc: 'Das Alanya MTAL Campus vermittelt Fähigkeiten für das 21. Jahrhundert und ist mit modernen Bildungswerkzeugen ausgestattet.',
      achievements: [
        { year: '2024', title: '16. Internationaler MEB Robot-Wettbewerb', desc: 'Erfolgreiche Teilnahme in der Kategorie Fortgeschrittener Linienfolger.' },
        { year: '2024', title: 'STEM Okul Etiketi (STEM School Label)', desc: 'Eine der wenigen europäischen Schulen mit dem Titel einer STEM-Schule.' },
        { year: '2024', title: 'eTwinning-Qualitätssiegel', desc: 'Die Projekte "Countries and Their Cultures" und "Dont Be Dependent Be Alive" erhielten nationale Qualitätssiegel.' },
        { year: '2021', title: 'Patent- und Gebrauchsmustererfolg', desc: 'Eine von nur zwei Schulen in Antalya mit genehmigten Patenten.' },
        { year: '2021', title: 'Teknofest Istanbul Finale', desc: 'Teilnahme am Finale mit dem "Yaban-Projekt".' },
        { year: '2019', title: '13. Internationaler MEB Robot-Wettbewerb', desc: 'Aufstieg in die zweite Runde im Samsun-Wettbewerb.' },
        { year: '2018', title: 'TÜBİTAK 49. Forschungsprojekte für Oberschüler', desc: 'Regionaler Sieger KONYA - "Anla Beni!" Projekt.' },
        { year: '2017', title: 'TÜBİTAK 48. Forschungsprojekte für Oberschüler', desc: 'Regionaler Sieger KONYA und ANREIZ-Preis im Türkei-Finale.' },
        { year: '2012', title: 'e-biko Informatik-Olympiade', desc: 'Silbermedaille - "Fantommobil Projesi".' }
      ]
    },
    RU: {
      title: 'ХАРАКТЕРИСТИКИ ШКОЛЫ',
      subtitle: 'Оснащение и достижения Аланийского профессионально-технического анатолийского лицея',
      back: 'Вернуться на главную',
      statsTitle: 'Наша школа в цифрах',
      visionMission: 'Видение и Миссия',
      awardsTitle: 'Наши достижения',
      facilitiesTitle: 'Наше оснащение',
      detailsTitle: 'Общая информация',
      classrooms: 'Количество классов',
      teachers: 'Количество учителей',
      students: 'Количество учеников',
      workshops: 'Мастерские',
      halls: 'Многоцелевые залы',
      gym: 'Спортивный зал',
      labs: 'Лаборатория',
      itClasses: 'IT-классы',
      library: 'Библиотека',
      books: 'Количество книг',
      cafeteria: 'Столовая',
      teachingType: 'Тип обучения',
      address: 'Адрес',
      hours: 'Школьные часы',
      heating: 'Отопление',
      connection: 'Связь',
      housing: 'Жилье',
      awards: 'Награды и проекты',
      vision: 'Наше видение',
      visionText: 'В соответствии с меняющимися потребностями информационной эры, привить нашим студентам необходимые знания, навыки, оборудование и поведение в соответствии со стандартами современного мира. Подготовить среду, в которой каждый работает над тем, чтобы становиться лучше с каждым днем.',
      mission: 'Наша миссия',
      missionText: 'В качестве профессионально-технического учебного заведения, соответствующего целям и стратегиям Турецкого национального образования, обеспечить, чтобы все наши студенты выросли демократичными, светскими, знающими, квалифицированными и уверенными в себе людьми, дать им возможность и воспитать их как людей, способных отвечать на меняющиеся потребности 21-го века, любящих свою страну и нацию и с энтузиазмом относящихся к своей работе.',
      ataturkQuote1: 'Вся моя надежда',
      ataturkQuote2: 'на молодежь',
      allRightsReserved: 'Все права защищены.',
      designedBy: 'ДИЗАЙН И КОДИРОВАНИЕ',
      ataturk: 'Мустафа Кемаль Ататюрк',
      studentPortal: 'Студенческий портал',
      instructorPortal: 'Портал для преподавателей',
      labRules: 'Правила лаборатории',
      documentationLink: 'Документация',
      systemStatus: 'Статус системы',
      platform: 'Платформа',
      resources: 'Ресурсы',
      contact: 'Контакты',
      fullDay: 'Полный день',
      fiber: 'Оптоволоконный интернет Fatih',
      housingUnits: '10 квартир для персонала',
      ac: 'Кондиционер',
      officialAddress: 'Cumhuriyet Mah. Sanayi Cd. No.45 Alanya',
      polyosExpansion: 'Система управления школьной лабораторией и домашними заданиями Pardus',
      futureTech: 'Технологии будущего',
      futureDesc: 'Кампус Alanya MTAL обучает навыкам 21 века, используя современные образовательные инструменты и мастерские.',
      achievements: [
        { year: '2024', title: '16-й Международный конкурс роботов MEB', desc: 'Успешное участие в категории Advanced Line Follower.' },
        { year: '2024', title: 'Знак школы STEM', desc: 'Одна из немногих европейских школ, получивших статус школы STEM.' },
        { year: '2024', title: 'Знаки качества eTwinning', desc: 'Проекты "Страны и их культуры" и "Не будь зависимым, будь живым" получили национальные знаки качества.' },
        { year: '2021', title: 'Успех патента и полезной модели', desc: 'Одна из двух школ в Анталье с утвержденными патентами.' },
        { year: '2021', title: 'Финал Технофеста в Стамбуле', desc: 'Участие в финале с проектом "Yaban".' },
        { year: '2019', title: '13-й Международный конкурс роботов MEB', desc: 'Выход во второй раунд на соревнованиях в Самсуне.' },
        { year: '2018', title: 'TÜBİTAK 49-е исследовательские проекты лицеистов', desc: 'Победитель региона Конья - проект "Пойми меня!".' },
        { year: '2017', title: 'TÜBİTAK 48-е исследовательские проекты лицеистов', desc: 'Победитель региона Конья и поощрительная премия в финале Турции.' },
        { year: '2012', title: 'Олимпиада по информатике e-biko', desc: 'Серебряная медаль - проект "Fantomobil".' }
      ]
    }
  };

  const t = translations[currentLang] || translations.TR;
  const achievementList = t.achievements;

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

  const stats = [
    { icon: School, label: t.classrooms, value: '39', color: '#2463eb' },
    { icon: Users, label: t.teachers, value: '88', color: '#7c3aed' },
    { icon: Users, label: t.students, value: '1210', color: '#db2777' },
    { icon: Cpu, label: t.workshops, value: '27', color: '#0d9488' },
    { icon: Layout, label: t.halls, value: '3', color: '#ea580c' },
    { icon: Dumbbell, label: t.gym, value: '1', color: '#dc2626' },
    { icon: Star, label: t.labs, value: '1', color: '#ca8a04' },
    { icon: Terminal, label: t.itClasses, value: '1-8', color: '#2563eb' },
    { icon: BookOpen, label: t.library, value: '1', color: '#4f46e5' },
    { icon: Award, label: t.books, value: '2200', color: '#9333ea' },
    { icon: Coffee, label: t.cafeteria, value: '1', color: '#db2777' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Lexend', sans-serif", color: '#1e293b' }}>
      {isSetupRequired && <SystemSetupPopup />}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');
        body { font-family: 'Lexend', sans-serif !important; }
        .glass-nav { background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.3); }
        .hero-mesh { background: radial-gradient(circle at 15% 50%, rgba(37, 99, 235, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(124, 58, 237, 0.08), transparent 25%); background-color: #f8fafc; }
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(226, 232, 240, 0.8); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .glass-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.08); border-color: rgba(36, 99, 235, 0.2); }
        .stat-card { text-align: center; padding: 24px; border-radius: 20px; }
        .achievement-item { position: relative; padding-left: 32px; border-left: 2px solid #e2e8f0; margin-bottom: 24px; }
        .achievement-item::before { content: ""; position: absolute; left: -7px; top: 0; width: 12px; height: 12px; border-radius: 50%; background: #2463eb; border: 2px solid white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
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
              <a onClick={() => navigate('/')} style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>{currentLang === 'TR' ? 'Ana Sayfa' : (currentLang === 'EN' ? 'Home' : (currentLang === 'DE' ? 'Startseite' : 'Главная'))}</a>
              <a onClick={() => navigate('/lab-rules')} style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>{t.labRules}</a>
              <a onClick={() => navigate('/dokumantasyon')} style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>{t.documentationLink}</a>
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
              <button 
                onClick={() => navigate('/')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: '#0f172a', color: 'white', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft size={16} />
                {t.back}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="hero-mesh" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', letterSpacing: '-0.03em' }}>
              {t.title}
            </h1>
            <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
              {t.subtitle}
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{ marginBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <Compass style={{ color: '#2463eb' }} />
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{t.statsTitle}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="glass-card stat-card">
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${stat.color}10`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Icon size={24} />
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: '48px' }}>
            {/* Left: Vision, Mission & Achievements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
              
              {/* Vision & Mission */}
              <div className="glass-card" style={{ padding: '40px', borderRadius: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                  <Target style={{ color: '#2463eb' }} />
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{t.visionMission}</h2>
                </div>
                
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#2463eb', marginBottom: '12px' }}>{t.vision}</h3>
                  <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7' }}>
                    {t.visionText}
                  </p>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#7c3aed', marginBottom: '12px' }}>{t.mission}</h3>
                  <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7' }}>
                    {t.missionText}
                  </p>
                </div>
              </div>

              {/* Achievements */}
              <div style={{ marginBottom: '64px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                  <Trophy style={{ color: '#ea580c' }} />
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{t.awardsTitle}</h2>
                </div>
                
                <div>
                  {achievementList.map((item, idx) => (
                    <div key={idx} className="achievement-item">
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#2463eb', marginBottom: '4px' }}>{item.year}</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>{item.title}</div>
                      <div style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.5' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Details & Facilities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              
              {/* General Details */}
              <div className="glass-card" style={{ padding: '32px', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <Compass style={{ color: '#db2777' }} />
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{t.detailsTitle}</h2>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <DetailItem icon={Clock} label={t.hours} value="08:30 - 17:15" />
                  <DetailItem icon={Target} label={t.teachingType} value={t.fullDay} />
                  <DetailItem icon={Wifi} label={t.connection} value={t.fiber} />
                  <DetailItem icon={Home} label={t.housing} value={t.housingUnits} />
                  <DetailItem icon={Target} label={t.heating} value={t.ac} />
                  <DetailItem icon={MapPin} label={t.address} value={t.officialAddress} />
                </div>
              </div>

              {/* Facilities Illustration/Context */}
              <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '300px' }}>
                <img 
                  src="/Alanya Mesleki ve Teknik Anadolu Lisesi.png" 
                  alt="School Campus" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9), transparent)' }} />
                <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
                  <div style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>{t.futureTech}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{t.futureDesc}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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

const DetailItem = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ minWidth: '32px', display: 'flex', justifyContent: 'center' }}>
      <Icon size={18} color="#94a3b8" />
    </div>
    <div>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>{value}</div>
    </div>
  </div>
);

export default AboutSchool;
