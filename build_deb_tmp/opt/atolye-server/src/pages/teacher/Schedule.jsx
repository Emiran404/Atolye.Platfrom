import { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/layouts';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { Calendar, Plus, Edit, Trash2, Clock, BookOpen } from 'lucide-react';
import { CLASS_LIST } from '../../store/authStore';
import { scheduleApi } from '../../services/api';

const Schedule = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [selectedClass, setSelectedClass] = useState('9-A');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Tamam',
    onConfirm: () => {},
    type: 'warning'
  });
  
  const [formData, setFormData] = useState({
    className: '9-A',
    day: 'Pazartesi',
    period: '1',
    subject: '',
    teacher: '',
    room: ''
  });
  
  // Toplu ekleme için
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkPeriods, setBulkPeriods] = useState({
    start: '1',
    end: '1'
  });

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
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await scheduleApi.getAll();
      setSchedules(response.schedules || []);
    } catch (error) {
      console.error('Ders programı yüklenemedi:', error);
      toast.error('Ders programı yüklenemedi');
    }
  };

  const saveSchedules = async (newSchedules) => {
    // Bu fonksiyon artık kullanılmayacak, her işlem ayrı API çağrısı yapacak
    setSchedules(newSchedules);
  };

  const handleSubmit = async () => {
    if (!formData.subject || !formData.teacher) {
      toast.error('Ders adı ve öğretmen gerekli');
      return;
    }

    console.log('Submit başladı:', { bulkMode, editingSchedule, formData, bulkPeriods });

    try {
      if (bulkMode && !editingSchedule) {
        // Toplu ekleme modu
        console.log('Toplu ekleme modu aktif');
        const startPeriod = parseInt(bulkPeriods.start);
        const endPeriod = parseInt(bulkPeriods.end);
        
        console.log('Saat aralığı:', startPeriod, '-', endPeriod);
        
        if (startPeriod > endPeriod) {
          toast.error('Başlangıç saati bitiş saatinden küçük olmalı');
          return;
        }
        
        const newSchedules = [];
        for (let p = startPeriod; p <= endPeriod; p++) {
          // Aynı slot'ta ders var mı kontrol et
          const existing = schedules.find(s => 
            s.className === formData.className && 
            s.day === formData.day && 
            s.period === p.toString()
          );
          
          console.log(`${p}. saat kontrolü:`, existing ? 'Dolu' : 'Boş');
          
          if (!existing) {
            newSchedules.push({
              className: formData.className,
              day: formData.day,
              period: p.toString(),
              subject: formData.subject,
              teacher: formData.teacher,
              room: formData.room
            });
          }
        }
        
        console.log('Eklenecek dersler:', newSchedules);
        
        if (newSchedules.length === 0) {
          toast.error('Tüm saatler dolu, yeni ders eklenemedi');
          return;
        }
        
        await scheduleApi.createBulk(newSchedules);
        toast.success(`${newSchedules.length} ders eklendi (${bulkPeriods.start}. - ${bulkPeriods.end}. saat)`);
        await loadSchedules();
      } else if (editingSchedule) {
        // Güncelleme modu
        await scheduleApi.update(editingSchedule.id, formData);
        toast.success('Ders güncellendi');
        await loadSchedules();
      } else {
        // Tek ekleme modu
        console.log('Tek ekleme modu');
        
        // Aynı slot'ta ders var mı kontrol et
        const existing = schedules.find(s => 
          s.className === formData.className && 
          s.day === formData.day && 
          s.period === formData.period
        );
        
        if (existing) {
          toast.error('Bu saatte zaten bir ders var');
          return;
        }
        
        await scheduleApi.create(formData);
        toast.success('Ders eklendi');
        await loadSchedules();
      }

      handleCloseModal();
    } catch (error) {
      console.error('Ders kaydetme hatası:', error);
      toast.error('Ders kaydedilemedi: ' + error.message);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Dersi Sil',
      message: 'Bu dersi silmek istediğinize emin misiniz?',
      confirmText: 'Sil',
      type: 'danger',
      onConfirm: async () => {
        try {
          await scheduleApi.delete(id);
          toast.success('Ders silindi');
          await loadSchedules();
        } catch (error) {
          console.error('Ders silme hatası:', error);
          toast.error('Ders silinemedi');
        }
      }
    });
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData(schedule);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
    setBulkMode(false);
    setBulkPeriods({ start: '1', end: '1' });
    setFormData({
      className: selectedClass,
      day: 'Pazartesi',
      period: '1',
      subject: '',
      teacher: '',
      room: ''
    });
  };

  const getScheduleForClass = (className) => {
    return schedules.filter(s => s.className === className);
  };

  const getLesson = (day, period) => {
    return schedules.find(s => 
      s.className === selectedClass && 
      s.day === day && 
      s.period === period
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
    controls: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
    select: {
      padding: '10px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
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
      padding: '14px 12px',
      textAlign: 'center',
      fontSize: '13px',
      fontWeight: '700',
      color: '#475569',
      border: '1px solid #e2e8f0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    td: {
      padding: '12px',
      border: '1px solid #e2e8f0',
      textAlign: 'center',
      minHeight: '80px',
      verticalAlign: 'top'
    },
    lessonCard: {
      backgroundColor: '#eff6ff',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #bfdbfe',
      position: 'relative'
    },
    lessonSubject: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e40af',
      marginBottom: '6px'
    },
    lessonTeacher: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px'
    },
    lessonRoom: {
      fontSize: '11px',
      color: '#94a3b8',
      fontWeight: '500'
    },
    actions: {
      display: 'flex',
      gap: '4px',
      marginTop: '8px',
      justifyContent: 'center'
    },
    emptySlot: {
      color: '#cbd5e1',
      fontSize: '13px',
      fontStyle: 'italic',
      padding: '20px'
    },
    timeSlot: {
      fontSize: '11px',
      color: '#94a3b8',
      fontWeight: '500',
      marginBottom: '4px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '6px'
    }
  };

  return (
    <TeacherLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Ders Programı</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              Haftalık ders programını düzenleyin
            </p>
          </div>
          <div style={styles.controls}>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              style={styles.select}
            >
              {CLASS_LIST.map(cls => (
                <option key={cls} value={cls}>{cls} Sınıfı</option>
              ))}
            </select>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={18} style={{ marginRight: '8px' }} />
              Ders Ekle
            </Button>
          </div>
        </div>

        {/* Schedule Table */}
        <div style={styles.card}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, minWidth: '100px' }}>Saat</th>
                  {days.map(day => (
                    <th key={day} style={{ ...styles.th, minWidth: '140px' }}>
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
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
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
                              <div style={styles.actions}>
                                <button
                                  onClick={() => handleEdit(lesson)}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete(lesson.id)}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={styles.emptySlot}>Boş</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingSchedule ? 'Ders Düzenle' : 'Yeni Ders Ekle'}
        >
          <div>
            <label style={styles.label}>Sınıf</label>
            <select
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              style={styles.input}
            >
              {CLASS_LIST.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <label style={styles.label}>Gün</label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              style={styles.input}
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>

            {!editingSchedule && (
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}>
                  <input
                    type="checkbox"
                    checked={bulkMode}
                    onChange={(e) => setBulkMode(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                    🎯 Toplu Ekleme (Birden fazla saate aynı dersi ekle)
                  </span>
                </label>

                {bulkMode && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ ...styles.label, marginBottom: '6px' }}>Başlangıç Saati</label>
                      <select
                        value={bulkPeriods.start}
                        onChange={(e) => setBulkPeriods({ ...bulkPeriods, start: e.target.value })}
                        style={styles.input}
                      >
                        {periods.map(period => (
                          <option key={period} value={period}>
                            {period}. Ders
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ ...styles.label, marginBottom: '6px' }}>Bitiş Saati</label>
                      <select
                        value={bulkPeriods.end}
                        onChange={(e) => setBulkPeriods({ ...bulkPeriods, end: e.target.value })}
                        style={styles.input}
                      >
                        {periods.map(period => (
                          <option key={period} value={period}>
                            {period}. Ders
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!bulkMode && (
              <>
                <label style={styles.label}>Ders Saati</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  style={styles.input}
                >
                  {periods.map(period => (
                    <option key={period} value={period}>
                      {period}. Ders ({timeSlots[period]})
                    </option>
                  ))}
                </select>
              </>
            )}

            <label style={styles.label}>Ders Adı *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Örn: Matematik"
              style={styles.input}
            />

            <label style={styles.label}>Öğretmen *</label>
            <input
              type="text"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              placeholder="Örn: Ali Yılmaz"
              style={styles.input}
            />

            <label style={styles.label}>Derslik</label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="Örn: A101"
              style={styles.input}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={handleCloseModal}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>
                {editingSchedule ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          {...confirmModal}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </TeacherLayout>
  );
};

export default Schedule;
