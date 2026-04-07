import React, { useEffect, useState } from 'react';
import { FolderOpen, Search, Filter, Download, Eye, ChevronDown, FileText, CheckCircle, Clock, XCircle, Edit3, Send, X, AlertCircle, Home, ArrowRight } from 'lucide-react';
import StudentSidebar from '../../components/layout/StudentSidebar';
import { useAuthStore } from '../../store/authStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useExamStore } from '../../store/examStore';
import { formatDateTime, formatDate } from '../../utils/dateHelpers';
import { formatFileSize } from '../../utils/fileHelpers';
import { t } from '../../utils/i18n';

const Submissions = () => {
  const { user } = useAuthStore();
  const { loadSubmissions, getStudentSubmissions, requestEditPermission } = useSubmissionStore();
  const { loadExams, exams } = useExamStore();

  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Modals
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [requestSending, setRequestSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadExams();
      await loadSubmissions();

      const subs = getStudentSubmissions(user?.id);
      // edit_granted durumundaki gönderimleri filtrele (düzenleme izni verilmiş)
      const activeSubs = subs.filter(sub => sub.status !== 'edit_granted');

      // Sınavlara göre grupla
      const groupedByExam = {};
      activeSubs.forEach(sub => {
        const exam = exams.find(e => e.id === sub.examId);

        if (!groupedByExam[sub.examId]) {
          groupedByExam[sub.examId] = {
            examId: sub.examId,
            exam: exam,
            files: [],
            lastSubmittedAt: sub.submittedAt,
            isLocked: sub.isLocked,
            grade: sub.grade,
            feedback: sub.feedback,
            gradedAt: sub.gradedAt,
            isQuiz: exam?.isQuiz || sub.type === 'quiz',
            score: sub.score,
            earnedPoints: sub.earnedPoints,
            totalPoints: sub.totalPoints,
            answers: sub.answers
          };
        }

        if (!exam?.isQuiz && sub.type !== 'quiz') {
          groupedByExam[sub.examId].files.push(sub);
        } else {
          // Quiz durumunda dosya yerine sanal bir dosya objesi ekleyelim ki UI döngüleri çalışsın
          // Ya da doğrudan quiz bilgisini saklayalım
          if (groupedByExam[sub.examId].files.length === 0) {
            groupedByExam[sub.examId].files.push({
              ...sub,
              fileName: 'Quiz Sonucu',
              fileSize: 0,
              isQuiz: true
            });
          }
        }

        // En son gönderim tarihini tut
        if (new Date(sub.submittedAt) > new Date(groupedByExam[sub.examId].lastSubmittedAt)) {
          groupedByExam[sub.examId].lastSubmittedAt = sub.submittedAt;
        }
      });

      const enrichedSubs = Object.values(groupedByExam).sort((a, b) => 
        new Date(b.lastSubmittedAt) - new Date(a.lastSubmittedAt)
      );
      setSubmissions(enrichedSubs);
      setFilteredSubmissions(enrichedSubs);
      setLoading(false);
    };

    fetchData();

    // Otomatik yenileme - Her 10 saniyede bir
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, [user, exams.length]);

  useEffect(() => {
    let filtered = submissions;

    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.files?.some(f => f.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => {
        if (statusFilter === 'graded') return sub.grade !== null && sub.grade !== undefined;
        if (statusFilter === 'pending') return sub.grade === null || sub.grade === undefined;
        if (statusFilter === 'locked') return sub.isLocked;
        return true;
      });
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, statusFilter, submissions]);

  const getStatusBadge = (submission) => {
    if (submission.grade === 'K' || submission.grade === 'G') {
      return { text: submission.grade === 'K' ? 'Kopya (İptal)' : 'Girmedi', color: '#ef4444', bg: '#fef2f2', icon: XCircle };
    }
    if (submission.grade !== null && submission.grade !== undefined) {
      return { text: 'Notlandırıldı', color: '#10b981', bg: '#ecfdf5', icon: CheckCircle };
    }
    if (submission.isLocked) {
      return { text: 'Kilitli', color: '#3b82f6', bg: '#eff6ff', icon: Clock };
    }
    return { text: 'Düzenlenebilir', color: '#f59e0b', bg: '#fffbeb', icon: Edit3 };
  };

  const getEditRequestStatus = (submission) => {
    if (!submission.editRequests || submission.editRequests.length === 0) return null;
    const lastRequest = submission.editRequests[submission.editRequests.length - 1];
    return lastRequest;
  };

  const handleDownload = (submission) => {
    if (submission.filePath) {
      const link = document.createElement('a');
      link.href = submission.filePath;
      link.download = submission.fileName;
      link.click();
    }
  };

  const handlePreview = (submission) => {
    setSelectedSubmission(submission);
    setShowPreviewModal(true);
  };

  const handleEditRequest = async () => {
    if (!editReason.trim() || !selectedSubmission) return;

    setRequestSending(true);
    try {
      await requestEditPermission(selectedSubmission.id, editReason);
      alert('Düzenleme talebiniz öğretmene iletildi!');
      setShowEditRequestModal(false);
      setEditReason('');

      // Verileri yenile
      await loadSubmissions();
      const subs = getStudentSubmissions(user?.id);
      const enrichedSubs = subs.map(sub => ({
        ...sub,
        exam: exams.find(e => e.id === sub.examId)
      }));
      setSubmissions(enrichedSubs);
    } catch (error) {
      alert('Talep gönderilemedi: ' + error.message);
    }
    setRequestSending(false);
  };

  const getFileUrl = (submission) => {
    if (submission.filePath) {
      return submission.filePath;
    }
    return null;
  };

  const canRequestEdit = (submission) => {
    // Sınav bitmiş mi kontrol et
    if (!submission.exam?.endDate) return false;
    const examEnd = new Date(submission.exam.endDate);
    const now = new Date();
    return now < examEnd; // Sınav henüz bitmemişse talep gönderilebilir
  };

  const canPreview = (submission) => {
    if (submission.isQuiz) return false;
    const ext = submission.fileName?.split('.').pop()?.toLowerCase();
    return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
  };

  const styles = {
    container: { maxWidth: '1400px', margin: '0 auto' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
    subtitle: { fontSize: '14px', color: '#64748b' },
    badge: { padding: '6px 12px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },

    // Layout
    layout: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', marginTop: '24px' },

    // Sidebar (Exam List)
    sidebar: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 200px)',
      overflowY: 'auto'
    },
    sidebarTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', paddingLeft: '12px' },
    examItem: (isSelected) => ({
      padding: '16px',
      borderRadius: '14px',
      marginBottom: '10px',
      cursor: 'pointer',
      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
      border: isSelected ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isSelected ? '0 4px 12px rgba(36, 99, 235, 0.1)' : 'none'
    }),
    examItemTitle: { fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' },
    examItemMeta: { fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' },
    examItemBadge: { fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '500' },

    // File Manager Area
    fileManager: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0',
      minHeight: '600px'
    },
    fileManagerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e2e8f0'
    },
    fileManagerTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b' },
    viewToggle: { display: 'flex', gap: '8px' },
    viewBtn: (isActive) => ({
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: isActive ? '#3b82f6' : '#fff',
      color: isActive ? '#fff' : '#64748b',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.2s'
    }),

    // File Grid
    fileGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '24px'
    },
    fileCard: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    },
    fileIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      backgroundColor: '#eff6ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '12px',
      color: '#3b82f6'
    },
    fileCardName: { fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '4px', wordBreak: 'break-word' },
    fileCardSize: { fontSize: '12px', color: '#64748b', marginBottom: '12px' },
    fileCardActions: { display: 'flex', gap: '6px', marginTop: '12px' },
    fileActionBtn: {
      padding: '6px 10px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#fff',
      fontSize: '12px',
      color: '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s'
    },

    // Empty State
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '80px 20px',
      minHeight: '400px'
    },
    emptyIcon: { marginBottom: '16px', color: '#cbd5e1' },
    emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
    emptyText: { fontSize: '14px', color: '#64748b' },

    // Modal styles
    modal: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    modalTitle: { fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    modalSection: { marginBottom: '20px' },
    modalLabel: { fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '8px' },
    modalBox: { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px' },
    modalRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
    modalRowLabel: { color: '#64748b', fontSize: '14px' },
    modalRowValue: { color: '#1e293b', fontSize: '14px', fontWeight: '500' },

    // Preview Modal
    previewModal: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    previewContainer: {
      width: '90%',
      height: '90%',
      maxWidth: '1200px',
      backgroundColor: '#1e293b',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    previewHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #334155'
    },
    previewTitle: {
      color: '#fff',
      fontSize: '16px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    previewActions: {
      display: 'flex',
      gap: '12px'
    },
    previewBtn: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    previewContent: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'auto'
    },

    // Edit Request Modal
    editRequestBtn: {
      padding: '8px 12px',
      backgroundColor: '#fef3c7',
      border: '1px solid #fcd34d',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#92400e',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },
    textarea: {
      width: '100%',
      height: '120px',
      padding: '12px',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      resize: 'none',
      boxSizing: 'border-box'
    }
  };

  if (loading) {
    return (
      <>
        <StudentSidebar />
        <div style={{ marginLeft: '288px', minHeight: '100vh', background: '#f6f6f8' }}>
          <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
            <p style={{ color: '#64748b' }}>Yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <StudentSidebar />

      {/* Main Content */}
      <div style={{
        marginLeft: '288px',
        minHeight: '100vh',
        background: '#f6f6f8'
      }}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #f0f1f4',
          padding: '20px 48px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          {/* Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#94a3b8',
            marginBottom: '16px'
          }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#2463eb'}
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
              {t('home')}
            </span>
            <ArrowRight size={14} />
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#2463eb'}
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
              {t('dashboard')}
            </span>
            <ArrowRight size={14} />
            <span style={{ color: '#2463eb', fontWeight: '500' }}>{t('submissions')}</span>
          </div>

          {/* User info */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '4px'
              }}>
                {t('submissions')}
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                {user?.studentNumber} • {user?.fullName || user?.name || t('student')}
              </p>
            </div>

            {/* User Avatar */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              {(user?.fullName || user?.name)?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '48px' }}>
          <div style={styles.container}>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>{t('mySubmissions')}</h1>
                <p style={styles.subtitle}>{t('viewAndManageFiles')}</p>
              </div>
              <span style={styles.badge}>{submissions.length} {t('exam')}</span>
            </div>

            {/* Layout: Sidebar + File Manager */}
            <div style={styles.layout}>
              {/* Sol: Sınav Listesi */}
              <div style={styles.sidebar}>
                <h3 style={styles.sidebarTitle}>{t('exams')}</h3>
                {submissions.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '40px 20px'
                  }}>
                    <FolderOpen size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                    <p style={{ fontSize: '13px', color: '#64748b' }}>{t('noSubmissionsYet')}</p>
                  </div>
                ) : (
                  submissions.map((submission) => {
                    const status = getStatusBadge(submission);
                    return (
                      <div
                        key={submission.examId}
                        style={styles.examItem(selectedExam?.examId === submission.examId)}
                        onClick={() => setSelectedExam(submission)}
                        onMouseEnter={(e) => {
                          if (selectedExam?.examId !== submission.examId) {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedExam?.examId !== submission.examId) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={styles.examItemTitle}>
                          {submission.isQuiz ? '📝 ' : ''}
                          {submission.exam?.title || t('unknown')}
                        </div>
                        <div style={styles.examItemMeta}>
                          <span style={styles.examItemBadge}>
                            {submission.isQuiz ? `✅ ${t('completed')}` : `📁 ${submission.files?.length || 0} ${t('files')}`}
                          </span>
                          {(submission.grade !== null && submission.grade !== undefined) && (
                            <span style={{
                              ...styles.examItemBadge,
                              backgroundColor: (submission.grade === 'K' || submission.grade === 'G') ? '#fef2f2' : (submission.grade >= 70 ? '#dcfce7' : submission.grade >= 50 ? '#fef3c7' : '#fee2e2'),
                              color: (submission.grade === 'K' || submission.grade === 'G') ? '#dc2626' : (submission.grade >= 70 ? '#166534' : submission.grade >= 50 ? '#92400e' : '#991b1b')
                            }}>
                              ⭐ {submission.grade}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sağ: Dosya Yöneticisi */}
              <div style={styles.fileManager}>
                {!selectedExam ? (
                  <div style={styles.emptyState}>
                    <FileText size={64} style={styles.emptyIcon} />
                    <h3 style={styles.emptyTitle}>{t('selectExam')}</h3>
                    <p style={styles.emptyText}>{t('selectExamToView')}</p>
                  </div>
                ) : (
                  <>
                    {/* File Manager Header */}
                    <div style={styles.fileManagerHeader}>
                      <div>
                        <h2 style={styles.fileManagerTitle}>{selectedExam.exam?.title}</h2>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                          {formatDate(selectedExam.lastSubmittedAt)} • {selectedExam.isQuiz ? t('quiz') : `${selectedExam.files?.length || 0} ${t('files')}`}
                          {(selectedExam.grade !== null && selectedExam.grade !== undefined) && (
                            <span style={{
                              marginLeft: '12px',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              backgroundColor: (selectedExam.grade === 'K' || selectedExam.grade === 'G') ? '#fef2f2' : (selectedExam.grade >= 70 ? '#dcfce7' : selectedExam.grade >= 50 ? '#fef3c7' : '#fee2e2'),
                              color: (selectedExam.grade === 'K' || selectedExam.grade === 'G') ? '#dc2626' : (selectedExam.grade >= 70 ? '#166534' : selectedExam.grade >= 50 ? '#92400e' : '#991b1b'),
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {t('grade')}: {selectedExam.grade}
                            </span>
                          )}
                        </p>
                      </div>
                      <div style={styles.viewToggle}>
                        <button
                          style={styles.viewBtn(viewMode === 'grid')}
                          onClick={() => setViewMode('grid')}
                        >
                          {t('grid')}
                        </button>
                        <button
                          style={styles.viewBtn(viewMode === 'list')}
                          onClick={() => setViewMode('list')}
                        >
                          {t('list')}
                        </button>
                      </div>
                    </div>

                    {/* File Grid/List */}
                    {viewMode === 'grid' ? (
                      <div style={styles.fileGrid}>
                        {selectedExam.files?.map((file) => {
                          const fileExt = file.fileName?.split('.').pop()?.toLowerCase();
                          return (
                            <div
                              key={file.id}
                              style={styles.fileCard}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = '#3b82f6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                            >
                              <div style={styles.fileIcon}>
                                {file.isQuiz ? <CheckCircle size={24} color="#10b981" /> : <FileText size={24} />}
                              </div>
                              <div style={styles.fileCardName}>{file.fileName || (file.isQuiz ? t('quizResult') : t('file'))}</div>
                              <div style={styles.fileCardSize}>{file.isQuiz ? ((selectedExam.grade === null || selectedExam.grade === undefined) ? t('waitingForGrade') : `${selectedExam.earnedPoints || 0} / ${selectedExam.totalPoints || 100} ${t('score')}`) : formatFileSize(file.fileSize)}</div>
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
                                {formatDateTime(file.submittedAt)}
                              </div>
                              <div style={styles.fileCardActions}>
                                {file.isQuiz ? (
                                  <button
                                    style={{ ...styles.fileActionBtn, backgroundColor: '#2463eb', color: '#fff', border: 'none', width: '100%' }}
                                    onClick={() => {
                                      setSelectedSubmission({ ...file, ...selectedExam });
                                      setShowDetailModal(true);
                                    }}
                                  >
                                    <Eye size={14} /> {t('viewResults')}
                                  </button>
                                ) : (
                                  <>
                                    {canPreview(file) && (
                                      <button
                                        style={styles.fileActionBtn}
                                        onClick={() => handlePreview(file)}
                                      >
                                        <Eye size={14} /> Önizle
                                      </button>
                                    )}
                                    <button
                                      style={styles.fileActionBtn}
                                      onClick={() => handleDownload(file)}
                                    >
                                      <Download size={14} /> İndir
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ marginTop: '24px' }}>
                        {selectedExam.files?.map((file) => (
                          <div
                            key={file.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '16px',
                              backgroundColor: '#f8fafc',
                              borderRadius: '12px',
                              marginBottom: '12px',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: file.isQuiz ? '#f0fdf4' : '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: file.isQuiz ? '#10b981' : '#3b82f6'
                              }}>
                                {file.isQuiz ? <CheckCircle size={20} /> : <FileText size={20} />}
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                                  {file.fileName || (file.isQuiz ? t('quizResult') : t('file'))}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                  {file.isQuiz ? ((selectedExam.grade === null || selectedExam.grade === undefined) ? t('waitingForGrade') : `${selectedExam.earnedPoints || 0} / ${selectedExam.totalPoints || 100} ${t('score')}`) : formatFileSize(file.fileSize)} • {formatDateTime(file.submittedAt)}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {file.isQuiz ? (
                                <button
                                  style={{ ...styles.fileActionBtn, backgroundColor: '#2463eb', color: '#fff', border: 'none' }}
                                  onClick={() => {
                                    setSelectedSubmission({ ...file, ...selectedExam });
                                    setShowDetailModal(true);
                                  }}
                                >
                                  <Eye size={14} /> {t('viewResults')}
                                </button>
                              ) : (
                                <>
                                  {canPreview(file) && (
                                    <button
                                      style={styles.fileActionBtn}
                                      onClick={() => handlePreview(file)}
                                    >
                                      <Eye size={14} /> Önizle
                                    </button>
                                  )}
                                  <button
                                    style={styles.fileActionBtn}
                                    onClick={() => handleDownload(file)}
                                  >
                                    <Download size={14} /> İndir
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* Preview Modal */}
            {showPreviewModal && selectedSubmission && (
              <div style={styles.previewModal}>
                <div style={styles.previewContainer}>
                  <div style={styles.previewHeader}>
                    <div style={styles.previewTitle}>
                      <FileText size={20} />
                      {selectedSubmission.fileName}
                    </div>
                    <div style={styles.previewActions}>
                      <button
                        style={{ ...styles.previewBtn, backgroundColor: '#3b82f6', color: '#fff' }}
                        onClick={() => handleDownload(selectedSubmission)}
                      >
                        <Download size={16} /> İndir
                      </button>
                      <button
                        style={{ ...styles.previewBtn, backgroundColor: '#475569', color: '#fff' }}
                        onClick={() => setShowPreviewModal(false)}
                      >
                        <X size={16} /> Kapat
                      </button>
                    </div>
                  </div>
                  <div style={styles.previewContent}>
                    {selectedSubmission.fileName?.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={getFileUrl(selectedSubmission)}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                        title="PDF Preview"
                      />
                    ) : (
                      <img
                        src={getFileUrl(selectedSubmission)}
                        alt={selectedSubmission.fileName}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedSubmission && (
              <div style={styles.modal} onClick={() => setShowDetailModal(false)}>
                <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                  <div style={styles.modalTitle}>
                    <span>{t('submissionDetails') || 'Teslim Detayları'}</span>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={styles.modalSection}>
                    <p style={styles.modalLabel}>{t('examInfo') || 'Sınav Bilgileri'}</p>
                    <div style={styles.modalBox}>
                      <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{selectedSubmission.exam?.title}</p>
                      <p style={{ fontSize: '14px', color: '#64748b' }}>{selectedSubmission.exam?.department}</p>
                    </div>
                  </div>

                  <div style={styles.modalSection}>
                    <p style={styles.modalLabel}>{selectedSubmission.isQuiz ? t('quizInfo') : t('fileInfo')}</p>
                    <div style={styles.modalBox}>
                      {!selectedSubmission.isQuiz ? (
                        <>
                          <div style={styles.modalRow}>
                            <span style={styles.modalRowLabel}>{t('fileNameLabel') || 'Dosya Adı'}:</span>
                            <span style={styles.modalRowValue}>{selectedSubmission.fileName}</span>
                          </div>
                          <div style={styles.modalRow}>
                            <span style={styles.modalRowLabel}>{t('fileSizeLabel') || 'Boyut'}:</span>
                            <span style={styles.modalRowValue}>{formatFileSize(selectedSubmission.fileSize)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={styles.modalRow}>
                            <span style={styles.modalRowLabel}>{t('score')}:</span>
                            <span style={{ ...styles.modalRowValue, color: '#10b981', fontSize: '18px' }}>
                              {(selectedSubmission.grade === null || selectedSubmission.grade === undefined) ? '-' : `${selectedSubmission.earnedPoints} / ${selectedSubmission.totalPoints}`}
                            </span>
                          </div>
                          <div style={styles.modalRow}>
                            <span style={styles.modalRowLabel}>{t('correctAnswersCount')}:</span>
                            <span style={styles.modalRowValue}>
                              {(selectedSubmission.grade === null || selectedSubmission.grade === undefined) ? '-' : (selectedSubmission.answers?.filter(a => a.isCorrect).length || 0)}
                            </span>
                          </div>
                        </>
                      )}
                      <div style={styles.modalRow}>
                        <span style={styles.modalRowLabel}>{t('submissionDate') || 'Teslim Tarihi'}:</span>
                        <span style={styles.modalRowValue}>{formatDateTime(selectedSubmission.submittedAt)}</span>
                      </div>
                      <div style={styles.modalRow}>
                        <span style={styles.modalRowLabel}>{t('ipAddress') || 'IP Adresi'}:</span>
                        <span style={styles.modalRowValue}>{selectedSubmission.ipAddress || 'Bilinmiyor'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedSubmission.isQuiz && selectedSubmission.answers && (
                    <div style={styles.modalSection}>
                      <p style={styles.modalLabel}>{t('questionDetails')}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedSubmission.exam?.questions?.map((question, idx) => {
                          const studentAnswer = selectedSubmission.answers.find(a => a.questionId === question.id);
                          const isCorrect = studentAnswer?.isCorrect;
                          return (
                            <div key={question.id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: (selectedSubmission.grade === null || selectedSubmission.grade === undefined) ? '#f8fafc' : (isCorrect ? '#f0fdf4' : (studentAnswer?.selectedIndex === null ? '#f8fafc' : '#fef2f2')) }}>
                              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{idx + 1}. {question.text}</p>
                              <div style={{ fontSize: '13px' }}>
                                <p style={{ color: '#64748b' }}>{t('yourAnswer')}: <span style={{ fontWeight: '600', color: (selectedSubmission.grade !== null && selectedSubmission.grade !== undefined) ? (isCorrect ? '#10b981' : '#ef4444') : '#475569' }}>{studentAnswer?.selectedIndex !== null ? question.options[studentAnswer.selectedIndex] : t('emptyAnswer')}</span></p>
                                {(selectedSubmission.grade !== null && selectedSubmission.grade !== undefined) && !isCorrect && (
                                  <p style={{ color: '#10b981', marginTop: '4px' }}>{t('correctAnswer')}: <span style={{ fontWeight: '600' }}>{question.options[question.correctIndex]}</span></p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedSubmission.grade !== null && selectedSubmission.grade !== undefined && (
                    <div style={styles.modalSection}>
                      <p style={styles.modalLabel}>{t('evaluation') || 'Değerlendirme'}</p>
                      <div style={styles.modalBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{selectedSubmission.grade}</span>
                          <span style={{ color: '#64748b' }}>/ 100</span>
                        </div>
                        {selectedSubmission.feedback && (
                          <div>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{t('teacherComment') || 'Öğretmen Yorumu'}:</p>
                            <p style={{ color: '#1e293b' }}>
                              {selectedSubmission.isQuiz && selectedSubmission.feedback.includes('Otomatik notlandırma')
                                ? selectedSubmission.feedback.replace('Otomatik notlandırma', t('autoGrading'))
                                : selectedSubmission.feedback
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!selectedSubmission.isQuiz ? (
                      <>
                        {canPreview(selectedSubmission) && (
                          <button
                            style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={() => { setShowDetailModal(false); handlePreview(selectedSubmission); }}
                          >
                            <Eye size={16} /> {t('preview') || 'Önizle'}
                          </button>
                        )}
                        <button
                          style={{ flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          onClick={() => handleDownload(selectedSubmission)}
                        >
                          <Download size={16} /> {t('download') || 'İndir'}
                        </button>
                      </>
                    ) : (
                      <button
                        style={{ flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={() => setShowDetailModal(false)}
                      >
                        <CheckCircle size={16} /> {t('close') || 'Kapat'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Edit Request Modal */}
            {showEditRequestModal && selectedSubmission && (
              <div style={styles.modal} onClick={() => setShowEditRequestModal(false)}>
                <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                  <div style={styles.modalTitle}>
                    <span>Düzenleme Talebi</span>
                    <button
                      onClick={() => setShowEditRequestModal(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>Dikkat!</p>
                        <p style={{ fontSize: '13px', color: '#78350f' }}>
                          Dosyanız kilitli olduğu için değişiklik yapamazsınız.
                          Değişiklik yapabilmek için öğretmeninizden onay almanız gerekmektedir.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={styles.modalSection}>
                    <p style={styles.modalLabel}>Dosya: {selectedSubmission.fileName}</p>
                    <p style={styles.modalLabel}>Sınav: {selectedSubmission.exam?.title}</p>
                  </div>

                  <div style={styles.modalSection}>
                    <label style={styles.modalLabel}>Düzenleme Nedeniniz *</label>
                    <textarea
                      style={styles.textarea}
                      placeholder="Neden dosyanızı değiştirmek istediğinizi açıklayın..."
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                    />
                  </div>

                  <button
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: editReason.trim() ? '#f59e0b' : '#e2e8f0',
                      color: editReason.trim() ? '#fff' : '#94a3b8',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: editReason.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onClick={handleEditRequest}
                    disabled={!editReason.trim() || requestSending}
                  >
                    {requestSending ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Talep Gönder
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Submissions;
