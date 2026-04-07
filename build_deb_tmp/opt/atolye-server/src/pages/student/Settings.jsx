import React, { useState } from 'react';
import { User, Lock, Globe, Copy, Eye, EyeOff, BadgeCheck, School, Home, ArrowRight } from 'lucide-react';
import StudentSidebar from '../../components/layout/StudentSidebar';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Bell, Key } from 'lucide-react';
import { checkPasswordStrength } from '../../utils/crypto';
import { t, languages } from '../../utils/i18n';

const Settings = () => {
  const { user, changePassword: updatePassword, language, setLanguage, updateNotificationSettings } = useAuthStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(user?.notificationSettings?.loginAlerts ?? true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
  };

  const getPasswordStrength = () => {
    if (!passwordData.newPassword) return { level: 0, text: '', color: '' };
    const strength = checkPasswordStrength(passwordData.newPassword);

    if (strength.score < 2) return { level: 1, text: t('weak'), color: '#ef4444' };
    if (strength.score < 4) return { level: 2, text: t('medium'), color: '#f59e0b' };
    return { level: 3, text: t('strong'), color: '#10b981' };
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t('passwordMismatch'));
      return;
    }

    const strength = checkPasswordStrength(passwordData.newPassword);
    if (!strength.isValid) {
      alert(t('passwordWeak'));
      return;
    }

    try {
      await updatePassword(user.id, passwordData.currentPassword, passwordData.newPassword);
      alert(t('passwordChanged'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert(error.message);
    }
  };
  
  const handleSaveNotifications = () => {
    setSaving(true);
    updateNotificationSettings({ loginAlerts });
    setTimeout(() => {
      alert(t('success'));
      setSaving(false);
    }, 500);
  };

  const copyFolderPath = () => {
    const path = `~/Documents/Atolye/Submissions/${user.className}/${user.fullName}`;
    navigator.clipboard.writeText(path);
    alert(t('copiedToClipboard') || 'Copied to clipboard!');
  };

  const strength = getPasswordStrength();
  const languageFlags = {
    tr: '🇹🇷',
    en: '🇬🇧',
    de: '🇩🇪',
    ru: '🇷🇺'
  };

  return (
    <>
      <StudentSidebar />

      {/* Main Content */}
      <div style={{
        marginLeft: '288px',
        minHeight: '100vh',
        background: '#f6f6f8'
      }}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #f0f1f4',
          padding: '20px 48px'
        }}>
          {/* Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#94a3b8',
            marginBottom: '16px'
          }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#2463eb'}
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
              {t('home')}
            </span>
            <span>/</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#2463eb'}
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
              {t('profile')}
            </span>
            <span>/</span>
            <span style={{ color: '#111318', fontWeight: '600' }}>{t('settings')}</span>
          </div>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#111318'
          }}>
            {t('settings')}
          </h1>
        </header>

        {/* Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '48px'
        }}>
          {/* Profile Card (Read Only) */}
          <section style={{
            background: 'linear-gradient(135deg, #eef5ff 0%, #f0f9ff 100%)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #e0f2fe',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative background */}
            <div style={{
              position: 'absolute',
              right: '-40px',
              top: '-40px',
              width: '256px',
              height: '256px',
              background: 'rgba(36, 99, 235, 0.05)',
              borderRadius: '50%',
              filter: 'blur(60px)',
              pointerEvents: 'none'
            }}></div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              position: 'relative'
            }}>
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '112px',
                  height: '112px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2463eb 0%, #1e40af 100%)',
                  border: '4px solid white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  {user?.fullName?.charAt(0)}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '16px',
                  height: '16px',
                  background: '#10b981',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} title="Online"></div>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111318',
                  marginBottom: '8px'
                }}>
                  {user?.fullName}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>
                    <BadgeCheck size={18} />
                    <span>{t('studentNumber')}: </span>
                    <span style={{ color: '#111318', fontWeight: '600' }}>{user?.studentNumber}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>
                    <School size={18} />
                    <span>{t('className')}: </span>
                    <span style={{ color: '#111318', fontWeight: '600' }}>{user?.className}</span>
                  </div>
                </div>
              </div>

              {/* Read Only Badge */}
              <div style={{
                padding: '6px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: '#64748b',
                letterSpacing: '0.05em',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                {t('readOnly')}
              </div>
            </div>
          </section>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '32px'
          }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Language Preference */}
              <section style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#111318',
                      marginBottom: '4px'
                    }}>
                      {t('languagePreference')}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>
                      {t('selectPreferredLanguage')}
                    </p>
                  </div>
                  <Globe size={32} style={{ color: '#cbd5e1' }} />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px'
                }}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '12px',
                        border: language === lang.code ? '2px solid #2463eb' : '2px solid #e2e8f0',
                        background: language === lang.code ? '#eef5ff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: language === lang.code ? '0 2px 4px rgba(36, 99, 235, 0.1)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (language !== lang.code) {
                          e.currentTarget.style.borderColor = 'rgba(36, 99, 235, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (language !== lang.code) {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }
                      }}
                    >
                      {language === lang.code && (
                        <>
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '8px',
                            height: '8px',
                            background: '#2463eb',
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite'
                          }}></div>
                          <span style={{
                            position: 'absolute',
                            top: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '2px 8px',
                            background: '#2463eb',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            borderRadius: '999px',
                            boxShadow: '0 2px 4px rgba(36, 99, 235, 0.3)'
                          }}>
                            {t('active')}
                          </span>
                        </>
                      )}
                      <div style={{
                        fontSize: '40px',
                        lineHeight: 1
                      }}>
                        {languageFlags[lang.code]}
                      </div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: language === lang.code ? '700' : '600',
                        color: language === lang.code ? '#2463eb' : '#64748b'
                      }}>
                        {lang.nativeName}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Local Data Folder */}
              <section style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#111318',
                    marginBottom: '4px'
                  }}>
                    {t('localDataFolder')}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>
                    {t('assignmentsSyncedHere')}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 16px'
                }}>
                  <code style={{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: '#64748b'
                  }}>
                    ~/Documents/Atolye/Submissions/{user?.className}/
                  </code>
                  <button
                    onClick={copyFolderPath}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#2463eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#64748b';
                    }}
                    title={t('copyPath')}
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </section>

              {/* Notification Preferences */}
              <section style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    padding: '8px',
                    background: '#ecfdf5',
                    borderRadius: '12px',
                    color: '#10b981'
                  }}>
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#111318',
                      marginBottom: '2px'
                    }}>
                      {t('notificationPreferences')}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>
                      {t('manageHowYouGetNotified')}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '12px'
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{t('loginAlerts')}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{t('loginAlertsDesc')}</p>
                    </div>
                    <div 
                      onClick={() => setLoginAlerts(!loginAlerts)}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: loginAlerts ? '#2463eb' : '#cbd5e1',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: '2px',
                        left: loginAlerts ? '22px' : '2px',
                        transition: 'all 0.2s'
                      }} />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#2463eb',
                      color: 'white',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {saving ? t('loading') : t('savePreferences')}
                  </button>
                </div>
              </section>
            </div>

            {/* Right Column - Security */}
            <div>
              <section style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                height: 'fit-content'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #f0f1f4'
                }}>
                  <div style={{
                    padding: '8px',
                    background: '#fef2f2',
                    borderRadius: '12px',
                    color: '#ef4444'
                  }}>
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#111318',
                      marginBottom: '2px'
                    }}>
                      {t('security')}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>
                      {t('updateYourPassword')}
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  {/* Current Password */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      marginBottom: '6px'
                    }}>
                      {t('currentPassword')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        style={{
                          width: '100%',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '10px 40px 10px 16px',
                          fontSize: '14px',
                          color: '#111318',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#2463eb';
                          e.target.style.boxShadow = '0 0 0 3px rgba(36, 99, 235, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      marginBottom: '6px'
                    }}>
                      {t('newPassword')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="••••••••"
                        style={{
                          width: '100%',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '10px 40px 10px 16px',
                          fontSize: '14px',
                          color: '#111318',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#2463eb';
                          e.target.style.boxShadow = '0 0 0 3px rgba(36, 99, 235, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Strength Meter */}
                    {passwordData.newPassword && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '10px',
                          color: '#94a3b8',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          <span>{t('strength')}</span>
                          <span style={{ color: strength.color }}>{strength.text}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '4px',
                          height: '6px'
                        }}>
                          <div style={{
                            flex: 1,
                            background: strength.level >= 1 ? strength.color : '#e2e8f0',
                            borderRadius: '999px',
                            transition: 'background 0.3s'
                          }}></div>
                          <div style={{
                            flex: 1,
                            background: strength.level >= 2 ? strength.color : '#e2e8f0',
                            borderRadius: '999px',
                            transition: 'background 0.3s'
                          }}></div>
                          <div style={{
                            flex: 1,
                            background: strength.level >= 3 ? strength.color : '#e2e8f0',
                            borderRadius: '999px',
                            transition: 'background 0.3s'
                          }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      marginBottom: '6px'
                    }}>
                      {t('confirmPassword')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        style={{
                          width: '100%',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: '#111318',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#2463eb';
                          e.target.style.boxShadow = '0 0 0 3px rgba(36, 99, 235, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      background: '#2463eb',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '14px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '8px',
                      boxShadow: '0 4px 12px rgba(36, 99, 235, 0.3)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1e40af';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#2463eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span>{t('saveChanges')}</span>
                    <ArrowRight size={18} />
                  </button>
                </form>
              </section>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </>
  );
};

export default Settings;
