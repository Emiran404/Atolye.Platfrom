import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastContainer } from './components/ui/Toast';
import { useNotificationStore } from './store/notificationStore';
import { useAuthStore } from './store/authStore';
import { initializeDemoData } from './utils/initData';

// Landing
import { LandingPage } from './pages/LandingPage';
import Documentation from './pages/Documentation';
import LabRules from './pages/LabRules';
import SystemStatus from './pages/SystemStatus';
import AboutSchool from './pages/AboutSchool';
import ScrollToTop from './components/ScrollToTop';

// Auth pages
import { StudentLogin, StudentRegister, TeacherLogin, TeacherRegister } from './pages/auth';

// Student pages
import {
  StudentDashboard,
  FileUpload,
  Submissions,
  Grades,
  MyOptics,
  Notifications,
  Settings,
  Quiz
} from './pages/student';
import StudentSchedule from './pages/student/Schedule';

// Teacher pages
import {
  TeacherDashboard,
  CreateExam,
  ActiveExams,
  ExamEdit,
  EditRequests,
  Evaluate,
  StudentList,
  Archive,
  Stats,
  TeacherNotifications,
  TeacherSettings,
  PlatformManagement,
  IntegratedSystems,
  PolyOsOGA,
  LiveExams,
  Grades as TeacherGrades
} from './pages/teacher';
import TeacherSchedule from './pages/teacher/Schedule';
import Scheduler from './pages/teacher/Scheduler';
import PolyOsLNA from './pages/PolyOsLNA';
import ReportProblem from './pages/shared/ReportProblem';

function App() {
  const { theme, isAuthenticated, updateActivity, startInactivityTimer } = useAuthStore();

  // Initialize demo data
  useEffect(() => {
    initializeDemoData();
  }, []);

  // Aktivite izleyici - mouse ve keyboard hareketlerini yakala
  useEffect(() => {
    if (!isAuthenticated) return;

    // Sayfa yüklendiğinde aktiviteyi güncelle (F5 koruması)
    updateActivity();

    // İnaktivite timer'ı başlat
    startInactivityTimer();

    // Aktivite olayları
    const handleActivity = () => {
      updateActivity();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Event listener'ları ekle
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Sayfa visibility değişikliği (sekme değişimi)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity(); // Sekmeye dönüldüğünde aktiviteyi güncelle
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, updateActivity, startInactivityTimer]);

  // Global Heartbeat - Sistem Durumu için aktif oturum takibi
  useEffect(() => {
    if (!isAuthenticated) return;

    const { user } = useAuthStore.getState();
    if (!user?.id) return;

    const sendHeartbeat = async () => {
      try {
        await fetch('/api/system/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id,
            userType: useAuthStore.getState().userType 
          })
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    // İlk girişte hemen gönder
    sendHeartbeat();

    // Sonra her 30 saniyede bir
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Toast Container - useToastStore için */}
      <ToastContainer />

      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/dokumantasyon" element={<Documentation />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/lab-rules" element={<LabRules />} />
        <Route path="/sistem-durumu" element={<SystemStatus />} />
        <Route path="/okul-ozellikleri" element={<AboutSchool />} />

        {/* PolyOS LNA - Public transfer session (no auth required) */}
        {/* PolyOS LNA - Public transfer session (no auth required) */}
        <Route path="/ogs-register" element={<PolyOsLNA />} />

        {/* Student Auth */}
        <Route path="/ogrenci/giris" element={<StudentLogin />} />
        <Route path="/ogrenci/kayit" element={<StudentRegister />} />

        {/* Teacher Auth */}
        <Route path="/ogretmen/giris" element={<TeacherLogin />} />
        <Route path="/ogretmen/kayit" element={<TeacherRegister />} />

        {/* Student Protected Routes */}
        <Route
          path="/ogrenci"
          element={
            <ProtectedRoute userType="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/panel"
          element={
            <ProtectedRoute userType="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/dosya-yukle"
          element={
            <ProtectedRoute userType="student">
              <FileUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/dosya-yukle/:examId"
          element={
            <ProtectedRoute userType="student">
              <FileUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/quiz/:examId"
          element={
            <ProtectedRoute userType="student">
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/gonderimlerim"
          element={
            <ProtectedRoute userType="student">
              <Submissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/notlarim"
          element={
            <ProtectedRoute userType="student">
              <Grades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/optiklerim"
          element={
            <ProtectedRoute userType="student">
              <MyOptics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/bildirimler"
          element={
            <ProtectedRoute userType="student">
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/ayarlar"
          element={
            <ProtectedRoute userType="student">
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/sorun-bildir"
          element={
            <ProtectedRoute userType="student">
              <ReportProblem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogrenci/ders-programi"
          element={
            <ProtectedRoute userType="student">
              <StudentSchedule />
            </ProtectedRoute>
          }
        />

        {/* Teacher Protected Routes */}
        <Route
          path="/ogretmen/panel"
          element={
            <ProtectedRoute userType="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/sinav-olustur"
          element={
            <ProtectedRoute userType="teacher">
              <CreateExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/aktif-sinavlar"
          element={
            <ProtectedRoute userType="teacher">
              <ActiveExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/canli-sinav"
          element={
            <ProtectedRoute userType="teacher">
              <LiveExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/sinav-duzenle/:examId"
          element={
            <ProtectedRoute userType="teacher">
              <ExamEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/duzenleme-talepleri"
          element={
            <ProtectedRoute userType="teacher">
              <EditRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/degerlendirme"
          element={
            <ProtectedRoute userType="teacher">
              <Evaluate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/degerlendirme/:examId"
          element={
            <ProtectedRoute userType="teacher">
              <Evaluate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/degerlendirme/:examId/:submissionId"
          element={
            <ProtectedRoute userType="teacher">
              <Evaluate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/ogrenci-listesi"
          element={
            <ProtectedRoute userType="teacher">
              <StudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/arsiv"
          element={
            <ProtectedRoute userType="teacher">
              <Archive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/istatistikler"
          element={
            <ProtectedRoute userType="teacher">
              <Stats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/bildirimler"
          element={
            <ProtectedRoute userType="teacher">
              <TeacherNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/ogrenci-notlari"
          element={
            <ProtectedRoute userType="teacher">
              <TeacherGrades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/ayarlar"
          element={
            <ProtectedRoute userType="teacher">
              <TeacherSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/platform-yonetimi"
          element={
            <ProtectedRoute userType="teacher">
              <PlatformManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/entegre-sistemler"
          element={<Navigate to="/ogretmen/polyos-oga" replace />}
        />
        <Route
          path="/ogretmen/ders-programi"
          element={
            <ProtectedRoute userType="teacher">
              <TeacherSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/polyos-oga"
          element={
            <ProtectedRoute userType="teacher">
              <PolyOsOGA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/zamanlanmis-yayin"
          element={
            <ProtectedRoute userType="teacher">
              <Scheduler />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ogretmen/sorun-bildir"
          element={
            <ProtectedRoute userType="teacher">
              <ReportProblem />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
