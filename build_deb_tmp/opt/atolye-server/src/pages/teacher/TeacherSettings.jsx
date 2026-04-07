import { useState } from 'react';
import { TeacherLayout } from '../../components/layouts';
import { Button, Input, Modal, ConfirmModal } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import { authApi } from '../../services/api';
import { hashPassword, verifyPassword } from '../../utils/crypto';
import {
  User, Lock, Bell, Shield, Eye, EyeOff, Save, AlertTriangle,
  CheckCircle, Moon, Sun, Monitor, Settings, Database, RefreshCw, Trash2, X, Globe, Key, Printer, Copy, Download
} from 'lucide-react';
import { resetAllData } from '../../utils/initData';
import { t, languages } from '../../utils/i18n';

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { marginBottom: '8px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  layout: { display: 'flex', flexDirection: 'row', gap: '24px', flexWrap: 'wrap' },
  sidebar: {
    width: '250px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    height: 'fit-content'
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: active ? '#0d9488' : 'transparent',
    color: active ? '#ffffff' : '#64748b',
    fontWeight: active ? '600' : '500',
    fontSize: '14px',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    marginBottom: '4px',
    transition: 'all 0.2s'
  }),
  content: { flex: '1', minWidth: '300px' },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px'
  },
  cardTitle: { fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '24px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '8px' },
  hint: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  errorBox: {
    padding: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    color: '#dc2626'
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  toggleLabel: { fontWeight: '500', color: '#1e293b' },
  toggleDesc: { fontSize: '14px', color: '#64748b', marginTop: '2px' },
  toggle: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s'
  },
  toggleKnob: (checked) => ({
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: '2px',
    left: checked ? '22px' : '2px',
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  }),
  themeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  themeBtn: (active) => ({
    padding: '20px 16px',
    borderRadius: '12px',
    border: active ? '2px solid #0d9488' : '2px solid #e2e8f0',
    backgroundColor: active ? '#f0fdfa' : '#ffffff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s'
  }),
  themeLabel: { fontWeight: '500', color: '#1e293b', marginTop: '8px' },
  modalContent: { textAlign: 'center', padding: '16px' },
  successIcon: { width: '64px', height: '64px', color: '#10b981', margin: '0 auto 16px' }
};

const Toggle = ({ checked, onChange }) => (
  <div
    style={{ ...styles.toggle, backgroundColor: checked ? '#0d9488' : '#cbd5e1' }}
    onClick={() => onChange(!checked)}
  >
    <div style={styles.toggleKnob(checked)} />
  </div>
);

