import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Upload,
  FolderOpen,
  Bell,
  Settings,
  FileText,
  GraduationCap,
  Code,
  ArrowLeft,
  LogOut,
  Award,
  Target,
  AlertTriangle
} from 'lucide-react';
import { t } from '../../utils/i18n';
import { useAuthStore } from '../../store/authStore';

const studentMenuItems = [
  { path: '/ogrenci', icon: Home, label: 'dashboard', end: true },
  { path: '/ogrenci/dosya-yukle', icon: Upload, label: 'fileUpload' },
  { path: '/ogrenci/gonderimlerim', icon: FileText, label: 'submissions' },
  { path: '/ogrenci/notlarim', icon: Award, label: 'grades' },
  { path: '/ogrenci/optiklerim', icon: Target, label: 'examOptics' },
  { path: '/ogrenci/bildirimler', icon: Bell, label: 'notifications' },
  { path: '/ogrenci/ayarlar', icon: Settings, label: 'settings' },
  { path: '/ogrenci/sorun-bildir', icon: AlertTriangle, label: 'reportProblemMenu' }
];

const StudentSidebar = () => {
  const navigate = useNavigate();
  const { logout, language } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside style={{
      display: 'flex',
      width: '288px',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRight: '1px solid #f0f1f4',
      background: 'white',
      padding: '20px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 20
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#2463eb',
            color: 'white'
          }}>
            <GraduationCap size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1', marginBottom: '2px' }}>
              Atölye
            </h1>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>
              Student Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {studentMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              id={`student-nav-${item.path.replace('/ogrenci', '').replace('/', '') || 'panel'}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '12px',
                background: isActive ? 'rgba(36, 99, 235, 0.1)' : 'transparent',
                color: isActive ? '#2463eb' : '#64748b',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                textDecoration: 'none',
                transition: 'all 0.2s'
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#475569';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              <item.icon size={20} />
              <span>{t(item.label)}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Developer Credit */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Ana Sayfaya Dön Butonu */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '12px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2463eb';
            e.currentTarget.style.borderColor = '#2463eb';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f1f5f9';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.color = '#475569';
          }}
        >
          <ArrowLeft size={20} />
          <span>{t('backToHome') || 'Ana Sayfaya Dön'}</span>
        </button>

        {/* Çıkış Yap Butonu */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.borderColor = '#fecaca';
            e.currentTarget.style.color = '#dc2626';
          }}
        >
          <LogOut size={20} />
          <span>{t('logout') || 'Çıkış Yap'}</span>
        </button>

        <div style={{ height: '1px', width: '100%', background: '#f0f1f4' }}></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 12px',
          opacity: 0.7,
          transition: 'opacity 0.2s',
          cursor: 'default'
        }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          <Code size={20} style={{ color: '#94a3b8' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', lineHeight: '1.2' }}>
              Developed by
            </p>
            <p style={{ fontSize: '14px', color: '#111318', fontWeight: '700', lineHeight: '1.2' }}>
              Emirhan Gök
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
