import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  X,
  Copy,
  Check,
  User,
  Trash2,
  CloudUpload,
  LockOpen,
  Timer,
  ArrowRight,
  School,
  BadgeCheck,
  Plus
} from 'lucide-react';
import { StudentSidebar } from '../../components/layout';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { useExamStore } from '../../store/examStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { formatFileSize, isValidFileType, isFileSizeValid } from '../../utils/fileHelpers';
import { hashFile } from '../../utils/crypto';
import { formatDateTime } from '../../utils/dateHelpers';
import { t } from '../../utils/i18n';

const FileUpload = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { loadExams, getExamsForStudent } = useExamStore();
  const { submitFile, submitWithoutFile, submitClassic, loadSubmissions, markAsReady } = useSubmissionStore();

  const examId = searchParams.get('exam');
  const [selectedExam, setSelectedExam] = useState(null);

  const hasApprovedEditRequest = (submission) => {
    if (!submission?.editRequests) return false;
    const approved = submission.editRequests.find(r => r.status === 'approved');
    if (!approved) return false;
    const expiresAt = new Date(approved.editExpiresAt || submission.editDeadline);
    return expiresAt > new Date();
  };

  const [files, setFiles] = useState([]);
  const [fileHashes, setFileHashes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [examEndCheckInterval, setExamEndCheckInterval] = useState(null);
  const [classicAnswers, setClassicAnswers] = useState([{ id: 1, text: '' }]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      await loadExams();
      const allSubmissions = await loadSubmissions();

      if (examId) {
        // Öğrencinin sınıfına ait sınavları filtrele
        const studentExams = getExamsForStudent(user?.id, user?.className);
        const exam = studentExams.find(e => e.id === examId);

        if (exam) {
          setSelectedExam(exam);
          const submission = (allSubmissions || []).find(s =>
            s.examId === examId &&
            s.studentId === user?.id &&
            s.status !== 'edit_granted'
          );
          setCurrentSubmission(submission || null);

          if (submission && submission.type === 'classic' && submission.answers) {
            setClassicAnswers(submission.answers.map((a, i) => ({ id: i + 1, text: a.text })));
          }

          const examFiles = (allSubmissions || []).filter(s =>
            s.examId === examId &&
            s.studentId === user?.id &&
            s.status !== 'edit_granted'
          );
          setUploadedFiles(examFiles);
        } else {
          // Sınav bulunamadı, null bırak ama kullanıcı sınavları görecek
          setSelectedExam(null);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [examId, user]);

  // Monitor exam end time for auto-lock
  useEffect(() => {
    if (selectedExam && uploadedFiles.length > 0 && !currentSubmission?.isLocked && autoLockEnabled) {
      // Check every 5 seconds if exam has ended
      const interval = setInterval(() => {
        const now = new Date();
        const examEnd = new Date(selectedExam.endDate);

        if (now >= examEnd) {
          // Exam has ended - auto lock
          handleAutoLock();
          clearInterval(interval);
        }
      }, 5000);

      setExamEndCheckInterval(interval);

      return () => clearInterval(interval);
    }
  }, [selectedExam, uploadedFiles.length, currentSubmission?.isLocked, autoLockEnabled]);

  // Anti-Cheat (Sınav Güvenliği)
  useEffect(() => {
    if (!selectedExam || currentSubmission?.isLocked) return;

    const handleContextMenu = (e) => {
      if (selectedExam.disableShortcuts) {
        e.preventDefault();
        toast.error('Sağ tık bu sınavda engellenmiştir.');
      }
    };

    const handleCopy = (e) => {
      if (selectedExam.disableShortcuts) {
        e.preventDefault();
        toast.error('Kopyalama bu sınavda engellenmiştir.');
      }
    };

    const handleVisibilityChange = () => {
      if (selectedExam.disableShortcuts && document.hidden && !currentSubmission?.isLocked) {
        toast.error('Sınav ekranından ayrıldınız! Lütfen sınavınıza odaklanın!', { duration: 5000 });
      }
    };

    const handleBlur = () => {
      if (selectedExam.disableShortcuts && !currentSubmission?.isLocked) {
        toast.warning('Dikkatiniz dağıldı! Lütfen sınav ekranına geri dönün.');
      }
    };

    const handleKeyDown = (e) => {
      if (selectedExam.disableShortcuts) {
        // F1-F12 keys, Alt, Tab, Meta, Ctrl+C/V
        if (
          e.key === 'F11' ||
          e.key === 'F12' ||
          (e.altKey && e.key === 'Tab') ||
          (e.altKey && e.key === 'F4') ||
          e.metaKey ||
          (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p'))
        ) {
          e.preventDefault();
          toast.error('Bu kısayol işlemi sınav sırasında engellenmiştir.');
        }
      }
    };

    const handleFullscreenChange = async () => {
      if (selectedExam.preventLeaveFullScreen && !document.fullscreenElement && !currentSubmission?.isLocked) {
        toast.error('Sınav sırasında tam ekrandan çıkmak yasaktır! Lütfen tekrar tam ekrana dönün.', { duration: 6000 });
        setIsPaused(true);
      }
    };

    // Event Listenere'ları ekle
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Tam ekrana zorla (eğer açık ve destekleniyorsa)
    if (selectedExam.preventLeaveFullScreen && !document.fullscreenElement) {
      try {
        document.documentElement.requestFullscreen().catch((err) => {
          console.log('Otomatik tam ekran engellendi, kullanıcı etkileşimi bekleniyor:', err);
        });
      } catch (e) { }
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [selectedExam, currentSubmission?.isLocked]);

  const handleAutoLock = async () => {
    if (currentSubmission?.id && !currentSubmission?.isLocked && autoLockEnabled) {
      try {
        await markAsReady(currentSubmission.id);
        toast.success(t('submissionAutoLocked'));
        const allSubmissions = await loadSubmissions();
        const submission = (allSubmissions || []).find(s =>
          s.examId === examId &&
          s.studentId === user?.id &&
          s.status !== 'edit_granted'
        );
        setCurrentSubmission(submission || null);
      } catch (error) {
        console.error('Auto-lock error:', error);
      }
    }
  };

  const disableAutoLock = async () => {
    // Otomatik kilitlemeyi iptal et ve direkt kilitle
    if (examEndCheckInterval) {
      clearInterval(examEndCheckInterval);
      setExamEndCheckInterval(null);
    }
    setAutoLockEnabled(false);

    // Direkt kilitle
    if (currentSubmission?.id) {
      try {
        await markAsReady(currentSubmission.id);
        toast.success(t('submissionLocked'));
      } catch (error) {
        toast.error(t('lockError'));
        console.error('Lock error:', error);
      }
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [selectedExam, files]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  };

  const processFiles = async (newFiles) => {
    if (!selectedExam) {
      toast.error(t('pleaseSelectExam'));
      return;
    }

    const allowedFormats = selectedExam.allowedFileTypes || ['.pdf'];
    const cleanFormats = allowedFormats.map(f => f.replace('.', '').toLowerCase());
    const maxSize = selectedExam.maxFileSize || 10;
    const allowMultiple = selectedExam.multipleFiles || false;
    const maxFileCount = selectedExam.maxFileCount || 1;

    const validFiles = [];

    for (const file of newFiles) {
      if (!isValidFileType(file, cleanFormats)) {
        toast.error(`${file.name}: ${t('allowedFormats')}: ${allowedFormats.join(', ')}`);
        continue;
      }

      if (!isFileSizeValid(file, maxSize)) {
        toast.error(`${file.name}: ${t('maxFileSize')} ${maxSize} MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (!allowMultiple) {
      const singleFile = validFiles[0];
      setFiles([singleFile]);
      setIsHashing(true);
      try {
        const hash = await hashFile(singleFile);
        setFileHashes([hash]);
      } catch (error) {
        toast.error(t('hashError'));
      }
      setIsHashing(false);
      return;
    }

    const currentCount = files.length;
    const availableSlots = maxFileCount - currentCount;

    if (availableSlots <= 0) {
      toast.error(`${t('maxFiles')} ${maxFileCount}`);
      return;
    }

    const filesToAdd = validFiles.slice(0, availableSlots);

    setIsHashing(true);
    const newHashes = [];

    for (const file of filesToAdd) {
      try {
        const hash = await hashFile(file);
        newHashes.push(hash);
      } catch (error) {
        newHashes.push('');
      }
    }

    setFiles(prev => [...prev, ...filesToAdd]);
    setFileHashes(prev => [...prev, ...newHashes]);
    setIsHashing(false);

    if (filesToAdd.length < validFiles.length) {
      toast.warning(`${validFiles.length - filesToAdd.length} ${t('filesNotAdded')}`);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileHashes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isSubmitting || !selectedExam) return;
    if (selectedExam.requireFileUpload !== false && files.length === 0) return;

    if (currentSubmission && !hasApprovedEditRequest(currentSubmission)) {
      toast.error(t('alreadySubmitted'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Kullanıcı IP adresini al
      let clientIp = 'Bilinmiyor';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        clientIp = ipData.ip;
      } catch (e) {
        console.error('IP alınamadı:', e);
      }

      const studentInfo = {
        studentNumber: user.studentNumber,
        fullName: user.fullName || user.name,
        className: user.className,
        folderPath: `${user.className}/${user.fullName || user.name}-${user.studentNumber}`
      };

      if (selectedExam.requireFileUpload === false && (selectedExam.type === 'exam' || selectedExam.type === 'final_exam') && classicAnswers.some(a => a.text.trim())) {
        // Classic text submission
        const result = await submitClassic({
          examId,
          studentId: user.id,
          studentNumber: user.studentNumber,
          studentName: user.fullName || user.name,
          studentClass: user.className,
          answers: classicAnswers.filter(a => a.text.trim()),
          clientIp
        });
        if (!result.success) throw new Error(result.error || 'Klasik sınav teslimi oluşturulamadı');
      } else if (files.length === 0) {
        // Requires file upload is false and no files provided (and no text answers)
        const result = await submitWithoutFile(examId, user.id, studentInfo, clientIp);
        if (!result.success) throw new Error(result.error || 'Teslim oluşturulamadı');
      } else {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const hash = fileHashes[i];

          const result = await submitFile(examId, user.id, studentInfo, file, clientIp);

          if (!result.success) {
            throw new Error(result.error || 'Dosya yüklenemedi');
          }
        }
      }

      toast.success(t('filesUploaded'));
      setFiles([]);
      setFileHashes([]);

      const allSubmissions = await loadSubmissions();
      const examFiles = (allSubmissions || []).filter(s =>
        s.examId === examId &&
        s.studentId === user?.id &&
        s.status !== 'edit_granted'
      );
      setUploadedFiles(examFiles);

      const submission = (allSubmissions || []).find(s =>
        s.examId === examId &&
        s.studentId === user?.id &&
        s.status !== 'edit_granted'
      );
      setCurrentSubmission(submission || null);

      // Auto-lock is now enabled and will trigger when exam ends
      if (submission && !submission.isLocked) {
        toast.info(t('autoLockOnExamEnd'));
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('uploadError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUploadedFile = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/submissions/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Silme başarısız');

      toast.success(t('fileDeleted'));

      const allSubmissions = await loadSubmissions();
      const examFiles = (allSubmissions || []).filter(s =>
        s.examId === examId &&
        s.studentId === user?.id &&
        s.status !== 'edit_granted'
      );
      setUploadedFiles(examFiles);

      const submission = (allSubmissions || []).find(s =>
        s.examId === examId &&
        s.studentId === user?.id &&
        s.status !== 'edit_granted'
      );
      setCurrentSubmission(submission || null);
    } catch (error) {
      toast.error(t('deleteError'));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <StudentSidebar />
        <div style={{
          flex: 1,
          marginLeft: '288px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#2463eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#64748b' }}>{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedExam) {
    // Öğrencinin sınıfına ait sınavları göster
    const studentExams = getExamsForStudent(user?.id, user?.className).sort((a, b) => {
      const now = new Date();
      const getStatus = (exam) => {
        const start = new Date(exam.startDate);
        const end = new Date(exam.endDate);
        if (now >= start && now <= end) return 0; // Active
        if (now < start) return 1; // Upcoming
        return 2; // Ended
      };

      const statusA = getStatus(a);
      const statusB = getStatus(b);

      if (statusA !== statusB) return statusA - statusB;
      
      // If same status, sort by startDate descending (newest first)
      return new Date(b.startDate) - new Date(a.startDate);
    });

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <StudentSidebar />
        <div style={{
          flex: 1,
          marginLeft: '288px',
          padding: '40px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            {examId && (
              <>
                <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111318', marginBottom: '12px' }}>
                  {t('examNotFound')}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '32px' }}>
                  {t('examNotFoundDesc')}
                </p>
              </>
            )}

            {studentExams.length > 0 ? (
              <>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111318', marginBottom: '24px', textAlign: 'left' }}>
                  {t('availableExams')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                  {studentExams.map((exam, idx) => {
                    const now = new Date();
                    const startDate = new Date(exam.startDate);
                    const endDate = new Date(exam.endDate);
                    const isActive = now >= startDate && now <= endDate;
                    const hasEnded = now > endDate;

                    return (
                      <div
                        key={exam.id}
                        onClick={() => !hasEnded && navigate(`/ogrenci/dosya-yukle?exam=${exam.id}`)}
                        style={{
                          padding: '28px',
                          backgroundColor: 'white',
                          borderRadius: '16px',
                          cursor: hasEnded ? 'not-allowed' : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          opacity: hasEnded ? 0.6 : 1,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px'
                        }}
                        onMouseEnter={(e) => {
                          if (!hasEnded) {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.transform = 'translateY(-6px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Status Badge */}
                        <div style={{ 
                          position: 'absolute', 
                          top: '16px', 
                          right: '16px'
                        }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '750',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            backgroundColor: hasEnded ? '#f1f5f9' : isActive ? '#dcfce7' : '#fff7ed',
                            color: hasEnded ? '#64748b' : isActive ? '#059669' : '#d97706',
                            border: `1px solid ${hasEnded ? '#e2e8f0' : isActive ? '#bbf7d0' : '#ffedd5'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            <div style={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                              backgroundColor: 'currentColor' 
                            }}></div>
                            {hasEnded ? t('ended') : isActive ? t('active') : t('upcoming')}
                          </span>
                        </div>

                        {/* Title & Type Icon */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: isActive ? '#eff6ff' : '#f8fafc',
                            color: isActive ? '#3b82f6' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {exam.isQuiz ? <BadgeCheck size={24} /> : <FileText size={24} />}
                          </div>
                          <h4 style={{ 
                            fontSize: '19px', 
                            fontWeight: '800', 
                            color: '#1e293b',
                            margin: 0,
                            lineHeight: '1.2'
                          }}>
                            {exam.title}
                          </h4>
                        </div>

                        {/* Description */}
                        {exam.description && (
                          <p style={{ 
                            color: '#64748b', 
                            fontSize: '14.5px', 
                            lineHeight: '1.5',
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {exam.description}
                          </p>
                        )}

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {/* Teacher */}
                          {exam.teacherName && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              color: '#3b82f6', 
                              backgroundColor: '#eff6ff',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              width: 'fit-content'
                            }}>
                              <User size={16} />
                              <span style={{ fontSize: '13px', fontWeight: '650' }}>{exam.teacherName}</span>
                            </div>
                          )}

                          {/* Dates */}
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '6px',
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: '12px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                              <Clock size={14} />
                              <span style={{ fontSize: '13px' }}>
                                <span style={{ fontWeight: '600', color: '#475569' }}>{t('startDate')}:</span> {formatDateTime(exam.startDate)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                              <Timer size={14} />
                              <span style={{ fontSize: '13px' }}>
                                <span style={{ fontWeight: '600', color: '#475569' }}>{t('endDate')}:</span> {formatDateTime(exam.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Hint */}
                        {!hasEnded && (
                          <div style={{
                            position: 'absolute',
                            bottom: '16px',
                            right: '28px',
                            color: '#3b82f6',
                            transform: 'translateX(10px)',
                            opacity: 0,
                            transition: 'all 0.3s'
                          }} className="action-hint">
                            <Plus size={20} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 40px',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '1px dashed #cbd5e1',
                marginTop: '40px'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '30px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px',
                  color: '#94a3b8'
                }}>
                  <School size={48} />
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>
                  {t('noActiveExams')}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px', maxWidth: '450px', lineHeight: '1.6' }}>
                  {t('noExamsAvailable')}
                </p>
              </div>
            )}

            <button
              onClick={() => navigate('/ogrenci')}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                backgroundColor: '#2463eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {t('backToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleResume = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsPaused(false);
    } catch (e) {
      toast.error('Tam ekrana geçiş reddedildi.');
    }
  };

  if (isPaused) {
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
      }}>
        <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '24px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Sınav Duraklatıldı</h1>
        <p style={{ fontSize: '18px', color: '#cbd5e1', marginBottom: '32px', textAlign: 'center', maxWidth: '600px' }}>
          Sınav sırasında tam ekrandan çıkmak güvenlik kurallarına aykırıdır. Lütfen sınava devam etmek için tekrar tam ekrana geçin.
        </p>
        <button
          onClick={handleResume}
          style={{
            padding: '16px 32px', backgroundColor: '#2463eb', color: 'white', borderRadius: '12px',
            fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', border: 'none'
          }}
        >
          Sınava Devam Et (Tam Ekrana Geç)
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f6f6f8' }}>
      <StudentSidebar />

      <div style={{ flex: 1, marginLeft: '288px', display: 'flex', flexDirection: 'column' }}>
        {/* Header / Topbar */}
        <div style={{
          height: '72px',
          backgroundColor: 'white',
          borderBottom: '1px solid #f0f1f4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span
              onClick={() => navigate('/ogrenci')}
              style={{ color: '#64748b', cursor: 'pointer', fontWeight: '500' }}
            >
              {t('home')}
            </span>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span
              onClick={() => navigate('/ogrenci')}
              style={{ color: '#64748b', cursor: 'pointer', fontWeight: '500' }}
            >
              {t('dashboard')}
            </span>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ color: '#111318', fontWeight: '600' }}>{t('uploadFile')}</span>
          </div>

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>
                {user?.studentNumber || t('student')}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111318' }}>
                {user?.fullName || user?.name || t('student')}
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}>
              {(user?.fullName || user?.name)?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: '32px',
            overflowY: 'auto',
            userSelect: selectedExam?.disableShortcuts ? 'none' : 'auto'
          }}
          onCopy={(e) => selectedExam?.disableShortcuts && e.preventDefault()}
          onContextMenu={(e) => selectedExam?.disableShortcuts && e.preventDefault()}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Check if exam has ended */}
            {(() => {
              const now = new Date();
              const endDate = new Date(selectedExam.endDate);
              const hasEnded = now > endDate;

              if (hasEnded) {
                return (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '48px',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                  }}>
                    <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 24px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111318', marginBottom: '12px' }}>
                      {t('examEnded')}
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>
                      {selectedExam.title}
                    </p>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                      {t('examEndedDesc')}
                    </p>
                    <button
                      onClick={() => navigate('/ogrenci')}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#2463eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {t('backToDashboard')}
                    </button>
                  </div>
                );
              }

              return null;
            })()}

            {/* Only show upload form if exam is not ended */}
            {(() => {
              const now = new Date();
              const endDate = new Date(selectedExam.endDate);
              const hasEnded = now > endDate;

              if (hasEnded) return null;

              return (
                <>
                  {/* Exam Info Card */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    marginBottom: '32px'
                  }}>
                    {/* Gradient Header */}
                    <div style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #14b8a6 50%, #10b981 100%)',
                      padding: '32px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: '33%',
                        height: '100%',
                        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                        opacity: 0.1
                      }} />
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}>
                            {selectedExam.type || t('exam')}
                          </span>

                          {selectedExam?.preventLeaveFullScreen && (
                            <button
                              onClick={() => {
                                if (!document.fullscreenElement) {
                                  document.documentElement.requestFullscreen().catch(e => console.error(e));
                                }
                              }}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                backdropFilter: 'blur(8px)'
                              }}
                            >
                              Tam Ekranı Aç
                            </button>
                          )}
                        </div>
                        <h2 style={{
                          fontSize: '28px',
                          fontWeight: '800',
                          color: 'white',
                          marginBottom: '8px'
                        }}>
                          {selectedExam.title}
                        </h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px' }}>
                          {selectedExam.description || t('uploadFilesDesc')}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      borderTop: '1px solid #f0f1f4'
                    }}>
                      <div style={{
                        padding: '24px',
                        borderRight: '1px solid #f0f1f4'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <User size={18} color="#64748b" />
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                            {t('teacher')}
                          </span>
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#111318' }}>
                          {selectedExam.teacherName || 'Teacher'}
                        </p>
                      </div>

                      <div style={{
                        padding: '24px',
                        borderRight: '1px solid #f0f1f4'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Calendar size={18} color="#64748b" />
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                            {t('startDate')}
                          </span>
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#111318' }}>
                          {formatDateTime(selectedExam.startDate)}
                        </p>
                      </div>

                      <div style={{
                        padding: '24px',
                        borderRight: '1px solid #f0f1f4'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <AlertCircle size={18} color="#64748b" />
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                            {t('endDate')}
                          </span>
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#111318' }}>
                          {formatDateTime(selectedExam.endDate)}
                        </p>
                      </div>

                      <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <FileText size={18} color="#64748b" />
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                            {t('constraints')}
                          </span>
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#111318' }}>
                          {(selectedExam.allowedFileTypes || ['.pdf']).map(f => f.replace('.', '').toUpperCase()).join(', ')} | Max: {selectedExam.maxFileSize ? Math.round(selectedExam.maxFileSize / (1024 * 1024)) : 10}MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Soru İçeriği */}
                  {(selectedExam.questionText || selectedExam.questionFileUrl) && (
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                      marginBottom: '32px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <FileText size={20} color="#0d9488" />
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111318' }}>Soru İçeriği</h3>
                      </div>

                      {selectedExam.questionText && (
                        <div style={{
                          backgroundColor: '#f8fafc',
                          padding: '16px',
                          borderRadius: '12px',
                          fontSize: '15px',
                          color: '#334155',
                          whiteSpace: 'pre-wrap',
                          marginBottom: selectedExam.questionFileUrl ? '16px' : '0'
                        }}>
                          {selectedExam.questionText}
                        </div>
                      )}

                      {selectedExam.questionFileUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                          <FileText size={24} color="#16a34a" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>Soru Dosyası</div>
                            <div style={{ fontSize: '12px', color: '#15803d' }}>Öğretmeniniz tarafından yüklenmiş ek dosya.</div>
                          </div>
                          <a
                            href={selectedExam.questionFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#16a34a',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}
                          >
                            Görüntüle / İndir
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Edit Request Active Alert */}
                  {currentSubmission && hasApprovedEditRequest(currentSubmission) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: '#d1fae5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '12px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#86efac',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#166534'
                        }}>
                          <LockOpen size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#166534', marginBottom: '2px' }}>
                            {t('editRequestApproved')}
                          </h3>
                          <p style={{ fontSize: '14px', color: '#166534' }}>
                            {t('editRequestApprovedDesc')}
                          </p>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        backgroundColor: '#86efac',
                        borderRadius: '8px',
                        color: '#166534'
                      }}>
                        <Timer size={18} />
                        <span style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'monospace' }}>
                          14:32
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Main Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                    {/* Left Column - Upload Area / PDF Viewer */}
                    {(selectedExam.requireFileUpload === false && (selectedExam.type === 'exam' || selectedExam.type === 'final_exam')) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '800px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111318' }}>Sınav Dosyası</h3>
                        {selectedExam.questionFileUrl ? (
                          <iframe
                            src={selectedExam.questionFileUrl ? "/" + selectedExam.questionFileUrl.split('\\').join('/').split('/').filter(Boolean).join('/') : ""}
                            title="Sınav Soruları"
                            style={{ width: '100%', height: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}
                          />
                        ) : (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#64748b' }}>
                            Sınav dosyası bulunamadı.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Drag & Drop Zone */}
                        {selectedExam.requireFileUpload !== false && (
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '48px 24px',
                              border: '2px dashed',
                              borderColor: isDragging ? '#2463eb' : '#cbd5e1',
                              borderRadius: '16px',
                              backgroundColor: isDragging ? 'rgba(36, 99, 235, 0.05)' : 'rgba(248, 250, 252, 0.5)',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <input
                              type="file"
                              onChange={handleFileSelect}
                              accept={(selectedExam.allowedFileTypes || ['.pdf']).join(',')}
                              multiple={selectedExam.multipleFiles || false}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                opacity: 0,
                                cursor: 'pointer',
                                zIndex: 10
                              }}
                            />

                            <div style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '16px',
                              transition: 'transform 0.2s',
                              transform: isDragging ? 'scale(1.1)' : 'scale(1)'
                            }}>
                              <CloudUpload size={32} color="#2463eb" />
                            </div>

                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#111318',
                              marginBottom: '4px'
                            }}>
                              {t('dragDropFiles')}
                            </h3>

                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                              {t('orClickToBrowse')}
                            </p>

                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>
                              {t('supported')}: {(selectedExam.allowedFileTypes || ['.pdf']).map(f => f.replace('.', '')).join(', ')}
                            </p>
                          </div>
                        )}

                        {/* Display warning if upload not required */}
                        {selectedExam.requireFileUpload === false && files.length === 0 && (
                          <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', color: '#1e3a8a', fontSize: '14px' }}>
                            Öğretmeniniz bu sınav için dosya yüklemeyi zorunlu kılmamıştır. İsterseniz dosya yüklemeden direkt teslimi gönderebilirsiniz.
                          </div>
                        )}

                        {/* Submit Button for no-file submissions */}
                        {selectedExam.requireFileUpload === false && files.length === 0 && !currentSubmission && (
                          <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '16px',
                              backgroundColor: isSubmitting ? '#94a3b8' : '#2463eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isSubmitting ? 'Gönderiliyor...' : 'Teslimi Gönder (Dosyasız)'}
                          </button>
                        )}

                        {/* Staged Files List */}
                        {files.length > 0 && (
                          <div>
                            <h4 style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#111318',
                              marginBottom: '12px'
                            }}>
                              <Clock size={18} color="#2463eb" />
                              {t('readyToSubmit')} ({files.length})
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {files.map((file, index) => (
                                <div key={index} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '16px',
                                  backgroundColor: 'white',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '12px',
                                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                    <div style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '8px',
                                      backgroundColor: '#eff6ff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      <FileText size={20} color="#2563eb" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontSize: '15px', fontWeight: '500', color: '#111318', marginBottom: '2px' }}>
                                        {file.name}
                                      </p>
                                      <p style={{ fontSize: '13px', color: '#64748b' }}>
                                        {formatFileSize(file.size)}
                                      </p>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {fileHashes[index] && (
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '4px 8px',
                                        backgroundColor: '#f1f5f9',
                                        borderRadius: '6px'
                                      }}>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>
                                          SHA-256
                                        </span>
                                        <code style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                                          {fileHashes[index].substring(0, 8)}...
                                        </code>
                                      </div>
                                    )}

                                    <button
                                      onClick={() => removeFile(index)}
                                      style={{
                                        padding: '8px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fee2e2';
                                        e.currentTarget.style.color = '#ef4444';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#94a3b8';
                                      }}
                                    >
                                      <X size={20} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Submit Button */}
                            <button
                              onClick={handleSubmit}
                              disabled={isSubmitting || isHashing}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '16px',
                                marginTop: '16px',
                                backgroundColor: (isSubmitting || isHashing) ? '#94a3b8' : '#2463eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: (isSubmitting || isHashing) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSubmitting && !isHashing) {
                                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(36, 99, 235, 0.2)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSubmitting && !isHashing) {
                                  e.currentTarget.style.backgroundColor = '#2463eb';
                                  e.currentTarget.style.boxShadow = 'none';
                                }
                              }}
                            >
                              {isSubmitting ? (
                                <>
                                  <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '3px solid rgba(255, 255, 255, 0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                  }} />
                                  <span>{t('submitting')}</span>
                                </>
                              ) : (
                                <>
                                  <span>{t('submitFilesLock')}</span>
                                  <ArrowRight size={18} />
                                </>
                              )}
                            </button>

                            <p style={{
                              marginTop: '12px',
                              textAlign: 'center',
                              fontSize: '12px',
                              color: '#94a3b8'
                            }}>
                              {t('bySubmittingAgree')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Right Column - History / Text Answers */}
                    {selectedExam.requireFileUpload === false && selectedExam.type === 'exam' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#111318', marginBottom: '8px' }}>
                            <FileText size={20} color="#2463eb" />
                            Yanıtlarınız
                          </h4>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                            {classicAnswers.map((answer, index) => (
                              <div key={answer.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                    Cevap {index + 1}
                                  </label>
                                  {!currentSubmission?.isLocked && classicAnswers.length > 1 && (
                                    <button
                                      onClick={() => setClassicAnswers(classicAnswers.filter((a, i) => i !== index))}
                                      style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                      Sil
                                    </button>
                                  )}
                                </div>
                                <textarea
                                  value={answer.text}
                                  onChange={(e) => {
                                    const newAnswers = [...classicAnswers];
                                    newAnswers[index].text = e.target.value;
                                    setClassicAnswers(newAnswers);
                                  }}
                                  disabled={currentSubmission?.isLocked}
                                  placeholder={`${index + 1}. sorunun cevabını buraya yazın...`}
                                  style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '12px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    backgroundColor: currentSubmission?.isLocked ? '#f1f5f9' : 'white',
                                    color: currentSubmission?.isLocked ? '#64748b' : '#0f172a'
                                  }}
                                />
                              </div>
                            ))}
                          </div>

                          {!currentSubmission?.isLocked && (
                            <button
                              onClick={() => setClassicAnswers([...classicAnswers, { id: Date.now(), text: '' }])}
                              style={{
                                padding: '12px',
                                backgroundColor: 'white',
                                color: '#334155',
                                border: '1px dashed #cbd5e1',
                                borderRadius: '8px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <Plus size={16} /> Yeni Yanıt Alanı Ekle
                            </button>
                          )}

                          <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || currentSubmission?.isLocked}
                            style={{
                              width: '100%',
                              padding: '16px',
                              backgroundColor: (isSubmitting || currentSubmission?.isLocked) ? '#94a3b8' : '#2463eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: (isSubmitting || currentSubmission?.isLocked) ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                          >
                            {isSubmitting ? (
                              <>
                                <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255, 255, 255, 0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                <span>Gönderiliyor...</span>
                              </>
                            ) : currentSubmission?.isLocked ? (
                              <>
                                <CheckCircle size={18} />
                                <span>Teslim Kilitlendi</span>
                              </>
                            ) : (
                              <>
                                <span>Yanıtları Gönder</span>
                                <ArrowRight size={18} />
                              </>
                            )}
                          </button>

                          {currentSubmission && !currentSubmission.isLocked && (
                            <button
                              onClick={async () => {
                                try {
                                  await markAsReady(currentSubmission.id);
                                  toast.success(t('submissionLocked'));
                                  const allSubmissions = await loadSubmissions();
                                  const submission = (allSubmissions || []).find(s =>
                                    s.examId === examId &&
                                    s.studentId === user?.id &&
                                    s.status !== 'edit_granted'
                                  );
                                  setCurrentSubmission(submission || null);
                                } catch (error) {
                                  toast.error(t('lockError'));
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                              }}
                            >
                              <CheckCircle size={18} />
                              <span>Yanıtlarımı Kilitle (Teslim Et)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{
                          padding: '24px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px'
                        }}>
                          <h4 style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#111318',
                            marginBottom: '16px'
                          }}>
                            <Clock size={18} color="#64748b" />
                            {t('uploadHistory')}
                          </h4>

                          {uploadedFiles.length === 0 ? (
                            <div style={{
                              padding: '48px 24px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              fontSize: '14px',
                              color: '#94a3b8'
                            }}>
                              <FileText size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                              {t('noFilesUploaded')}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {uploadedFiles.map((file) => (
                                <div key={file.id} style={{
                                  position: 'relative',
                                  paddingLeft: '16px',
                                  borderLeft: '2px solid #e2e8f0'
                                }}>
                                  <div style={{
                                    position: 'absolute',
                                    left: '-5px',
                                    top: '8px',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#cbd5e1'
                                  }} />

                                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '8px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#334155',
                                        marginBottom: '2px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {file.fileName}
                                      </p>
                                      <p style={{ fontSize: '12px', color: '#64748b' }}>
                                        {new Date(file.submittedAt).toLocaleString('tr-TR')}
                                      </p>
                                    </div>

                                    <button
                                      onClick={() => handleDeleteUploadedFile(file.id)}
                                      disabled={currentSubmission?.isLocked}
                                      style={{
                                        padding: '4px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: currentSubmission?.isLocked ? 'not-allowed' : 'pointer',
                                        color: currentSubmission?.isLocked ? '#cbd5e1' : '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '4px',
                                        flexShrink: 0,
                                        opacity: currentSubmission?.isLocked ? 0.5 : 1
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!currentSubmission?.isLocked) {
                                          e.currentTarget.style.color = '#ef4444';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!currentSubmission?.isLocked) {
                                          e.currentTarget.style.color = '#94a3b8';
                                        }
                                      }}
                                      title={currentSubmission?.isLocked ? t('submissionLockedStatus') : t('deleteFromServer')}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Auto-Lock Status or Manual Lock Button */}
                          {uploadedFiles.length > 0 && !currentSubmission?.isLocked && (
                            <>
                              {autoLockEnabled ? (
                                <div style={{
                                  marginTop: '16px',
                                  padding: '16px',
                                  backgroundColor: '#dbeafe',
                                  border: '2px solid #60a5fa',
                                  borderRadius: '12px'
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '12px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Timer size={18} color="#1e40af" />
                                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                                        {t('autoLockEnabled')}
                                      </span>
                                    </div>
                                  </div>
                                  <p style={{ fontSize: '13px', color: '#1e40af', marginBottom: '12px' }}>
                                    {t('autoLockExamEndDesc')}
                                  </p>
                                  <button
                                    onClick={disableAutoLock}
                                    style={{
                                      width: '100%',
                                      padding: '10px',
                                      backgroundColor: 'white',
                                      color: '#1e40af',
                                      border: '2px solid #60a5fa',
                                      borderRadius: '8px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#dbeafe';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'white';
                                    }}
                                  >
                                    {t('disableAutoLock')}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={async () => {
                                    if (currentSubmission?.id) {
                                      try {
                                        await markAsReady(currentSubmission.id);
                                        toast.success(t('submissionLocked'));
                                        const allSubmissions = await loadSubmissions();
                                        const submission = (allSubmissions || []).find(s =>
                                          s.examId === examId &&
                                          s.studentId === user?.id &&
                                          s.status !== 'edit_granted'
                                        );
                                        setCurrentSubmission(submission || null);
                                      } catch (error) {
                                        toast.error(t('lockError'));
                                      }
                                    }
                                  }}
                                  style={{
                                    width: '100%',
                                    marginTop: '16px',
                                    padding: '12px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#059669';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.2)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#10b981';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  <CheckCircle size={18} />
                                  <span>{t('lockSubmission')}</span>
                                </button>
                              )}
                            </>
                          )}

                          {/* Locked Status */}
                          {currentSubmission?.isLocked && (
                            <div style={{
                              marginTop: '16px',
                              padding: '12px',
                              backgroundColor: '#fef3c7',
                              border: '1px solid #fcd34d',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '13px',
                              color: '#92400e',
                              fontWeight: '600'
                            }}>
                              <CheckCircle size={16} />
                              <span>{t('submissionLockedStatus')}</span>
                            </div>
                          )}

                          <div style={{
                            marginTop: '24px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              color: '#64748b'
                            }}>
                              <BadgeCheck size={16} />
                              <span>{t('encryptedLogged')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FileUpload;
