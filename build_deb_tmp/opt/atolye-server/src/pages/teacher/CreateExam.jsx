import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  Clock,
  Settings,
  Users,
  Bell,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Upload,
  Download
} from 'lucide-react';
import { TeacherLayout } from '../../components/layouts';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore, CLASS_LIST } from '../../store/authStore';
import { useExamStore } from '../../store/examStore';
import { useNotificationStore } from '../../store/notificationStore';
import { ALLOWED_FORMATS } from '../../utils/fileHelpers';

const EXAM_TYPES = [
  { value: 'final_exam', label: 'Sınav' },
  { value: 'exam', label: 'Klasik Sınav (Dosya)' },
  { value: 'quiz', label: 'Çoktan Seçmeli (Otomatik Notlandırma)' },
  { value: 'homework', label: 'Ödev' },
  { value: 'project', label: 'Proje' }
];

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '15px',
  },
  stepsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    padding: '0 16px',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  stepCircle: (active, completed) => ({
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: completed || active ? '#0d9488' : '#f1f5f9',
    color: completed || active ? '#ffffff' : '#94a3b8',
    transition: 'all 0.3s ease',
    border: active ? '2px solid #0d9488' : 'none',
  }),
  stepLabel: (active) => ({
    fontSize: '12px',
    fontWeight: '500',
    color: active ? '#0d9488' : '#94a3b8',
    textAlign: 'center',
    maxWidth: '70px',
  }),
  stepLine: (completed) => ({
    flex: 1,
    height: '2px',
    margin: '0 8px',
    backgroundColor: completed ? '#0d9488' : '#e2e8f0',
    borderRadius: '2px',
    marginTop: '-30px',
  }),
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '32px',
    marginBottom: '24px',
    minHeight: '400px',
    boxShadow: 'none',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  radioOption: (selected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: selected ? '#f0fdfa' : '#f8fafc',
    border: `1px solid ${selected ? '#0d9488' : '#e2e8f0'}`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  radioInput: {
    width: '18px',
    height: '18px',
    accentColor: '#0d9488',
  },
  radioLabel: {
    flex: 1,
  },
  radioTitle: {
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: '4px',
  },
  radioDesc: {
    fontSize: '13px',
    color: '#64748b',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
  },
  checkboxOption: (selected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: selected ? '#f0fdfa' : '#f8fafc',
    border: `1px solid ${selected ? '#0d9488' : '#e2e8f0'}`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#0d9488',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  rangeContainer: {
    marginTop: '16px',
  },
  rangeValue: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: '600',
    color: '#0d9488',
    marginBottom: '12px',
  },
  range: {
    width: '100%',
    height: '8px',
    accentColor: '#0d9488',
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '8px',
  },
  summarySection: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid #e2e8f0',
  },
  summaryTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: '14px',
  },
  summaryValue: {
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: '500',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '16px',
  },
  button: (variant) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    border: variant === 'ghost' ? '1px solid #e2e8f0' : 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: variant === 'primary' ? '#0d9488' : variant === 'success' ? '#10b981' : variant === 'danger' ? '#ef4444' : variant === 'ghost' ? '#ffffff' : 'transparent',
    color: variant === 'ghost' ? '#64748b' : '#ffffff',
  }),
  classGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  notificationSettings: {
    paddingLeft: '20px',
    borderLeft: '3px solid #0d9488',
    marginTop: '16px',
  },
  questionCard: {
    border: '1px solid #e2e8f0',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
};

