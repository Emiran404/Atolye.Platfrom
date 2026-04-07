import { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/layouts';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore, CLASS_LIST } from '../../store/authStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { formatDate } from '../../utils/dateHelpers';
import {
  Search, Filter, User, Folder, Calendar, Eye,
  Download, ChevronDown, ChevronUp, FileText,
  BarChart2, AlertTriangle, Key, Lock, Save, X,
  Activity, LogIn, Upload, Clock
} from 'lucide-react';

// Light tema için stiller
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '12px'
  },
  statCard: (isActive) => ({
    padding: '12px',
    backgroundColor: isActive ? '#f0fdfa' : '#ffffff',
    border: isActive ? '2px solid #0d9488' : '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }),
  statValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b'
  },
  filterCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px'
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '16px'
  },
  searchContainer: {
    flex: '1',
    minWidth: '200px',
    maxWidth: '300px'
  },
  select: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: '#1e293b',
    cursor: 'pointer'
  },
  emptyState: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center'
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#f59e0b',
    margin: '0 auto 16px'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px'
  },
  emptyText: {
    color: '#64748b'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHead: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b'
  },
  thRight: {
    textAlign: 'right',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '12px 16px',
    color: '#1e293b'
  },
  tdMuted: {
    padding: '12px 16px',
    color: '#64748b',
    fontSize: '14px'
  },
  tdRight: {
    padding: '12px 16px',
    textAlign: 'right'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#f0fdfa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0d9488'
  },
  studentCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  studentName: {
    fontWeight: '600',
    color: '#1e293b'
  },
  expandedRow: {
    backgroundColor: '#f8fafc',
    padding: '16px 32px'
  },
  expandedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  expandedLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '8px'
  },
  expandedValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#1e293b'
  },
  gradeSuccess: {
    fontWeight: '700',
    color: '#10b981'
  },
  gradeWarning: {
    fontWeight: '700',
    color: '#f59e0b'
  },
  gradeDanger: {
    fontWeight: '700',
    color: '#ef4444'
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  modalAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    backgroundColor: '#f0fdfa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0d9488'
  },
  modalName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b'
  },
  modalInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  detailCard: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px'
  },
  detailLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px'
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
    wordBreak: 'break-all',
    fontFamily: 'monospace'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  statBox: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    textAlign: 'center'
  },
  statBoxValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b'
  },
  statBoxLabel: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px'
  },
  ipList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  ipItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  ipAddress: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#1e293b'
  },
  ipDate: {
    fontSize: '12px',
    color: '#64748b'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '12px'
  }
};

