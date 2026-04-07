import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  Calendar,
  Clock,
  FileText,
  Users,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  Bell,
  Upload,
  Download
} from 'lucide-react';
import { TeacherLayout } from '../../components/layouts';
import { useExamStore } from '../../store/examStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';

const styles = {
  container: {
    padding: '32px',
    maxWidth: '800px',
    margin: '0 auto'
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
    color: '#1e293b'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  checkboxActive: {
    backgroundColor: '#eff6ff',
    border: '1px solid #3b82f6'
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  alert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef2f2',
    borderRadius: '10px',
    marginBottom: '24px'
  },
  questionCard: {
    border: '1px solid #e2e8f0',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  }
};

const ExamEdit = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loadExams, getExam, updateExam } = useExamStore();
  const { loadStudents, students } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    targetType: 'all',
    targetClasses: [],
    allowedFileTypes: ['.pdf'],
    maxFileSize: 10,
    isActive: true,
    isQuiz: false,
    autoGrading: true,
    questions: [],
    questionText: '',
    requireFileUpload: true,
    questionFileUrl: null,
    sendNotification: false,
    notifyOnStart: false,
    notifyBefore30: false,
    notifyBefore5: false
  });

  const availableClasses = ['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];
  const fileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.png'];

  useEffect(() => {
    const fetchData = async () => {
      await loadExams(user?.id);
      await loadStudents();
      const exam = getExam(examId);

      if (exam) {
        // targetType kontrolü - eski sınavlar için backward compatibility
        let targetType = exam.targetType || 'class';
        if (!exam.targetType && exam.targetClasses && exam.targetClasses.length === availableClasses.length) {
          targetType = 'all';
        }

        setFormData({
          title: exam.title || '',
          description: exam.description || '',
          startDate: exam.startDate ? formatDateForInput(exam.startDate) : '',
          endDate: exam.endDate ? formatDateForInput(exam.endDate) : '',
          targetType: targetType,
          targetClasses: exam.targetClasses || [],
          allowedFileTypes: exam.allowedFileTypes || ['.pdf'],
          maxFileSize: exam.maxFileSize ? Math.round(exam.maxFileSize / (1024 * 1024)) : 10,
          isActive: exam.isActive !== false,
          isQuiz: exam.isQuiz || exam.type === 'quiz',
          type: exam.type || 'exam',
          autoGrading: exam.autoGrading !== false,
          questions: exam.questions || [],
          questionText: exam.questionText || '',
          requireFileUpload: exam.requireFileUpload !== false,
          questionFileUrl: exam.questionFileUrl || null,
          sendNotification: exam.sendNotification || false,
          notifyOnStart: exam.notifyOnStart || false,
          notifyBefore30: exam.notifyBefore30 || false,
          notifyBefore5: exam.notifyBefore5 || false
        });
      } else {
        toast.error('Sınav bulunamadı');
        navigate('/ogretmen/aktif-sinavlar');
      }
      setLoading(false);
    };

    fetchData();
  }, [examId]);

  const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    // Local timezone'da format için offset düzeltmesi
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTargetTypeChange = (type) => {
    setFormData(prev => ({ ...prev, targetType: type }));
  };

  const toggleClass = (className) => {
    setFormData(prev => ({
      ...prev,
      targetClasses: prev.targetClasses.includes(className)
        ? prev.targetClasses.filter(c => c !== className)
        : [...prev.targetClasses, className]
    }));
  };

  const toggleFileType = (type) => {
    setFormData(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.includes(type)
        ? prev.allowedFileTypes.filter(t => t !== type)
        : [...prev.allowedFileTypes, type]
    }));
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
    handleChange({ target: { name: 'questions', value: [...formData.questions, newQuestion] } });
  };

  const updateQuestion = (id, field, value) => {
    const newQuestions = formData.questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    );
    handleChange({ target: { name: 'questions', value: newQuestions } });
  };

  const removeQuestion = (id) => {
    if (formData.questions.length <= 1) {
      toast.error('En az bir soru olmalıdır');
      return;
    }
    const newQuestions = formData.questions.filter(q => q.id !== id);
    handleChange({ target: { name: 'questions', value: newQuestions } });
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
    handleChange({ target: { name: 'questions', value: newQuestions } });
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
          const existingQuestions = formData.questions.filter(q => q.text !== '' || q.options.some(o => o !== ''));
          handleChange({ target: { name: 'questions', value: [...existingQuestions, ...importedQuestions] } });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Sınav adı gerekli');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Başlangıç ve bitiş tarihleri gerekli');
      return;
    }

    // Tarih kontrolleri
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate >= endDate) {
      toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    if (formData.targetType === 'class' && formData.targetClasses.length === 0) {
      toast.error('En az bir sınıf seçmelisiniz');
      return;
    }

    setSaving(true);

    try {
      // targetType'a göre targetClasses ayarla
      let finalTargetClasses = formData.targetClasses;
      if (formData.targetType === 'all') {
        finalTargetClasses = availableClasses;
      }

      const result = await updateExam(examId, {
        ...formData,
        maxFileSize: formData.maxFileSize * 1024 * 1024,
        targetClasses: finalTargetClasses,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        updatedAt: new Date().toISOString(),
        questionText: formData.questionText,
        requireFileUpload: formData.requireFileUpload,
        sendNotification: formData.sendNotification,
        notifyOnStart: formData.sendNotification ? formData.notifyOnStart : false,
        notifyBefore30: formData.sendNotification ? formData.notifyBefore30 : false,
        notifyBefore5: formData.sendNotification ? formData.notifyBefore5 : false
      });

      if (result) {
        toast.success('Sınav güncellendi');
        navigate('/ogretmen/aktif-sinavlar');
      } else {
        toast.error('Sınav güncellenemedi');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
          <p style={{ color: '#64748b' }}>Yükleniyor...</p>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Sınav Düzenle</h1>
          <button
            style={styles.btnSecondary}
            onClick={() => navigate('/ogretmen/aktif-sinavlar')}
          >
            <X size={18} />
            İptal
          </button>
        </div>

        <div style={styles.alert}>
          <AlertCircle size={20} color="#ef4444" />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b' }}>Dikkat</p>
            <p style={{ fontSize: '13px', color: '#7f1d1d' }}>
              Sınav düzenleme yapıldığında öğrencilere bildirim gönderilecektir.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Temel Bilgiler */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>
              <FileText size={18} color="#3b82f6" />
              Temel Bilgiler
            </h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Sınav Tipi</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="final_exam">Sınav</option>
                <option value="exam">Klasik Sınav (Dosya)</option>
                <option value="homework">Ödev</option>
                <option value="quiz">Çoktan Seçmeli (Otomatik Notlandırma)</option>
                <option value="project">Proje</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Sınav Adı *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                style={styles.input}
                placeholder="Örn: 2. Dönem Matematik Yazılısı"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Açıklama</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={styles.textarea}
                placeholder="Sınav hakkında bilgi..."
              />
            </div>

            {formData.isQuiz && (
              <div style={{ ...styles.formGroup, backgroundColor: '#f0fdfa', padding: '16px', borderRadius: '12px', border: '1px solid #ccfbf1', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.autoGrading}
                    onChange={(e) => handleChange({ target: { name: 'autoGrading', value: e.target.checked } })}
                    style={{ width: '18px', height: '18px', accentColor: '#0d9488' }}
                  />
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '500', color: '#0f766e', display: 'block' }}>Otomatik Notlandırma</span>
                    <span style={{ fontSize: '13px', color: '#0d9488' }}>Sistem, test sonuçlarını anında notlandırır. Kapatırsanız tüm testler öğretmen değerlendirmesine düşer.</span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Tarih ve Saat */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>
              <Calendar size={18} color="#10b981" />
              Tarih ve Saat
            </h3>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Başlangıç *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Bitiş *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Hedef Öğrenciler */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>
              <Users size={18} color="#8b5cf6" />
              Hedef Öğrenciler *
            </h3>

            <div style={styles.formGroup}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: formData.targetType === 'all' ? '#f0fdfa' : '#f8fafc',
                    border: `2px solid ${formData.targetType === 'all' ? '#0d9488' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="targetType"
                    value="all"
                    checked={formData.targetType === 'all'}
                    onChange={(e) => handleTargetTypeChange(e.target.value)}
                    style={{ width: '18px', height: '18px', accentColor: '#0d9488' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>
                      Tüm Öğrenciler
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Tüm kayıtlı öğrenciler
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: formData.targetType === 'class' ? '#f0fdfa' : '#f8fafc',
                    border: `2px solid ${formData.targetType === 'class' ? '#0d9488' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="targetType"
                    value="class"
                    checked={formData.targetType === 'class'}
                    onChange={(e) => handleTargetTypeChange(e.target.value)}
                    style={{ width: '18px', height: '18px', accentColor: '#0d9488' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>
                      Belirli Sınıflar
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Seçili sınıflardaki öğrenciler
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {formData.targetType === 'class' && (
              <div style={{ marginTop: '16px' }}>
                <label style={styles.label}>Sınıfları Seçin</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {availableClasses.map(cls => (
                    <div
                      key={cls}
                      style={{
                        ...styles.checkbox,
                        ...(formData.targetClasses.includes(cls) ? styles.checkboxActive : {})
                      }}
                      onClick={() => toggleClass(cls)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.targetClasses.includes(cls)}
                        onChange={() => { }}
                        style={{ accentColor: '#3b82f6' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{cls}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Soru Ayarları / Dosya Ayarları */}
          {formData.isQuiz ? (
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>
                <HelpCircle size={18} color="#0d9488" />
                Sorular
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {formData.questions?.map((q, idx) => (
                  <div key={q.id} style={styles.questionCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '50%',
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
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px',
                            backgroundColor: '#fef2f2', color: '#ef4444',
                            border: 'none', borderRadius: '8px', cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
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
                                borderRadius: '8px',
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
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={downloadSampleJSON}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px 16px', backgroundColor: 'transparent', color: '#64748b',
                      border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer',
                      fontWeight: '600', fontSize: '14px', flex: 1
                    }}
                    title="Örnek JSON İndir"
                  >
                    <Download size={18} />
                    Örnek İndir
                  </button>

                  <label
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px 16px', backgroundColor: 'transparent', color: '#f59e0b',
                      border: '1px solid #f59e0b', borderRadius: '12px', cursor: 'pointer',
                      fontWeight: '600', fontSize: '14px', flex: 1
                    }}
                  >
                    <Upload size={18} />
                    İçe Aktar (.json)
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
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px 16px', backgroundColor: '#f0fdfa', color: '#0d9488',
                      border: '1px dashed #0d9488', borderRadius: '12px', cursor: 'pointer',
                      fontWeight: '600', fontSize: '14px', flex: 1
                    }}
                  >
                    <Plus size={18} />
                    Yeni Soru
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>
                <Clock size={18} color="#f59e0b" />
                Dosya Ayarları
              </h3>

              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="#0d9488" />
                  Soru İçeriği (İsteğe Bağlı)
                </h4>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Soru Metni</label>
                  <textarea
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="Öğrencilerin cevaplaması gereken soruyu veya yönergeyi buraya yazabilirsiniz..."
                    rows={4}
                  />
                </div>

                {formData.questionFileUrl && (
                  <div style={{ fontSize: '13px', color: '#0ea5e9', marginBottom: '8px' }}>
                    Mevcut Soru Dosyası: <a href={formData.questionFileUrl} target="_blank" rel="noopener noreferrer">Görüntüle</a>
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#f0fdfa', padding: '16px', borderRadius: '12px', border: '1px solid #ccfbf1', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.requireFileUpload}
                    onChange={(e) => handleChange({ target: { name: 'requireFileUpload', value: e.target.checked } })}
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
                    <label style={styles.label}>İzin Verilen Dosya Türleri</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {fileTypes.map(type => (
                        <div
                          key={type}
                          style={{
                            ...styles.checkbox,
                            ...(formData.allowedFileTypes.includes(type) ? styles.checkboxActive : {})
                          }}
                          onClick={() => toggleFileType(type)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.allowedFileTypes.includes(type)}
                            onChange={() => { }}
                            style={{ accentColor: '#3b82f6' }}
                          />
                          <span style={{ fontSize: '14px', color: '#1e293b' }}>{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Maksimum Dosya Boyutu (MB)</label>
                    <input
                      type="number"
                      name="maxFileSize"
                      value={formData.maxFileSize}
                      onChange={handleChange}
                      style={{ ...styles.input, maxWidth: '150px' }}
                      min="1"
                      max="100"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bildirim Ayarları */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>
              <Bell size={18} color="#0d9488" />
              Bildirim Ayarları
            </h3>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: formData.sendNotification ? '#f0fdfa' : '#f8fafc', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: formData.sendNotification ? '1px solid #14b8a6' : '1px solid #e2e8f0', marginBottom: '16px' }}>
              <input
                type="checkbox"
                checked={formData.sendNotification}
                onChange={(e) => handleChange({ target: { name: 'sendNotification', value: e.target.checked } })}
                style={{ width: '18px', height: '18px', accentColor: '#0d9488', marginTop: '2px' }}
              />
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Bildirim Gönder</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Öğrencilere sistem üzerinden hatırlatmalar iletilir.</div>
              </div>
            </label>

            {formData.sendNotification && (
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.notifyOnStart}
                    onChange={(e) => handleChange({ target: { name: 'notifyOnStart', value: e.target.checked } })}
                    style={{ width: '16px', height: '16px', accentColor: '#0d9488' }}
                  />
                  <span style={{ fontSize: '14px', color: '#1e293b' }}>Sınav başladığında bildir</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.notifyBefore30}
                    onChange={(e) => handleChange({ target: { name: 'notifyBefore30', value: e.target.checked } })}
                    style={{ width: '16px', height: '16px', accentColor: '#0d9488' }}
                  />
                  <span style={{ fontSize: '14px', color: '#1e293b' }}>30 dakika kala hatırlat</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.notifyBefore5}
                    onChange={(e) => handleChange({ target: { name: 'notifyBefore5', value: e.target.checked } })}
                    style={{ width: '16px', height: '16px', accentColor: '#0d9488' }}
                  />
                  <span style={{ fontSize: '14px', color: '#1e293b' }}>5 dakika kala hatırlat</span>
                </label>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => navigate('/ogretmen/aktif-sinavlar')}
            >
              İptal
            </button>
            <button
              type="submit"
              style={styles.btnPrimary}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  );
};

export default ExamEdit;
