import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  ClipboardCheck,
  TrendingUp,
  PlusCircle,
  Clock,
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { TeacherLayout } from '../../components/layouts';
import { useAuthStore } from '../../store/authStore';
import { useExamStore } from '../../store/examStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { formatDateTime, getRelativeTime } from '../../utils/dateHelpers';
import NotificationPermissionPopup from '../../components/NotificationPermissionPopup';
import { OnboardingTour } from '../../components/ui';
import { t } from '../../utils/i18n';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, loadStudents, students } = useAuthStore();
  const { loadExams, getActiveExams, getPastExams } = useExamStore();
  const { loadSubmissions, submissions } = useSubmissionStore();

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeExams: 0,
    pendingEvaluations: 0,
    avgParticipation: 0
  });
  const [activeExams, setActiveExams] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startTour, setStartTour] = useState(0); // Trigger tour re-run

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Backend'den verileri yükle
        const [studentsData, examsData, submissionsData] = await Promise.all([
          loadStudents(),
          loadExams(),
          loadSubmissions()
        ]);

        const now = new Date();
        const active = (examsData || []).filter(exam => {
          const start = new Date(exam.startDate);
          const end = new Date(exam.endDate);
          return start <= now && end >= now && (exam.status === 'active' || exam.isActive);
        });

        // edit_granted durumundaki kayıtları filtrele ve sadece mevcut sınavlarda olanları al
        const examIds = new Set((examsData || []).map(e => e.id));
        const activeSubmissions = submissionsData.filter(s => s.status !== 'edit_granted' && examIds.has(s.examId));

        // Unique submission sayısını hesapla (öğrenci-sınav bazında, grade'i olanı seç)
        const uniqueSubmissions = {};
        activeSubmissions.forEach(s => {
          const key = `${s.studentId}-${s.examId}`;
          // Grade'i olan submission'ı önceliklendir
          if (!uniqueSubmissions[key] || (s.grade !== null && s.grade !== undefined)) {
            uniqueSubmissions[key] = s;
          }
        });
        const uniqueSubmissionCount = Object.keys(uniqueSubmissions).length;

        // Bekleyen değerlendirme sayısı (unique submissions içinden)
        const pending = Object.values(uniqueSubmissions).filter(s => s.grade === null || s.grade === undefined).length;

        setStats({
          totalStudents: studentsData.length,
          activeExams: active.length,
          pendingEvaluations: pending,
          avgParticipation: studentsData.length > 0 && active.length > 0
            ? Math.round((uniqueSubmissionCount / (studentsData.length * active.length)) * 100)
            : 0
        });

        setActiveExams(active.slice(0, 4));

        // Aktiviteleri grupla - aynı öğrenci + sınav için birden fazla dosya varsa grupla
        const groupedActivities = {};
        const teacherExamIds = new Set((examsData || []).map(e => e.id));

        submissionsData
          .filter(s => s.status !== 'edit_granted' && teacherExamIds.has(s.examId)) // Sadece öğretmenin sınavları
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
          .forEach(s => {
            const key = `${s.studentId}-${s.examId}`;
            if (!groupedActivities[key]) {
              groupedActivities[key] = {
                id: s.id,
                studentName: s.studentName,
                examId: s.examId,
                files: [],
                time: s.submittedAt
              };
            }
            groupedActivities[key].files.push(s.fileName);
            // En son gönderim zamanını tut
            if (new Date(s.submittedAt) > new Date(groupedActivities[key].time)) {
              groupedActivities[key].time = s.submittedAt;
            }
          });

        const activities = Object.values(groupedActivities)
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 6)
          .map(g => {
            const exam = (examsData || []).find(e => e.id === g.examId);
            return {
              id: g.id,
              type: 'submission',
              message: `${g.studentName || 'Öğrenci'} dosya teslim etti`,
              detail: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontWeight: '600', color: '#0d9488', fontSize: '13px' }}>
                    {exam?.title || 'Bilinmeyen Sınav'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {g.files.length > 1 ? `${g.files.length} Dosya` : g.files[0]}
                  </div>
                </div>
              ),
              time: g.time
            };
          });

        setRecentActivities(activities);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      }
      setLoading(false);
    };

    fetchData();

    // Otomatik yenileme - Her 10 saniyede bir
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, []);

  const statCards = [
    {
      label: t('totalStudents'),
      value: stats.totalStudents,
      icon: Users,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      detail: t('registeredStudents')
    },
    {
      label: t('activeExamsLabel'),
      value: stats.activeExams,
      icon: FileText,
      color: '#10b981',
      bgColor: '#ecfdf5',
      detail: t('ongoing')
    },
    {
      label: t('pendingEvaluation'),
      value: stats.pendingEvaluations,
      icon: ClipboardCheck,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      detail: t('ungraded')
    },
    {
      label: t('participationRate'),
      value: `${stats.avgParticipation}%`,
      icon: TrendingUp,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      detail: t('submissionRate')
    }
  ];

  const quickActions = [
    { icon: PlusCircle, label: 'Yeni Sınav Oluştur', path: '/ogretmen/sinav-olustur', color: '#0d9488' },
    { icon: ClipboardCheck, label: 'Değerlendirme Yap', path: '/ogretmen/degerlendirme', color: '#f59e0b' },
    { icon: Users, label: 'Öğrenci Listesi', path: '/ogretmen/ogrenci-listesi', color: '#3b82f6' },
    { icon: Clock, label: 'Düzenleme Talepleri', path: '/ogretmen/duzenleme-talepleri', color: '#8b5cf6' }
  ];

  const tourSteps = [
    {
      targetId: 'welcome-header',
      title: 'Hoş Geldiniz! 👋',
      content: 'PolyOS Öğretmen Paneline hoş geldiniz. Bu kısa tur ile platformu keşfedin.',
    },
    {
      targetId: 'new-exam-btn',
      title: 'Sınav Oluşturun 📝',
      content: 'Bu butonu kullanarak yeni bir sınav veya ödev oluşturabilir, öğrencilerinize atayabilirsiniz.',
    },
    {
      targetId: 'stats-grid',
      title: 'Genel İstatistikler 📊',
      content: 'Öğrenci sayısı, aktif sınavlar ve katılım oranlarını buradan takip edebilirsiniz.',
    },
    {
      targetId: 'quick-actions',
      title: 'Hızlı İşlemler ⚡',
      content: 'Sık kullanılan işlemlere buradan anında ulaşabilirsiniz.',
    },
    {
      targetId: 'active-exams',
      title: 'Aktif Sınavlar 🟢',
      content: 'Şu an devam eden sınavlarınızı ve gönderim durumlarını buradan izleyebilirsiniz.',
    },
    {
      targetId: 'recent-activities',
      title: 'Son Aktiviteler 🔔',
      content: 'Öğrencilerinizden gelen son dosya gönderimlerini ve sistem aktivitelerini buradan görebilirsiniz.',
    },
    {
      targetId: 'nav-sinav-olustur',
      title: 'Sınav Oluştur 📋',
      content: 'Sol menüden Sınav Oluştur sayfasına giderek klasik veya quiz türünde yeni sınavlar hazırlayabilirsiniz.',
    },
    {
      targetId: 'nav-aktif-sinavlar',
      title: 'Aktif Sınavlar 📂',
      content: 'Devam eden tüm sınavlarınızı, gönderim sayılarını ve durumlarını bu sayfadan yönetebilirsiniz.',
    },
    {
      targetId: 'nav-canli-sinav',
      title: 'Canlı Sınav 🎯',
      content: 'Öğrencilerin gerçek zamanlı olarak katıldığı canlı sınavları bu sayfadan başlatıp yönetebilirsiniz.',
    },
    {
      targetId: 'nav-ogrenci-listesi',
      title: 'Öğrenci Listesi 👥',
      content: 'Tüm öğrencilerinizi görüntüleyebilir, sınıf/şube filtresi uygulayabilir ve detaylı bilgilerine ulaşabilirsiniz.',
    },
    {
      targetId: 'nav-degerlendirme',
      title: 'Değerlendirme ✅',
      content: 'Öğrencilerin gönderdiği ödev ve sınav cevaplarını buradan inceleyip notlandırabilirsiniz.',
    },
    {
      targetId: 'nav-arsiv',
      title: 'Arşiv 📁',
      content: 'Tamamlanmış sınavların sonuçlarını, istatistiklerini ve raporlarını buradan indirebilirsiniz.',
    },
    {
      targetId: 'nav-istatistikler',
      title: 'İstatistikler 📈',
      content: 'Sınıf bazında başarı oranları, katılım grafikleri ve genel performans raporlarına buradan ulaşabilirsiniz.',
    },
    {
      targetId: 'nav-platform-yonetimi',
      title: 'Platform Yönetimi 🛡️',
      content: 'Sistem ayarlarını yönetebilir, kullanıcı verilerini düzenleyebilir ve platform genelindeki konfigürasyonları buradan yapabilirsiniz.',
    },
    {
      targetId: 'nav-entegre-sistemler',
      title: 'Entegre Sistemler 🖥️',
      content: 'Harici sistemler ve araçlarla entegrasyon ayarlarını bu özel sayfadan yönetebilirsiniz.',
    },
    {
      targetId: 'nav-bildirimler',
      title: 'Bildirimler 🔔',
      content: 'Öğrenci gönderimleri, sistem uyarıları ve önemli olaylar hakkındaki bildirimlerinizi buradan takip edebilirsiniz.',
    },
    {
      targetId: 'nav-ayarlar',
      title: 'Ayarlar ⚙️',
      content: 'Profil bilgilerinizi, şifrenizi ve bildirim tercihlerinizi Ayarlar sayfasından düzenleyebilirsiniz.',
    },
  ];

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    greeting: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '4px'
    },
    subGreeting: {
      fontSize: '14px',
      color: '#64748b'
    },
    newExamBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: '#0d9488',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    statIcon: (bgColor) => ({
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      backgroundColor: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    }),
    statValue: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '2px'
    },
    statDetail: {
      fontSize: '12px',
      color: '#94a3b8'
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      marginBottom: '24px'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b'
    },
    viewAllBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '8px 12px',
      backgroundColor: 'transparent',
      color: '#0d9488',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    quickActionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px'
    },
    quickActionBtn: (color) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'left'
    }),
    quickActionIcon: (color) => ({
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: color + '15',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color
    }),
    quickActionLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1e293b'
    },
    examItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      marginBottom: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '1px solid transparent'
    },
    examInfo: {
      flex: 1
    },
    examTitle: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '4px'
    },
    examMeta: {
      fontSize: '13px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    examBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      backgroundColor: '#ecfdf5',
      color: '#059669',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500'
    },
    activityItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px',
      borderRadius: '10px',
      marginBottom: '8px',
      transition: 'background-color 0.2s'
    },
    activityDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      marginTop: '6px',
      flexShrink: 0
    },
    activityContent: {
      flex: 1
    },
    activityMessage: {
      fontSize: '14px',
      color: '#1e293b',
      marginBottom: '2px'
    },
    activityDetail: {
      fontSize: '12px',
      color: '#64748b'
    },
    activityTime: {
      fontSize: '12px',
      color: '#94a3b8',
      whiteSpace: 'nowrap'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#64748b'
    },
    emptyIcon: {
      marginBottom: '12px',
      color: '#cbd5e1'
    }
  };

  return (
    <TeacherLayout>
      <style>{`
        @media (max-width: 1024px) {
          .teacher-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .teacher-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .teacher-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .teacher-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .teacher-quick-actions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <div className="teacher-header" style={styles.header}>
          <div id="welcome-header">
            <h1 style={styles.greeting}>Hoş Geldiniz, {user?.fullName} 👋</h1>
            <p style={styles.subGreeting}>{user?.department || 'Öğretmen'} • {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                ...styles.newExamBtn,
                backgroundColor: '#ffffff',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                boxShadow: 'none'
              }}
              onClick={() => setStartTour(prev => prev + 1)}
            >
              <HelpCircle size={18} />
              Yardım
            </button>
            <button
              id="new-exam-btn"
              style={styles.newExamBtn}
              onClick={() => navigate('/ogretmen/sinav-olustur')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <PlusCircle size={18} />
              Yeni Sınav Oluştur
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div id="stats-grid" className="teacher-stats-grid" style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <div
              key={index}
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
              }}
            >
              <div style={styles.statIcon(stat.bgColor)}>
                <stat.icon size={24} color={stat.color} />
              </div>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
              <div style={styles.statDetail}>{stat.detail}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="teacher-main-grid" style={styles.mainGrid}>
          {/* Quick Actions */}
          <div id="quick-actions" style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Hızlı İşlemler</h2>
            </div>
            <div className="teacher-quick-actions-grid" style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  style={styles.quickActionBtn(action.color)}
                  onClick={() => navigate(action.path)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = action.color;
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <div style={styles.quickActionIcon(action.color)}>
                    <action.icon size={20} />
                  </div>
                  <span style={styles.quickActionLabel}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Exams */}
          <div id="active-exams" style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Aktif Sınavlar</h2>
              <button
                style={styles.viewAllBtn}
                onClick={() => navigate('/ogretmen/aktif-sinavlar')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdfa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Tümünü Gör
                <ChevronRight size={16} />
              </button>
            </div>

            {activeExams.length === 0 ? (
              <div style={styles.emptyState}>
                <Activity size={48} style={styles.emptyIcon} />
                <p>Aktif sınav bulunmuyor</p>
              </div>
            ) : (
              <div>
                {activeExams.map((exam) => (
                  <div
                    key={exam.id}
                    style={styles.examItem}
                    onClick={() => navigate(`/ogretmen/aktif-sinavlar?exam=${exam.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0d9488';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  >
                    <div style={styles.examInfo}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ ...styles.examTitle, marginBottom: 0 }}>{exam.title}</div>
                        {exam.isQuiz && (
                          <span style={{
                            fontSize: '9px',
                            backgroundColor: '#f0fdfa',
                            color: '#0d9488',
                            padding: '1px 6px',
                            border: '1px solid #0d9488',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            borderRadius: '4px'
                          }}>
                            Quiz
                          </span>
                        )}
                      </div>
                      <div style={styles.examMeta}>
                        <Calendar size={14} />
                        {exam.department || 'Genel'}
                      </div>
                    </div>
                    <div style={styles.examBadge}>
                      <CheckCircle size={12} />
                      Aktif
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div id="recent-activities" style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Son Aktiviteler</h2>
          </div>

          {recentActivities.length === 0 ? (
            <div style={styles.emptyState}>
              <Clock size={48} style={styles.emptyIcon} />
              <p>Henüz aktivite bulunmuyor</p>
            </div>
          ) : (
            <div>
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  style={styles.activityItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={styles.activityDot} />
                  <div style={styles.activityContent}>
                    <div style={styles.activityMessage}>{activity.message}</div>
                    <div style={styles.activityDetail}>{activity.detail}</div>
                  </div>
                  <div style={styles.activityTime}>{getRelativeTime(activity.time)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <OnboardingTour 
        key={startTour} 
        steps={tourSteps} 
        onComplete={() => setStartTour(0)}
        tourKey={`teacher-onboarding-done-${user?.id || 'unknown'}`}
        forceShow={startTour > 0}
      />
      <NotificationPermissionPopup />
    </TeacherLayout>
  );
};

export default TeacherDashboard;
