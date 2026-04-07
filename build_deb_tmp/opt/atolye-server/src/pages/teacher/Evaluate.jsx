import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TeacherLayout } from '../../components/layouts';
import {
  Button,
  Input,
  Modal,
  ConfirmModal,
  Badge,
  Card,
  Select,
  Textarea
} from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useExamStore } from '../../store/examStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore, CLASS_LIST } from '../../store/authStore';
import { formatDate } from '../../utils/dateHelpers';
import { formatFileSize } from '../../utils/fileHelpers';
import { submissionApi } from '../../services/api';
import { t } from '../../utils/i18n';
import {
  Search, Filter, ArrowLeft, ArrowRight, Download, FileText, Check,
  X, MessageSquare, AlertTriangle, Clock, Save, Eye, Send, FolderOpen, Copy, Users
} from 'lucide-react';

// Light theme stilleri
const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc' },
  container: { height: 'calc(100vh - 64px)', display: 'flex' },
  sidebar: {
    width: '320px',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    boxShadow: '4px 0 10px -5px rgba(0, 0, 0, 0.05)'
  },
  sidebarHeader: { padding: '16px', borderBottom: '1px solid #e2e8f0' },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    borderRadius: '6px',
    marginBottom: '8px'
  },
  examTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 },
  badgeRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' },
  searchSection: { padding: '12px', borderBottom: '1px solid #e2e8f0' },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  filterSelect: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    marginTop: '8px'
  },
  submissionList: { flex: 1, overflowY: 'auto' },
  submissionItem: (isActive) => ({
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    backgroundColor: isActive ? '#eff6ff' : '#ffffff',
    borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    margin: '4px 8px',
    borderRadius: '12px'
  }),
  studentName: { fontWeight: '500', color: '#1e293b', marginBottom: '4px' },
  studentNumber: { fontSize: '13px', color: '#64748b' },
  gradeDisplay: { fontSize: '20px', fontWeight: '700', color: '#3b82f6' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9' },
  topBar: {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  navButtons: { display: 'flex', alignItems: 'center', gap: '12px' },
  navButton: {
    padding: '6px 10px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#475569'
  },
  navText: { color: '#64748b', fontSize: '14px' },
  contentArea: { flex: 1, display: 'flex', overflow: 'hidden' },
  filePreview: { flex: 1, padding: '24px', overflowY: 'auto' },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
  },
  previewHeader: {
    padding: '16px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  previewTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 },
  fileList: { padding: '16px', flex: 1, overflowY: 'auto' },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid #e2e8f0'
  },
  fileInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  fileIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileName: { fontWeight: '500', color: '#1e293b', marginBottom: '2px' },
  fileSize: { fontSize: '13px', color: '#64748b' },
  fileActions: { display: 'flex', gap: '8px' },
  actionButton: {
    padding: '6px 10px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#475569',
    fontSize: '13px'
  },
  gradingPanel: {
    width: '340px',
    borderLeft: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 140px)',
    boxShadow: '-4px 0 10px -5px rgba(0, 0, 0, 0.05)'
  },
  studentInfoSection: { padding: '16px', borderBottom: '1px solid #e2e8f0' },
  sectionTitle: { fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  infoLabel: { fontSize: '13px', color: '#64748b' },
  infoValue: { fontSize: '13px', color: '#1e293b', fontWeight: '500' },
  folderPath: {
    fontSize: '12px',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    padding: '8px 12px',
    borderRadius: '6px',
    fontFamily: 'monospace',
    marginTop: '8px',
    wordBreak: 'break-all'
  },
  gradingSection: { padding: '16px' },
  inputLabel: { fontSize: '13px', fontWeight: '500', color: '#1e293b', marginBottom: '6px', display: 'block' },
  gradeInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box'
  },
  feedbackArea: {
    width: '100%',
    height: '120px',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    resize: 'none',
    boxSizing: 'border-box'
  },
  actionSection: { padding: '16px', borderTop: '1px solid #e2e8f0' },
  saveButton: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  secondaryButton: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  },
  badge: (variant) => ({
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: variant === 'primary' ? '#eff6ff' : variant === 'warning' ? '#fef3c7' : variant === 'success' ? '#d1fae5' : '#f1f5f9',
    color: variant === 'primary' ? '#3b82f6' : variant === 'warning' ? '#d97706' : variant === 'success' ? '#059669' : '#64748b'
  }),
  downloadButton: {
    padding: '6px 12px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#475569',
    fontSize: '13px'
  }
};

