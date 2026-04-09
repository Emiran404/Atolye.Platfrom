import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings, Shield, Users, Lock, Unlock, Save, UserCheck, UserX, Trash2, Mail, BarChart3, HardDrive, FileText, Clock, Download, Database, Key, AlertTriangle, RefreshCcw, CheckCircle2, Info as InfoIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TeacherLayout } from '../../components/layouts';
import { useToast } from '../../components/ui/Toast';
import { Button, ConfirmModal } from '../../components/ui';
import { CLASS_LIST } from '../../store/authStore';
import { resetAllData } from '../../utils/initData';
import { t } from '../../utils/i18n';

const PlatformManagement = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // URL'den tab parametresini al (varsayılan: registration)
  const initialTab = searchParams.get('tab') || 'registration';
  const [activeTab, setActiveTab] = useState(initialTab); // registration, users, bulk, stats, backup, update, reset

  // Platform ayarları
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [teacherRegistrationEnabled, setTeacherRegistrationEnabled] = useState(true);
  const [allowedClasses, setAllowedClasses] = useState([]);

  // Kullanıcı yönetimi
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // İstatistikler
  const [stats, setStats] = useState(null);

  // Toplu bildirim state'leri
  const [bulkTarget, setBulkTarget] = useState('all-students');
  const [bulkClass, setBulkClass] = useState('9-A');
  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Yedekleme state'leri
  const [includePhotos, setIncludePhotos] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);

  // Veri sıfırlama error state
  const [resetError, setResetError] = useState('');

  // Güncelleme state'leri
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [updateHistory, setUpdateHistory] = useState([]);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [availableUpdate, setAvailableUpdate] = useState(null);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Tamam',
    onConfirm: () => { },
    type: 'warning'
  });

  const handleResetAllData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'TÜM VERİLERİ SİL?',
      message: '⚠️ DİKKAT: TÜM VERİLER SİLİNECEK!\n\nÖğrenci kayıtları, öğretmen kayıtları, sınavlar ve teslimler dahil tüm veriler kalıcı olarak silinecek.\n\nBu işlem geri alınamaz!\n\nDevam etmek istiyor musunuz?',
      confirmText: 'Evet, Devam Et',
      type: 'danger',
      onConfirm: () => {
        // İkinci onay modalı (Kilitli dosyalar uyarısı) - setTimeout ile gecikme ekliyoruz ki ilk modal kapansın
        setTimeout(() => {
          setConfirmModal({
            isOpen: true,
            title: '🔐 SON GÜVENLİK ADIMI',
            message: `⚠️ KRİTİK BİLGİLENDİRME:

Sistem sıfırlama işlemi sırasında, bazı dosyalar Windows (OneDrive/Gezgin) veya Vite tarafından "Kilitli" tutulduğu için otomatik silinemeyebilir.

Sıfırlama bittikten sonra tam temizlik için:
• Windows: Kök dizindeki "cleanup_windows.bat" dosyasını çalıştırın.
• Linux/Pardus: Kök dizindeki "cleanup_linux.sh" scriptini kullanın.

Bu araçlar kilitli süreçleri sonlandırıp tüm verileri güvenle temizleyecektir.

HAZIR MISINIZ? Bu işlem tüm sistemi Fabrika Ayarlarına döndürecektir. 👋`,
            confirmText: 'Sistemi Sıfırla ve Temizle',
            type: 'danger',
            onConfirm: async () => {
              try {
                setSaving(true);
                const result = await resetAllData();

                if (result.success === false) {
                  setResetError('Bazı veriler sıfırlanamadı. Lütfen sunucuyu kontrol edin.');
                  toast.error('Bazı veriler sıfırlanamadı. Lütfen sunucuyu kontrol edin.');
                }

                // Kullanıcıyı logout yap ve ana sayfaya yönlendir
                setTimeout(() => {
                  window.location.href = '/';
                }, 500);
              } catch (error) {
                console.error('Veri sıfırlama hatası:', error);
                setResetError('Veri sıfırlama sırasında bir hata oluştu.');
                toast.error('Veri sıfırlama sırasında bir hata oluştu.');
              } finally {
                setSaving(false);
              }
            }
          });
        }, 100);
      }
    });
  };


  useEffect(() => {
    loadSettings();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'stats') loadStats();
    if (activeTab === 'update') {
      loadUpdateData();
      handleCheckUpdate(); // Otomatik kontrol et
    }
  }, [activeTab]);

  const loadUpdateData = async () => {
    setLoading(true);
    try {
      const [vRes, hRes] = await Promise.all([
        fetch('/api/system/version'),
        fetch('/api/system/updates')
      ]);
      const vData = await vRes.json();
      const hData = await hRes.json();

      if (vData.success) setCurrentVersion(vData.version);
      if (hData.success) setUpdateHistory(hData.updates);
    } catch (error) {
      console.error('Güncelleme verileri yüklenemedi:', error);
    }
    setLoading(false);
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setAvailableUpdate(null);
    try {
      const response = await fetch('/api/system/check-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true })
      });
      const data = await response.json();
      
      // Sürüm bilgisini de tazeleyelim
      const vRes = await fetch('/api/system/version');
      const vData = await vRes.json();
      if (vData.success) setCurrentVersion(vData.version);

      if (data.success && data.updateAvailable) {
        setAvailableUpdate(data);
        toast.info(`Yeni bir güncelleme bulundu: v${data.latestVersion}`);
      } else {
        toast.success('Sisteminiz güncel.');
      }
    } catch (error) {
      toast.error('Güncelleme kontrolü başarısız.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleInstallUpdate = async () => {
    if (!availableUpdate) return;

    setInstallingUpdate(true);
    setUpdateProgress(0);

    // Progress simülasyonu
    const intervals = [
      { p: 20, t: 1000, m: 'Yedek alınıyor...' },
      { p: 50, t: 2000, m: 'Dosyalar indiriliyor...' },
      { p: 80, t: 3000, m: 'Sistem dosyaları güncelleniyor...' },
      { p: 100, t: 1500, m: 'Tamamlanıyor...' }
    ];

    for (const step of intervals) {
      await new Promise(r => setTimeout(r, step.t));
      setUpdateProgress(step.p);
    }

    try {
      const response = await fetch('/api/system/install-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: availableUpdate.latestVersion,
          description: availableUpdate.customDescription
        })
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Güncelleme başarıyla yüklendi! Sistem yeniden başlatılıyor...');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error('Güncelleme sırasında hata oluştu.');
        setInstallingUpdate(false);
      }
    } catch (error) {
      toast.error('Geri yükleme hatası!');
      setInstallingUpdate(false);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setRegistrationEnabled(data.settings.registrationEnabled || false);
        setTeacherRegistrationEnabled(data.settings.teacherRegistrationEnabled !== false);
        setAllowedClasses(data.settings.allowedClasses || []);
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    }
    setLoading(false);
  };

  const handleSaveSettings = async (newSettings = {}) => {
    setSaving(true);
    try {
      const settingsToSave = {
        registrationEnabled: newSettings.registrationEnabled !== undefined ? newSettings.registrationEnabled : registrationEnabled,
        teacherRegistrationEnabled: newSettings.teacherRegistrationEnabled !== undefined ? newSettings.teacherRegistrationEnabled : teacherRegistrationEnabled,
        allowedClasses: newSettings.allowedClasses !== undefined ? newSettings.allowedClasses : allowedClasses
      };

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Ayarlar kaydedildi');
      } else {
        toast.error('Ayarlar kaydedilemedi');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Kaydetme hatası:', error);
    }
    setSaving(false);
  };

  const handleToggleRegistration = async (enabled) => {
    setRegistrationEnabled(enabled);
    await handleSaveSettings({ registrationEnabled: enabled });
  };

  const handleToggleTeacherRegistration = async (enabled) => {
    setTeacherRegistrationEnabled(enabled);
    await handleSaveSettings({ teacherRegistrationEnabled: enabled });
  };

  const toggleClass = async (className) => {
    let newAllowedClasses;
    if (allowedClasses.includes(className)) {
      newAllowedClasses = allowedClasses.filter(c => c !== className);
    } else {
      newAllowedClasses = [...allowedClasses, className];
    }
    setAllowedClasses(newAllowedClasses);
    await handleSaveSettings({ allowedClasses: newAllowedClasses });
  };

  const selectAllClasses = async () => {
    setAllowedClasses([...CLASS_LIST]);
    await handleSaveSettings({ allowedClasses: [...CLASS_LIST] });
  };

  const deselectAllClasses = async () => {
    setAllowedClasses([]);
    await handleSaveSettings({ allowedClasses: [] });
  };

  // Kullanıcı yönetimi fonksiyonları
  const loadUsers = async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        fetch('/api/users/students'),
        fetch('/api/users/teachers')
      ]);
      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();

      if (studentsData.success) setStudents(studentsData.students);
      if (teachersData.success) setTeachers(teachersData.teachers);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    }
  };

  const handleDeleteUser = (userId, userType) => {
    setConfirmModal({
      isOpen: true,
      title: 'Kullanıcıyı Sil',
      message: 'Bu kullanıcıyı silmek istediğinizden emin misiniz?',
      confirmText: 'Sil',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userType })
          });

          const data = await response.json();
          if (data.success) {
            toast.success('Kullanıcı silindi');
            loadUsers();
          } else {
            toast.error('Kullanıcı silinemedi');
          }
        } catch (error) {
          toast.error('Bir hata oluştu');
        }
      }
    });
  };

  const handleToggleSuspend = async (userId, userType, currentStatus) => {
    try {
      const response = await fetch(`/api/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          suspended: !currentStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(currentStatus ? 'Kullanıcı aktif edildi' : 'Kullanıcı askıya alındı');
        loadUsers();
      } else {
        toast.error('İşlem başarısız');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  // İstatistik yükleme
  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  // Toplu bildirim gönderme
  const handleSendBulkNotification = async (target, title, message) => {
    try {
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, title, message })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`${data.count} kullanıcıya bildirim gönderildi`);
      } else {
        toast.error('Bildirim gönderilemedi');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  // Yedekleme fonksiyonları
  const handleBackupData = async () => {
    setBackupInProgress(true);
    try {
      // Backend'den gerçek verileri al
      const response = await fetch('/api/backup');
      const data = await response.json();

      if (!data.success) {
        toast.error('Yedekleme başarısız');
        return;
      }

      const backupData = data.backup;

      // JSON dosyası oluştur
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `platform-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Yedek başarıyla indirildi');
    } catch (error) {
      console.error('Yedekleme hatası:', error);
      toast.error('Yedekleme sırasında hata oluştu');
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleBackupWithPhotos = async () => {
    setBackupInProgress(true);
    try {
      toast.info('Fotoğraflarla yedekleme hazırlanıyor... Bu biraz zaman alabilir.');

      // Backend'den ZIP olarak indir
      const response = await fetch('/api/backup/with-photos');

      if (!response.ok) {
        toast.error('Yedekleme başarısız');
        return;
      }

      // ZIP dosyasını blob olarak al
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `platform-backup-with-photos-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Fotoğraflı yedek başarıyla indirildi (ZIP)');
    } catch (error) {
      console.error('Yedekleme hatası:', error);
      toast.error('Yedekleme sırasında bir hata oluştu');
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleRestoreData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setConfirmModal({
      isOpen: true,
      title: 'Yedek Geri Yükle',
      message: 'Yedek geri yüklendiğinde mevcut veriler silinecek. Devam etmek istiyor musunuz?',
      confirmText: 'Yedeği Yükle',
      type: 'warning',
      onConfirm: async () => {
        try {
          // ZIP dosyası mı JSON mu kontrol et
          const isZip = file.name.endsWith('.zip');

          if (isZip) {
            // ZIP dosyası - multipart/form-data ile gönder
            const formData = new FormData();
            formData.append('backup', file);

            toast.info('ZIP dosyası yükleniyor ve geri yükleniyor...');

            const response = await fetch('/api/backup/restore-zip', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              let errorMsg = 'Sunucu hatası';
              try {
                const result = await response.json();
                errorMsg = result.error || errorMsg;
              } catch (e) {
                errorMsg = `HTTP ${response.status}: ${response.statusText}`;
              }
              toast.error('Geri yükleme başarısız: ' + errorMsg);
              return;
            }

            const result = await response.json();

            if (result.success) {
              toast.success('ZIP yedeği başarıyla geri yüklendi! Sayfa yenileniyor...');
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else {
              toast.error('Geri yükleme başarısız: ' + (result.error || 'Bilinmeyen hata'));
            }
          } else {
            // JSON dosyası - mevcut yöntem
            const text = await file.text();
            const backupData = JSON.parse(text);

            if (!backupData.data) {
              throw new Error('Geçersiz yedek dosyası');
            }

            // Backend'e gönder
            const response = await fetch('/api/backup/restore', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: backupData.data })
            });

            const result = await response.json();

            if (result.success) {
              toast.success('Yedek başarıyla geri yüklendi! Sayfa yenileniyor...');
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else {
              toast.error('Geri yükleme başarısız');
            }
          }
        } catch (error) {
          console.error('Geri yükleme hatası:', error);
          toast.error('Geçersiz yedek dosyası veya bir hata oluştu');
        }
      }
    });

    event.target.value = '';
  };

  // Render fonksiyonları
  const renderRegistrationTab = () => (
    <>
      {/* Öğretmen Kayıt Kontrolü */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Users size={24} style={{ color: '#8b5cf6' }} />
          <h2 style={styles.cardTitle}>Öğretmen Kayıt Kontrolü</h2>
        </div>

        <div style={styles.toggleSection}>
          <div style={styles.toggleLabel}>
            <span style={styles.toggleTitle}>Öğretmen Kayıtları</span>
            <span style={styles.toggleDesc}>
              {teacherRegistrationEnabled
                ? 'Yeni öğretmen kayıtları aktif'
                : 'Yeni öğretmen kayıtları kapalı'}
            </span>
          </div>
          <button
            style={styles.toggleButton(teacherRegistrationEnabled)}
            onClick={() => handleToggleTeacherRegistration(!teacherRegistrationEnabled)}
            disabled={saving}
          >
            {teacherRegistrationEnabled ? (
              <>
                <Unlock size={18} />
                <span>Açık</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>Kapalı</span>
              </>
            )}
          </button>
        </div>

        {!teacherRegistrationEnabled && (
          <div style={styles.warningBox}>
            <p style={styles.warningTitle}>⚠️ Öğretmen Kayıtları Kapalı</p>
            <p style={styles.warningText}>
              Şu anda hiçbir öğretmen sisteme kayıt olamaz. Kayıtları tekrar açmak için yukarıdaki butonu kullanın.
            </p>
          </div>
        )}
      </div>

      {/* Öğrenci Kayıt Kontrolü */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Shield size={24} style={{ color: '#3b82f6' }} />
          <h2 style={styles.cardTitle}>Öğrenci Kayıt Kontrolü</h2>
        </div>

        <div style={styles.toggleSection}>
          <div style={styles.toggleLabel}>
            <span style={styles.toggleTitle}>Öğrenci Kayıtları</span>
            <span style={styles.toggleDesc}>
              {registrationEnabled
                ? 'Yeni öğrenci kayıtları aktif'
                : 'Yeni öğrenci kayıtları kapalı'}
            </span>
          </div>
          <button
            style={styles.toggleButton(registrationEnabled)}
            onClick={() => handleToggleRegistration(!registrationEnabled)}
            disabled={saving}
          >
            {registrationEnabled ? (
              <>
                <Unlock size={18} />
                <span>Açık</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>Kapalı</span>
              </>
            )}
          </button>
        </div>

        {!registrationEnabled && (
          <div style={styles.warningBox}>
            <p style={styles.warningTitle}>⚠️ Kayıtlar Kapalı</p>
            <p style={styles.warningText}>
              Şu anda hiçbir öğrenci sisteme kayıt olamaz. Kayıtları tekrar açmak için yukarıdaki butonu kullanın.
            </p>
          </div>
        )}
      </div>

      {/* Sınıf Bazlı Kayıt Kontrolü */}
      {registrationEnabled && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Users size={24} style={{ color: '#10b981' }} />
            <h2 style={styles.cardTitle}>Kayıt Açık Sınıflar</h2>
          </div>

          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
            Sadece seçili sınıflar kayıt olabilir. Diğer sınıflar kayıt ekranında görünmez.
          </p>

          <div style={styles.actionButtons}>
            <button
              style={styles.button('secondary')}
              onClick={selectAllClasses}
            >
              Tümünü Seç
            </button>
            <button
              style={styles.button('secondary')}
              onClick={deselectAllClasses}
            >
              Tümünü Kaldır
            </button>
          </div>

          <div style={styles.classGrid}>
            {CLASS_LIST.map((className) => {
              const isSelected = allowedClasses.includes(className);
              return (
                <div
                  key={className}
                  style={styles.classCard(isSelected)}
                  onClick={() => toggleClass(className)}
                >
                  <div style={styles.className(isSelected)}>{className}</div>
                  <div style={styles.classStatus(isSelected)}>
                    {isSelected ? (
                      <>
                        <Unlock size={14} />
                        <span>Açık</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>Kapalı</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {allowedClasses.length === 0 && (
            <div style={{ ...styles.warningBox, backgroundColor: '#fee2e2', borderColor: '#fecaca' }}>
              <p style={{ ...styles.warningTitle, color: '#991b1b' }}>❌ Hiçbir Sınıf Seçilmedi</p>
              <p style={{ ...styles.warningText, color: '#7f1d1d' }}>
                Kayıtlar açık olmasına rağmen hiçbir sınıf seçilmedi. Öğrenciler kayıt olamayacak.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bilgi Kutusu */}
      <div style={{ ...styles.card, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Settings size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
              💡 Nasıl Çalışır?
            </h3>
            <ul style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Değişiklikler otomatik olarak kaydedilir</li>
              <li>Kayıtlar kapalıyken hiçbir öğrenci sisteme kayıt olamaz</li>
              <li>Kayıtlar açıkken sadece seçili sınıflar kayıt formunda görünür</li>
              <li>Öğrenciler sadece kendi sınıflarına kayıt olabilir</li>
              <li>Toksik davranış durumunda tüm kayıtları kapatabilir veya belirli sınıfları engelleyebilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );

  const [passwordChangeModeRemaining, setPasswordChangeModeRemaining] = useState(null);

  useEffect(() => {
    // İlk yüklemede ve 1 saniyede bir kalan süreyi kontrol et
    const checkPasswordModeStatus = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();

        if (data.success && data.settings?.passwordChangeModeExpiresAt) {
          const expiresAt = new Date(data.settings.passwordChangeModeExpiresAt).getTime();
          const now = Date.now();

          if (expiresAt > now) {
            setPasswordChangeModeRemaining(Math.floor((expiresAt - now) / 1000));
          } else {
            setPasswordChangeModeRemaining(null);
          }
        } else {
          setPasswordChangeModeRemaining(null);
        }
      } catch (error) {
        console.error('Ayarlar alınamadı:', error);
      }
    };

    if (activeTab === 'users') {
      checkPasswordModeStatus();
      const interval = setInterval(() => {
        setPasswordChangeModeRemaining((prev) => {
          if (prev === null) {
            checkPasswordModeStatus(); // Belki arkada biri açtı diye periyodik kontrol et
            return null;
          }
          if (prev <= 1) {
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTogglePasswordChangeMode = async () => {
    try {
      const currentSettingsRes = await fetch('/api/settings');
      const currentSettings = await currentSettingsRes.json();

      let updateRes;
      if (passwordChangeModeRemaining !== null) {
        // İptal et
        updateRes = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentSettings,
            passwordChangeModeExpiresAt: null
          })
        });
        if (updateRes.ok) {
          setPasswordChangeModeRemaining(null);
          toast.success('Şifre Değiştirme Modu iptal edildi.');
        } else {
          toast.error('Mod iptal edilemedi.');
        }
      } else {
        // Aktif et
        const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();
        updateRes = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentSettings,
            passwordChangeModeExpiresAt: expiresAt
          })
        });
        if (updateRes.ok) {
          setPasswordChangeModeRemaining(600); // 10 dakika = 600 saniye
          toast.success('Öğrenci Şifre Değiştirme Modu 10 dakikalığına aktif edildi!');
        } else {
          toast.error('Mod aktif edilemedi.');
        }
      }
    } catch (error) {
      toast.error('Bağlantı hatası!');
    }
  };

  const renderUsersTab = () => {
    const filteredStudents = students.filter(s =>
      s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentNumber?.includes(searchQuery) ||
      s.className?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTeachers = teachers.filter(t =>
      t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <>
        {/* Arama */}
        <div style={styles.card}>
          <input
            type="text"
            placeholder="🔍 Öğrenci veya öğretmen ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              outline: 'none'
            }}
          />
        </div>

        {/* Öğrenciler */}
        <div style={styles.card}>
          <div style={{ ...styles.cardHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Users size={24} style={{ color: '#3b82f6' }} />
              <h2 style={styles.cardTitle}>Öğrenciler ({filteredStudents.length})</h2>
            </div>
            <Button
              variant={passwordChangeModeRemaining !== null ? "error" : "warning"}
              onClick={handleTogglePasswordChangeMode}
            >
              <Key size={16} />
              {passwordChangeModeRemaining !== null
                ? `İptal Et (${formatTime(passwordChangeModeRemaining)})`
                : 'Tüm Öğrenciler için Şifre Değişim Modu (10dk)'}
            </Button>
          </div>

          {filteredStudents.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
              Öğrenci bulunamadı
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#64748b' }}>Ad Soyad</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#64748b' }}>Okul No</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#64748b' }}>Sınıf</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#64748b' }}>Durum</th>
                    <th style={{ textAlign: 'center', padding: '12px', fontSize: '13px', color: '#64748b' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{student.fullName}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{student.studentNumber}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{student.className}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: student.suspended ? '#fee2e2' : '#dcfce7',
                          color: student.suspended ? '#991b1b' : '#166534'
                        }}>
                          {student.suspended ? 'Askıda' : 'Aktif'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleToggleSuspend(student.id, 'student', student.suspended)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: student.suspended ? '#dcfce7' : '#fef3c7',
                              color: student.suspended ? '#166534' : '#92400e',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {student.suspended ? <UserCheck size={14} /> : <UserX size={14} />}
                            {student.suspended ? 'Aktif Et' : 'Askıya Al'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(student.id, 'student')}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={14} />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Öğretmenler */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <UserCheck size={24} style={{ color: '#8b5cf6' }} />
            <h2 style={styles.cardTitle}>Öğretmenler ({filteredTeachers.length})</h2>
          </div>

          {filteredTeachers.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
              Öğretmen bulunamadı
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#64748b' }}>Ad Soyad</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#64748b' }}>Kullanıcı Adı</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#64748b' }}>Bölüm</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', color: '#64748b' }}>Durum</th>
                    <th style={{ textAlign: 'center', padding: '12px', fontSize: '13px', color: '#64748b' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map(teacher => (
                    <tr key={teacher.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{teacher.fullName}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{teacher.username}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{teacher.department}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: teacher.suspended ? '#fee2e2' : '#dcfce7',
                          color: teacher.suspended ? '#991b1b' : '#166534'
                        }}>
                          {teacher.suspended ? 'Askıda' : 'Aktif'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleToggleSuspend(teacher.id, 'teacher', teacher.suspended)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: teacher.suspended ? '#dcfce7' : '#fef3c7',
                              color: teacher.suspended ? '#166534' : '#92400e',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {teacher.suspended ? <UserCheck size={14} /> : <UserX size={14} />}
                            {teacher.suspended ? 'Aktif Et' : 'Askıya Al'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(teacher.id, 'teacher')}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={14} />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderBulkTab = () => {
    const handleSendBulk = async () => {
      if (!bulkTitle || !bulkMessage) {
        toast.error('Başlık ve mesaj gerekli');
        return;
      }

      setSending(true);
      const target = bulkTarget === 'class' ? `class-${bulkClass}` : bulkTarget;
      await handleSendBulkNotification(target, bulkTitle, bulkMessage);
      setBulkTitle('');
      setBulkMessage('');
      setSending(false);
    };

    return (
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Mail size={24} style={{ color: '#10b981' }} />
          <h2 style={styles.cardTitle}>Toplu Bildirim Gönder</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Kime */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
              Kime Gönderilsin?
            </label>
            <select
              value={bulkTarget}
              onChange={(e) => setBulkTarget(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none'
              }}
            >
              <option value="all-students">Tüm Öğrenciler</option>
              <option value="class">Belirli Sınıf</option>
              <option value="all-teachers">Tüm Öğretmenler</option>
            </select>
          </div>

          {/* Sınıf Seçimi */}
          {bulkTarget === 'class' && (
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
                Sınıf Seç
              </label>
              <select
                value={bulkClass}
                onChange={(e) => setBulkClass(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  outline: 'none'
                }}
              >
                {CLASS_LIST.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Başlık */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
              Bildirim Başlığı
            </label>
            <input
              type="text"
              value={bulkTitle}
              onChange={(e) => setBulkTitle(e.target.value)}
              placeholder="Örn: Önemli Duyuru"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none'
              }}
            />
          </div>

          {/* Mesaj */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
              Mesaj
            </label>
            <textarea
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              placeholder="Bildirim mesajınızı buraya yazın..."
              rows={5}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Gönder Butonu */}
          <button
            onClick={handleSendBulk}
            disabled={sending || !bulkTitle || !bulkMessage}
            style={{
              padding: '12px',
              backgroundColor: sending ? '#94a3b8' : '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Mail size={18} />
            {sending ? 'Gönderiliyor...' : 'Bildirim Gönder'}
          </button>
        </div>
      </div>
    );
  };

  const renderStatsTab = () => {
    if (!stats) {
      return (
        <div style={styles.card}>
          <p style={{ textAlign: 'center', color: '#64748b' }}>İstatistikler yükleniyor...</p>
        </div>
      );
    }

    const statCards = [
      {
        icon: Users,
        title: 'Toplam Öğrenci',
        value: stats.totalStudents || 0,
        color: '#3b82f6'
      },
      {
        icon: UserCheck,
        title: 'Toplam Öğretmen',
        value: stats.totalTeachers || 0,
        color: '#8b5cf6'
      },
      {
        icon: FileText,
        title: 'Aktif Sınavlar',
        value: stats.activeExams || 0,
        color: '#10b981'
      },
      {
        icon: Clock,
        title: 'Toplam Gönderim',
        value: stats.totalSubmissions || 0,
        color: '#f59e0b'
      },
      {
        icon: HardDrive,
        title: 'Kullanılan Depolama',
        value: stats.storageUsed || '0 B',
        subtitle: `Kalan: ${stats.remainingSpace || '10 GB'}`,
        color: '#ef4444'
      }
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            style={{
              ...styles.card,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: 0
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              backgroundColor: `${stat.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <stat.icon size={28} style={{ color: stat.color }} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{stat.title}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{stat.value}</p>
              {stat.subtitle && <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{stat.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBackupTab = () => (
    <>
      {/* Yedekleme Bilgisi */}
      <div style={{ ...styles.card, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Database size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e40af', marginBottom: '8px' }}>
              📦 Veri Yedekleme Sistemi
            </h3>
            <p style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6', marginBottom: '8px' }}>
              Platform verilerinizi güvenli bir şekilde yedekleyin ve gerektiğinde geri yükleyin.
            </p>
            <ul style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li><strong>Yedeklenen Veriler:</strong> Öğrenciler, Öğretmenler, Sınavlar, Gönderimler, Notlar, Bildirimler, Programlar</li>
              <li><strong>Fotoğraflar:</strong> Varsayılan olarak yedeklenmez (dosya boyutu nedeniyle)</li>
              <li><strong>Format:</strong> JSON dosyası (kolayca okunabilir ve düzenlenebilir)</li>
              <li><strong>Güvenlik:</strong> Yedek dosyaları güvenli bir yerde saklayın</li>
            </ul>
          </div>
        </div>
      </div>

      {/* JSON Yedekleme */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Download size={24} style={{ color: '#10b981' }} />
          <h2 style={styles.cardTitle}>Veri Yedekleme</h2>
        </div>

        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
          Platform verilerini JSON formatında yedekleyin. Bu yedek dosyası ile tüm öğrenci, öğretmen, sınav ve not bilgilerini kaydedebilirsiniz.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Standart Yedek */}
          <div style={{
            padding: '20px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Database size={20} style={{ color: '#10b981' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                Standart Yedekleme (JSON)
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: '1.6' }}>
              Tüm platform verileri JSON dosyası olarak indirilir. Fotoğraflar dahil <strong>değildir</strong>.
              Dosya boyutu küçüktür ve hızlı indirilir.
            </p>
            <button
              onClick={handleBackupData}
              disabled={backupInProgress}
              style={{
                ...styles.button('primary'),
                width: '100%',
                opacity: backupInProgress ? 0.6 : 1
              }}
            >
              <Download size={18} />
              {backupInProgress ? 'Yedekleniyor...' : 'JSON Yedek İndir'}
            </button>
          </div>

          {/* Fotoğraflı Yedek */}
          <div style={{
            padding: '20px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Download size={20} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                Fotoğraflı Yedekleme (ZIP)
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: '1.6' }}>
              Tüm veriler + yüklenen fotoğraflar ZIP arşivi olarak indirilir.
              <strong> Dosya boyutu büyük olabilir.</strong> İndirme işlemi daha uzun sürebilir.
              ZIP içeriği: backup.json, uploads/ ve uploads_student/ klasörleri.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <input
                type="checkbox"
                id="includePhotos"
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="includePhotos" style={{
                fontSize: '13px',
                color: '#92400e',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
                Fotoğrafları dahil et (uploads ve uploads_student klasörleri)
              </label>
            </div>

            <button
              onClick={handleBackupWithPhotos}
              disabled={backupInProgress || !includePhotos}
              style={{
                ...styles.button('primary'),
                width: '100%',
                opacity: 1,
                backgroundColor: !includePhotos ? '#64748b' : '#3b82f6',
                color: '#ffffff',
                cursor: !includePhotos ? 'not-allowed' : 'pointer'
              }}
            >
              <Download size={18} />
              {backupInProgress ? 'Yedekleniyor...' : 'Fotoğraflı Yedek İndir (ZIP)'}
            </button>

            {!includePhotos && (
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '8px',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                Fotoğrafları dahil etmek için yukarıdaki kutucuğu işaretleyin
              </p>
            )}
          </div>
        </div>

        {/* Uyarı */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
            <strong>⚠️ Önemli:</strong> Yedek dosyalarını güvenli bir yerde saklayın.
            Bu dosyalar tüm platform verilerinizi içerir ve yetkisiz kişilerin eline geçmemelidir.
          </p>
        </div>
      </div>

      {/* Geri Yükleme */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Database size={24} style={{ color: '#ef4444' }} />
          <h2 style={styles.cardTitle}>Veri Geri Yükleme</h2>
        </div>

        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
          Daha önce aldığınız yedek dosyasından verileri geri yükleyin.
          <strong style={{ color: '#ef4444' }}> Bu işlem mevcut tüm verileri silecektir!</strong>
          <br />
          <span style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', display: 'block' }}>
            Desteklenen formatlar: <strong>JSON</strong> (sadece veriler) veya <strong>ZIP</strong> (veriler + fotoğraflar)
          </span>
        </p>

        <div style={{
          padding: '20px',
          border: '2px dashed #fecaca',
          borderRadius: '12px',
          backgroundColor: '#fef2f2',
          textAlign: 'center'
        }}>
          <Database size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>
            Dikkatli Olun!
          </h3>
          <p style={{ fontSize: '13px', color: '#7f1d1d', marginBottom: '16px', lineHeight: '1.6' }}>
            Yedek geri yüklendiğinde mevcut tüm veriler (öğrenciler, sınavlar, notlar) silinecek ve
            yedek dosyasındaki verilerle değiştirilecektir. Bu işlem geri alınamaz.
            {' '}ZIP dosyası seçerseniz fotoğraflar da geri yüklenecektir.
          </p>

          <input
            type="file"
            accept=".json,.zip"
            onChange={handleRestoreData}
            style={{ display: 'none' }}
            id="restore-file-input"
          />
          <label
            htmlFor="restore-file-input"
            style={{
              ...styles.button('secondary'),
              display: 'inline-flex',
              cursor: 'pointer'
            }}
          >
            <Database size={18} />
            Yedek Dosyası Seç (.json veya .zip)
          </label>
        </div>
      </div>

    </>
  );

  const renderUpdateTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Mevcut Durum */}
      <div style={{
        ...styles.card,
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        border: 'none',
        color: 'white',
        padding: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Sistem Durumu</p>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
              Sürüm v{currentVersion}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>Sistem Güncel ve Kararlı</span>
            </div>
          </div>
          <button
            onClick={handleCheckUpdate}
            disabled={checkingUpdate || installingUpdate}
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <RefreshCcw size={18} className={checkingUpdate ? 'animate-spin' : ''} />
            {checkingUpdate ? 'Kontrol Ediliyor...' : 'Güncellemeleri Kontrol Et'}
          </button>
        </div>
      </div>

      {/* Yeni Güncelleme Varsa */}
      {availableUpdate && (
        <div style={{
          ...styles.card,
          borderColor: '#3b82f6',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)',
          animation: 'in-expo 0.5s ease-out'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              flexShrink: 0
            }}>
              <RefreshCcw size={32} />
            </div>
            <style>{`
                .markdown-content ul { padding-left: 20px; list-style-type: disc; margin-bottom: 12px; }
                .markdown-content li { margin-bottom: 4px; }
                .markdown-content h1, .markdown-content h2, .markdown-content h3 { 
                  font-size: 1.1em; 
                  font-weight: 700; 
                  margin-top: 12px; 
                  margin-bottom: 8px;
                  color: #1e293b;
                }
                .markdown-content p { margin-bottom: 8px; }
                .markdown-content strong { font-weight: 700; color: #1e293b; }
                .markdown-content code { 
                  background-color: #f1f5f9; 
                  padding: 2px 4px; 
                  border-radius: 4px; 
                  font-family: monospace;
                  font-size: 0.9em;
                }
              `}</style>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    Yeni Sürüm Mevcut: v{availableUpdate.latestVersion}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    Yayınlanma Tarihi: {new Date(availableUpdate.releaseDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>Kritik Güncelleme</span>
              </div>

              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Neler Değişti?</h4>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  lineHeight: '1.6',
                  overflowY: 'auto',
                  maxHeight: '300px'
                }} className="markdown-content">
                  <ReactMarkdown>{availableUpdate.changelog}</ReactMarkdown>
                </div>
              </div>

              {installingUpdate ? (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>Yükleniyor...</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6' }}>%{updateProgress}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${updateProgress}%`,
                      backgroundColor: '#3b82f6',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleInstallUpdate}
                  style={{
                    ...styles.button('primary'),
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px'
                  }}
                >
                  Şimdi Yükle ve Yeniden Başlat
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Geçmiş */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Clock size={24} style={{ color: '#64748b' }} />
          <h2 style={styles.cardTitle}>Güncelleme Geçmişi</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {updateHistory.map((update, index) => (
            <div
              key={update.version}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: index === 0 ? '#f0f9ff' : 'white',
                border: `1px solid ${index === 0 ? '#bae6fd' : '#f1f5f9'}`,
                borderRadius: '12px'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: update.status === 'installed' ? '#dcfce7' : '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: update.status === 'installed' ? '#166534' : '#991b1b',
                flexShrink: 0
              }}>
                {update.status === 'installed' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>v{update.version}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(update.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{update.description}</p>
              </div>
              {index === 0 && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#bae6fd',
                  color: '#0369a1',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>AKTİF SÜRÜM</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bilgi Kutusu */}
      <div style={{ ...styles.card, backgroundColor: '#fff7ed', borderColor: '#ffedd5' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <InfoIcon size={24} style={{ color: '#f97316', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#9a3412', marginBottom: '8px' }}>
              💡 Güncelleme Hakkında
            </h3>
            <p style={{ fontSize: '13px', color: '#9a3412', lineHeight: '1.6' }}>
              Güncelleme işlemi sırasında sistem dosyaları yenilenirken otomatik olarak bir veri yedeği alınır.
              İşlem tamamlandığında platform otomatik olarak yenilenecek ve yeni sürüm aktif olacaktır.
              Önemli güncellemeleri kaçırmamak için düzenli olarak kontrol etmeniz önerilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResetTab = () => (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <AlertTriangle size={24} style={{ color: '#dc2626' }} />
        <h2 style={styles.cardTitle}>DİKKAT: Sistemi Sıfırla</h2>
      </div>

      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
        Tüm platform verilerini kalıcı olarak silip sistemi başlangıç durumuna getirin.
      </p>

      {resetError && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          {resetError}
        </div>
      )}

      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={24} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626', margin: 0 }}>Tüm Verileri Sıfırla</h3>
            <p style={{ fontSize: '14px', color: '#991b1b', margin: '4px 0 0 0' }}>Bütün sistemi siler</p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '14px', color: '#991b1b' }}>
              <strong>Uyarı:</strong> Bu işlem geri alınamaz! Aşağıdaki veriler kalıcı olarak silinecektir:
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Öğrenci ve öğretmen hesapları</li>
                <li>Sınavlar, ödevler, değerlendirmeler</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleResetAllData}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '14px 24px',
            backgroundColor: saving ? '#fca5a5' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Trash2 size={18} />
          {saving ? 'Sıfırlanıyor...' : 'Tüm Verileri Sıfırla'}
        </button>
      </div>

      {/* Sistem Bilgileri */}
      <div style={{
        marginTop: '24px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Platform Bilgileri</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b' }}>Platform Versiyonu</span>
            <span style={{ fontWeight: '500', color: '#1e293b' }}>v{currentVersion || '...'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b' }}>Son Güncelleme</span>
            <span style={{ fontWeight: '500', color: '#1e293b' }}>{updateHistory[0]?.date ? new Date(updateHistory[0].date).toLocaleDateString('tr-TR') : '15.03.2026'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b' }}>Altyapı</span>
            <span style={{ fontWeight: '500', color: '#1e293b' }}>PolyOS Engine</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ color: '#64748b' }}>Geliştirici</span>
            <span style={{ fontWeight: '500', color: '#1e293b' }}>Emirhan Gök</span>
          </div>
        </div>
      </div>
    </div>
  );

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '32px' },
    header: { marginBottom: '32px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
    subtitle: { fontSize: '14px', color: '#64748b' },

    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '2px solid #e2e8f0',
      overflowX: 'auto'
    },

    tab: (isActive) => ({
      padding: '12px 20px',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
      color: isActive ? '#3b82f6' : '#64748b',
      fontSize: '14px',
      fontWeight: isActive ? '600' : '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }),

    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      marginBottom: '24px'
    },

    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e2e8f0'
    },

    cardTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b' },

    toggleSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      marginBottom: '16px'
    },

    toggleLabel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },

    toggleTitle: { fontSize: '15px', fontWeight: '600', color: '#1e293b' },
    toggleDesc: { fontSize: '13px', color: '#64748b' },

    toggleButton: (enabled) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      backgroundColor: enabled ? '#dcfce7' : '#fee2e2',
      color: enabled ? '#166534' : '#991b1b',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }),

    classGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '12px',
      marginTop: '16px'
    },

    classCard: (isSelected) => ({
      padding: '16px',
      borderRadius: '12px',
      border: isSelected ? '2px solid #3b82f6' : '2px solid #e2e8f0',
      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center'
    }),

    className: (isSelected) => ({
      fontSize: '16px',
      fontWeight: '700',
      color: isSelected ? '#3b82f6' : '#64748b',
      marginBottom: '8px'
    }),

    classStatus: (isSelected) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      fontSize: '12px',
      fontWeight: '500',
      color: isSelected ? '#166534' : '#991b1b'
    }),

    actionButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },

    button: (variant = 'primary') => ({
      padding: '10px 20px',
      backgroundColor: variant === 'primary' ? '#3b82f6' : variant === 'secondary' ? '#f1f5f9' : '#ef4444',
      color: variant === 'primary' ? '#ffffff' : variant === 'secondary' ? '#475569' : '#ffffff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    }),

    saveButton: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '24px',
      transition: 'all 0.2s'
    },

    warningBox: {
      padding: '16px',
      backgroundColor: '#fef3c7',
      border: '1px solid #fcd34d',
      borderRadius: '12px',
      marginTop: '16px'
    },

    warningTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#92400e',
      marginBottom: '8px'
    },

    warningText: {
      fontSize: '13px',
      color: '#78350f',
      lineHeight: '1.6'
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div style={styles.container}>
          <p style={{ textAlign: 'center', color: '#64748b' }}>Yükleniyor...</p>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Platform Yönetimi</h1>
          <p style={styles.subtitle}>Platform ayarlarını, kullanıcıları ve istatistikleri yönetin</p>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabs}>
          <button
            style={styles.tab(activeTab === 'registration')}
            onClick={() => setActiveTab('registration')}
          >
            <Shield size={18} />
            Kayıt Kontrolü
          </button>
          <button
            style={styles.tab(activeTab === 'users')}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Kullanıcı Yönetimi
          </button>
          <button
            style={styles.tab(activeTab === 'bulk')}
            onClick={() => setActiveTab('bulk')}
          >
            <Mail size={18} />
            Toplu İşlemler
          </button>
          <button
            style={styles.tab(activeTab === 'stats')}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={18} />
            İstatistikler
          </button>
          <button
            style={styles.tab(activeTab === 'backup')}
            onClick={() => setActiveTab('backup')}
          >
            <Database size={18} />
            Veri Yedekleme
          </button>
          <button
            style={styles.tab(activeTab === 'update')}
            onClick={() => setActiveTab('update')}
          >
            <RefreshCcw size={18} />
            Güncelleme Yönetimi
          </button>
          <button
            style={{ ...styles.tab(activeTab === 'reset'), color: activeTab === 'reset' ? '#dc2626' : '#64748b', borderBottomColor: activeTab === 'reset' ? '#dc2626' : 'transparent' }}
            onClick={() => setActiveTab('reset')}
          >
            <AlertTriangle size={18} />
            Sistem Sıfırlama
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'registration' && renderRegistrationTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'bulk' && renderBulkTab()}
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'backup' && renderBackupTab()}
        {activeTab === 'update' && renderUpdateTab()}
        {activeTab === 'reset' && renderResetTab()}
        <ConfirmModal
          {...confirmModal}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </TeacherLayout>
  );
};

export default PlatformManagement;
