import { useState, useEffect } from 'react';
import { StudentLayout } from '../../components/layouts';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { scheduleApi } from '../../services/api';

const Schedule = () => {
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState([]);

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const periods = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const timeSlots = {
    '1': '08:30 - 09:15',
    '2': '09:20 - 10:05',
    '3': '10:10 - 10:55',
    '4': '11:00 - 11:45',
    '5': '12:30 - 13:15',
    '6': '13:20 - 14:05',
    '7': '14:10 - 14:55',
    '8': '15:00 - 15:45'
  };

  useEffect(() => {
    loadSchedules();
  }, [user?.className]); // user.className değiştiğinde yeniden yükle

  useEffect(() => {
    // Her 5 saniyede bir otomatik yenileme
    const interval = setInterval(() => {
      loadSchedules();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.className]);

  const loadSchedules = async () => {
    if (!user?.className) {
      console.log('Kullanıcı sınıfı bulunamadı');
      return;
    }

    try {
      console.log('Ders programı yükleniyor, sınıf:', user.className);
      const response = await scheduleApi.getByClass(user.className);
      console.log('API yanıtı:', response);
      setSchedules(response.schedules || []);
    } catch (error) {
      console.error('Ders programı yüklenemedi:', error);
    }
  };

  const getLesson = (day, period) => {
    return schedules.find(s => s.day === day && s.period === period);
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '24px' },
    header: { textAlign: 'center', marginBottom: '8px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
    subtitle: { fontSize: '16px', color: '#64748b' },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    th: {
      backgroundColor: '#f8fafc',
      padding: '16px 12px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '700',
      color: '#475569',
      border: '1px solid #e2e8f0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    td: {
      padding: '16px 12px',
      border: '1px solid #e2e8f0',
      textAlign: 'center',
      minHeight: '100px',
      verticalAlign: 'middle'
    },
    lessonCard: {
      backgroundColor: '#eff6ff',
      padding: '16px',
      borderRadius: '10px',
      border: '2px solid #bfdbfe'
    },
    lessonSubject: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#1e40af',
      marginBottom: '8px'
    },
    lessonTeacher: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '4px'
    },
    lessonRoom: {
      fontSize: '12px',
      color: '#94a3b8',
      fontWeight: '600'
    },
    emptySlot: {
      color: '#cbd5e1',
      fontSize: '14px',
      fontStyle: 'italic',
      padding: '30px'
    },
    timeSlot: {
      fontSize: '12px',
      color: '#94a3b8',
      fontWeight: '600',
      marginBottom: '6px'
    }
  };

  return (
    <StudentLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📅 Ders Programım</h1>
          <p style={styles.subtitle}>
            {user?.className} Sınıfı - Haftalık Ders Programı
          </p>
        </div>

        {/* Schedule Table */}
        <div style={styles.card}>
          {schedules.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '60px 40px'
            }}>
              <Calendar size={64} color="#cbd5e1" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
                Henüz ders programı yok
              </h3>
              <p style={{ color: '#94a3b8' }}>
                Öğretmeniniz tarafından ders programı eklendiğinde burada görünecek
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, minWidth: '110px' }}>Saat</th>
                    {days.map(day => (
                      <th key={day} style={{ ...styles.th, minWidth: '160px' }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map(period => (
                    <tr key={period}>
                      <td style={styles.td}>
                        <div style={styles.timeSlot}>{period}. Ders</div>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                          {timeSlots[period]}
                        </div>
                      </td>
                      {days.map(day => {
                        const lesson = getLesson(day, period);
                        return (
                          <td key={`${day}-${period}`} style={styles.td}>
                            {lesson ? (
                              <div style={styles.lessonCard}>
                                <div style={styles.lessonSubject}>
                                  📚 {lesson.subject}
                                </div>
                                <div style={styles.lessonTeacher}>
                                  👤 {lesson.teacher}
                                </div>
                                {lesson.room && (
                                  <div style={styles.lessonRoom}>
                                    📍 {lesson.room}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={styles.emptySlot}>-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #bfdbfe'
        }}>
          <p style={{ fontSize: '14px', color: '#1e40af', textAlign: 'center' }}>
            💡 Ders saatlerinde değişiklik olduğunda öğretmeninizden bilgi alınız
          </p>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Schedule;
