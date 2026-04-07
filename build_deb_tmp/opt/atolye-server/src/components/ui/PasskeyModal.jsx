import React, { useState, useEffect } from 'react';
import { Shield, Key, Fingerprint, X, Settings } from 'lucide-react';

const PasskeyModal = ({ isOpen, onClose, userName, onGoToSettings }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('passkey_modal_dismissed', 'true');
    }
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleGoToSettings = () => {
    localStorage.setItem('passkey_modal_dismissed', 'true');
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      if (onGoToSettings) onGoToSettings();
    }, 300);
  };

  if (!isOpen) return null;

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0)',
      backdropFilter: isVisible ? 'blur(8px)' : 'blur(0px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      transition: 'all 0.3s ease',
      padding: '20px'
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      maxWidth: '480px',
      width: '100%',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)',
      padding: '32px 28px',
      position: 'relative',
      overflow: 'hidden'
    },
    headerPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.5
    },
    closeBtn: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      color: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    iconContainer: {
      width: '80px',
      height: '80px',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: '8px',
      position: 'relative',
      zIndex: 1
    },
    subtitle: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.85)',
      position: 'relative',
      zIndex: 1
    },
    content: {
      padding: '28px'
    },
    welcomeText: {
      fontSize: '15px',
      color: '#475569',
      lineHeight: '1.7',
      marginBottom: '24px'
    },
    featureList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '28px'
    },
    feature: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '14px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s'
    },
    featureIcon: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    featureTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '4px'
    },
    featureDesc: {
      fontSize: '13px',
      color: '#64748b',
      lineHeight: '1.5'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '24px',
      cursor: 'pointer'
    },
    checkboxInput: {
      width: '20px',
      height: '20px',
      accentColor: '#0d9488',
      cursor: 'pointer'
    },
    checkboxLabel: {
      fontSize: '14px',
      color: '#64748b'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      flexDirection: 'column'
    },
    primaryBtn: {
      padding: '16px 24px',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
      color: '#ffffff',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.2s',
      boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)'
    },
    secondaryBtn: {
      padding: '14px 24px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      backgroundColor: '#ffffff',
      color: '#64748b',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center'
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={handleClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div style={modalStyles.headerPattern}></div>
          <button
            style={modalStyles.closeBtn}
            onClick={handleClose}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          >
            <X size={18} />
          </button>
          <div style={modalStyles.iconContainer}>
            <Shield size={36} style={{ color: '#ffffff' }} />
          </div>
          <h2 style={modalStyles.title}>Hesabınızı Güvende Tutun</h2>
          <p style={modalStyles.subtitle}>Passkey ile şifresiz, güvenli giriş deneyimi</p>
        </div>

        <div style={modalStyles.content}>
          <p style={modalStyles.welcomeText}>
            Merhaba <strong>{userName || 'Öğretmen'}</strong>! 👋 Hesabınızın güvenliği bizim için çok önemli. 
            Passkey özelliği ile hesabınızı şifresiz ve daha güvenli bir şekilde koruyabilirsiniz.
          </p>

          <div style={modalStyles.featureList}>
            <div style={modalStyles.feature}>
              <div style={{ ...modalStyles.featureIcon, background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}>
                <Fingerprint size={22} style={{ color: '#2563eb' }} />
              </div>
              <div>
                <div style={modalStyles.featureTitle}>Parmak İzi / Yüz Tanıma</div>
                <div style={modalStyles.featureDesc}>
                  Cihazınızın biyometrik özelliklerini kullanarak hızlı ve güvenli giriş yapın
                </div>
              </div>
            </div>

            <div style={modalStyles.feature}>
              <div style={{ ...modalStyles.featureIcon, background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                <Shield size={22} style={{ color: '#d97706' }} />
              </div>
              <div>
                <div style={modalStyles.featureTitle}>Gelişmiş Güvenlik</div>
                <div style={modalStyles.featureDesc}>
                  Şifre sızıntılarına karşı tam koruma, phishing saldırılarına karşı bağışıklık
                </div>
              </div>
            </div>
          </div>

          <label style={modalStyles.checkbox} onClick={(e) => { e.stopPropagation(); setDontShowAgain(!dontShowAgain); }}>
            <input
              type="checkbox"
              style={modalStyles.checkboxInput}
              checked={dontShowAgain}
              readOnly
            />
            <span style={modalStyles.checkboxLabel}>Bu mesajı bir daha gösterme</span>
          </label>

          <div style={modalStyles.buttonGroup}>
            <button
              style={modalStyles.primaryBtn}
              onClick={handleGoToSettings}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Settings size={18} />
              Ayarlarınızdan Passkey'i Aktif Edin
            </button>
            <button
              style={modalStyles.secondaryBtn}
              onClick={handleClose}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              Daha Sonra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasskeyModal;