const TeacherSettings = () => {
  const { user, updateProfile, theme, setTheme, language: storeLanguage, setLanguage: storeSetLanguage } = useAuthStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [submissionAlerts, setSubmissionAlerts] = useState(user?.notificationSettings?.submissionAlerts ?? true);
  const [loginAlerts, setLoginAlerts] = useState(user?.notificationSettings?.loginAlerts ?? true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Tamam',
    onConfirm: () => {},
    type: 'warning'
  });


  // Recovery Key States
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);

  const handleLanguageChange = (lang) => {
    storeSetLanguage(lang);
    const messages = {
      tr: 'Dil Türkçe olarak ayarlandı',
      en: 'Language set to English',
      ru: 'Язык изменен на Русский',
      de: 'Sprache auf Deutsch gesetzt'
    };
    toast.success(messages[lang] || t('languageChanged'));
  };

  // Passkey fonksiyonları
  const handleSetupPasskey = async () => {
    try {
      setSaving(true);

      // Secure Context (HTTPS/localhost) kontrolü
      if (!window.isSecureContext) {
        toast.error('Passkey güvenliği için HTTPS bağlantısı veya localhost gereklidir.');
        toast.info('Şu anki bağlantınız (HTTP veya IP adresi) güvenli kabul edilmediği için tarayıcı Passkey özelliğini devre dışı bıraktı.');
        return;
      }

      // Tarayıcı desteği kontrolü
      if (!window.PublicKeyCredential || !navigator.credentials || !navigator.credentials.create) {
        toast.error('Passkey bu tarayıcıda desteklenmiyor veya devre dışı bırakılmış.');
        toast.info('Lütfen güncel Chrome, Edge veya Safari kullanın.');
        return;
      }

      toast.info('Passkey kurulumu başlatılıyor...');

      // Challenge al
      const { challenge } = await authApi.passkeyRegisterChallenge(user.username);

      // WebAuthn credential oluştur
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(atob(challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          rp: { name: 'Atölye Platform' },
          user: {
            id: Uint8Array.from(user.username, c => c.charCodeAt(0)),
            name: user.username,
            displayName: user.fullName
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          timeout: 60000,
          attestation: 'none'
        }
      });

      // Credential ID ve public key'i kaydet
      const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(credential.response.getPublicKey())));

      await authApi.passkeyRegister(user.username, credentialId, publicKey);

      updateProfile({ passkeyEnabled: true, credentialId, publicKey });
      toast.success('Passkey başarıyla kuruldu!');
      setSuccessMessage('Passkey başarıyla etkinleştirildi!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Passkey kurulum hatası:', error);

      // Kullanıcı dostu hata mesajları
      if (error.name === 'NotAllowedError') {
        toast.error('Passkey kurulumu iptal edildi veya izin verilmedi.');
      } else if (error.name === 'NotSupportedError') {
        toast.error('Bu cihaz veya tarayıcı passkey desteklemiyor.');
      } else if (error.name === 'InvalidStateError') {
        toast.error('Bu hesap için zaten bir passkey kayıtlı.');
      } else {
        toast.error('Passkey kurulumu başarısız: ' + (error.message || 'Bilinmeyen hata'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePasskey = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Passkey Kapatılsın mı?',
      message: 'Passkey kapatılsın mı? Bir sonraki girişte şifre kullanmanız gerekecek.',
      confirmText: 'Evet, Kapat',
      type: 'danger',
      onConfirm: async () => {
        try {
          setSaving(true);
          toast.info('Passkey kaldırılıyor...');

          // Backend'de passkey kaldır (endpoint eklenirse)
          updateProfile({ passkeyEnabled: false, credentialId: null, publicKey: null });

          toast.success('Passkey başarıyla kaldırıldı!');
          setSuccessMessage('Passkey devre dışı bırakıldı.');
          setShowSuccessModal(true);
        } catch (error) {
          toast.error('Passkey kaldırma başarısız: ' + error.message);
        } finally {
          setSaving(false);
        }
      }
    });
  };


  const handleGenerateRecoveryKey = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Kurtarma Anahtarı Oluştur',
      message: 'Yeni bir kurtarma anahtarı oluşturulacak. \n\nEğer varsa, eski anahtarınız GEÇERSİZ olacaktır.\n\nDevam etmek istiyor musunuz?',
      confirmText: 'Oluştur',
      type: 'warning',
      onConfirm: async () => {
        try {
          setSaving(true);
          const result = await authApi.generateRecoveryKey(user.username);

          if (result.success) {
            setGeneratedKey(result.recoveryKey);
            setShowRecoveryModal(true);
            // Store'daki user bilgisini güncelle
            updateProfile({ recoveryKeyCreatedAt: new Date().toISOString(), hasRecoveryKey: true });
          }
        } catch (error) {
          toast.error('Anahtar oluşturulamadı: ' + error.message);
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setKeyCopied(true);
    toast.success('Anahtar kopyalandı!');
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handlePrintKey = () => {
    const printWindow = window.open('', '', 'width=600,height=400');
    printWindow.document.write(`
          <html>
              <head>
                  <title>PolyOS Kurtarma Anahtarı</title>
                  <style>
                      body { font-family: monospace; padding: 40px; text-align: center; border: 2px solid #000; margin: 20px; }
                      h1 { font-family: sans-serif; }
                      .key { font-size: 24px; font-weight: bold; background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
                      .info { color: #666; font-family: sans-serif; }
                  </style>
              </head>
              <body>
                  <h1>PolyOS Kurtarma Anahtarı</h1>
                  <p class="info">Bu anahtar, şifrenizi unuttuğunuzda hesabınıza erişmek için kullanılır.</p>
                  <p class="info">Lütfen güvenli bir yerde saklayın.</p>
                  <div class="key">${generatedKey}</div>
                  <p>Oluşturulma Tarihi: ${new Date().toLocaleDateString()}</p>
                  <p>Kullanıcı: ${user.username}</p>
              </body>
          </html>
      `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadKey = () => {
    const content = `POLYOS KURTARMA ANAHTARI\n\n` +
      `Kullanıcı: ${user.username}\n` +
      `Tarih: ${new Date().toLocaleString()}\n` +
      `Anahtar: ${generatedKey}\n\n` +
      `BU ANAHTARI GÜVENLİ BİR YERDE SAKLAYIN VE KİMSEYLE PAYLAŞMAYIN.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `polyos-recovery-key-${user.username}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Anahtar dosyası indirildi!');
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Güvenlik', icon: Lock },
    { id: 'passkey', label: 'Passkey', icon: Shield },
    { id: 'recovery', label: 'Kurtarma Anahtarı', icon: Key },
    { id: 'notifications', label: t('notifications'), icon: Bell }
  ];


  const handleSaveProfile = async () => {
    setError('');
    setSaving(true);
    try {
      updateProfile({ fullName, department });
      setSuccessMessage('Profil bilgileri güncellendi.');
      setShowSuccessModal(true);
    } catch (err) {
      setError('Profil güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    setSaving(true);
    try {
      const isValid = await verifyPassword(currentPassword, user.password, user.username);
      if (!isValid) {
        setError('Mevcut şifre hatalı.');
        setSaving(false);
        return;
      }
      const hashedNewPassword = await hashPassword(newPassword, user.username);
      updateProfile({ password: hashedNewPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Şifre başarıyla değiştirildi.');
      setShowSuccessModal(true);
    } catch (err) {
      setError('Şifre değiştirilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    const { updateNotificationSettings } = useAuthStore.getState();
    setSaving(true);
    
    updateNotificationSettings({
      submissionAlerts,
      loginAlerts
    });

    setTimeout(() => {
      setSuccessMessage(t('success'));
      setShowSuccessModal(true);
      setSaving(false);
    }, 500);
  };



  return (
    <TeacherLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Ayarlar</h1>
          <p style={styles.subtitle}>Hesap ve uygulama ayarlarınızı yönetin</p>
        </div>

        <div style={styles.layout}>
          <div style={styles.sidebar}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                style={styles.navItem(activeTab === tab.id)}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={styles.content}>
            {activeTab === 'profile' && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Profil Bilgileri</h2>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kullanıcı Adı</label>
                  <Input value={user?.username || ''} disabled style={{ backgroundColor: '#f8fafc' }} />
                  <p style={styles.hint}>Kullanıcı adı değiştirilemez</p>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ad Soyad</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Adınız ve soyadınız" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Bölüm</label>
                  <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Bölümünüz" />
                </div>
                <div style={{ marginTop: '24px' }}>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    <Save size={16} style={{ marginRight: '8px' }} />
                    {saving ? t('loading') : t('savePreferences')}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Güvenlik</h2>
                {error && (
                  <div style={styles.errorBox}>
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                  </div>
                )}
                <h3 style={{ ...styles.label, marginBottom: '16px' }}>Şifre Değiştir</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Mevcut Şifre</label>
                  <div style={{ position: 'relative' }}>
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Mevcut şifrenizi girin"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Yeni Şifre</label>
                  <div style={{ position: 'relative' }}>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Yeni şifrenizi girin"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p style={styles.hint}>En az 8 karakter, büyük/küçük harf ve rakam içermeli</p>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Yeni Şifre (Tekrar)</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>
                <div style={{ marginTop: '24px' }}>
                  <Button onClick={handleChangePassword} disabled={saving}>
                    <Shield size={16} style={{ marginRight: '8px' }} />
                    Şifreyi Değiştir
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'passkey' && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Passkey Yönetimi</h2>
                <div style={{
                  marginBottom: '24px',
                  color: '#64748b',
                  fontSize: '15px',
                  lineHeight: '1.6'
                }}>
                  Hesabınızı passkey ile koruyun. Windows Hello, Linux (Pardus) ve MacOS ile uyumlu.
                </div>

                {/* Durum Kartı */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '28px',
                  padding: '20px',
                  background: user?.passkeyEnabled
                    ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                    : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  borderRadius: '16px',
                  border: user?.passkeyEnabled ? '2px solid #10b981' : '2px solid #ef4444'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: user?.passkeyEnabled
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: user?.passkeyEnabled
                      ? '0 4px 14px rgba(16, 185, 129, 0.3)'
                      : '0 4px 14px rgba(239, 68, 68, 0.3)'
                  }}>
                    <Shield size={28} style={{ color: '#ffffff' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '16px', marginBottom: '4px' }}>
                      Passkey Durumu
                    </div>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '18px',
                      color: user?.passkeyEnabled ? '#059669' : '#dc2626'
                    }}>
                      {user?.passkeyEnabled ? '✓ Aktif' : '○ Kapalı'}
                    </div>
                  </div>
                </div>

                {/* Butonlar */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSetupPasskey}
                    disabled={user?.passkeyEnabled || saving}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '16px 24px',
                      borderRadius: '14px',
                      border: 'none',
                      background: user?.passkeyEnabled
                        ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
                        : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                      color: user?.passkeyEnabled ? '#94a3b8' : '#ffffff',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: user?.passkeyEnabled || saving ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: user?.passkeyEnabled
                        ? 'none'
                        : '0 4px 14px rgba(13, 148, 136, 0.3)',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      if (!user?.passkeyEnabled && !saving) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(13, 148, 136, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = user?.passkeyEnabled
                        ? 'none'
                        : '0 4px 14px rgba(13, 148, 136, 0.3)';
                    }}
                  >
                    <Shield size={18} />
                    <span>Passkey Kur</span>
                  </button>

                  <button
                    onClick={handleRemovePasskey}
                    disabled={!user?.passkeyEnabled || saving}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '16px 24px',
                      borderRadius: '14px',
                      border: !user?.passkeyEnabled ? '2px solid #e2e8f0' : 'none',
                      background: !user?.passkeyEnabled
                        ? '#ffffff'
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: !user?.passkeyEnabled ? '#94a3b8' : '#ffffff',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: !user?.passkeyEnabled || saving ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: !user?.passkeyEnabled
                        ? 'none'
                        : '0 4px 14px rgba(239, 68, 68, 0.3)',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      if (user?.passkeyEnabled && !saving) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = !user?.passkeyEnabled
                        ? 'none'
                        : '0 4px 14px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    <X size={18} />
                    <span>Passkey Kapat</span>
                  </button>
                </div>

                {/* Bilgi Kutuları */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                    💡 <strong>Bilgi:</strong> Passkey ile giriş için platformunuzun biyometrik (parmak izi, yüz tanıma)
                    veya anahtar tabanlı kimlik doğrulamasını kullanabilirsiniz.
                  </div>
                </div>

                {/* Tarayıcı Uyumluluk Uyarısı */}
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  borderRadius: '12px',
                  border: '1px solid #3b82f6',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.6' }}>
                    🌐 <strong>Desteklenen Tarayıcılar:</strong> Passkey özelliği güncel Chrome, Edge, Safari'de çalışır.
                    Firefox'ta düzgün çalışmayabilir. HTTPS bağlantısı gereklidir.
                  </div>
                </div>

                {user?.passkeyEnabled && (
                  <div style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    borderRadius: '12px',
                    border: '1px solid #fb923c'
                  }}>
                    <div style={{ fontSize: '13px', color: '#9a3412', lineHeight: '1.6' }}>
                      ⚠️ <strong>Önemli:</strong> Passkey'i unutmanız durumunda giriş sayfasında <strong style={{ color: '#ea580c' }}>M + N</strong> tuş
                      kombinasyonuna basarak şifrenizle giriş yapabilirsiniz.
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recovery' && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Kurtarma Anahtarı (Master Recovery Key)</h2>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#fff7ed',
                  border: '1px solid #ffedd5',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Key size={24} color="#ea580c" style={{ flexShrink: 0 }} />
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#9a3412', fontSize: '16px' }}>Bu Nedir?</h3>
                      <p style={{ margin: 0, color: '#c2410c', fontSize: '14px', lineHeight: '1.6' }}>
                        Kurtarma anahtarı, şifrenizi unuttuğunuzda e-posta veya başka bir doğrulama gerektirmeden hesabınızı kurtarmanızı sağlayan
                        tek seferlik, özel bir koddur. İnternet bağlantısı gerektirmez.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Mevcut Durum</div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: (user?.recoveryKeyHash || user?.hasRecoveryKey) ? '#10b981' : '#64748b'
                    }}>
                      {(user?.recoveryKeyHash || user?.hasRecoveryKey) ? '✅ Aktif' : '○ Oluşturulmamış'}
                    </div>
                    {(user?.recoveryKeyCreatedAt) && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        Oluşturulma: {new Date(user.recoveryKeyCreatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <Button onClick={handleGenerateRecoveryKey} disabled={saving}>
                    <Key size={16} style={{ marginRight: '8px' }} />
                    {(user?.recoveryKeyHash || user?.hasRecoveryKey) ? 'Yeni Anahtar Oluştur' : 'Anahtar Oluştur'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>{t('notificationPreferences')}</h2>
                <div style={styles.toggleRow}>
                  <div>
                    <p style={styles.toggleLabel}>{t('newSubmissionAlerts')}</p>
                    <p style={styles.toggleDesc}>{t('newSubmissionAlertsDesc')}</p>
                  </div>
                  <Toggle checked={submissionAlerts} onChange={setSubmissionAlerts} />
                </div>
                <div style={styles.toggleRow}>
                  <div>
                    <p style={styles.toggleLabel}>{t('loginAlerts')}</p>
                    <p style={styles.toggleDesc}>{t('loginAlertsDesc')}</p>
                  </div>
                  <Toggle checked={loginAlerts} onChange={setLoginAlerts} />
                </div>
                <div style={{ marginTop: '24px' }}>
                  <Button onClick={handleSaveNotifications} disabled={saving}>
                    <Bell size={16} style={{ marginRight: '8px' }} />
                    Tercihleri Kaydet
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recovery Key Modal */}
        <Modal isOpen={showRecoveryModal} onClose={() => setShowRecoveryModal(false)} title="Kurtarma Anahtarı">
          <div style={{ padding: '8px 24px 24px' }}>
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              border: '1px solid #fee2e2'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: '#fee2e2',
                  borderRadius: '8px',
                  color: '#dc2626'
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#991b1b', fontSize: '15px', fontWeight: '600' }}>Önemli Uyarı</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c', lineHeight: '1.5' }}>
                    Bu anahtar sadece tek seferlik gösterilecektir. Lütfen güvenli bir yere kaydedin veya çıktısını alın.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155', marginLeft: '4px', marginBottom: '8px', display: 'block' }}>
                Kurtarma Anahtarınız
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <code style={{
                    color: '#334155',
                    fontSize: '18px',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    textAlign: 'center',
                    wordBreak: 'break-all'
                  }}>
                    {generatedKey}
                  </code>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <Button
                onClick={handleCopyKey}
                style={{
                  flex: 1,
                  background: keyCopied ? '#10b981' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {keyCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                <span>{keyCopied ? 'Kopyalandı' : 'Kopyala'}</span>
              </Button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={handleDownloadKey}
                style={{
                  flex: 1,
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              >
                <Download size={18} />
                <span>Dosya Olarak İndir</span>
              </Button>
              <Button
                onClick={handlePrintKey}
                style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <Printer size={18} />
                <span>Yazdır</span>
              </Button>
            </div>

            <button
              onClick={() => setShowRecoveryModal(false)}
              style={{
                width: '100%',
                marginTop: '20px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Kapat
            </button>
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="İşlem Başarılı">
          <div style={styles.modalContent}>
            <CheckCircle style={styles.successIcon} />
            <p style={{ color: '#1e293b', marginBottom: '16px' }}>{successMessage}</p>
            <Button onClick={() => setShowSuccessModal(false)}>Tamam</Button>
          </div>
        </Modal>

        {/* Global Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          type={confirmModal.type}
        />
      </div>
    </TeacherLayout>
  );
};

export default TeacherSettings;
