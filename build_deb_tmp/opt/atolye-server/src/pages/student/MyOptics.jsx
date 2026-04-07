import React, { useEffect, useState } from 'react';
import { Target, Calendar, CheckCircle, Clock, AlertCircle, Award, FileText } from 'lucide-react';
import { StudentLayout } from '../../components/layouts';
import { useAuthStore } from '../../store/authStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useExamStore } from '../../store/examStore';
import { formatDateTime } from '../../utils/dateHelpers';
import { t } from '../../utils/i18n';
import OpticalFormModal from './OpticalFormModal';

const MyOptics = () => {
  const { user } = useAuthStore();
  const { loadSubmissions, getStudentSubmissions } = useSubmissionStore();
  const { loadExams, exams } = useExamStore();

  const [loading, setLoading] = useState(true);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [opticalFormOpen, setOpticalFormOpen] = useState(false);
  const [selectedSubmissionForOptic, setSelectedSubmissionForOptic] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        await loadExams();
        await loadSubmissions();

        const userSubmissions = getStudentSubmissions(user.id);
        const activeSubmissions = userSubmissions.filter(sub => sub.status !== 'edit_granted');

        // Sınav bilgilerini ekle ve sadece Quiz'leri al
        const quizzes = activeSubmissions
          .map(sub => ({
            ...sub,
            exam: exams.find(e => e.id === sub.examId)
          }))
          .filter(sub => sub.isQuiz || sub.type === 'quiz' || sub.exam?.isQuiz);

        setQuizSubmissions(quizzes);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, exams.length]);

  // Öğrenci-sınav bazında grupla (aynı sınav için yedek vs.)
  const getUniqueSubmissions = (subs) => {
    const grouped = {};
    subs.forEach(sub => {
      const key = `${sub.examId}-${sub.studentId}`;
      if (!grouped[key]) {
        grouped[key] = { ...sub, files: [sub] };
      }
    });
    return Object.values(grouped);
  };

  const uniqueQuizzes = getUniqueSubmissions(quizSubmissions).sort((a, b) => 
    new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  const getStatusBadge = (submission) => {
    if (submission.grade !== null && submission.grade !== undefined) {
      const grade = submission.grade;
      if (grade === 'K') return { text: t('cheatCancelled'), color: '#ef4444', bg: '#fef2f2' };
      if (grade >= 85) return { text: t('excellent'), color: '#10b981', bg: '#ecfdf5' };
      if (grade >= 70) return { text: t('good'), color: '#3b82f6', bg: '#eff6ff' };
      if (grade >= 50) return { text: t('pass'), color: '#f59e0b', bg: '#fffbeb' };
      return { text: t('fail'), color: '#ef4444', bg: '#fef2f2' };
    }
    return { text: t('pending'), color: '#64748b', bg: '#f1f5f9' };
  };

  const styles = {
    container: { width: '100%', maxWidth: '1200px', margin: '40px auto', padding: '0 20px' },
    header: { marginBottom: '32px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
    subtitle: { fontSize: '14px', color: '#64748b' },
    card: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginBottom: '20px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      position: 'relative'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '28px 28px 20px',
      borderBottom: '1px solid #f1f5f9'
    },
    examTitle: { fontSize: '19px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' },
    examDesc: { fontSize: '14px', color: '#64748b', fontWeight: '500' },
    badge: (status) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '750',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      backgroundColor: status.bg,
      color: status.color,
      border: `1px solid ${status.bg === '#fef2f2' ? '#fee2e2' : status.bg === '#ecfdf5' ? '#dcfce7' : status.bg === '#eff6ff' ? '#dbeafe' : status.bg === '#fffbeb' ? '#fef3c7' : '#e2e8f0'}`
    }),
    cardBody: {
      padding: '24px 28px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      alignItems: 'center'
    },
    infoItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#475569', fontWeight: '500' },
    gradeSection: {
      padding: '24px 28px',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    gradeDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    gradeNumber: (grade) => ({
      fontSize: '42px',
      fontWeight: '900',
      color: grade === 'K' ? '#ef4444' : (grade >= 85 ? '#10b981' : grade >= 70 ? '#3b82f6' : grade >= 50 ? '#f59e0b' : '#ef4444'),
      lineHeight: 1
    }),
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: '#fff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      minHeight: '300px'
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
          <p style={{ color: '#64748b' }}>{t('loading')}</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>{t('examOptics')}</h1>
          <p style={styles.subtitle}>{t('examOpticsSubtitle')}</p>
        </div>

        {uniqueQuizzes.length === 0 ? (
          <div style={styles.emptyState}>
            <Target size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              {t('noQuizResultYet')}
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              {t('noQuizResultDesc')}
            </p>
          </div>
        ) : (
          <div>
            {uniqueQuizzes.map((submission) => {
              const status = getStatusBadge(submission);

              return (
                <div 
                  key={submission.id} 
                  style={styles.card}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.examTitle}>{submission.exam?.title || t('exam')}</h3>
                      <p style={styles.examDesc}>{submission.exam?.department || submission.exam?.className || t('exam')}</p>
                    </div>
                    <span style={styles.badge(status)}>
                      {submission.grade !== null && submission.grade !== undefined ? (
                        <><CheckCircle size={14} /> {status.text}</>
                      ) : (
                        <><Clock size={14} /> {status.text}</>
                      )}
                    </span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.infoItem}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f0fdf4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981'
                      }}>
                        <Calendar size={18} />
                      </div>
                      <span>{formatDateTime(submission.submittedAt)}</span>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f5f3ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6'
                      }}>
                        <Award size={18} />
                      </div>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>
                        {(submission.grade === null || submission.grade === undefined) ? '-' : submission.earnedPoints} / {(submission.grade === null || submission.grade === undefined) ? '-' : submission.totalPoints} {t('score')}
                      </span>
                    </div>

                    <div style={{ justifySelf: 'end' }}>
                      <button
                        onClick={() => {
                          setSelectedSubmissionForOptic(submission);
                          setOpticalFormOpen(true);
                        }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '10px',
                          padding: '12px 24px', backgroundColor: '#eff6ff', color: '#2563eb',
                          border: '1px solid #dbeafe', borderRadius: '12px', cursor: 'pointer',
                          fontSize: '14.5px', fontWeight: '700', transition: 'all 0.3s',
                          boxShadow: '0 1px 2px rgba(37, 99, 235, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dbeafe';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(37, 99, 235, 0.05)';
                        }}
                      >
                        <FileText size={20} />
                        {t('viewMyOptic')}
                      </button>
                    </div>
                  </div>

                  {/* Grade Section */}
                  {submission.grade !== null && submission.grade !== undefined && (
                    <div style={styles.gradeSection}>
                      <div style={styles.gradeDisplay}>
                        <Award size={24} color={submission.grade === 'K' ? '#ef4444' : '#f59e0b'} />
                        <span style={styles.gradeNumber(submission.grade)}>{submission.grade}</span>
                        {submission.grade !== 'K' && <span style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>/ 100</span>}
                      </div>
                    </div>
                  )}

                  {/* Pending Message */}
                  {(submission.grade === null || submission.grade === undefined) && (
                    <div style={{ ...styles.gradeSection, backgroundColor: '#fffbeb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={20} color="#f59e0b" />
                        <span style={{ color: '#92400e', fontSize: '14px', fontWeight: '500' }}>
                          {t('inEvaluation')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <OpticalFormModal
        isOpen={opticalFormOpen}
        onClose={() => {
          setOpticalFormOpen(false);
          setSelectedSubmissionForOptic(null);
        }}
        submission={selectedSubmissionForOptic}
      />
    </StudentLayout>
  );
};

export default MyOptics;
