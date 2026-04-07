import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, User, Lock, BookOpen, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { checkPasswordStrength } from '../../utils/crypto';

const TeacherRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { registerTeacher } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [teacherRegistrationEnabled, setTeacherRegistrationEnabled] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  // Platform ayarlarını yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.success) {
          setTeacherRegistrationEnabled(data.settings.teacherRegistrationEnabled !== false);
        }
      } catch (error) {
        console.error('Ayarlar yüklenemedi:', error);
      }
      setSettingsLoading(false);
    };
    loadSettings();
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Ad Soyad gerekli';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Ad Soyad en az 3 karakter olmalı';
    }

    if (!formData.username) {
      newErrors.username = 'Kullanıcı adı gerekli';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Kullanıcı adı en az 4 karakter olmalı';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir';
    }

    if (!formData.department) {
      newErrors.department = 'Bölüm/Ders gerekli';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else {
      const strength = checkPasswordStrength(formData.password);
      if (!strength.isValid) {
        newErrors.password = 'Şifre en az 8 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam içermeli';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await registerTeacher(formData);
      if (result.success) {
        toast.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
        setTimeout(() => navigate('/ogretmen/panel'), 1000);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  const getStrengthColor = () => {
    if (passwordStrength.strength === 'weak') return '#ef4444';
    if (passwordStrength.strength === 'medium') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 50%, #fdf2f8 100%)',
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
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            borderRadius: '16px',
            marginBottom: '16px',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
          }}>
            <Users style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            Öğretmen Kaydı
          </h1>
          <p style={{ color: '#64748b' }}>Atölye Sınav Platformuna kayıt ol</p>
        </div>

        {settingsLoading ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            color: '#64748b'
          }}>
            Yükleniyor...
          </div>
        ) : !teacherRegistrationEnabled ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              backgroundColor: '#fee2e2',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #fecaca',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <AlertTriangle style={{ 
                width: '48px', 
                height: '48px', 
                color: '#dc2626', 
                margin: '0 auto 16px' 
              }} />
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#991b1b', 
                marginBottom: '12px' 
              }}>
                Kayıtlar Kapalı
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: '#7f1d1d', 
                lineHeight: '1.6' 
              }}>
                Şu anda öğretmen kayıtları kabul edilmemektedir. Lütfen daha sonra tekrar deneyin.
              </p>
            </div>
            
            <Button
              onClick={() => navigate('/')}
              style={{ width: '100%' }}
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        ) : (
          <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input
                label="Ad Soyad"
                icon={User}
                type="text"
                placeholder="Ahmet Öğretmen"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                error={errors.fullName}
                required
              />

              <Input
                label="Kullanıcı Adı"
                icon={User}
                type="text"
                placeholder="ahmet_ogretmen"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                error={errors.username}
                required
              />

              <Input
                label="Bölüm/Ders"
                icon={BookOpen}
                type="text"
                placeholder="Siber Güvenlik"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                error={errors.department}
                required
              />

              <div>
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
                {formData.password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          style={{
                            height: '4px',
                            flex: 1,
                            borderRadius: '2px',
                            backgroundColor: passwordStrength.score >= level ? getStrengthColor() : '#e2e8f0'
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: '12px', marginTop: '4px', color: getStrengthColor() }}>
                      {passwordStrength.strength === 'weak' && 'Zayıf şifre'}
                      {passwordStrength.strength === 'medium' && 'Orta güçlükte şifre'}
                      {passwordStrength.strength === 'strong' && 'Güçlü şifre'}
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Şifre Tekrar"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                required
              />

              <Button type="submit" fullWidth loading={loading} className="bg-indigo-600 hover:bg-indigo-700">
                Kayıt Ol
              </Button>
            </div>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Zaten hesabınız var mı?{' '}
              <Link to="/ogretmen/giris" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
          Öğrenci misiniz?{' '}
          <Link to="/ogrenci/kayit" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
            Öğrenci kaydı
          </Link>
        </p>
      </div>
    </div>
  );
};

export { TeacherRegister };
