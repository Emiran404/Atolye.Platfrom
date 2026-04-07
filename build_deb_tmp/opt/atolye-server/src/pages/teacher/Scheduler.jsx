import { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/layouts';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useExamStore } from '../../store/examStore';
import { useAuthStore } from '../../store/authStore';
import { Clock, Calendar, Power, PowerOff, Play, Pause, CheckCircle, XCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/dateHelpers';

const Scheduler = () => {
  const { toast } = useToast();
  const { exams, loadExams } = useExamStore();
  const { user } = useAuthStore();
  const [scheduledExams, setScheduledExams] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadExams(user?.id);
    
    // Her saniye current time güncelle
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      checkScheduledExams();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (exams.length > 0) {
      updateScheduledExams();
    }
  }, [exams]);

  const updateScheduledExams = () => {
    const scheduled = exams.map(exam => {
      const startDate = new Date(exam.startDate);
      const endDate = new Date(exam.endDate);
      const now = new Date();

      let status = 'scheduled'; // upcoming
      if (now >= startDate && now <= endDate) {
        status = 'active';
      } else if (now > endDate) {
        status = 'ended';
      }

      const timeUntilStart = startDate - now;
      const timeUntilEnd = endDate - now;

      return {
        ...exam,
        scheduleStatus: status,
        timeUntilStart,
        timeUntilEnd,
        isAutoManaged: exam.autoPublish !== false // Default true
      };
    });

    // Sırala: active -> scheduled -> ended
    scheduled.sort((a, b) => {
      const order = { active: 1, scheduled: 2, ended: 3 };
      return order[a.scheduleStatus] - order[b.scheduleStatus];
    });

    setScheduledExams(scheduled);
  };

  const checkScheduledExams = () => {
    // Her saniye kontrol et ve otomatik aç/kapat
    const now = new Date();
    
    exams.forEach(exam => {
      if (exam.autoPublish === false) return; // Manuel kontroldekiler skip

      const startDate = new Date(exam.startDate);
      const endDate = new Date(exam.endDate);

      // Otomatik başlat
      if (now >= startDate && now <= endDate && !exam.isActive) {
        console.log(`Sınav otomatik başlatıldı: ${exam.title}`);
        // Backend'e toggle isteği gönder
        // toggleExamStatus(exam.id, true);
      }

      // Otomatik bitir
      if (now > endDate && exam.isActive) {
        console.log(`Sınav otomatik kapatıldı: ${exam.title}`);
        // toggleExamStatus(exam.id, false);
      }
    });
  };

  const formatTimeRemaining = (ms) => {
    if (ms < 0) return 'Geçti';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (days > 0) return `${days}g ${hours}s`;
    if (hours > 0) return `${hours}s ${minutes}d`;
    if (minutes > 0) return `${minutes}d ${seconds}s`;
    return `${seconds}s`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        text: 'Aktif',
        bg: '#dcfce7',
        color: '#166534',
        icon: <Power size={14} />
      },
      scheduled: {
        text: 'Zamanlanmış',
        bg: '#dbeafe',
        color: '#1e40af',
        icon: <Clock size={14} />
      },
      ended: {
        text: 'Sona Erdi',
        bg: '#f3f4f6',
        color: '#6b7280',
        icon: <PowerOff size={14} />
      }
    };

    const badge = badges[status];
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: badge.bg,
        color: badge.color,
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600'
      }}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '24px' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: { fontSize: '24px', fontWeight: '700', color: '#1e293b' },
    currentTime: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      backgroundColor: '#eff6ff',
      borderRadius: '12px',
      border: '1px solid #bfdbfe'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      marginBottom: '16px'
    },
    examHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
      flexWrap: 'wrap',
      gap: '12px'
    },
    examTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '8px'
    },
    examMeta: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      marginTop: '16px'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#64748b'
    },
    metaLabel: {
      fontWeight: '600',
      color: '#475569'
    },
    countdown: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#fef3c7',
      border: '1px solid #fde68a',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#92400e'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e2e8f0'
    }
  };

  return (
    <TeacherLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Zamanlanmış Sınavlar</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              Otomatik açılma/kapanma zamanlaması
            </p>
          </div>
          <div style={styles.currentTime}>
            <Clock size={20} color="#3b82f6" />
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e40af' }}>
              {currentTime.toLocaleString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Info Card */}
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #bfdbfe'
        }}>
          <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '8px', fontWeight: '600' }}>
            ⚡ Otomatik Yönetim
          </p>
          <p style={{ fontSize: '13px', color: '#3b82f6', lineHeight: '1.6' }}>
            Sınavlar belirtilen başlangıç ve bitiş tarihlerinde otomatik olarak açılır/kapanır.
            Manuel kontrol için sınav düzenleme sayfasını kullanabilirsiniz.
          </p>
        </div>

        {/* Scheduled Exams List */}
        {scheduledExams.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={64} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
              Zamanlanmış sınav yok
            </h3>
            <p style={{ color: '#94a3b8' }}>
              Sınav oluşturduğunuzda otomatik olarak burada görünecek
            </p>
          </div>
        ) : (
          <div>
            {scheduledExams.map(exam => (
              <div key={exam.id} style={styles.card}>
                <div style={styles.examHeader}>
                  <div style={{ flex: 1 }}>
                    <h3 style={styles.examTitle}>{exam.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {getStatusBadge(exam.scheduleStatus)}
                      <span style={{
                        padding: '6px 12px',
                        backgroundColor: (exam.type === 'exam' || exam.type === 'final_exam') ? '#fef3c7' : '#f3e8ff',
                        color: (exam.type === 'exam' || exam.type === 'final_exam') ? '#92400e' : '#6b21a8',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {(exam.type === 'exam' || exam.type === 'final_exam') ? '📝 Sınav' : '📚 Ödev'}
                      </span>
                    </div>
                  </div>

                  {/* Countdown */}
                  {exam.scheduleStatus === 'scheduled' && (
                    <div style={styles.countdown}>
                      <Clock size={16} />
                      Başlamasına: {formatTimeRemaining(exam.timeUntilStart)}
                    </div>
                  )}
                  {exam.scheduleStatus === 'active' && (
                    <div style={{ ...styles.countdown, backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#166534' }}>
                      <Play size={16} />
                      Bitmesine: {formatTimeRemaining(exam.timeUntilEnd)}
                    </div>
                  )}
                </div>

                {/* Exam Meta */}
                <div style={styles.examMeta}>
                  <div style={styles.metaItem}>
                    <Calendar size={16} />
                    <span style={styles.metaLabel}>Başlangıç:</span>
                    <span>{formatDateTime(exam.startDate)}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <Calendar size={16} />
                    <span style={styles.metaLabel}>Bitiş:</span>
                    <span>{formatDateTime(exam.endDate)}</span>
                  </div>
                  <div style={styles.metaItem}>
                    {exam.isAutoManaged ? (
                      <>
                        <CheckCircle size={16} color="#10b981" />
                        <span style={{ color: '#10b981', fontWeight: '600' }}>Otomatik Yönetim Aktif</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} color="#ef4444" />
                        <span style={{ color: '#ef4444', fontWeight: '600' }}>Manuel Kontrol</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {exam.scheduleStatus === 'active' && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '6px'
                    }}>
                      <span>İlerleme</span>
                      <span>
                        {Math.round(
                          ((Date.now() - new Date(exam.startDate)) / 
                          (new Date(exam.endDate) - new Date(exam.startDate))) * 100
                        )}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.round(
                          ((Date.now() - new Date(exam.startDate)) / 
                          (new Date(exam.endDate) - new Date(exam.startDate))) * 100
                        )}%`,
                        height: '100%',
                        backgroundColor: '#10b981',
                        transition: 'width 1s linear'
                      }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#dcfce7', borderRadius: '3px' }} />
            <span style={{ fontSize: '13px', color: '#64748b' }}>Aktif Sınavlar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#dbeafe', borderRadius: '3px' }} />
            <span style={{ fontSize: '13px', color: '#64748b' }}>Zamanlanmış</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
            <span style={{ fontSize: '13px', color: '#64748b' }}>Sona Ermiş</span>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Scheduler;
