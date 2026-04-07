import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { t } from '../utils/i18n';

const NotificationPermissionPopup = () => {
  const { enablePushNotifications, pushEnabled } = useNotificationStore();
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    // Sayfa yüklendiğinde 3 saniye sonra popup göster
    const timer = setTimeout(() => {
      if (permission === 'default') {
        setShow(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [permission]);

  const requestPermission = async () => {
    try {
      const granted = await enablePushNotifications();
      setPermission(granted ? 'granted' : 'denied');
      
      if (granted) {
        // Test bildirimi gönder
        new Notification(t('notificationsEnabled'), {
          body: t('notificationsEnabledDesc'),
          icon: '/logo.png',
          badge: '/logo.png'
        });
        
        // 2 saniye sonra popup'ı kapat
        setTimeout(() => setShow(false), 2000);
      } else {
        setShow(false);
      }
    } catch (error) {
      console.error('Bildirim izni hatası:', error);
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    // 1 gün sonra tekrar göster
    localStorage.setItem('notificationDismissed', Date.now().toString());
  };

  if (!show || permission !== 'default') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '360px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      padding: '20px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out',
      border: '2px solid #e2e8f0'
    }}>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f1f5f9';
          e.currentTarget.style.color = '#64748b';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#94a3b8';
        }}
      >
        <X size={18} />
      </button>

      {/* Icon */}
      <div style={{
        width: '56px',
        height: '56px',
        backgroundColor: '#eff6ff',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        animation: 'pulse 2s infinite'
      }}>
        <Bell size={28} color="#3b82f6" />
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '8px',
        paddingRight: '24px'
      }}>
        {t('enableNotifications')}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '14px',
        color: '#64748b',
        lineHeight: '1.6',
        marginBottom: '16px'
      }}>
        {t('notificationPermissionDesc')}
      </p>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={requestPermission}
          style={{
            flex: 1,
            padding: '12px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Check size={18} />
          {t('allowNotifications')}
        </button>
        
        <button
          onClick={handleDismiss}
          style={{
            padding: '12px 20px',
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
        >
          {t('later')}
        </button>
      </div>

      {/* Info */}
      <p style={{
        fontSize: '12px',
        color: '#94a3b8',
        marginTop: '12px',
        lineHeight: '1.4'
      }}>
        {t('notificationSettingsNote')}
      </p>
    </div>
  );
};

export default NotificationPermissionPopup;