const Evaluate = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();

  const { exams, loadExams } = useExamStore();
  const { submissions, loadSubmissions, gradeSubmission, respondToEditRequest } = useSubmissionStore();
  const { createNotification } = useNotificationStore();
  const toast = useToast();

  const [selectedExam, setSelectedExam] = useState(null);
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sidebarClassFilter, setSidebarClassFilter] = useState('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [showGrantEditModal, setShowGrantEditModal] = useState(false);
  const [editRequestNote, setEditRequestNote] = useState('');
  const [grantEditNote, setGrantEditNote] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Tamam',
    onConfirm: () => {},
    type: 'warning'
  });
  const [saving, setSaving] = useState(false);
  
  // Kopya tespit sistemi
  const [duplicates, setDuplicates] = useState([]);
  const [allDuplicates, setAllDuplicates] = useState([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);

  useEffect(() => {
    // Sınav değiştiğinde tüm local state'leri sıfırla (Böylece eski sınavın verileri kalmaz)
    setCurrentSubmission(null);
    setExamSubmissions([]);
    setGrade('');
    setFeedback('');
    setDuplicates([]);
    setCurrentIndex(0);
    setPreviewFile(null);

    const fetchData = async () => {
      await loadExams();
      await loadSubmissions();
      
      if (examId) {
        try {
          const dupResponse = await submissionApi.getExamDuplicates(examId);
          if (dupResponse.success) {
            setAllDuplicates(dupResponse.duplicates || []);
          }
        } catch (err) {
          console.error('Kopya verileri yüklenemedi:', err);
        }
      }
    };
    fetchData();
    
    // Otomatik yenileme - Her 10 saniyede bir
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, [examId]);

  // Initialize
  useEffect(() => {
    if (examId) {
      const exam = exams.find(e => e.id === examId);
      setSelectedExam(exam);
      
      if (exam) {
        // edit_granted durumundaki kayıtları filtrele
        const subs = submissions.filter(s => s.examId === examId && s.status !== 'edit_granted');
        
        // Öğrencilere göre grupla
        const groupedByStudent = {};
        subs.forEach(sub => {
          if (!groupedByStudent[sub.studentId]) {
            groupedByStudent[sub.studentId] = {
              id: sub.id, // İlk submission'ın id'sini kullan
              studentId: sub.studentId,
              studentName: sub.studentName,
              studentNumber: sub.studentNumber,
              studentClass: sub.studentClass,
              examId: sub.examId,
              folderPath: sub.folderPath,
              submittedAt: sub.submittedAt,
              status: sub.status,
              grade: sub.grade,
              feedback: sub.feedback,
              gradedAt: sub.gradedAt,
              gradedBy: sub.gradedBy,
              isLocked: sub.isLocked,
              files: []
            };
          }
          // Dosyayı ekle
          groupedByStudent[sub.studentId].files.push({
            id: sub.id,
            fileName: sub.fileName,
            fileSize: sub.fileSize,
            fileType: sub.fileType,
            filePath: sub.filePath,
            fileHash: sub.fileHash,
            submittedAt: sub.submittedAt
          });
        });
        
        const groupedSubs = Object.values(groupedByStudent);
        setExamSubmissions(groupedSubs);
        
        if (submissionId) {
          const sub = groupedSubs.find(s => 
            s.id === submissionId || s.files.some(f => f.id === submissionId)
          );
          if (sub) {
            // Sadece öğrenci değiştiğinde veya sayfa ilk yüklendiğinde not alanlarını güncelle
            if (!currentSubmission || currentSubmission.studentId !== sub.studentId) {
              setCurrentSubmission(sub);
              setCurrentIndex(groupedSubs.findIndex(s => s.id === sub.id || s.files.some(f => f.id === submissionId)));
              setGrade(sub.grade?.toString() || '');
              setFeedback(sub.feedback || '');
              checkForDuplicates(sub); // İlk yüklemede kopya kontrolünü tetikle
            }
          }
        } else if (groupedSubs.length > 0) {
          if (!currentSubmission) {
            setCurrentSubmission(groupedSubs[0]);
            setGrade(groupedSubs[0].grade?.toString() || '');
            setFeedback(groupedSubs[0].feedback || '');
            checkForDuplicates(groupedSubs[0]); // İlk yüklemede kopya kontrolünü tetikle
          }
        }
      }
    }
  }, [examId, submissionId, exams, submissions]);

  const filteredSubmissions = examSubmissions.filter(s => {
    const matchesSearch = s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.studentNumber?.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'graded' && s.status === 'graded') ||
                         (filterStatus === 'ungraded' && s.status !== 'graded');
    const matchesClass = sidebarClassFilter === 'all' || s.studentClass === sidebarClassFilter;
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleSelectSubmission = (submission, index) => {
    setCurrentSubmission(submission);
    setCurrentIndex(index);
    setGrade(submission.grade?.toString() || '');
    setFeedback(submission.feedback || '');
    navigate(`/ogretmen/degerlendirme/${examId}/${submission.id}`, { replace: true });
    
    // Kopya kontrolu yap
    if (submission) {
      checkForDuplicates(submission);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleSelectSubmission(filteredSubmissions[currentIndex - 1], currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredSubmissions.length - 1) {
      handleSelectSubmission(filteredSubmissions[currentIndex + 1], currentIndex + 1);
    }
  };
  
  // Kopya kontrol fonksiyonu
  const checkForDuplicates = async (submission) => {
    // Tüm dosya hash'lerini topla
    const hashes = submission.files?.map(f => f.fileHash).filter(h => !!h) || [];
    
    if (hashes.length === 0) {
      setDuplicates([]);
      return;
    }
    
    setLoadingDuplicates(true);
    try {
      const allMatches = [];
      
      // Her bir dosya için kopya kontrolü yap
      for (const hash of hashes) {
        const response = await submissionApi.checkDuplicate(
          hash,
          submission.examId,
          submission.studentId
        );
        
        if (response.success && response.hasDuplicate && response.matches) {
          // Eşleşmeleri topla
          allMatches.push(...response.matches);
        }
      }
      
      // Tekilleştir (aynı öğrenci farklı dosyalarla eşleşmiş olabilir)
      const uniqueMatches = [];
      const seenIds = new Set();
      
      allMatches.forEach(match => {
        const key = `${match.studentNumber}-${match.fileName}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          uniqueMatches.push(match);
        }
      });
      
      setDuplicates(uniqueMatches);
    } catch (error) {
      console.error('Kopya kontrol hatası:', error);
      setDuplicates([]);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  const handleSaveGrade = async (notify = false) => {
    if (!currentSubmission || !grade) return;
    
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      toast.error('Not 0-100 arasında olmalıdır');
      return;
    }

    setSaving(true);
    try {
      // Not kaydet
      await gradeSubmission(currentSubmission.id, gradeNum, feedback);
      
      // Bildirimi oluştur (push notification ile)
      if (notify) {
        await createNotification({
          type: 'grade_published',
          title: 'Not Açıklandı',
          message: `${selectedExam?.title} için notunuz açıklandı: ${gradeNum}`,
          targetType: 'student',
          targetId: currentSubmission.studentId,
          relatedId: examId
        }, true); // showPush = true
      }

      // Local state güncelle
      const updatedSubs = examSubmissions.map(s => 
        s.id === currentSubmission.id 
          ? { ...s, grade: gradeNum, feedback, status: 'graded', gradedAt: new Date().toISOString() }
          : s
      );
      setExamSubmissions(updatedSubs);
      setCurrentSubmission({ ...currentSubmission, grade: gradeNum, feedback, status: 'graded' });
      
      // Başarı mesajı
      toast.success(notify ? 'Not kaydedildi ve öğrenciye bildirildi!' : 'Not başarıyla kaydedildi!');
      
      if (notify) {
        setShowFeedbackModal(true);
      }
    } catch (error) {
      console.error('Not kaydetme hatası:', error);
      toast.error('Not kaydedilemedi! Hata: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Düzenleme talebini onayla
  const handleApproveEditRequest = async (approved) => {
    if (!currentSubmission) return;
    const pendingRequest = currentSubmission.editRequests?.find(r => r.status === 'pending');
    if (!pendingRequest) return;

    setSaving(true);
    try {
      await respondToEditRequest(
        currentSubmission.id,
        pendingRequest.id,
        approved,
        null, // teacherId
        editRequestNote,
        10 // 10 dakika düzenleme süresi
      );

      await createNotification({
        type: approved ? 'edit_approved' : 'edit_rejected',
        title: approved ? 'Düzenleme Talebi Onaylandı' : 'Düzenleme Talebi Reddedildi',
        message: approved 
          ? `${selectedExam?.title} için düzenleme talebiniz onaylandı. 10 dakika içinde düzenleme yapabilirsiniz.`
          : `${selectedExam?.title} için düzenleme talebiniz reddedildi. ${editRequestNote}`,
        targetType: 'student',
        targetId: currentSubmission.studentId,
        relatedId: examId
      });

      toast.success(approved ? 'Düzenleme talebi onaylandı!' : 'Düzenleme talebi reddedildi!');
      setShowEditRequestModal(false);
      setEditRequestNote('');
      
      // Verileri yenile
      await loadSubmissions();
      const subs = submissions.filter(s => s.examId === examId);
      setExamSubmissions(subs);
    } catch (error) {
      toast.error('İşlem başarısız: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Bekleyen düzenleme talebi var mı?
  const getPendingEditRequest = (submission) => {
    return submission?.editRequests?.find(r => r.status === 'pending');
  };

  // Öğretmen direkt düzenleme izni ver
  const handleGrantEditPermission = () => {
    if (!currentSubmission) return;

    setConfirmModal({
      isOpen: true,
      title: 'Düzenleme İzni Verilsin mi?',
      message: '⚠️ DİKKAT!\n\nBu işlem öğrencinin yüklediği TÜM dosyaları silecek ve öğrenciye yeni dosya yükleme izni verecek.\n\nDevam etmek istiyor musunuz?',
      confirmText: 'Evet, İzin Ver',
      type: 'danger',
      onConfirm: async () => {
        // Modal'ı hemen kapat
        setShowGrantEditModal(false);
        setSaving(true);
        
        try {
          await submissionApi.grantEditPermission(
            currentSubmission.id,
            examId,
            currentSubmission.studentId,
            grantEditNote || 'Yanlış dosya yüklediniz, lütfen düzeltin.',
            null // teacherId
          );

          // Bildirim gönder
          await createNotification({
            type: 'edit_granted',
            title: t('notifEditGranted'),
            message: `${selectedExam?.title} ${t('notifEditGrantedMsg')}`,
            targetType: 'student',
            targetId: currentSubmission.studentId,
            relatedId: examId
          }, true);

          toast.success('Düzenleme izni verildi ve mevcut dosyalar silindi!');
          setGrantEditNote('');
          
          // Sayfayı yenile (F5)
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (error) {
          console.error('Düzenleme izni verme hatası:', error);
          toast.error('İşlem başarısız: ' + error.message);
          setSaving(false);
        }
      }
    });
  };

  const gradedCount = examSubmissions.filter(s => s.status === 'graded').length;
  const totalCount = examSubmissions.length;

  // Dosya URL'sini al
  const getFileUrl = (submission) => {
    if (!submission) return null;
    // Backend'den gelen filePath kullan
    if (submission.filePath) {
      // filePath zaten /uploads/ ile başlıyorsa direkt kullan
      return submission.filePath;
    }
    // Eski sistem - base64 fileData
    if (submission.fileData) {
      return submission.fileData;
    }
    return null;
  };

  // Dosya indirme fonksiyonu
  const handleDownloadFile = (file = null) => {
    const targetFile = file || previewFile || currentSubmission;
    const fileUrl = file ? file.filePath : (previewFile ? previewFile.filePath : getFileUrl(currentSubmission));
    if (!fileUrl) {
      console.error('Dosya bulunamadı');
      return;
    }
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = targetFile.fileName || 'dosya';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dosya önizleme - Modal aç
  const handlePreviewFile = (file = null) => {
    const targetFile = file || currentSubmission;
    
    if (!targetFile || (!targetFile.filePath && !targetFile.fileName)) {
      console.error('Dosya bulunamadı');
      return;
    }

    setPreviewFile({
      fileName: targetFile.fileName,
      filePath: targetFile.filePath || getFileUrl(targetFile),
      fileSize: targetFile.fileSize
    });
    
    setShowPreviewModal(true);
  };

  // Dosya tipini kontrol et
  const getFileType = (fileName) => {
    if (!fileName) return 'unknown';
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'document';
    return 'unknown';
  };

  // Sınav seçilmemişse - sınav listesi göster
  if (!examId) {
    const allExams = (exams || []).filter(exam => {
      const title = exam.title || '';
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === 'all' || 
                          (exam.targetType === 'all') ||
                          (exam.targetClasses && exam.targetClasses.includes(classFilter));
      const matchesType = typeFilter === 'all' ||
                         (typeFilter === 'exam' && (exam.type === 'exam' || exam.type === 'final_exam')) ||
                         (typeFilter === 'assignment' && (exam.type !== 'exam' && exam.type !== 'final_exam' && exam.type !== 'project')) ||
                         (exam.type === typeFilter);
      return matchesSearch && matchesClass && matchesType;
    }).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    return (
      <TeacherLayout>
        <div style={{ padding: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Değerlendirme
          </h1>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Değerlendirmek istediğiniz sınavı seçin
          </p>

          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(226, 232, 240, 0.8)', 
            borderRadius: '28px', 
            padding: '24px', 
            marginBottom: '32px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'sticky',
            top: '0',
            zIndex: '10'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)';
            e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
          }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1.5', minWidth: '300px' }}>
                <Input
                  placeholder="Sınav adı ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={Search}
                  style={{ 
                    backgroundColor: '#f8fafc',
                    border: '2px solid #f1f5f9',
                    height: '52px',
                    borderRadius: '16px',
                    fontSize: '15px'
                  }}
                />
              </div>
              
              <div style={{ 
                flex: '1', 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center',
                minWidth: '320px'
              }}>
                <Select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  icon={Users}
                  style={{ height: '52px', borderRadius: '16px', border: '2px solid #f1f5f9' }}
                  placeholder="Seç"
                >
                  <option value="all">Tüm Sınıflar</option>
                  {CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>

                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  icon={Filter}
                  style={{ height: '52px', borderRadius: '16px', border: '2px solid #f1f5f9' }}
                  placeholder="Kategori"
                >
                  <option value="all">Kategoriler</option>
                  <option value="exam">Sınavlar</option>
                  <option value="assignment">Ödevler</option>
                  <option value="project">Projeler</option>
                </Select>

                {(searchQuery || classFilter !== 'all' || typeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setClassFilter('all');
                      setTypeFilter('all');
                    }}
                    style={{
                      padding: '0 16px',
                      height: '52px',
                      borderRadius: '16px',
                      border: '2px solid #fee2e2',
                      backgroundColor: '#fef2f2',
                      color: '#ef4444',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  >
                    <X size={18} />
                    Temizle
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {allExams.length === 0 ? (
            <div style={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center'
            }}>
              <AlertTriangle style={{ width: '48px', height: '48px', color: '#f59e0b', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                Aranan Kriterlere Uygun Sınav Bulunamadı
              </h3>
              <p style={{ color: '#64748b', marginBottom: '16px' }}>
                Filtreleri temizleyerek veya farklı bir arama yaparak tekrar deneyin.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setClassFilter('all');
                  setTypeFilter('all');
                }}
              >
                Filtreleri Temizle
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {allExams.map(exam => {
                const examSubs = submissions.filter(s => s.examId === exam.id && s.status !== 'edit_granted');
                const uniqueStudents = new Set(examSubs.map(s => s.studentId));
                const submissionCount = uniqueStudents.size;
                const gradedCount = new Set(examSubs.filter(s => s.status === 'graded').map(s => s.studentId)).size;
                
                return (
                  <div
                    key={exam.id}
                    onClick={() => navigate(`/ogretmen/degerlendirme/${exam.id}`)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '28px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
                      }}>
                        <FileText size={28} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                          {exam.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '12px', fontWeight: '600', color: '#64748b', 
                            backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '8px'
                          }}>
                            {exam.targetClasses?.join(', ') || 'Tüm sınıflar'}
                          </span>
                          <span style={{ 
                            fontSize: '12px', fontWeight: '750', color: '#2563eb', 
                            backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '8px',
                            textTransform: 'uppercase', letterSpacing: '0.02em'
                          }}>
                            {(exam.type === 'exam' || exam.type === 'final_exam') ? 'Sınav' : 'Ödev'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center', padding: '0 16px', borderRight: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', lineHeight: 1, marginBottom: '4px' }}>
                          {submissionCount}
                        </p>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Gönderim</p>
                      </div>
                      <div style={{ textAlign: 'center', padding: '0 16px' }}>
                        <p style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', lineHeight: 1, marginBottom: '4px' }}>
                          {gradedCount}
                        </p>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Değerlendirildi</p>
                      </div>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
                        marginLeft: '8px'
                      }}>
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </TeacherLayout>
    );
  }

  if (!selectedExam) {
    return (
      <TeacherLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <div style={{ textAlign: 'center' }}>
            <AlertTriangle style={{ width: '48px', height: '48px', color: '#f59e0b', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#1e293b' }}>Sınav Bulunamadı</h3>
            <button 
              style={styles.saveButton}
              onClick={() => navigate('/ogretmen/aktif-sinavlar')}
            >
              Aktif Sınavlara Dön
            </button>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div style={styles.container}>
        {/* Sol Panel - Gönderim Listesi */}
        <div style={styles.sidebar}>
          {/* Başlık */}
          <div style={styles.sidebarHeader}>
            <button 
              style={styles.backButton}
              onClick={() => navigate('/ogretmen/aktif-sinavlar')}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Geri
            </button>
            <h2 style={styles.examTitle}>{selectedExam.title}</h2>
            <div style={styles.badgeRow}>
              <span style={styles.badge((selectedExam.type === 'exam' || selectedExam.type === 'final_exam') ? 'primary' : 'secondary')}>
                {(selectedExam.type === 'exam' || selectedExam.type === 'final_exam') ? 'Sınav' : 'Ödev'}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {gradedCount}/{totalCount} Değerlendirildi
              </span>
            </div>
          </div>

          {/* Arama & Filtre */}
          <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
            <div style={{ marginBottom: '12px' }}>
              <Input
                placeholder="Öğrenci ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
                style={{ height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                icon={Filter}
                style={{ height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                placeholder="Durum"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="graded">Puanlanan</option>
                <option value="ungraded">Puanlanmayan</option>
              </Select>

              <Select
                value={sidebarClassFilter}
                onChange={(e) => setSidebarClassFilter(e.target.value)}
                icon={Users}
                style={{ height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                placeholder="Sınıf"
              >
                <option value="all">Sınıflar</option>
                {CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>

          {/* Gönderim Listesi */}
          <div style={styles.submissionList}>
            {filteredSubmissions.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                Gönderim bulunamadı
              </div>
            ) : (
              filteredSubmissions.map((submission, index) => {
                const hasPendingRequest = getPendingEditRequest(submission);
                return (
                <div
                  key={submission.id}
                  style={styles.submissionItem(currentSubmission?.id === submission.id)}
                  onClick={() => handleSelectSubmission(submission, index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={styles.studentName}>
                        {submission.studentName}
                        {hasPendingRequest && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}>
                            TALEP
                          </span>
                        )}
                      </p>
                      <p style={styles.studentNumber}>{submission.studentNumber}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Kopya Göstergesi */}
                      {allDuplicates.some(dup => 
                        dup.students.some(s => s.studentNumber === submission.studentNumber)
                      ) && (
                        <div 
                          title="Potansiyel Kopya"
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#fee2e2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444'
                          }}
                        >
                          <Copy size={14} />
                        </div>
                      )}
                      
                      {submission.status === 'graded' ? (
                        <div style={{ textAlign: 'center' }}>
                          <p style={styles.gradeDisplay}>{submission.grade}</p>
                          <Check style={{ width: '16px', height: '16px', color: '#10b981', margin: '0 auto' }} />
                        </div>
                      ) : (
                        <span style={styles.badge('warning')}>Bekliyor</span>
                      )}
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

        {/* Ana İçerik - Değerlendirme */}
        <div style={styles.mainContent}>
          {currentSubmission ? (
            <>
              {/* Üst Bar */}
              <div style={styles.topBar}>
                <div style={styles.navButtons}>
                  <button 
                    style={{ ...styles.navButton, opacity: currentIndex === 0 ? 0.5 : 1 }}
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                  >
                    <ArrowLeft style={{ width: '16px', height: '16px' }} />
                  </button>
                  <span style={styles.navText}>
                    {currentIndex + 1} / {filteredSubmissions.length}
                  </span>
                  <button 
                    style={{ ...styles.navButton, opacity: currentIndex === filteredSubmissions.length - 1 ? 0.5 : 1 }}
                    onClick={handleNext}
                    disabled={currentIndex === filteredSubmissions.length - 1}
                  >
                    <ArrowRight style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>

                <button style={styles.downloadButton} onClick={handleDownloadFile}>
                  <Download style={{ width: '16px', height: '16px' }} />
                  İndir
                </button>
              </div>

              {/* İçerik Alanı */}
              <div style={styles.contentArea}>
                {/* Dosya Önizleme */}
                <div style={styles.filePreview}>
                  {/* Kopya Uyarısı */}
                  {duplicates.length > 0 && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      border: '2px solid #fca5a5',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#dc2626',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Copy style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#991b1b', margin: 0 }}>
                            ⚠️ Potansiyel Kopya!
                          </h4>
                          <p style={{ fontSize: '13px', color: '#b91c1c', margin: '4px 0 0 0' }}>
                            Dosya içerikleri {duplicates.length} farklı öğrenciyle eşleşiyor
                          </p>
                        </div>
                      </div>
                      <div style={{ 
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        padding: '12px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        {duplicates.map((dup, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: '#fef2f2',
                            borderRadius: '6px',
                            marginBottom: idx < duplicates.length - 1 ? '8px' : 0,
                            border: '1px solid #fecaca'
                          }}>
                            <div>
                              <p style={{ fontWeight: '600', color: '#991b1b', margin: 0, fontSize: '14px' }}>
                                {dup.studentName} ({dup.fileName})
                              </p>
                              <p style={{ fontSize: '12px', color: '#b91c1c', margin: '2px 0 0 0' }}>
                                {dup.studentNumber} • {formatDate(dup.submittedAt)}
                              </p>
                              <p style={{ fontSize: '10px', color: '#ef4444', fontFamily: 'monospace', marginTop: '4px', opacity: 0.8 }}>
                                Hash: {dup.fileHash}
                              </p>
                            </div>
                            <div style={{
                              padding: '4px 10px',
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              %{dup.similarity || 100}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div style={styles.previewCard}>
                    <div style={styles.previewHeader}>
                      <h3 style={styles.previewTitle}>Gönderilen Dosya</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FolderOpen style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                        <span style={{ fontSize: '13px', color: '#3b82f6' }}>
                          {currentSubmission.folderPath}
                        </span>
                      </div>
                    </div>
                    
                    <div style={styles.fileList}>
                      {currentSubmission.files && currentSubmission.files.length > 0 ? (
                        currentSubmission.files.map((file, index) => {
                          const isDuplicate = duplicates.some(d => d.fileHash === file.fileHash);
                          return (
                          <div 
                            key={file.id || index} 
                            style={{
                              ...styles.fileItem, 
                              marginBottom: index < currentSubmission.files.length - 1 ? '12px' : 0,
                              border: isDuplicate ? '2px solid #ef4444' : styles.fileItem.border,
                              backgroundColor: isDuplicate ? '#fff5f5' : styles.fileItem.backgroundColor
                            }}
                          >
                            <div style={styles.fileInfo}>
                              <div style={styles.fileIcon}>
                                <FileText style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={styles.fileName}>{file.fileName}</p>
                                <p style={styles.fileSize}>
                                  {formatFileSize(file.fileSize)} • {formatDate(file.submittedAt)}
                                </p>
                                {file.fileHash && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginTop: '6px',
                                    padding: '6px 10px',
                                    backgroundColor: isDuplicate ? '#fee2e2' : '#f1f5f9',
                                    borderRadius: '6px',
                                    border: isDuplicate ? '1px solid #fca5a5' : '1px solid #e2e8f0'
                                  }}>
                                    <Copy style={{ width: '12px', height: '12px', color: isDuplicate ? '#991b1b' : '#64748b', flexShrink: 0 }} />
                                    <span style={{
                                      fontSize: '11px',
                                      color: isDuplicate ? '#991b1b' : '#64748b',
                                      fontFamily: 'monospace',
                                      wordBreak: 'break-all',
                                      lineHeight: '1.4'
                                    }}>
                                      {file.fileHash}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={styles.fileActions}>
                              <button style={styles.actionButton} onClick={() => handlePreviewFile(file)}>
                                <Eye style={{ width: '14px', height: '14px' }} />
                                Önizle
                              </button>
                              <button style={styles.actionButton} onClick={() => handleDownloadFile(file)}>
                                <Download style={{ width: '14px', height: '14px' }} />
                                İndir
                              </button>
                            </div>
                          </div>
                          );
                        })
                      ) : currentSubmission.fileName ? (
                        <div style={{
                          ...styles.fileItem,
                          border: duplicates.some(d => d.fileHash === currentSubmission.fileHash) ? '2px solid #ef4444' : styles.fileItem.border,
                          backgroundColor: duplicates.some(d => d.fileHash === currentSubmission.fileHash) ? '#fff5f5' : styles.fileItem.backgroundColor
                        }}>
                          <div style={styles.fileInfo}>
                            <div style={styles.fileIcon}>
                              <FileText style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={styles.fileName}>{currentSubmission.fileName}</p>
                              <p style={styles.fileSize}>
                                {formatFileSize(currentSubmission.fileSize)} • {formatDate(currentSubmission.submittedAt)}
                              </p>
                              {currentSubmission.fileHash && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  marginTop: '6px',
                                  padding: '6px 10px',
                                  backgroundColor: duplicates.some(d => d.fileHash === currentSubmission.fileHash) ? '#fee2e2' : '#f1f5f9',
                                  borderRadius: '6px',
                                  border: duplicates.some(d => d.fileHash === currentSubmission.fileHash) ? '1px solid #fca5a5' : '1px solid #e2e8f0'
                                }}>
                                  <Copy style={{ width: '12px', height: '12px', color: '#64748b', flexShrink: 0 }} />
                                  <span style={{
                                    fontSize: '11px',
                                    color: '#64748b',
                                    fontFamily: 'monospace',
                                    wordBreak: 'break-all',
                                    lineHeight: '1.4'
                                  }}>
                                    {currentSubmission.fileHash}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={styles.fileActions}>
                            <button style={styles.actionButton} onClick={handlePreviewFile}>
                              <Eye style={{ width: '14px', height: '14px' }} />
                              Önizle
                            </button>
                            <button style={styles.actionButton} onClick={handleDownloadFile}>
                              <Download style={{ width: '14px', height: '14px' }} />
                              İndir
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={styles.emptyState}>
                          <FileText style={{ width: '48px', height: '48px', opacity: 0.5, marginBottom: '8px' }} />
                          <p>Dosya bulunamadı</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Not Verme Paneli */}
                <div style={styles.gradingPanel}>
                  {/* Öğrenci Bilgileri */}
                  <div style={styles.studentInfoSection}>
                    <h3 style={styles.sectionTitle}>Öğrenci Bilgileri</h3>
                    <div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Ad Soyad:</span>
                        <span style={styles.infoValue}>{currentSubmission.studentName || currentSubmission.studentNumber || 'Bilinmiyor'}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Numara:</span>
                        <span style={styles.infoValue}>{currentSubmission.studentNumber}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Sınıf:</span>
                        <span style={styles.infoValue}>{currentSubmission.studentClass}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Gönderim:</span>
                        <span style={styles.infoValue}>{formatDate(currentSubmission.submittedAt)}</span>
                      </div>
                      {currentSubmission.isLate && (
                        <span style={styles.badge('warning')}>Geç Gönderim</span>
                      )}
                    </div>
                    <div style={styles.folderPath}>
                      <FolderOpen style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px' }} />
                      {currentSubmission.folderPath}
                    </div>
                  </div>

                  {/* Not Girişi */}
                  <div style={styles.gradingSection}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={styles.inputLabel}>Not (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        style={styles.gradeInput}
                      />
                    </div>

                    <div>
                      <label style={styles.inputLabel}>Geri Bildirim</label>
                      <textarea
                        placeholder="Öğrenciye geri bildirim yazın..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        style={styles.feedbackArea}
                      />
                    </div>
                  </div>

                  {/* Düzenleme Talebi Bildirimi */}
                  {getPendingEditRequest(currentSubmission) && (
                    <div style={{
                      margin: '0 16px 16px',
                      padding: '12px 16px',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fcd34d',
                      borderRadius: '10px'
                    }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                        ⚠️ Düzenleme Talebi Bekliyor
                      </p>
                      <p style={{ fontSize: '12px', color: '#78350f', marginBottom: '12px' }}>
                        {getPendingEditRequest(currentSubmission)?.reason}
                      </p>
                      <button
                        onClick={() => setShowEditRequestModal(true)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#f59e0b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Talebi Değerlendir
                      </button>
                    </div>
                  )}

                  {/* Eylemler */}
                  <div style={styles.actionSection}>
                    <button 
                      style={{ ...styles.saveButton, opacity: saving || !grade ? 0.5 : 1 }}
                      onClick={() => handleSaveGrade(false)}
                      disabled={saving || !grade}
                    >
                      <Save style={{ width: '16px', height: '16px' }} />
                      Kaydet
                    </button>
                    <button 
                      style={{ ...styles.secondaryButton, opacity: saving || !grade ? 0.5 : 1 }}
                      onClick={() => handleSaveGrade(true)}
                      disabled={saving || !grade}
                    >
                      <Send style={{ width: '16px', height: '16px' }} />
                      Kaydet ve Bildir
                    </button>
                    <button 
                      style={{ 
                        ...styles.secondaryButton, 
                        backgroundColor: '#fef3c7',
                        borderColor: '#fcd34d',
                        color: '#92400e',
                        marginTop: '8px',
                        opacity: saving ? 0.5 : 1
                      }}
                      onClick={() => setShowGrantEditModal(true)}
                      disabled={saving}
                    >
                      <AlertTriangle style={{ width: '16px', height: '16px' }} />
                      Düzenleme İzni Ver
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <FileText style={{ width: '64px', height: '64px', opacity: 0.5, marginBottom: '16px' }} />
              <p style={{ fontSize: '16px' }}>Değerlendirmek için bir gönderim seçin</p>
            </div>
          )}
        </div>
      </div>

      {/* Başarı Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Not Kaydedildi"
      >
        <div style={{ textAlign: 'center', padding: '16px' }}>
          <Check style={{ width: '64px', height: '64px', color: '#10b981', margin: '0 auto 16px' }} />
          <p style={{ color: '#1e293b', marginBottom: '16px' }}>
            Not başarıyla kaydedildi ve öğrenciye bildirildi.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button style={styles.secondaryButton} onClick={() => setShowFeedbackModal(false)}>
              Bu Öğrencide Kal
            </button>
            <button 
              style={styles.saveButton}
              onClick={() => {
                setShowFeedbackModal(false);
                handleNext();
              }}
            >
              Sonrakine Geç
            </button>
          </div>
        </div>
      </Modal>

      {/* Dosya Önizleme Modal */}
      {showPreviewModal && previewFile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '1200px',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                  {previewFile.fileName}
                </h3>
                {currentSubmission && (
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    {currentSubmission.studentName} • {currentSubmission.studentNumber}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleDownloadFile(previewFile)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  İndir
                </button>
                <button
                  onClick={() => window.open(previewFile.filePath, '_blank')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Yeni Sekmede Aç
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewFile(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              backgroundColor: '#f8fafc',
              overflow: 'auto'
            }}>
              {getFileType(previewFile.fileName) === 'image' ? (
                <img
                  src={previewFile.filePath}
                  alt={previewFile.fileName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
              ) : getFileType(previewFile.fileName) === 'pdf' ? (
                <iframe
                  src={previewFile.filePath}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                  title={previewFile.fileName}
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <FileText style={{ width: '80px', height: '80px', color: '#94a3b8', marginBottom: '16px' }} />
                  <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '16px' }}>
                    Bu dosya türü önizlenemiyor
                  </p>
                  <button
                    onClick={() => handleDownloadFile(previewFile)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <Download style={{ width: '18px', height: '18px' }} />
                    Dosyayı İndir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {showEditRequestModal && currentSubmission && getPendingEditRequest(currentSubmission) && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>
              Düzenleme Talebi
            </h3>
            
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                {currentSubmission.studentName} - {currentSubmission.studentNumber}
              </p>
              <p style={{ fontSize: '14px', color: '#78350f' }}>
                <strong>Sebep:</strong> {getPendingEditRequest(currentSubmission)?.reason}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '8px', display: 'block' }}>
                Not (opsiyonel)
              </label>
              <textarea
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#1e293b',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Öğrenciye iletilecek not..."
                value={editRequestNote}
                onChange={(e) => setEditRequestNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowEditRequestModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                İptal
              </button>
              <button
                onClick={() => handleApproveEditRequest(false)}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Reddet
              </button>
              <button
                onClick={() => handleApproveEditRequest(true)}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Düzenleme İzni Ver Modal */}
      {showGrantEditModal && currentSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '520px',
            width: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
              ⚠️ Düzenleme İzni Ver
            </h3>

            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                {currentSubmission.studentName} - {currentSubmission.studentNumber}
              </p>
              <p style={{ fontSize: '13px', color: '#78350f', marginBottom: '8px' }}>
                <strong>DİKKAT:</strong> Bu işlem öğrencinin yüklediği TÜM dosyaları kalıcı olarak silecek!
              </p>
              <p style={{ fontSize: '13px', color: '#78350f' }}>
                Öğrenci yeni dosya yükleyebilecek.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '8px', display: 'block' }}>
                Öğrenciye Not
              </label>
              <textarea
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#1e293b',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Örn: Yanlış dosya yüklediniz, lütfen düzeltin..."
                value={grantEditNote}
                onChange={(e) => setGrantEditNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowGrantEditModal(false);
                  setGrantEditNote('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                İptal
              </button>
              <button
                onClick={handleGrantEditPermission}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  opacity: saving ? 0.5 : 1
                }}
              >
                {saving ? 'İşleniyor...' : 'İzni Ver ve Dosyaları Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </TeacherLayout>
  );
};

export default Evaluate;