const CreateExam = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getAllStudents, students } = useAuthStore();
  const { createExam, updateExam } = useExamStore();
  const { createExamNotification } = useNotificationStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [studentClassFilter, setStudentClassFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'exam',
    department: user?.department || '',
    description: '',
    instructions: '',
    startType: 'now',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    duration: 60,
    allowedFormats: ['pdf'],
    maxFileSize: 10,
    maxFileSize: 10,
    multipleFiles: false,
    maxFileCount: 1,
    questionText: '',
    questionFile: null,
    requireFileUpload: true,
    targetType: 'all',
    targetClasses: [],
    targetStudents: [],
    sendNotification: true,
    notifyOnStart: true,
    notifyBefore30: true,
    notifyBefore5: true,
    questions: [], // Quiz soruları
    isQuiz: false,
    autoGrading: true,
    preventLeaveFullScreen: false,
    disableShortcuts: false
  });

  const steps = [
    { number: 1, title: 'Temel Bilgiler', icon: FileText },
    { number: 2, title: 'Zamanlama', icon: Clock },
    { number: 3, title: formData.type === 'quiz' ? 'Siz Hazırlayın' : 'Dosya Ayarları', icon: formData.type === 'quiz' ? HelpCircle : Settings },
    { number: 4, title: 'Öğrenci Seçimi', icon: Users },
    { number: 5, title: 'Güvenlik ve Bildirimler', icon: Bell },
    { number: 6, title: 'Özet', icon: Check }
  ];

  // Otomatik tarih ayarlama fonksiyonu
  const setQuickStartTimes = () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + formData.duration * 60000); // duration dakika sonra

    // Local timezone'a göre tarih ve saat formatla
    const year = endTime.getFullYear();
    const month = String(endTime.getMonth() + 1).padStart(2, '0');
    const day = String(endTime.getDate()).padStart(2, '0');
    const hours = String(endTime.getHours()).padStart(2, '0');
    const minutes = String(endTime.getMinutes()).padStart(2, '0');

    const endDateStr = `${year}-${month}-${day}`;
    const endTimeStr = `${hours}:${minutes}`;

    handleChange('endDate', endDateStr);
    handleChange('endTime', endTimeStr);

    // Kullanıcıya bilgi ver
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const endDateDisplay = `${endTime.getDate()} ${months[endTime.getMonth()]}`;
    const endTimeDisplay = endTimeStr;

    toast.success(`✅ Sistem otomatik olarak ${endDateDisplay} saat ${endTimeDisplay}'e ayarladı (${formData.duration} dakika)`, {
      duration: 5000
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Sınav tipi quiz seçilirse isQuiz flag'ini aç
      if (field === 'type') {
        newData.isQuiz = value === 'quiz';
        // Quiz ise varsayılan bir soru ekle boşsa
        if (value === 'quiz' && newData.questions.length === 0) {
          newData.questions = [{
            id: Date.now(),
            text: '',
            options: ['', '', '', ''],
            correctIndex: 0,
            points: 10
          }];
        }
      }

      return newData;
    });

    // startType 'now' seçildiğinde otomatik bitiş tarihi ayarla
    if (field === 'startType' && value === 'now') {
      setTimeout(setQuickStartTimes, 100);
    }

    // duration değiştiğinde ve startType 'now' ise bitiş tarihini güncelle
    if (field === 'duration' && formData.startType === 'now') {
      setTimeout(() => {
        const now = new Date();
        const endTime = new Date(now.getTime() + value * 60000);

        // Local timezone'a göre tarih ve saat formatla
        const year = endTime.getFullYear();
        const month = String(endTime.getMonth() + 1).padStart(2, '0');
        const day = String(endTime.getDate()).padStart(2, '0');
        const hours = String(endTime.getHours()).padStart(2, '0');
        const minutes = String(endTime.getMinutes()).padStart(2, '0');

        const endDateStr = `${year}-${month}-${day}`;
        const endTimeStr = `${hours}:${minutes}`;

        setFormData(prev => ({ ...prev, endDate: endDateStr, endTime: endTimeStr }));
      }, 100);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title) {
          toast.error('Sınav adı gerekli');
          return false;
        }
        break;
      case 2:
        if (!formData.endDate || !formData.endTime) {
          toast.error('Bitiş tarihi ve saati gerekli');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    let startDate;
    if (formData.startType === 'now') {
      startDate = new Date().toISOString();
    } else {
      startDate = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
    }
    const endDate = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

    const examData = {
      title: formData.title,
      type: formData.type,
      department: formData.department,
      description: formData.description,
      instructions: formData.instructions,
      startDate,
      endDate,
      allowedFormats: formData.allowedFormats,
      allowedFileTypes: formData.allowedFormats.flatMap(format => ALLOWED_FORMATS[format]?.extensions || []),
      maxFileSize: formData.maxFileSize * 1024 * 1024, // MB to Bytes
      multipleFiles: formData.multipleFiles,
      maxFileCount: formData.multipleFiles ? formData.maxFileCount : 1,
      targetType: formData.targetType,
      targetClasses: formData.targetClasses,
      targetStudents: formData.targetStudents,
      createdBy: user?.id,
      teacherName: user?.fullName,
      questions: formData.type === 'quiz' ? formData.questions : [],
      isQuiz: formData.type === 'quiz',
      autoGrading: formData.type === 'quiz' ? formData.autoGrading : undefined,
      questionText: formData.type !== 'quiz' ? formData.questionText : undefined,
      requireFileUpload: formData.type !== 'quiz' ? formData.requireFileUpload : undefined,
      preventLeaveFullScreen: formData.preventLeaveFullScreen,
      disableShortcuts: formData.disableShortcuts,

      // Bildirim tercihleri
      sendNotification: formData.sendNotification,
      notifyOnStart: formData.sendNotification ? formData.notifyOnStart : false,
      notifyBefore30: formData.sendNotification ? formData.notifyBefore30 : false,
      notifyBefore5: formData.sendNotification ? formData.notifyBefore5 : false,
      notificationsSent: {
        start: false,
        before30: false,
        before5: false
      }
    };

    const exam = await createExam(examData);

    if (exam && formData.type !== 'quiz' && formData.questionFile) {
      try {
        const formDataPayload = new FormData();
        formDataPayload.append('file', formData.questionFile);
        formDataPayload.append('folderPath', `exams/${exam.id}`);
        formDataPayload.append('examId', exam.id);
        formDataPayload.append('studentId', 'teacher');

        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formDataPayload,
        });

        const uploadData = await response.json();
        if (uploadData.success) {
          await updateExam(exam.id, { questionFileUrl: uploadData.file.filePath, originalFileName: formData.questionFile.name });
        }
      } catch (err) {
        console.error('Soru dosyası yükleme hatası:', err);
        toast.error('Soru dosyası yüklenemedi ama sınav oluşturuldu.');
      }
    }

    if (formData.sendNotification && exam) {
      // Hedef öğrencileri belirle
      let targetStudentIds = [];

      if (formData.targetType === 'all') {
        // Tüm öğrenciler
        targetStudentIds = students.map(s => s.id);
      } else if (formData.targetType === 'class') {
        // Seçili sınıflardaki öğrenciler
        targetStudentIds = students
          .filter(s => formData.targetClasses.includes(s.className))
          .map(s => s.id);
      } else if (formData.targetType === 'custom') {
        // Özel seçili öğrenciler
        targetStudentIds = formData.targetStudents;
      }

      // exam objesi veya examData kullan (title'ı garanti et)
      const notificationData = exam || { ...examData, title: formData.title };
      await createExamNotification(notificationData, 'new_exam', targetStudentIds);
    }

    toast.success('Sınav başarıyla oluşturuldu!');
    navigate('/ogretmen/aktif-sinavlar');
  };

  // Soru işlemleri
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      points: 10
    };
    handleChange('questions', [...formData.questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    const newQuestions = formData.questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    );
    handleChange('questions', newQuestions);
  };

  const removeQuestion = (id) => {
    if (formData.questions.length <= 1) {
      toast.error('En az bir soru olmalıdır');
      return;
    }
    const newQuestions = formData.questions.filter(q => q.id !== id);
    handleChange('questions', newQuestions);
  };

  const updateOption = (qId, oIdx, val) => {
    const newQuestions = formData.questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[oIdx] = val;
        return { ...q, options: newOptions };
      }
      return q;
    });
    handleChange('questions', newQuestions);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (Array.isArray(json)) {
          const importedQuestions = json.map((q, idx) => ({
            id: Date.now() + idx,
            text: q.text || '',
            options: q.options || ['', '', '', ''],
            correctIndex: q.correctIndex !== undefined ? q.correctIndex : 0,
            points: q.points || 10
          }));
          const existingQuestions = formData.questions.filter(q => q.text !== '' || q.options.some(o => o !== '')); // Boş default soruyu temizle
          handleChange('questions', [...existingQuestions, ...importedQuestions]);
          toast.success(`${importedQuestions.length} soru başarıyla içe aktarıldı.`);
        } else {
          toast.error('Geçersiz format. Lütfen örnek JSON formatını kullanın.');
        }
      } catch (error) {
        toast.error('JSON dosyası okunamadı veya hatalı formatta.');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const downloadSampleJSON = () => {
    const sample = [
      {
        "text": "Dünyanın tek doğal uydusu nedir?",
        "options": ["Güneş", "Ay", "Mars", "Venüs"],
        "correctIndex": 1,
        "points": 10
      },
      {
        "text": "Hangi programlama dili web geliştirme için standarttır?",
        "options": ["Python", "C++", "JavaScript", "Java"],
        "correctIndex": 2,
        "points": 10
      }
    ];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sample, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ornek_sorular.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // const students = getAllStudents(); // Redundant, already destructured from store

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Sınav Adı *</label>
              <input
                type="text"
                style={styles.input}
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Örn: Vize Sınavı"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Sınav Tipi</label>
              <select
                style={styles.select}
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                {EXAM_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {formData.type === 'quiz' && (
              <div style={{ ...styles.formGroup, backgroundColor: '#f0fdfa', padding: '16px', borderRadius: '12px', border: '1px solid #ccfbf1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.autoGrading}
                    onChange={(e) => handleChange('autoGrading', e.target.checked)}
                    style={styles.checkbox}
                  />
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '500', color: '#0f766e', display: 'block' }}>Otomatik Notlandırma</span>
                    <span style={{ fontSize: '13px', color: '#0d9488' }}>Sistem, test sonuçlarını anında notlandırır. Kapatırsanız tüm testler öğretmen değerlendirmesine düşer.</span>
                  </div>
                </label>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Ders/Bölüm</label>
              <input
                type="text"
                style={styles.input}
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="Örn: Siber Güvenlik"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Açıklama</label>
              <textarea
                style={styles.textarea}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Sınav hakkında kısa açıklama..."
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Talimatlar</label>
              <textarea
                style={{ ...styles.textarea, minHeight: '120px' }}
                value={formData.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="Öğrenciler için talimatlar..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Başlangıç Zamanı</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioOption(formData.startType === 'now')}>
                  <input
                    type="radio"
                    name="startType"
                    value="now"
                    checked={formData.startType === 'now'}
                    onChange={(e) => handleChange('startType', e.target.value)}
                    style={styles.radioInput}
                  />
                  <div style={styles.radioLabel}>
                    <div style={styles.radioTitle}>Hemen Başlat</div>
                    <div style={styles.radioDesc}>Sınav kaydedilir kaydedilmez başlar</div>
                  </div>
                </label>
                <label style={styles.radioOption(formData.startType === 'scheduled')}>
                  <input
                    type="radio"
                    name="startType"
                    value="scheduled"
                    checked={formData.startType === 'scheduled'}
                    onChange={(e) => handleChange('startType', e.target.value)}
                    style={styles.radioInput}
                  />
                  <div style={styles.radioLabel}>
                    <div style={styles.radioTitle}>Planlı Başlat</div>
                    <div style={styles.radioDesc}>Belirlenen tarih ve saatte başlar</div>
                  </div>
                </label>
              </div>

              {formData.startType === 'scheduled' && (
                <div style={{ ...styles.gridTwo, marginTop: '16px' }}>
                  <div>
                    <label style={styles.label}>Başlangıç Tarihi</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Başlangıç Saati</label>
                    <input
                      type="time"
                      style={styles.input}
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {formData.startType === 'now' && (
                <div style={{
                  backgroundColor: '#dbeafe',
                  padding: '16px',
                  borderRadius: '12px',
                  marginTop: '16px',
                  border: '1px solid #93c5fd'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Clock size={20} color="#2563eb" />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                      🚀 Sınav Süresi Seçimi
                    </span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ ...styles.label, marginBottom: '8px' }}>Sınav Süresi (dakika)</label>
                    <input
                      type="number"
                      min="10"
                      max="240"
                      style={styles.input}
                      value={formData.duration}
                      onChange={(e) => handleChange('duration', parseInt(e.target.value) || 60)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[30, 45, 60, 90, 120].map(minutes => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => handleChange('duration', minutes)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: formData.duration === minutes ? '#3b82f6' : '#e0e7ff',
                          color: formData.duration === minutes ? 'white' : '#3b82f6',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                      >
                        {minutes} dk
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '12px', color: '#3b82f6', marginTop: '12px', lineHeight: '1.5' }}>
                    ℹ️ Sınav hemen başlayacak ve seçtiğiniz süre sonunda otomatik kapanacaktır.
                  </p>
                </div>
              )}
            </div>

            <div style={{ ...styles.gridTwo, marginTop: '24px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bitiş Tarihi *</label>
                <input
                  type="date"
                  style={styles.input}
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  disabled={formData.startType === 'now'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bitiş Saati *</label>
                <input
                  type="time"
                  style={styles.input}
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  disabled={formData.startType === 'now'}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        if (formData.type === 'quiz') {
          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Sorular ({formData.questions.length})</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Sınav için sorularınızı bu alanda hazırlayın.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={downloadSampleJSON}
                    style={{ ...styles.button('ghost'), color: '#64748b', borderColor: '#e2e8f0', padding: '8px 12px' }}
                    title="Örnek JSON İndir"
                  >
                    <Download size={16} />
                  </button>
                  <label style={{ ...styles.button('ghost'), color: '#f59e0b', borderColor: '#f59e0b', cursor: 'pointer', padding: '8px 12px' }}>
                    <Upload size={16} />
                    <span>İçe Aktar (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    style={{ ...styles.button('primary'), padding: '8px 16px' }}
                  >
                    <Plus size={16} />
                    Yeni Soru
                  </button>
                </div>
              </div>

              {formData.questions.map((q, idx) => (
                <div key={q.id} style={styles.questionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#0d9488',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontWeight: '600', color: '#334155' }}>Soru Metni</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Puan:</span>
                        <input
                          type="number"
                          value={q.points}
                          onChange={(e) => updateQuestion(q.id, 'points', parseInt(e.target.value) || 0)}
                          style={{ ...styles.input, width: '60px', padding: '4px 8px', textAlign: 'center' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        style={{ ...styles.button('danger'), padding: '6px 12px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <textarea
                      style={styles.textarea}
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                      placeholder="Sorunuzu buraya yazın..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => updateQuestion(q.id, 'correctIndex', oIdx)}
                            style={{
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: q.correctIndex === oIdx ? '#10b981' : '#f1f5f9',
                              color: q.correctIndex === oIdx ? 'white' : '#94a3b8',
                              border: q.correctIndex === oIdx ? 'none' : '1px solid #e2e8f0',
                              cursor: 'pointer'
                            }}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                            placeholder={`${oIdx + 1}. seçenek...`}
                            style={{ ...styles.input, border: q.correctIndex === oIdx ? '1px solid #10b981' : '1px solid #e2e8f0' }}
                          />
                        </div>
                        {q.correctIndex === oIdx && (
                          <div style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}>
                            <Check size={12} /> Doğru
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                border: '1px dashed #cbd5e1',
                textAlign: 'center'
              }}>
                <button
                  type="button"
                  onClick={addQuestion}
                  style={{ ...styles.button('ghost'), margin: '0 auto', color: '#0d9488', borderColor: '#0d9488' }}
                >
                  <Plus size={16} />
                  Bir Soru Daha Ekle
                </button>
              </div>
            </div>
          );
        }

        return (
          <div>
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#0d9488" />
                Soru İçeriği (İsteğe Bağlı)
              </h4>

              <div style={styles.formGroup}>
                <label style={styles.label}>Soru Metni</label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => handleChange('questionText', e.target.value)}
                  style={styles.textarea}
                  placeholder="Öğrencilerin cevaplaması gereken soruyu veya yönergeyi buraya yazabilirsiniz..."
                  rows={4}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Soru PDF / Dosyası</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleChange('questionFile', e.target.files[0]);
                    }
                  }}
                  style={{ ...styles.input, padding: '10px' }}
                />
                {formData.questionFile && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>Seçilen dosya: {formData.questionFile.name}</div>}
              </div>
            </div>

            <div style={{ backgroundColor: '#f0fdfa', padding: '16px', borderRadius: '12px', border: '1px solid #ccfbf1', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.requireFileUpload}
                  onChange={(e) => handleChange('requireFileUpload', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#0d9488' }}
                />
                <div>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#0f766e', display: 'block' }}>Öğrenciler Dosya Yüklesin</span>
                  <span style={{ fontSize: '13px', color: '#0d9488' }}>Kapatırsanız öğrenciler dosya yükleyemez (sadece soruları okurlar veya dışarıdan cevaplarlar).</span>
                </div>
              </label>
            </div>

            {formData.requireFileUpload && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>İzin Verilen Formatlar</label>
                  <div style={styles.checkboxGrid}>
                    {Object.entries(ALLOWED_FORMATS).map(([key, format]) => (
                      <label
                        key={key}
                        style={styles.checkboxOption(formData.allowedFormats.includes(key))}
                      >
                        <input
                          type="checkbox"
                          checked={formData.allowedFormats.includes(key)}
                          onChange={(e) => {
                            const formats = e.target.checked
                              ? [...formData.allowedFormats, key]
                              : formData.allowedFormats.filter(f => f !== key);
                            handleChange('allowedFormats', formats);
                          }}
                          style={styles.checkbox}
                        />
                        <span style={{ color: '#1e293b', fontWeight: '500' }}>{format.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Maksimum Dosya Boyutu</label>
                  <div style={styles.rangeContainer}>
                    <div style={styles.rangeValue}>{formData.maxFileSize} MB</div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={formData.maxFileSize}
                      onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
                      style={styles.range}
                    />
                    <div style={styles.rangeLabels}>
                      <span>1 MB</span>
                      <span>50 MB</span>
                    </div>
                  </div>
                </div>

                <label style={{ ...styles.radioOption(formData.multipleFiles), marginTop: '24px' }}>
                  <input
                    type="checkbox"
                    checked={formData.multipleFiles}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      handleChange('multipleFiles', isChecked);
                      // Çoklu dosya açılırsa maxFileCount'u 7'ye ayarla, kapatılırsa 1'e ayarla
                      if (isChecked && formData.maxFileCount === 1) {
                        handleChange('maxFileCount', 7);
                      } else if (!isChecked) {
                        handleChange('maxFileCount', 1);
                      }
                    }}
                    style={styles.checkbox}
                  />
                  <div style={styles.radioLabel}>
                    <div style={styles.radioTitle}>Çoklu dosya yüklemeye izin ver</div>
                    <div style={styles.radioDesc}>Öğrenciler birden fazla dosya gönderebilir</div>
                  </div>
                </label>

                {formData.multipleFiles && (
                  <div style={{ ...styles.formGroup, marginTop: '16px' }}>
                    <label style={styles.label}>Maksimum Dosya Sayısı</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.maxFileCount}
                      onChange={(e) => handleChange('maxFileCount', Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      style={styles.input}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Hedef Öğrenciler</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioOption(formData.targetType === 'all')}>
                  <input
                    type="radio"
                    name="targetType"
                    value="all"
                    checked={formData.targetType === 'all'}
                    onChange={(e) => handleChange('targetType', e.target.value)}
                    style={styles.radioInput}
                  />
                  <div style={styles.radioLabel}>
                    <div style={styles.radioTitle}>Tüm Öğrenciler</div>
                    <div style={styles.radioDesc}>{students.length} öğrenci</div>
                  </div>
                </label>

                <label style={styles.radioOption(formData.targetType === 'class')}>
                  <input
                    type="radio"
                    name="targetType"
                    value="class"
                    checked={formData.targetType === 'class'}
                    onChange={(e) => handleChange('targetType', e.target.value)}
                    style={styles.radioInput}
                  />
                  <div style={styles.radioLabel}>
                    <div style={styles.radioTitle}>Sınıf Bazlı</div>
                    <div style={styles.radioDesc}>Belirli sınıfları seçin</div>
                  </div>
                </label>
                <label style={styles.radioOption(formData.targetType === 'student')}>
                  <input
                    type="radio"
                    name="targetType"
                    value="student"
                    checked={formData.targetType === 'student'}
                    onChange={(e) => handleChange('targetType', e.target.value)}
                    style={styles.radioInput}
                  />
                  <div style={styles.radioLabel}>
                    <div style={styles.radioTitle}>Öğrenciye Özel</div>
                    <div style={styles.radioDesc}>Belirli öğrencileri tek tek seçin</div>
                  </div>
                </label>
              </div>
            </div>

            {formData.targetType === 'class' && (
              <div style={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ ...styles.label, marginBottom: 0 }}>Sınıfları Seçin</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleChange('targetClasses', [...CLASS_LIST])}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      Tümünü Seç
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('targetClasses', [])}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      Seçimi Kaldır
                    </button>
                  </div>
                </div>
                <div style={styles.classGrid}>
                  {CLASS_LIST.map((className) => (
                    <label
                      key={className}
                      style={styles.checkboxOption(formData.targetClasses.includes(className))}
                    >
                      <input
                        type="checkbox"
                        checked={formData.targetClasses.includes(className)}
                        onChange={(e) => {
                          const classes = e.target.checked
                              ? [...formData.targetClasses, className]
                              : formData.targetClasses.filter(c => c !== className);
                          handleChange('targetClasses', classes);
                        }}
                        style={styles.checkbox}
                      />
                      <span style={{ color: '#1e293b', fontWeight: '500' }}>{className}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.targetType === 'student' && (
              <div style={styles.formGroup}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.label}>Sınıf Filtresi</label>
                  <select
                    style={styles.select}
                    value={studentClassFilter}
                    onChange={(e) => setStudentClassFilter(e.target.value)}
                  >
                    <option value="">Tüm Sınıflar</option>
                    {CLASS_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ ...styles.label, marginBottom: 0 }}>Öğrencileri Seçin ({formData.targetStudents.length} seçildi)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const filtered = students.filter(s => !studentClassFilter || s.className === studentClassFilter);
                      const allSelected = filtered.every(s => formData.targetStudents.includes(s.id));
                      
                      let newSelected;
                      if (allSelected) {
                        // Filtrelenenleri çıkar
                        const filteredIds = filtered.map(s => s.id);
                        newSelected = formData.targetStudents.filter(id => !filteredIds.includes(id));
                      } else {
                        // Filtrelenenleri ekle
                        const filteredIds = filtered.map(s => s.id);
                        newSelected = Array.from(new Set([...formData.targetStudents, ...filteredIds]));
                      }
                      handleChange('targetStudents', newSelected);
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {students.filter(s => !studentClassFilter || s.className === studentClassFilter).every(s => formData.targetStudents.includes(s.id)) 
                      ? 'Filtrelenenlerin Seçimini Kaldır' 
                      : 'Filtrelenenleri Seç'}
                  </button>
                </div>

                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px',
                  padding: '8px'
                }}>
                  {students
                    .filter(s => !studentClassFilter || s.className === studentClassFilter)
                    .map((student) => (
                      <label 
                        key={student.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: formData.targetStudents.includes(student.id) ? '#f0fdfa' : 'transparent',
                          transition: 'all 0.2s',
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.targetStudents.includes(student.id)}
                          onChange={(e) => {
                            const selected = e.target.checked
                              ? [...formData.targetStudents, student.id]
                              : formData.targetStudents.filter(id => id !== student.id);
                            handleChange('targetStudents', selected);
                          }}
                          style={styles.checkbox}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{student.fullName}</span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{student.studentNumber} • {student.className}</span>
                        </div>
                      </label>
                    ))}
                  {students.filter(s => !studentClassFilter || s.className === studentClassFilter).length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                      Bu kriterlere uygun öğrenci bulunamadı.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Güvenlik Ayarları */}
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#ef4444' }}>🛡️</span>
                Sınav Güvenliği (Anti-Cheat)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={styles.radioOption(formData.preventLeaveFullScreen)}>
                  <input
                    type="checkbox"
                    checked={formData.preventLeaveFullScreen}
                    onChange={(e) => handleChange('preventLeaveFullScreen', e.target.checked)}
                    style={styles.checkbox}
                  />
                  <div style={styles.radioLabel}>
                    <div style={styles.radioTitle}>Tam Ekrandan Çıkışı Engelle</div>
                    <div style={styles.radioDesc}>Öğrenci sınavdayken tam ekrandan çıkarsa sınavı kilitlenebilir.</div>
                  </div>
                </label>

                <label style={styles.radioOption(formData.disableShortcuts)}>
                  <input
                    type="checkbox"
                    checked={formData.disableShortcuts}
                    onChange={(e) => handleChange('disableShortcuts', e.target.checked)}
                    style={styles.checkbox}
                  />
                  <div style={styles.radioLabel}>
                    <div style={styles.radioTitle}>Sekme Değiştirmeyi Algıla & Kısayolları Kapat</div>
                    <div style={styles.radioDesc}>Kopyalama (Ctrl+C vb.) ve başka sekmeye geçişler (Alt+Tab) kısıtlanır, algılanırsa uyarılır.</div>
                  </div>
                </label>
              </div>
            </div>

            <hr style={{ borderTop: '1px solid #e2e8f0', margin: 0 }} />

            {/* Bildirim Ayarları */}
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="#3b82f6" />
                Bildirim Ayarları
              </h4>
              <label style={styles.radioOption(formData.sendNotification)}>
                <input
                  type="checkbox"
                  checked={formData.sendNotification}
                  onChange={(e) => handleChange('sendNotification', e.target.checked)}
                  style={styles.checkbox}
                />
                <div style={styles.radioLabel}>
                  <div style={styles.radioTitle}>Bildirim Gönder</div>
                  <div style={styles.radioDesc}>Öğrencilere bildirim gönderilsin</div>
                </div>
              </label>

              {formData.sendNotification && (
                <div style={styles.notificationSettings}>
                  <label style={{ ...styles.checkboxOption(formData.notifyOnStart), marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      checked={formData.notifyOnStart}
                      onChange={(e) => handleChange('notifyOnStart', e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span style={{ color: '#1e293b' }}>Sınav başladığında bildir</span>
                  </label>

                  <label style={{ ...styles.checkboxOption(formData.notifyBefore30), marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      checked={formData.notifyBefore30}
                      onChange={(e) => handleChange('notifyBefore30', e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span style={{ color: '#1e293b' }}>30 dakika kala hatırlat</span>
                  </label>

                  <label style={styles.checkboxOption(formData.notifyBefore5)}>
                    <input
                      type="checkbox"
                      checked={formData.notifyBefore5}
                      onChange={(e) => handleChange('notifyBefore5', e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span style={{ color: '#1e293b' }}>5 dakika kala hatırlat</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <div style={styles.summarySection}>
              <div style={styles.summaryTitle}>
                <FileText size={18} color="#0d9488" />
                Sınav Bilgileri
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Sınav Adı:</span>
                <span style={styles.summaryValue}>{formData.title}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Tip:</span>
                <span style={styles.summaryValue}>{EXAM_TYPES.find(t => t.value === formData.type)?.label}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Ders:</span>
                <span style={styles.summaryValue}>{formData.department || '-'}</span>
              </div>
            </div>

            <div style={styles.summarySection}>
              <div style={styles.summaryTitle}>
                <Clock size={18} color="#0d9488" />
                Zamanlama
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Başlangıç:</span>
                <span style={styles.summaryValue}>
                  {formData.startType === 'now' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🚀 Hemen Başlıyor</span>
                      <span style={{
                        fontSize: '11px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '600'
                      }}>
                        Otomatik
                      </span>
                    </span>
                  ) : `${formData.startDate} ${formData.startTime}`}
                </span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Bitiş:</span>
                <span style={styles.summaryValue}>
                  {formData.endDate} {formData.endTime}
                  {formData.startType === 'now' && (
                    <span style={{
                      fontSize: '11px',
                      color: '#3b82f6',
                      marginLeft: '8px',
                      fontWeight: '500'
                    }}>
                      ({formData.duration} dakika sonra)
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div style={styles.summarySection}>
              <div style={styles.summaryTitle}>
                {formData.type === 'quiz' ? (
                  <HelpCircle size={18} color="#0d9488" />
                ) : (
                  <Settings size={18} color="#0d9488" />
                )}
                {formData.type === 'quiz' ? 'Sınav İçeriği' : 'Dosya Ayarları'}
              </div>
              {formData.type === 'quiz' ? (
                <>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Soru Sayısı:</span>
                    <span style={styles.summaryValue}>{formData.questions.length} Soru</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Toplam Puan:</span>
                    <span style={styles.summaryValue}>
                      {formData.questions.reduce((sum, q) => sum + (q.points || 0), 0)} Puan
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Formatlar:</span>
                    <span style={styles.summaryValue}>
                      {formData.allowedFormats.map(f => ALLOWED_FORMATS[f]?.label).join(', ')}
                    </span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Max Boyut:</span>
                    <span style={styles.summaryValue}>{formData.maxFileSize} MB</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Çoklu Dosya:</span>
                    <span style={styles.summaryValue}>
                      {formData.multipleFiles ? `Evet (${formData.maxFileCount} dosyaya kadar)` : 'Hayır'}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div style={styles.summarySection}>
              <div style={styles.summaryTitle}>
                <Users size={18} color="#0d9488" />
                Hedef
              </div>
              <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
                <span style={styles.summaryLabel}>Öğrenciler:</span>
                <span style={styles.summaryValue}>
                  {formData.targetType === 'all'
                    ? 'Tüm öğrenciler'
                    : formData.targetType === 'class'
                    ? `${formData.targetClasses.join(', ')} (${formData.targetClasses.length} Sınıf)`
                    : `${formData.targetStudents.length} Özel Seçilmiş Öğrenci`}
                </span>
              </div>
            </div>
            <div style={styles.summarySection}>
              <div style={styles.summaryTitle}>
                <span style={{ fontSize: '16px' }}>🛡️</span>
                Güvenlik (Anti-Cheat)
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Tam Ekran Kilidi:</span>
                <span style={styles.summaryValue}>{formData.preventLeaveFullScreen ? 'Açık' : 'Kapalı'}</span>
              </div>
              <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
                <span style={styles.summaryLabel}>Sekme/Kısayol Koruması:</span>
                <span style={styles.summaryValue}>{formData.disableShortcuts ? 'Açık' : 'Kapalı'}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TeacherLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Yeni Sınav Oluştur</h1>
          <p style={styles.subtitle}>Adım adım sınav oluşturun</p>
        </div>

        <div style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div style={styles.stepItem}>
                <div style={styles.stepCircle(currentStep === step.number, currentStep > step.number)}>
                  {currentStep > step.number ? (
                    <Check size={20} />
                  ) : (
                    <step.icon size={20} />
                  )}
                </div>
                <span style={styles.stepLabel(currentStep >= step.number)}>{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div style={styles.stepLine(currentStep > step.number)} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>{steps[currentStep - 1].title}</h2>
          {renderStep()}
        </div>

        <div style={styles.navigation}>
          <button
            style={{
              ...styles.button('ghost'),
              opacity: currentStep === 1 ? 0.5 : 1,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
            }}
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft size={18} />
            Geri
          </button>

          {currentStep < 6 ? (
            <button
              style={styles.button('primary')}
              onClick={handleNext}
            >
              İleri
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              style={styles.button('success')}
              onClick={handleSubmit}
            >
              <Check size={18} />
              Sınavı Oluştur
            </button>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateExam;
