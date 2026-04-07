import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Hash, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { t } from '../../utils/i18n';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginStudent, resetStudentPassword } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // New State for Resetting
  const [resetMode, setResetMode] = useState(false);
  const [resetData, setResetData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    studentNumber: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (resetMode) {
      if (!resetData.newPassword) {
        newErrors.newPassword = 'Yeni şifre gerekli';
        toast.warning('Lütfen yeni şifrenizi girin');
      } else if (resetData.newPassword !== resetData.confirmPassword) {
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        toast.warning('Şifreler eşleşmiyor');
      }
    } else {
      if (!formData.studentNumber) {
        newErrors.studentNumber = 'Okul numarası gerekli';
        toast.warning('Lütfen okul numaranızı girin');
      }
      if (!formData.password) {
        newErrors.password = 'Şifre gerekli';
        if (!newErrors.studentNumber) toast.warning('Lütfen şifrenizi girin');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetSubmit = async () => {
    setLoading(true);
    toast.info('Şifreniz sıfırlanıyor...');
    try {
      const result = await resetStudentPassword(formData.studentNumber, resetData.newPassword);
      if (result.success) {
        toast.success(result.message || 'Şifreniz başarıyla değişti, giriş yapabilirsiniz.');
        setResetMode(false);
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        toast.error(result.error || 'Şifre sıfırlama başarısız!');
      }
    } catch (error) {
      toast.error('Bağlantı hatası!');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (resetMode) {
      return handleResetSubmit();
    }

    setLoading(true);
    toast.info('Giriş yapılıyor...');
    try {
      const result = await loginStudent(
        formData.studentNumber,
        formData.password,
        formData.rememberMe
      );

      if (result.success) {
        if (result.action === 'reset_password_required') {
          toast.warning('Şifre değiştirme modu aktif! Lütfen yeni şifre belirleyin.', { autoClose: 5000 });
          setResetMode(true);
        } else {
          toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
          
          // Giriş bildirimi oluştur
          const settings = result.user?.notificationSettings || { loginAlerts: true };
          if (settings.loginAlerts && result.user?.id) {
            const now = new Date();
            const browserInfo = navigator.userAgent.split(') ')[0].split(' (')[1] || 'Bilinmeyen Cihaz';
            const logDate = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
            const clientIp = result.clientIp || '127.0.0.1';
            
            useNotificationStore.getState().createNotification({
              type: 'security_alert',
              title: t('notifLoginTitle'),
              message: `${t('notifLoginDate')}: ${logDate}\n${t('notifLoginDevice')}: ${browserInfo}\n${t('notifLoginIP')}: ${clientIp}`,
              targetType: 'student',
              targetId: result.user.id
            });
          }

          navigate('/ogrenci/panel');
        }
      } else {
        toast.error(result.error || 'Giriş başarısız!');
      }
    } catch (error) {
      toast.error('Bağlantı hatası! Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  const handleChange = (field, value) => {
    if (resetMode) {
      setResetData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleStudentNumberBlur = () => {
    const number = formData.studentNumber.trim();
    if (number && /^\d+$/.test(number)) {
      // Sayı ise ve 4 haneden azsa başına 0 ekle
      const paddedNumber = number.padStart(4, '0');
      setFormData(prev => ({ ...prev, studentNumber: paddedNumber }));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #faf5ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '24px',
            fontSize: '14px'
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Ana Sayfa
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
            borderRadius: '16px',
            marginBottom: '16px',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
          }}>
            <GraduationCap style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            Öğrenci Girişi
          </h1>
          <p style={{ color: '#64748b' }}>Atölye Sınav Platformuna hoş geldiniz</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Güvenlik Uyarısı */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <ShieldAlert style={{ width: '20px', height: '20px', color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                Güvenlik Uyarısı
              </p>
              <p style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.5' }}>
                Güvenliğiniz için şifrenizi tarayıcıya kaydetmeyin. Her oturumda manuel olarak giriş yapmanızı öneririz.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!resetMode ? (
                <>
                  <Input
                    label="Okul Numarası"
                    icon={Hash}
                    type="text"
                    placeholder="1234 (örn: 181 → 0181)"
                    value={formData.studentNumber}
                    onChange={(e) => handleChange('studentNumber', e.target.value)}
                    onBlur={handleStudentNumberBlur}
                    error={errors.studentNumber}
                    required
                  />

                  <Input
                    label="Şifre"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    error={errors.password}
                    required
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => handleChange('rememberMe', e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                      />
                      <span style={{ fontSize: '14px', color: '#64748b' }}>Beni hatırla</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3b82f6',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      Şifrenizi mi unuttunuz?
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#eff6ff',
                    borderLeft: '4px solid #3b82f6',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    <p style={{ fontSize: '14px', color: '#1e3a8a', margin: 0 }}>
                      <strong>Şifre Yenileme Modu Aktif</strong><br />
                      Lütfen yeni şifrenizi belirleyin.
                    </p>
                  </div>

                  <Input
                    label="Yeni Şifre"
                    icon={Lock}
                    type="password"
                    placeholder="En az 6 karakter"
                    value={resetData.newPassword}
                    onChange={(e) => handleChange('newPassword', e.target.value)}
                    error={errors.newPassword}
                    required
                  />

                  <Input
                    label="Yeni Şifre (Tekrar)"
                    icon={Lock}
                    type="password"
                    placeholder="Yeni şifrenizi doğrulayın"
                    value={resetData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    required
                  />
                </>
              )}

              <Button type="submit" fullWidth loading={loading}>
                {resetMode ? 'Şifremi Yenile' : 'Giriş Yap'}
              </Button>
            </div>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Hesabınız yok mu?{' '}
              <Link to="/ogrenci/kayit" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div >

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
          Öğretmen misiniz?{' '}
          <Link to="/ogretmen/giris" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
            Öğretmen girişi
          </Link>
        </p>
      </div >
      {/* Şifremi Unuttum Modal */}
      {
        showForgotPassword && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '24px'
            }}
            onClick={() => setShowForgotPassword(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 60px -10px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <Lock style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  Şifrenizi mi Unuttunuz?
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                  Şifrenizi sıfırlamak için lütfen öğretmeninizle iletişime geçin.
                </p>
              </div>
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}
              >
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  💡 <strong>Not:</strong> Öğretmeniniz sizin için yeni bir şifre oluşturabilir veya mevcut şifrenizi sıfırlayabilir.
                </p>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                Anladım
              </button>
            </div>
          </div>
        )
      }    </div >
  );
};

export { StudentLogin };
