import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, userApi } from '../services/api';
import { getCurrentLanguage, changeLanguage as i18nChangeLanguage } from '../utils/i18n';

// Sınıf listesi
export const CLASS_LIST = [
  '9-A', '9-B', '9-C', '9-D', '9-E', '9-F',
  '10-A', '10-B', '10-C', '10-D', '10-E', '10-F',
  '11-A', '11-B', '11-C', '11-D', '11-E', '11-F',
  '12-A', '12-B', '12-C', '12-D', '12-E', '12-F'
];

// İnaktivite süresi (30 dakika = 30 * 60 * 1000 ms)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

// Dinamik storage seçici (öğrenciler: sessionStorage, öğretmenler: localStorage)
const getStorage = () => {
  const stored = localStorage.getItem('auth-storage') || sessionStorage.getItem('auth-storage');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      return data.state?.userType === 'teacher' ? localStorage : sessionStorage;
    } catch {
      return sessionStorage;
    }
  }
  return sessionStorage;
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      userType: null, // 'student' | 'teacher'
      loginAttempts: {},
      theme: 'light',
      students: [],
      lastActivity: Date.now(),
      inactivityTimer: null,
      language: getCurrentLanguage(),
      isServerOnline: true,

      // Sunucu durumunu güncelle
      setServerOnline: (status) => {
        if (get().isServerOnline !== status) {
          set({ isServerOnline: status });
        }
      },

      // Aktivite kaydı güncelle
      updateActivity: () => {
        set({ lastActivity: Date.now() });
      },

      // İnaktivite kontrolü
      checkInactivity: () => {
        const { lastActivity, isAuthenticated, logout } = get();
        if (!isAuthenticated) return;

        const timeSinceLastActivity = Date.now() - lastActivity;
        if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
          console.log('⏰ İnaktivite timeout - otomatik çıkış yapılıyor');
          logout();
          window.location.href = '/';
        }
      },

      // İnaktivite timer'ı başlat
      startInactivityTimer: () => {
        const { inactivityTimer } = get();

        // Varolan timer'ı temizle
        if (inactivityTimer) {
          clearInterval(inactivityTimer);
        }

        // Her 1 dakikada bir kontrol et
        const timer = setInterval(() => {
          get().checkInactivity();
        }, 60 * 1000);

        set({ inactivityTimer: timer });
      },

      // İnaktivite timer'ı durdur
      stopInactivityTimer: () => {
        const { inactivityTimer } = get();
        if (inactivityTimer) {
          clearInterval(inactivityTimer);
          set({ inactivityTimer: null });
        }
      },

      // Tema değiştir
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      },

      // Tema başlat
      initTheme: () => {
        // Her zaman light tema
        document.documentElement.classList.remove('dark');
        set({ theme: 'light' });
      },

      // Öğrenci kayıt - Backend API
      registerStudent: async (studentData) => {
        try {
          const response = await authApi.registerStudent(studentData);
          if (response.success) {
            // ÖĞRENCİLER: sessionStorage kullan
            localStorage.removeItem('auth-storage');

            set({
              user: response.user,
              isAuthenticated: true,
              userType: 'student',
              lastActivity: Date.now()
            });

            // İnaktivite timer'ı başlat
            get().startInactivityTimer();

            return { success: true };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error.message || 'Kayıt başarısız!' };
        }
      },

      // Öğrenci giriş - Backend API
      loginStudent: async (studentNumber, password, rememberMe = false) => {
        const attempts = get().loginAttempts[studentNumber] || { count: 0, lockedUntil: null };

        if (attempts.lockedUntil && new Date(attempts.lockedUntil) > new Date()) {
          const remainingTime = Math.ceil((new Date(attempts.lockedUntil) - new Date()) / 1000 / 60);
          return { success: false, error: `Hesap kilitli. ${remainingTime} dakika bekleyin.` };
        }

        try {
          const response = await authApi.loginStudent(studentNumber, password);

          if (response.success) {
            if (response.action === 'reset_password_required') {
              return { success: true, action: 'reset_password_required', studentNumber: response.studentNumber };
            }

            // Suspended kontrolü
            if (response.user.suspended) {
              return { success: false, error: 'Hesabınız askıya alınmış. Lütfen yönetici ile iletişime geçin.' };
            }

            const { [studentNumber]: _, ...restAttempts } = get().loginAttempts;

            // ÖĞRENCİLER: sessionStorage kullan (sayfa kapatınca çıkış)
            localStorage.removeItem('auth-storage');

            set({
              user: response.user,
              isAuthenticated: true,
              userType: 'student',
              loginAttempts: restAttempts,
              lastActivity: Date.now()
            });

            // İnaktivite timer'ı başlat
            get().startInactivityTimer();

            return { success: true, user: response.user };
          }

          const newAttempts = {
            count: attempts.count + 1,
            lockedUntil: attempts.count + 1 >= 3
              ? new Date(Date.now() + 5 * 60 * 1000).toISOString()
              : null
          };

          set({
            loginAttempts: { ...get().loginAttempts, [studentNumber]: newAttempts }
          });

          return {
            success: false,
            error: newAttempts.count >= 3
              ? 'Çok fazla hatalı deneme! Hesap 5 dakika kilitlendi.'
              : response.error || `Hatalı şifre! (${3 - newAttempts.count} deneme hakkınız kaldı)`
          };
        } catch (error) {
          return { success: false, error: error.message || 'Giriş başarısız!' };
        }
      },

      // Öğrenci şifre sıfırlama
      resetStudentPassword: async (studentNumber, newPassword) => {
        try {
          const response = await authApi.resetStudentPassword(studentNumber, newPassword);
          return response;
        } catch (error) {
          return { success: false, error: error.message || 'Şifre sıfırlama başarısız!' };
        }
      },

      // Öğretmen kayıt - Backend API
      registerTeacher: async (teacherData) => {
        try {
          const response = await authApi.registerTeacher(teacherData);
          if (response.success) {
            // ÖĞRETMENLER: localStorage kullan
            sessionStorage.removeItem('auth-storage');

            set({
              user: response.user,
              isAuthenticated: true,
              userType: 'teacher',
              lastActivity: Date.now()
            });

            // İnaktivite timer'ı başlat
            get().startInactivityTimer();

            return { success: true };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error.message || 'Kayıt başarısız!' };
        }
      },

      // Öğretmen giriş - Backend API
      loginTeacher: async (username, password) => {
        try {
          const response = await authApi.loginTeacher(username, password);
          if (response.success) {
            // Suspended kontrolü
            if (response.user.suspended) {
              return { success: false, error: 'Hesabınız askıya alınmış. Lütfen yönetici ile iletişime geçin.' };
            }

            // ÖĞRETMENLER: localStorage kullan (kalıcı)
            sessionStorage.removeItem('auth-storage');

            set({
              user: response.user,
              isAuthenticated: true,
              userType: 'teacher',
              lastActivity: Date.now()
            });

            // İnaktivite timer'ı başlat
            get().startInactivityTimer();

            return { success: true, user: response.user };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error.message || 'Giriş başarısız!' };
        }
      },

      // Kullanıcı durumunu kontrol et (suspended check)
      checkUserStatus: async () => {
        const { user, userType, logout } = get();
        if (!user || !userType) return;

        try {
          const response = userType === 'student'
            ? await authApi.loginStudent(user.studentNumber, '', true) // Skip password check
            : await authApi.loginTeacher(user.username, '', true);

          if (response.success && response.user.suspended) {
            logout();
            window.location.href = '/';
            return false;
          }
          return true;
        } catch (error) {
          return true; // Network hatası durumunda kullanıcıyı çıkarmayalım
        }
      },

      // Çıkış
      logout: () => {
        const { user } = get();
        if (user?.id) {
          console.log('[Auth] Logging out user:', user.id);
          // Notify backend to clear session immediately for system status
          // keepalive: true ensures the request is sent even if the page unloads
          fetch('/api/system/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
            keepalive: true
          }).catch(err => console.error('Logout notify failed:', err));
        }

        // İnaktivite timer'ı durdur
        get().stopInactivityTimer();

        // Storage'ı temizle
        localStorage.removeItem('auth-storage');
        sessionStorage.removeItem('auth-storage');

        set({
          user: null,
          isAuthenticated: false,
          userType: null,
          lastActivity: Date.now()
        });
      },

      // Bildirim ayarlarını güncelle
      updateNotificationSettings: async (settings) => {
        const currentUser = get().user;
        const { userType } = get();
        if (currentUser) {
          try {
            const response = await userApi.update(currentUser.id, userType, {
              notificationSettings: settings
            });
            if (response.success) {
              set({ user: response.user });
              return { success: true };
            }
          } catch (error) {
            console.error('Bildirim ayarları güncellenemedi:', error);
          }
          
          // Fallback or optimistic update if server call failed (or if we want immediate UI feedback)
          set({
            user: {
              ...currentUser,
              notificationSettings: {
                ...(currentUser.notificationSettings || {
                  loginAlerts: true,
                  submissionAlerts: true
                }),
                ...settings
              }
            }
          });
        }
      },

      // Tüm öğrencileri getir - Backend API
      getAllStudents: () => {
        // Senkron versiyon - cache'den döndür
        return get().students;
      },

      // Öğrencileri yükle - Backend API (async)
      loadStudents: async () => {
        try {
          const response = await authApi.getStudents();
          if (response.success) {
            set({ students: response.students });
            return response.students;
          }
          return [];
        } catch (error) {
          console.error('Öğrenciler yüklenemedi:', error);
          return [];
        }
      },

      // Tüm öğretmenleri getir
      getAllTeachers: () => {
        return [];
      },

      // Şifre değiştir
      changePassword: async (currentPassword, newPassword) => {
        return { success: false, error: 'Bu özellik henüz aktif değil' };
      },

      // Profil güncelle
      updateProfile: async (updates) => {
        const currentUser = get().user;
        const { userType } = get();
        if (currentUser) {
          try {
            const response = await userApi.update(currentUser.id, userType, updates);
            if (response.success) {
              set({ user: response.user });
              return { success: true };
            }
          } catch (error) {
            console.error('Profil güncellenemedi:', error);
          }
          
          // Fallback
          set({
            user: { ...currentUser, ...updates }
          });
        }
      },

      // Tema ayarla
      setTheme: (newTheme) => {
        set({ theme: newTheme });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      },

      // Dil ayarla
      setLanguage: (newLang) => {
        i18nChangeLanguage(newLang);
        set({ language: newLang });
      }
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          // Her iki storage'ı kontrol et
          const fromLocal = localStorage.getItem(name);
          const fromSession = sessionStorage.getItem(name);
          return fromLocal || fromSession;
        },
        setItem: (name, value) => {
          // userType'a göre storage seç
          try {
            const data = JSON.parse(value);
            if (data.state?.userType === 'teacher') {
              localStorage.setItem(name, value);
              sessionStorage.removeItem(name);
            } else {
              sessionStorage.setItem(name, value);
              localStorage.removeItem(name);
            }
          } catch {
            sessionStorage.setItem(name, value);
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        }
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
        theme: state.theme,
        lastActivity: state.lastActivity,
        language: state.language
      })
    }
  )
);

export { useAuthStore };