const StudentList = () => {
  const { loadStudents, students } = useAuthStore();
  const { submissions, loadSubmissions } = useSubmissionStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Log Kayıtları State
  const [studentLogs, setStudentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([loadStudents(), loadSubmissions()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Öğrenci seçildiğinde logları çek
  useEffect(() => {
    if (selectedStudent && showDetailModal) {
      const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
          const response = await fetch(`/api/users/students/${selectedStudent.id}/logs`);
          const data = await response.json();
          if (data.success) {
            setStudentLogs(data.logs || []);
          }
        } catch (error) {
          console.error("Loglar çekilemedi", error);
        }
        setLoadingLogs(false);
      };

      fetchLogs();
    } else {
      setStudentLogs([]);
    }
  }, [selectedStudent, showDetailModal]);

  const getStudentStats = (studentId) => {
    // edit_granted durumundaki gönderimleri hariç tut
    const studentSubmissions = submissions.filter(s => s.studentId === studentId && s.status !== 'edit_granted');

    // Öğrenci-sınav bazında grupla (aynı sınav için birden fazla dosya varsa 1 gönderim say)
    const getUniqueSubmissions = (subs) => {
      const grouped = {};
      subs.forEach(sub => {
        const key = `${sub.examId}-${sub.studentId}`;
        if (!grouped[key]) {
          grouped[key] = sub;
        }
      });
      return Object.values(grouped);
    };

    const uniqueSubmissions = getUniqueSubmissions(studentSubmissions);
    const totalSubmissions = uniqueSubmissions.length;
    const gradedSubmissions = uniqueSubmissions.filter(s => s.status === 'graded');
    const lateSubmissions = uniqueSubmissions.filter(s => s.isLate).length;
    const numGrades = gradedSubmissions.filter(s => typeof s.grade === 'number');
    const averageGrade = numGrades.length > 0
      ? Math.round(numGrades.reduce((acc, s) => acc + (s.grade || 0), 0) / numGrades.length)
      : null;

    return {
      totalSubmissions,
      gradedCount: gradedSubmissions.length,
      lateSubmissions,
      averageGrade
    };
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-student-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          studentNumber: selectedStudent.studentNumber,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Şifre başarıyla değiştirildi!');
        setIsChangingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Şifre değiştirme başarısız!');
      }
    } catch (error) {
      toast.error('Bir hata oluştu: ' + error.message);
    }
  };

  const [passwordChangeModeRemaining, setPasswordChangeModeRemaining] = useState(null);

  useEffect(() => {
    // İlk yüklemede ve 1 saniyede bir kalan süreyi kontrol et
    const checkPasswordModeStatus = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();

        if (data.success && data.settings?.passwordChangeModeExpiresAt) {
          const expiresAt = new Date(data.settings.passwordChangeModeExpiresAt).getTime();
          const now = Date.now();

          if (expiresAt > now) {
            setPasswordChangeModeRemaining(Math.floor((expiresAt - now) / 1000));
          } else {
            setPasswordChangeModeRemaining(null);
          }
        } else {
          setPasswordChangeModeRemaining(null);
        }
      } catch (error) {
        console.error('Ayarlar alınamadı:', error);
      }
    };

    checkPasswordModeStatus();
    const interval = setInterval(() => {
      setPasswordChangeModeRemaining((prev) => {
        if (prev === null) {
          checkPasswordModeStatus(); // Belki arkada biri açtı diye periyodik kontrol et
          return null;
        }
        if (prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTogglePasswordChangeMode = async () => {
    try {
      const currentSettingsRes = await fetch('/api/settings');
      const currentSettings = await currentSettingsRes.json();

      let updateRes;
      if (passwordChangeModeRemaining !== null) {
        // İptal et
        updateRes = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentSettings,
            passwordChangeModeExpiresAt: null
          })
        });
        if (updateRes.ok) {
          setPasswordChangeModeRemaining(null);
          toast.success('Şifre Değiştirme Modu iptal edildi.');
        } else {
          toast.error('Mod iptal edilemedi.');
        }
      } else {
        // Aktif et
        const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();
        updateRes = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentSettings,
            passwordChangeModeExpiresAt: expiresAt
          })
        });
        if (updateRes.ok) {
          setPasswordChangeModeRemaining(600); // 10 dakika = 600 saniye
          toast.success('Öğrenci Şifre Değiştirme Modu 10 dakikalığına aktif edildi!');
        } else {
          toast.error('Mod aktif edilemedi.');
        }
      }
    } catch (error) {
      toast.error('Bağlantı hatası!');
    }
  };

  const handleEnableIndividualPasswordChangeMode = async () => {
    try {
      if (!selectedStudent) return;
      const response = await fetch('/api/auth/login/enable-student-reset-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent.id })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'Öğrenci Şifre Değiştirme Modu 10 dakikalığına aktif edildi!');
      } else {
        toast.error(data.error || 'Mod aktif edilemedi.');
      }
    } catch (error) {
      toast.error('Bağlantı hatası!');
    }
  };

  const filteredStudents = students
    .filter(s => {
      const matchesSearch = s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNumber?.includes(searchQuery);
      const matchesClass = classFilter === 'all' || s.className === classFilter;
      return matchesSearch && matchesClass;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'number':
          comparison = a.studentNumber.localeCompare(b.studentNumber);
          break;
        case 'class':
          comparison = a.className.localeCompare(b.className);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleRow = (studentId) => {
    setExpandedRows(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const classStats = CLASS_LIST.map(className => {
    const classStudents = students.filter(s => s.className === className);
    return {
      name: className,
      count: classStudents.length
    };
  });

  const sortOptions = [
    { value: 'name', label: 'Ada Göre' },
    { value: 'number', label: 'Numaraya Göre' },
    { value: 'class', label: 'Sınıfa Göre' }
  ];

  const handleExportStudents = () => {
    if (!students || students.length === 0) {
      toast.error('Dışa aktarılacak öğrenci bulunamadı.');
      return;
    }

    try {
      // 1. Başlıkları oluştur (CSV formatında)
      // Türkçe karakter sorununu (BOM) aşmak için UTF-8 BOM ekliyoruz: \uFEFF
      const headers = ['Öğrenci Numarası', 'Ad Soyad', 'Sınıf', 'Kayıt Tarihi', 'Klasör Yolu', 'Durum'];
      
      // 2. Verileri satırlara çevir
      const csvRows = students.map(student => {
        return [
          student.studentNumber,
          // İçinde virgül geçme ihtimaline karşı tırnak içine alıyoruz
          `"${student.fullName}"`,
          student.className,
          formatDate(student.createdAt),
          student.folderPath,
          student.suspended ? 'Askıya Alındı' : 'Aktif'
        ].join(',');
      });

      // 3. İçeriği birleştir (BOM + Başlık + Satırlar)
      const csvContent = '\uFEFF' + headers.join(',') + '\n' + csvRows.join('\n');

      // 4. Blob oluştur ve indir
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ogrenci_listesi_${new Date().toLocaleDateString('tr-TR')}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Temizlik
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Liste Excel (CSV) formatında indirildi.');
    } catch (error) {
      toast.error('Dışa aktarma sırasında bir hata oluştu.');
      console.error('Export error:', error);
    }
  };

  return (
    <TeacherLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Öğrenci Listesi</h1>
            <p style={styles.subtitle}>Toplam {students.length} öğrenci kayıtlı</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant={passwordChangeModeRemaining !== null ? "error" : "warning"}
              onClick={handleTogglePasswordChangeMode}
            >
              <Key className="w-4 h-4 mr-2" />
              {passwordChangeModeRemaining !== null
                ? `İptal Et (${formatTime(passwordChangeModeRemaining)})`
                : 'Tüm Öğrenciler için Şifre Değişim Modu (10dk)'}
            </Button>
            <Button onClick={handleExportStudents}>
              <Download className="w-4 h-4 mr-2" />
              Excel'e Aktar
            </Button>
          </div>
        </div>

        {/* Class Stats */}
        <div style={styles.statsGrid}>
          {classStats.map((stat) => (
            <div
              key={stat.name}
              style={styles.statCard(classFilter === stat.name)}
              onClick={() => setClassFilter(classFilter === stat.name ? 'all' : stat.name)}
              onMouseEnter={(e) => {
                if (classFilter !== stat.name) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (classFilter !== stat.name) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }
              }}
            >
              <p style={styles.statValue}>{stat.count}</p>
              <p style={styles.statLabel}>{stat.name}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={styles.filterCard}>
          <div style={styles.filterRow}>
            <div style={styles.searchContainer}>
              <Input
                placeholder="Öğrenci ara (ad veya numara)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: '#64748b' }} />
              <select
                style={styles.select}
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">Tüm Sınıflar</option>
                {CLASS_LIST.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                style={styles.select}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>

        {/* Student List */}
        {filteredStudents.length === 0 ? (
          <div style={styles.emptyState}>
            <AlertTriangle style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>Öğrenci Bulunamadı</h3>
            <p style={styles.emptyText}>Arama kriterlerine uygun öğrenci bulunamadı.</p>
          </div>
        ) : (
          <div style={styles.tableCard}>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={{ ...styles.th, width: '40px' }}></th>
                    <th style={styles.th}>Öğrenci</th>
                    <th style={styles.th}>Numara</th>
                    <th style={styles.th}>Sınıf</th>
                    <th style={styles.th}>Gönderimler</th>
                    <th style={styles.th}>Ortalama</th>
                    <th style={styles.th}>Son Giriş</th>
                    <th style={styles.thRight}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const stats = getStudentStats(student.id);
                    const isExpanded = expandedRows.includes(student.id);

                    return (
                      <>
                        <tr
                          key={student.id}
                          style={styles.tr}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={styles.td}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(student.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </Button>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.studentCell}>
                              <div style={styles.avatar}>
                                <User size={16} />
                              </div>
                              <span style={styles.studentName}>{student.fullName}</span>
                            </div>
                          </td>
                          <td style={styles.tdMuted}>{student.studentNumber}</td>
                          <td style={styles.td}>
                            <Badge variant="secondary">{student.className}</Badge>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '600', color: '#1e293b' }}>{stats.totalSubmissions}</span>
                              {stats.lateSubmissions > 0 && (
                                <Badge variant="danger" size="sm">{stats.lateSubmissions} geç</Badge>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>
                            {stats.averageGrade !== null ? (
                              <span style={
                                stats.averageGrade >= 70 ? styles.gradeSuccess :
                                  stats.averageGrade >= 50 ? styles.gradeWarning : styles.gradeDanger
                              }>
                                {stats.averageGrade}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>-</span>
                            )}
                          </td>
                          <td style={styles.tdMuted}>
                            {student.lastLogin ? formatDate(student.lastLogin) : 'Hiç giriş yapmadı'}
                          </td>
                          <td style={styles.tdRight}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye size={16} />
                            </Button>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {isExpanded && (
                          <tr key={`${student.id}-expanded`} style={{ backgroundColor: '#f8fafc' }}>
                            <td colSpan="8" style={styles.expandedRow}>
                              <div style={styles.expandedGrid}>
                                <div>
                                  <h4 style={styles.expandedLabel}>Klasör Yolu</h4>
                                  <div style={styles.expandedValue}>
                                    <Folder size={16} style={{ color: '#0d9488' }} />
                                    <span>{student.folderPath}</span>
                                  </div>
                                </div>
                                <div>
                                  <h4 style={styles.expandedLabel}>Kayıt Bilgileri</h4>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                                    <Calendar size={16} />
                                    <span>Kayıt: {formatDate(student.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setIsChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');
          }}
          title="Öğrenci Detayları"
          size="4xl"
        >
          {selectedStudent && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 440px', gap: '24px', minHeight: '600px' }}>
              {/* Sol Sidebar - Profil */}
              <div style={{
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '20px',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                color: 'white',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
              }}>
                {/* Avatar & Info */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 8px 24px rgba(13, 148, 136, 0.4)',
                    border: '4px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <User size={56} strokeWidth={1.5} />
                  </div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    margin: '0 0 8px 0',
                    color: 'white'
                  }}>
                    {selectedStudent.fullName}
                  </h3>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    {selectedStudent.className}
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: 0,
                    fontFamily: 'monospace'
                  }}>
                    {selectedStudent.studentNumber}
                  </p>
                </div>

                {/* Quick Stats */}
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h4 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: '0 0 16px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Performans Özeti
                  </h4>
                  {(() => {
                    const stats = getStudentStats(selectedStudent.id);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>Gönderimler</span>
                          <span style={{ fontSize: '18px', fontWeight: '700' }}>{stats.totalSubmissions}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>Ortalama</span>
                          <span style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: stats.averageGrade >= 70 ? '#10b981' : stats.averageGrade >= 50 ? '#f59e0b' : '#ef4444'
                          }}>
                            {stats.averageGrade !== null ? stats.averageGrade : '-'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>Geç Gönderim</span>
                          <span style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>{stats.lateSubmissions}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Info Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px'
                  }}>
                    <Calendar size={18} style={{ color: '#14b8a6', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 2px 0' }}>Kayıt Tarihi</p>
                      <p style={{ fontSize: '13px', margin: 0 }}>{formatDate(selectedStudent.createdAt)}</p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px'
                  }}>
                    <Folder size={18} style={{ color: '#14b8a6', flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 2px 0' }}>Klasör</p>
                      <p style={{
                        fontSize: '11px',
                        margin: 0,
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {selectedStudent.folderPath}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ İçerik - Detaylar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Detaylı İstatistikler */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '28px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: '0 0 20px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <BarChart2 size={22} style={{ color: '#0d9488' }} />
                    Detaylı İstatistikler
                  </h3>
                  {(() => {
                    const stats = getStudentStats(selectedStudent.id);
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div style={{
                          padding: '20px',
                          background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                          borderRadius: '16px',
                          textAlign: 'center',
                          border: '1px solid #99f6e4'
                        }}>
                          <FileText size={28} style={{ color: '#0d9488', margin: '0 auto 8px' }} />
                          <p style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', margin: '8px 0 4px' }}>
                            {stats.totalSubmissions}
                          </p>
                          <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: 0 }}>TOPLAM GÖNDERİM</p>
                        </div>
                        <div style={{
                          padding: '20px',
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                          borderRadius: '16px',
                          textAlign: 'center',
                          border: '1px solid #bbf7d0'
                        }}>
                          <BarChart2 size={28} style={{ color: '#10b981', margin: '0 auto 8px' }} />
                          <p style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', margin: '8px 0 4px' }}>
                            {stats.averageGrade !== null ? stats.averageGrade : '-'}
                          </p>
                          <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: 0 }}>ORTALAMA NOT</p>
                        </div>
                        <div style={{
                          padding: '20px',
                          background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                          borderRadius: '16px',
                          textAlign: 'center',
                          border: '1px solid #fca5a5'
                        }}>
                          <AlertTriangle size={28} style={{ color: '#ef4444', margin: '0 auto 8px' }} />
                          <p style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', margin: '8px 0 4px' }}>
                            {stats.lateSubmissions}
                          </p>
                          <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: 0 }}>GEÇ GÖNDERİM</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Şifre Yönetimi */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    marginBottom: isChangingPassword ? '20px' : '0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Lock size={24} style={{ color: '#f59e0b' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                          Şifre Yönetimi
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                          Öğrenci şifresini güncelle veya şifre değiştirme modunu aktif et
                        </p>
                      </div>
                    </div>

                    {!isChangingPassword && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button
                          onClick={handleEnableIndividualPasswordChangeMode}
                          style={{
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#dbeafe';
                            e.target.style.borderColor = '#93c5fd';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#eff6ff';
                            e.target.style.borderColor = '#bfdbfe';
                          }}
                        >
                          <Key size={18} />
                          Şifre Değiştirme Modu (10dk)
                        </button>

                        <button
                          onClick={() => setIsChangingPassword(true)}
                          style={{
                            backgroundColor: '#fef3c7',
                            color: '#d97706',
                            border: '1px solid #fde68a',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#fde68a';
                            e.target.style.borderColor = '#fcd34d';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#fef3c7';
                            e.target.style.borderColor = '#fde68a';
                          }}
                        >
                          <Lock size={18} />
                          Şifreyi Manuel Değiştir
                        </button>
                      </div>
                    )}
                  </div>

                  {isChangingPassword && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px'
                      }}>
                        <div>
                          <label style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#64748b',
                            display: 'block',
                            marginBottom: '8px'
                          }}>
                            Yeni Şifre
                          </label>
                          <Input
                            type="password"
                            placeholder="Minimum 6 karakter"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#64748b',
                            display: 'block',
                            marginBottom: '8px'
                          }}>
                            Şifre Tekrar
                          </label>
                          <Input
                            type="password"
                            placeholder="Şifreyi tekrar girin"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={handlePasswordChange}
                          style={{
                            flex: 1,
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                        >
                          <Save size={16} />
                          Kaydet
                        </button>
                        <button
                          onClick={() => {
                            setIsChangingPassword(false);
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          style={{
                            flex: 1,
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '12px',
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
                            e.target.style.backgroundColor = '#e2e8f0';
                            e.target.style.color = '#1e293b';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#f1f5f9';
                            e.target.style.color = '#64748b';
                          }}
                        >
                          <X size={16} />
                          İptal
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* IP Geçmişi */}
                {selectedStudent.ipHistory && selectedStudent.ipHistory.length > 0 && (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '28px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#1e293b',
                      margin: '0 0 16px 0'
                    }}>
                      Son Giriş IP Adresleri
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedStudent.ipHistory.slice(-5).reverse().map((ip, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            color: '#0f172a',
                            fontWeight: '600'
                          }}>
                            {ip.ip}
                          </span>
                          <span style={{
                            fontSize: '13px',
                            color: '#64748b',
                            fontWeight: '500'
                          }}>
                            {formatDate(ip.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* 3. Sütun - Zaman Çizelgesi (Loglar) */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <Activity size={22} style={{ color: '#0d9488' }} />
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0
                  }}>
                    Aktivite Geçmişi
                  </h3>
                </div>

                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  paddingRight: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  maxHeight: '600px'
                }}>
                  {loadingLogs ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      Yükleniyor...
                    </div>
                  ) : studentLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>
                      Henüz aktivite kaydı bulunmuyor.
                    </div>
                  ) : (
                    studentLogs.map((log, index) => {
                      let Icon = Clock;
                      let iconColor = '#64748b';
                      let bgColor = '#f1f5f9';

                      if (log.type === 'login') {
                        Icon = LogIn;
                        iconColor = '#0ea5e9';
                        bgColor = '#e0f2fe';
                      } else if (log.type === 'submission' || log.type === 'submission_update') {
                        Icon = Upload;
                        iconColor = '#10b981';
                        bgColor = '#dcfce7';
                      } else if (log.type === 'password_reset') {
                        Icon = Key;
                        iconColor = '#f59e0b';
                        bgColor = '#fef3c7';
                      } else if (log.type === 'account_created') {
                        Icon = User;
                        iconColor = '#8b5cf6';
                        bgColor = '#ede9fe';
                      }

                      return (
                        <div key={log.id} style={{
                          display: 'flex',
                          gap: '12px',
                          position: 'relative'
                        }}>
                          {/* Çizgi (Timeline Line) */}
                          {index !== studentLogs.length - 1 && (
                            <div style={{
                              position: 'absolute',
                              top: '32px',
                              left: '15px',
                              bottom: '-28px',
                              width: '2px',
                              backgroundColor: '#e2e8f0'
                            }} />
                          )}

                          {/* İkon */}
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            zIndex: 1
                          }}>
                            <Icon size={14} style={{ color: iconColor }} />
                          </div>

                          {/* İçerik */}
                          <div style={{ flex: 1, paddingBottom: index === studentLogs.length - 1 ? '0' : '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                              <p style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#1e293b',
                                margin: 0
                              }}>
                                {log.action}
                              </p>
                              <span style={{
                                fontSize: '11px',
                                color: '#94a3b8',
                                whiteSpace: 'nowrap',
                                marginLeft: '8px'
                              }}>
                                {new Date(log.date).toLocaleDateString('tr-TR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p style={{
                              fontSize: '12px',
                              color: '#64748b',
                              margin: 0,
                              lineHeight: '1.4'
                            }}>
                              {log.details}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </TeacherLayout >
  );
};

export default StudentList;
