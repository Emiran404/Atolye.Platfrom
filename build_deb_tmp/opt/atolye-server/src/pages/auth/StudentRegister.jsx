import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Lock, Hash, ArrowLeft, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { CLASS_LIST } from '../../data/classes';
import { checkPasswordStrength } from '../../utils/crypto';

const StudentRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { registerStudent } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [allowedClasses, setAllowedClasses] = useState([]);
  const [formData, setFormData] = useState({
    studentNumber: '',
    fullName: '',
    className: '',
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
          setRegistrationEnabled(data.settings.registrationEnabled);
          setAllowedClasses(data.settings.allowedClasses || []);
        }
      } catch (error) {
        console.error('Ayarlar yüklenemedi:', error);
      }
      setSettingsLoading(false);
    };
    loadSettings();
  }, []);

  const classOptions = allowedClasses.map(c => ({ value: c, label: c }));

  const validate = () => {
    const newErrors = {};

    if (!formData.studentNumber) {
      newErrors.studentNumber = 'Okul numarası gerekli';
    } else if (!/^\d{4,}$/.test(formData.studentNumber)) {
      newErrors.studentNumber = 'Geçerli bir okul numarası girin (en az 4 rakam)';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Ad Soyad gerekli';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Ad Soyad en az 3 karakter olmalı';
    }

    if (!formData.className) {
      newErrors.className = 'Sınıf seçimi gerekli';
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
      const result = await registerStudent(formData);
      if (result.success) {
        toast.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
        setTimeout(() => navigate('/ogrenci/panel'), 1000);
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

  const handleStudentNumberBlur = () => {
    const number = formData.studentNumber.trim();
    if (number && /^\d+$/.test(number)) {
      // Sayı ise ve 4 haneden azsa başına 0 ekle
      const paddedNumber = number.padStart(4, '0');
      setFormData(prev => ({ ...prev, studentNumber: paddedNumber }));
    }
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  const getStrengthColor = () => {
    if (passwordStrength.strength === 'weak') return '#ef4444';
    if (passwordStrength.strength === 'medium') return '#f59e0b';
    return '#10b981';
  };

  // Kayıtlar kapalıysa uyarı göster
  if (settingsLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #faf5ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <p style={{ color: '#64748b' }}>Yükleniyor...</p>
      </div>
    );
  }

  if (!registrationEnabled || allowedClasses.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #faf5ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <AlertTriangle size={40} style={{ color: '#dc2626' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
            Kayıtlar Kapalı
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px' }}>
            {!registrationEnabled 
              ? 'Öğrenci kayıtları şu anda kapalıdır. Lütfen daha sonra tekrar deneyin.'
              : 'Şu anda kayıt kabul eden sınıf bulunmamaktadır.'}
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <ArrowLeft size={18} />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

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
            Öğrenci Kaydı
          </h1>
          <p style={{ color: '#64748b' }}>Atölye Sınav Platformuna kayıt ol</p>
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
              <Input
                label="Okul Numarası"
                icon={Hash}
                type="text"
                placeholder="Örn: 181 → 0181 (otomatik tamamlanır)"
                value={formData.studentNumber}
                onChange={(e) => handleChange('studentNumber', e.target.value)}
                onBlur={handleStudentNumberBlur}
                error={errors.studentNumber}
                required
              />

              <Input
                label="Ad Soyad"
                icon={User}
                type="text"
                placeholder="Ali Yılmaz"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                error={errors.fullName}
                required
              />

              <Select
                label="Sınıf"
                options={classOptions}
                value={formData.className}
                onChange={(e) => handleChange('className', e.target.value)}
                error={errors.className}
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

              <Button type="submit" fullWidth loading={loading}>
                Kayıt Ol
              </Button>
            </div>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Zaten hesabınız var mı?{' '}
              <Link to="/ogrenci/giris" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
          Öğretmen misiniz?{' '}
          <Link to="/ogretmen/kayit" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
            Öğretmen kaydı
          </Link>
        </p>
      </div>
    </div>
  );
};

export { StudentRegister };
