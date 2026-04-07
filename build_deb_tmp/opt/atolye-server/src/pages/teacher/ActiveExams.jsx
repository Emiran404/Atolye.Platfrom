import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Users,
  Eye,
  Edit,
  StopCircle,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Play,
  Timer,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { TeacherLayout } from '../../components/layouts';
import { useExamStore } from '../../store/examStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useAuthStore } from '../../store/authStore';
import { formatDateTime, getRelativeTime } from '../../utils/dateHelpers';

const styles = {
  container: {
    padding: '32px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px'
  },
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#0d9488',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: 'none'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b'
  },
  searchRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px'
  },
  searchInput: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: 'transparent'
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#64748b',
    cursor: 'pointer'
  },
  examList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  examCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: 'none',
    transition: 'all 0.2s'
  },
  examHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  examTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px'
  },
  examDesc: {
    fontSize: '14px',
    color: '#64748b'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  examMeta: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b'
  },
  progressSection: {
    marginBottom: '16px'
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px'
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s'
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    backgroundColor: '#fff',
    borderRadius: '16px'
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    border: '1px solid #e2e8f0'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '12px'
  },
  modalText: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  }
};

const ActiveExams = () => {
  const navigate = useNavigate();
  const { loadExams, getActiveExams, getUpcomingExams, deleteExam, endExam, extendExamTime } = useExamStore();
  const { getExamSubmissions, loadSubmissions } = useSubmissionStore();
  const { getAllStudents, loadStudents } = useAuthStore();

  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, upcoming
  const [selectedExam, setSelectedExam] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    totalSubmissions: 0
  });

  useEffect(() => {
    loadData();

    // Otomatik yenileme - Her 10 saniyede bir
    const refreshInterval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, []);

  const loadData = async () => {
    await loadStudents(); // Öğrencileri yükle
    await loadSubmissions(); // Gönderimleri yükle
    const loadedExams = await loadExams();

    // Aktif ve yaklaşan sınavları filtrele
    const now = new Date();
    const active = (loadedExams || []).filter(exam => {
      const start = new Date(exam.startDate);
      const end = new Date(exam.endDate);
      return start <= now && end >= now && (exam.status === 'active' || exam.isActive);
    });

    const upcoming = (loadedExams || []).filter(exam => {
      const start = new Date(exam.startDate);
      return start > now && (exam.status === 'active' || exam.isActive);
    });

    const allExams = [...active, ...upcoming];

    // Öğrenci-sınav bazında grupla (aynı öğrenci için birden fazla dosya varsa 1 gönderim say)
    const getUniqueSubmissionCount = (submissions) => {
      const uniqueStudents = new Set(submissions.map(s => s.studentId));
      return uniqueStudents.size;
    };

    let totalSubmissions = 0;
    allExams.forEach(exam => {
      const submissions = getExamSubmissions(exam.id);
      exam.submissionCount = getUniqueSubmissionCount(submissions);
      totalSubmissions += exam.submissionCount;
    });

    setExams(allExams);
    setStats({
      total: allExams.length,
      active: active.length,
      upcoming: upcoming.length,
      totalSubmissions
    });
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.startDate);
    const end = new Date(exam.endDate);

    if (start > now) {
      return { label: 'Yaklaşan', color: '#f59e0b', bgColor: '#fffbeb' };
    } else if (end < now || exam.status === 'completed') {
      return { label: 'Tamamlandı', color: '#10b981', bgColor: '#ecfdf5' };
    } else {
      return { label: 'Aktif', color: '#3b82f6', bgColor: '#eff6ff' };
    }
  };

  const getTimeRemaining = (exam) => {
    const now = new Date();
    const end = new Date(exam.endDate);
    const start = new Date(exam.startDate);

    if (start > now) {
      const diff = start - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}s ${minutes}dk sonra başlayacak`;
    }

    if (end < now) return 'Sona erdi';

    const diff = end - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} gün kaldı`;
    }

    return `${hours}s ${minutes}dk kaldı`;
  };

  const getSubmissionProgress = (exam) => {
    const students = getAllStudents();
    let targetCount = students.length;

    // targetClasses varsa sınıf bazlı sınav
    if (exam.targetClasses && exam.targetClasses.length > 0) {
      targetCount = students.filter(s => exam.targetClasses.includes(s.className)).length;
    }
    // targetStudents varsa özel seçim
    else if (exam.targetStudents && exam.targetStudents.length > 0) {
      targetCount = exam.targetStudents.length;
    }
    // targetType kontrolü (eski format)
    else if (exam.targetType === 'class') {
      targetCount = students.filter(s => exam.targetClasses?.includes(s.className)).length;
    } else if (exam.targetType === 'custom') {
      targetCount = exam.targetStudents?.length || 0;
    }

    const submitted = exam.submissionCount || 0;

    // Eğer hedef öğrenci sayısı 0 ise, gerçekte gönderim yapan öğrenci sayısını göster
    if (targetCount === 0 && submitted > 0) {
      targetCount = submitted;
    }

    const percentage = targetCount > 0 ? Math.round((submitted / targetCount) * 100) : 0;

    return { submitted, total: targetCount, percentage };
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'active') {
      const status = getExamStatus(exam);
      return matchesSearch && status.label === 'Aktif';
    }
    if (filter === 'upcoming') {
      const status = getExamStatus(exam);
      return matchesSearch && status.label === 'Yaklaşan';
    }
    return matchesSearch;
  });

  const handleDeleteExam = async () => {
    if (selectedExam) {
      await deleteExam(selectedExam.id);
      setShowDeleteModal(false);
      setSelectedExam(null);
      await loadData();
    }
  };

  const handleEndExam = async () => {
    if (selectedExam) {
      await endExam(selectedExam.id);
      setShowEndModal(false);
      setSelectedExam(null);
      await loadData();
    }
  };

  const handleExtendTime = async (examId, minutes) => {
    await extendExamTime(examId, minutes);
    await loadData();
  };

  return (
    <TeacherLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Aktif Sınavlar</h1>
            <p style={styles.subtitle}>Devam eden ve yaklaşan sınavları yönetin</p>
          </div>
          <button
            style={styles.createBtn}
            onClick={() => navigate('/ogretmen/sinav-olustur')}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            <Plus size={20} />
            Yeni Sınav Oluştur
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: '#eff6ff' }}>
              <FileText size={24} color="#3b82f6" />
            </div>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Toplam Sınav</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: '#ecfdf5' }}>
              <Play size={24} color="#10b981" />
            </div>
            <div style={styles.statValue}>{stats.active}</div>
            <div style={styles.statLabel}>Aktif Sınav</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: '#fffbeb' }}>
              <Clock size={24} color="#f59e0b" />
            </div>
            <div style={styles.statValue}>{stats.upcoming}</div>
            <div style={styles.statLabel}>Yaklaşan Sınav</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: '#f3e8ff' }}>
              <CheckCircle size={24} color="#8b5cf6" />
            </div>
            <div style={styles.statValue}>{stats.totalSubmissions}</div>
            <div style={styles.statLabel}>Toplam Teslim</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div style={styles.searchRow}>
          <div style={styles.searchInput}>
            <Search size={20} color="#94a3b8" />
            <input
              type="text"
              placeholder="Sınav ara..."
              style={styles.input}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === 'all' ? '#3b82f6' : '#fff',
              color: filter === 'all' ? '#fff' : '#64748b'
            }}
            onClick={() => setFilter('all')}
          >
            Tümü
          </button>
          <button
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === 'active' ? '#10b981' : '#fff',
              color: filter === 'active' ? '#fff' : '#64748b'
            }}
            onClick={() => setFilter('active')}
          >
            <Play size={16} />
            Aktif
          </button>
          <button
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === 'upcoming' ? '#f59e0b' : '#fff',
              color: filter === 'upcoming' ? '#fff' : '#64748b'
            }}
            onClick={() => setFilter('upcoming')}
          >
            <Clock size={16} />
            Yaklaşan
          </button>
        </div>

        {/* Exam List */}
        {filteredExams.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <FileText size={40} color="#94a3b8" />
            </div>
            <h3 style={styles.emptyTitle}>Henüz sınav yok</h3>
            <p style={styles.emptyText}>
              {searchTerm ? 'Arama kriterlerine uygun sınav bulunamadı.' : 'Yeni bir sınav oluşturarak başlayın.'}
            </p>
            {!searchTerm && (
              <button
                style={styles.createBtn}
                onClick={() => navigate('/ogretmen/sinav-olustur')}
              >
                <Plus size={20} />
                Sınav Oluştur
              </button>
            )}
          </div>
        ) : (
          <div style={styles.examList}>
            {filteredExams.map(exam => {
              const status = getExamStatus(exam);
              const progress = getSubmissionProgress(exam);
              const timeInfo = getTimeRemaining(exam);

              return (
                <div
                  key={exam.id}
                  style={styles.examCard}
                  onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
                >
                  <div style={styles.examHeader}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ ...styles.examTitle, margin: 0 }}>{exam.title}</h3>
                        {exam.isQuiz && (
                          <span style={{
                            fontSize: '10px',
                            backgroundColor: '#f0fdfa',
                            color: '#0d9488',
                            padding: '2px 8px',
                            border: '1px solid #0d9488',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}>
                            Çoktan Seçmeli
                          </span>
                        )}
                      </div>
                      <p style={styles.examDesc}>{exam.description || 'Açıklama yok'}</p>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: status.bgColor,
                      color: status.color
                    }}>
                      {status.label === 'Aktif' && <Play size={12} />}
                      {status.label === 'Yaklaşan' && <Clock size={12} />}
                      {status.label === 'Tamamlandı' && <CheckCircle size={12} />}
                      {status.label}
                    </span>
                  </div>

                  <div style={styles.examMeta}>
                    <div style={styles.metaItem}>
                      <Calendar size={16} />
                      <span>Başlangıç: {formatDateTime(exam.startDate)}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <Calendar size={16} />
                      <span>Bitiş: {formatDateTime(exam.endDate)}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <Timer size={16} />
                      <span style={{ color: status.color, fontWeight: '500' }}>{timeInfo}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <Users size={16} />
                      <span>{progress.total} öğrenci</span>
                    </div>
                  </div>

                  <div style={styles.progressSection}>
                    <div style={styles.progressLabel}>
                      <span>Teslim Durumu</span>
                      <span>{progress.submitted} / {progress.total} (%{progress.percentage})</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${progress.percentage}%`,
                          backgroundColor: progress.percentage >= 80 ? '#10b981' :
                            progress.percentage >= 50 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>

                  <div style={styles.actionRow}>
                    <button
                      style={{
                        ...styles.actionBtn,
                        backgroundColor: '#eff6ff',
                        color: '#3b82f6'
                      }}
                      onClick={() => navigate(`/ogretmen/degerlendirme?exam=${exam.id}`)}
                    >
                      <Eye size={16} />
                      Teslimleri Gör
                    </button>
                    <button
                      style={{
                        ...styles.actionBtn,
                        backgroundColor: '#f1f5f9',
                        color: '#64748b'
                      }}
                      onClick={() => navigate(`/ogretmen/sinav-duzenle/${exam.id}`)}
                    >
                      <Edit size={16} />
                      Düzenle
                    </button>
                    {status.label === 'Aktif' && (
                      <>
                        <button
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: '#fffbeb',
                            color: '#f59e0b'
                          }}
                          onClick={() => handleExtendTime(exam.id, 30)}
                        >
                          <Timer size={16} />
                          +30 dk
                        </button>
                        <button
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: '#fef2f2',
                            color: '#ef4444'
                          }}
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowEndModal(true);
                          }}
                        >
                          <StopCircle size={16} />
                          Bitir
                        </button>
                      </>
                    )}
                    <button
                      style={{
                        ...styles.actionBtn,
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        marginLeft: 'auto'
                      }}
                      onClick={() => {
                        setSelectedExam(exam);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Sınavı Sil</h3>
              <p style={styles.modalText}>
                "{selectedExam?.title}" sınavını silmek istediğinize emin misiniz?
                Bu işlem geri alınamaz ve tüm teslimler silinecektir.
              </p>
              <div style={styles.modalActions}>
                <button
                  style={{
                    ...styles.actionBtn,
                    backgroundColor: '#f1f5f9',
                    color: '#64748b'
                  }}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedExam(null);
                  }}
                >
                  İptal
                </button>
                <button
                  style={{
                    ...styles.actionBtn,
                    backgroundColor: '#ef4444',
                    color: '#fff'
                  }}
                  onClick={handleDeleteExam}
                >
                  <Trash2 size={16} />
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* End Exam Modal */}
        {showEndModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Sınavı Bitir</h3>
              <p style={styles.modalText}>
                "{selectedExam?.title}" sınavını şimdi bitirmek istediğinize emin misiniz?
                Öğrenciler artık teslim yapamayacak.
              </p>
              <div style={styles.modalActions}>
                <button
                  style={{
                    ...styles.actionBtn,
                    backgroundColor: '#f1f5f9',
                    color: '#64748b'
                  }}
                  onClick={() => {
                    setShowEndModal(false);
                    setSelectedExam(null);
                  }}
                >
                  İptal
                </button>
                <button
                  style={{
                    ...styles.actionBtn,
                    backgroundColor: '#ef4444',
                    color: '#fff'
                  }}
                  onClick={handleEndExam}
                >
                  <StopCircle size={16} />
                  Bitir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default ActiveExams;
