import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  FileText,
  Users,
  ClipboardCheck,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Archive,
  Shield,
  Monitor,
  MonitorPlay,
  Award,
  AlertTriangle,
  ArrowUpCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import PasskeyModal from '../ui/PasskeyModal';

const TeacherLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState(true);

  // Passkey modal kontrolü - giriş yapıldığında göster
  useEffect(() => {
    const passkeyDismissed = localStorage.getItem('passkey_modal_dismissed');
    if (!passkeyDismissed) {
      // Kısa bir gecikme ile modal göster (sayfa yüklendikten sonra)
      const timer = setTimeout(() => {
        setShowPasskeyModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Güncelleme Kontrolü
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const response = await fetch('/api/system/check-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force: false }) // Önbelleği (cache) kullan
        });
        const data = await response.json();
        if (data.success && data.updateAvailable) {
          setUpdateAvailable(data);
          
          // Eğer banner daha önce bu oturumda kapatılmadıysa göster
          const dismissedVersion = sessionStorage.getItem('update_banner_dismissed');
          if (dismissedVersion === data.latestVersion) {
            setShowUpdateBanner(false);
          }
        }
      } catch (error) {
        console.error('Güncelleme kontrolü başarısız:', error);
      }
    };

    checkUpdates();
    
    // Her 30 dakikada bir kontrol et
    const interval = setInterval(checkUpdates, 1800000);
    return () => clearInterval(interval);
  }, []);

  // CSS Animasyonları
  const animationStyles = `
    @keyframes logoFloat {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-3px) rotate(1deg); }
    }
    @keyframes logoPulse {
      0%, 100% { box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3); }
      50% { box-shadow: 0 6px 20px rgba(13, 148, 136, 0.5); }
    }
    @keyframes textShimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes emojiWave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-10deg); }
      75% { transform: rotate(10deg); }
    }
    .teacher-logo-container {
      transition: all 0.3s ease;
      display: inline-block;
    }
    .teacher-logo-container:hover {
      animation: emojiWave 0.5s ease-in-out;
    }
    .teacher-brand-text {
      background: linear-gradient(90deg, #0d9488 0%, #14b8a6 25%, #2dd4bf 50%, #14b8a6 75%, #0d9488 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: textShimmer 4s linear infinite;
    }
  `;

  const menuItems = [
    { icon: Home, label: 'Ana Sayfa', path: '/ogretmen/panel' },
    { icon: PlusCircle, label: 'Sınav Oluştur', path: '/ogretmen/sinav-olustur' },
    { icon: FileText, label: 'Aktif Sınavlar', path: '/ogretmen/aktif-sinavlar' },
    { icon: MonitorPlay, label: 'Canlı Sınav', path: '/ogretmen/canli-sinav' },
    { icon: Users, label: 'Öğrenci Listesi', path: '/ogretmen/ogrenci-listesi' },
    { icon: ClipboardCheck, label: 'Değerlendirme', path: '/ogretmen/degerlendirme' },
    { icon: Archive, label: 'Arşiv', path: '/ogretmen/arsiv' },
    { icon: BarChart3, label: 'İstatistikler', path: '/ogretmen/istatistikler' },
    { icon: Award, label: 'Öğrenci Notları', path: '/ogretmen/ogrenci-notlari' },
    { icon: Shield, label: 'Platform Yönetimi', path: '/ogretmen/platform-yonetimi' },
    { icon: Monitor, label: 'Entegre Sistemler', path: '/ogretmen/entegre-sistemler', special: true },
    { icon: Bell, label: 'Bildirimler', path: '/ogretmen/bildirimler' },
    { icon: Settings, label: 'Ayarlar', path: '/ogretmen/ayarlar' },
    { icon: AlertTriangle, label: 'Sorun Bildir', path: '/ogretmen/sorun-bildir' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const sidebarStyles = {
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: sidebarOpen ? '280px' : '80px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      zIndex: 1000,
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
    },
    logo: {
      padding: '20px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: sidebarOpen ? 'space-between' : 'center',
      minHeight: '80px'
    },
    logoText: {
      fontSize: '18px',
      fontWeight: '700',
      display: sidebarOpen ? 'flex' : 'none',
      alignItems: 'center',
      gap: '8px'
    },
    toggleBtn: {
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#f1f5f9',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#64748b',
      transition: 'all 0.2s'
    },
    userSection: {
      padding: sidebarOpen ? '20px' : '12px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '18px',
      fontWeight: '600',
      flexShrink: 0
    },
    userInfo: {
      display: sidebarOpen ? 'block' : 'none',
      overflow: 'hidden'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    userRole: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '2px'
    },
    nav: {
      flex: 1,
      padding: '16px 12px',
      overflowY: 'auto'
    },
    navItem: (active, isSpecial = false) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: sidebarOpen ? '12px 16px' : '12px',
      marginBottom: '4px',
      borderRadius: '10px',
      cursor: 'pointer',
      backgroundColor: (isSpecial && active)
        ? undefined
        : (isSpecial
          ? (active ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.08)')
          : (active ? '#f0fdfa' : 'transparent')),
      background: isSpecial && active
        ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)'
        : undefined,
      color: isSpecial
        ? (active ? '#a855f7' : '#9333ea')
        : (active ? '#0d9488' : '#475569'),
      fontWeight: active ? '600' : '500',
      fontSize: '14px',
      transition: 'all 0.2s',
      border: isSpecial ? '1px solid rgba(147, 51, 234, 0.3)' : 'none',
      width: '100%',
      textAlign: 'left',
      justifyContent: sidebarOpen ? 'flex-start' : 'center',
      boxShadow: isSpecial && active ? '0 4px 12px rgba(147, 51, 234, 0.2)' : 'none'
    }),
    navLabel: {
      display: sidebarOpen ? 'block' : 'none',
      whiteSpace: 'nowrap'
    },
    logoutSection: {
      padding: '16px 12px',
      borderTop: '1px solid #e2e8f0'
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: sidebarOpen ? '12px 16px' : '12px',
      borderRadius: '10px',
      cursor: 'pointer',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      fontWeight: '500',
      fontSize: '14px',
      border: 'none',
      width: '100%',
      justifyContent: sidebarOpen ? 'flex-start' : 'center',
      transition: 'all 0.2s'
    },
    main: {
      marginLeft: sidebarOpen ? '280px' : '80px',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      transition: 'margin-left 0.3s ease'
    },
    content: {
      padding: '32px'
    },
    mobileHeader: {
      display: 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 16px',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 999
    },
    mobileMenuBtn: {
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      color: '#475569'
    },
    overlay: {
      display: mobileMenuOpen ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 998
    },
    updateBanner: {
      marginBottom: '24px',
      background: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)',
      borderRadius: '16px',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#ffffff',
      boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    },
    bannerGlow: {
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
      pointerEvents: 'none'
    },
    bannerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      zIndex: 1
    },
    bannerIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    bannerInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    bannerTitle: {
      fontSize: '15px',
      fontWeight: '700',
      marginBottom: '2px'
    },
    bannerText: {
      fontSize: '13px',
      opacity: 0.9
    },
    bannerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 1
    },
    updateBtn: {
      padding: '10px 20px',
      backgroundColor: '#ffffff',
      color: '#0d9488',
      border: 'none',
      borderRadius: '10px',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    closeBannerBtn: {
      padding: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    }
  };

  return (
    <div>
      <style>{`
        ${animationStyles}
        @media (max-width: 768px) {
          .teacher-sidebar {
            transform: ${mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
            width: 280px !important;
          }
          .teacher-main {
            margin-left: 0 !important;
            padding-top: 64px !important;
          }
          .teacher-mobile-header {
            display: flex !important;
          }
          .teacher-toggle-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* Mobile Header */}
      <div className="teacher-mobile-header" style={sidebarStyles.mobileHeader}>
        <button
          className="teacher-mobile-menu-btn"
          style={sidebarStyles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#0d9488' }}>
          Öğretmen Paneli
        </span>
        <div style={{ width: '40px' }} />
      </div>

      {/* Overlay */}
      <div style={sidebarStyles.overlay} onClick={() => setMobileMenuOpen(false)} />

      {/* Sidebar */}
      <aside className="teacher-sidebar" style={sidebarStyles.sidebar}>
        {/* Logo */}
        <div style={sidebarStyles.logo}>
          <span style={sidebarStyles.logoText}>
            <span className="teacher-logo-container">📚</span>
            <span className="teacher-brand-text">Öğretmen Paneli</span>
          </span>
          <button
            className="teacher-toggle-btn"
            style={sidebarStyles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* User Section */}
        <div style={sidebarStyles.userSection}>
          <div style={sidebarStyles.avatar}>
            {user?.fullName?.charAt(0) || 'Ö'}
          </div>
          <div style={sidebarStyles.userInfo}>
            <div style={sidebarStyles.userName}>{user?.fullName || 'Öğretmen'}</div>
            <div style={sidebarStyles.userRole}>{user?.department || 'Öğretmen'}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={sidebarStyles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              id={`nav-${item.path.replace('/ogretmen/', '')}`}
              style={sidebarStyles.navItem(isActive(item.path), item.special)}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  if (item.special) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)';
                  } else {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  if (item.special) {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.08)';
                  } else {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }
              }}
            >
              <item.icon size={20} />
              <span style={sidebarStyles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={sidebarStyles.logoutSection}>
          <button
            style={sidebarStyles.logoutBtn}
            onClick={handleLogout}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
          >
            <LogOut size={20} />
            <span style={sidebarStyles.navLabel}>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="teacher-main" style={sidebarStyles.main}>
        <div style={sidebarStyles.content}>
          {/* Sürüm Güncelleme Bildirimi */}
          {updateAvailable && showUpdateBanner && (
            <div className="update-banner-anim" style={sidebarStyles.updateBanner}>
              <div style={sidebarStyles.bannerGlow} />
              <div style={sidebarStyles.bannerContent}>
                <div style={sidebarStyles.bannerIcon}>
                  <ArrowUpCircle size={24} />
                </div>
                <div style={sidebarStyles.bannerInfo}>
                  <div style={sidebarStyles.bannerTitle}>Yeni Sürüm Mevcut! ({updateAvailable.latestVersion})</div>
                  <div style={sidebarStyles.bannerText}>
                    Sisteminiz için kritik iyileştirmeler içeren bir güncelleme hazır.
                  </div>
                </div>
              </div>
              <div style={sidebarStyles.bannerActions}>
                <button 
                  style={sidebarStyles.updateBtn}
                  onClick={() => navigate('/ogretmen/platform-yonetimi?tab=update')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  Şimdi Güncelle
                </button>
                <button 
                  style={sidebarStyles.closeBannerBtn}
                  onClick={() => {
                    setShowUpdateBanner(false);
                    sessionStorage.setItem('update_banner_dismissed', updateAvailable.latestVersion);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                  title="Kapat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {children}
        </div>
      </main>

      {/* Passkey Modal */}
      <PasskeyModal
        isOpen={showPasskeyModal}
        onClose={() => setShowPasskeyModal(false)}
        userName={user?.fullName}
        onGoToSettings={() => navigate('/ogretmen/ayarlar')}
      />
    </div>
  );
};

export default TeacherLayout;
