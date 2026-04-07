import { useState, useMemo, useEffect } from 'react';
import { TeacherLayout } from '../../components/layouts';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useExamStore } from '../../store/examStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useAuthStore, CLASS_LIST } from '../../store/authStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, FileText, CheckCircle, Clock,
  Award, AlertTriangle, Download
} from 'lucide-react';

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '16px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' },
  statCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px'
  },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  statLabel: { fontSize: '14px', color: '#64748b', marginBottom: '4px' },
  statValue: { fontSize: '32px', fontWeight: '700', color: '#1e293b' },
  statExtra: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '14px' },
  iconBox: (bg) => ({
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }),
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' },
  chartCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px'
  },
  chartTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' },
  pieGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  legendDot: (color) => ({ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }),
  legendLabel: { fontSize: '14px', color: '#64748b' },
  legendValue: { fontSize: '14px', fontWeight: '600', color: '#1e293b', marginLeft: 'auto' }
};

const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Stats = () => {
  const { exams, loadExams } = useExamStore();
  const { submissions, loadSubmissions } = useSubmissionStore();
  const { user, getAllStudents, loadUsers } = useAuthStore();
  const students = useMemo(() => getAllStudents(), [getAllStudents]);

  const [timeRange, setTimeRange] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(true);

  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadExams(user?.id);
      await loadSubmissions();
      await loadUsers();
      setLoading(false);
    };
    fetchData();

    // Otomatik yenileme - Her 15 saniyede bir
    const refreshInterval = setInterval(() => {
      loadExams(user?.id);
      loadSubmissions();
      loadUsers();
    }, 15000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Filtrelenmiş veriler
  const filteredData = useMemo(() => {
    let filteredExams = [...exams];

    // Geçerli sınav ID'lerini al
    const examIds = new Set(exams.map(e => e.id));

    // edit_granted durumundaki gönderimleri ve silinmiş sınavlara ait gönderimleri hariç tut
    let filteredSubmissions = submissions.filter(s =>
      s.status !== 'edit_granted' && examIds.has(s.examId)
    );

    // Zaman filtresi
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'semester':
          startDate = new Date(now.setMonth(now.getMonth() - 6));
          break;
        default:
          startDate = new Date(0);
      }

      filteredExams = filteredExams.filter(e => new Date(e.createdAt) >= startDate);
      filteredSubmissions = filteredSubmissions.filter(s => new Date(s.submittedAt) >= startDate);
    }

    // Sınıf filtresi
    if (selectedClass !== 'all') {
      filteredSubmissions = filteredSubmissions.filter(s =>
        s.studentClass === selectedClass || s.className === selectedClass
      );
    }

    return { filteredExams, filteredSubmissions };
  }, [exams, submissions, timeRange, selectedClass]);

  const generalStats = useMemo(() => {
    const { filteredExams, filteredSubmissions } = filteredData;

    // Öğrenci-sınav bazında grupla (aynı öğrenci-sınav için birden fazla dosya varsa, grade'i olanı seç)
    const getUniqueSubmissions = (subs) => {
      const grouped = {};
      subs.forEach(sub => {
        const key = `${sub.examId}-${sub.studentId}`;
        // Eğer daha önce bu key için kayıt yoksa veya mevcut submission'ın grade'i varsa, güncelle
        if (!grouped[key] || (sub.grade !== null && sub.grade !== undefined)) {
          grouped[key] = sub;
        }
      });
      return Object.values(grouped);
    };

    const uniqueSubmissions = getUniqueSubmissions(filteredSubmissions);

    const totalExams = filteredExams.length;

    // Aktif sınav sayısı (Tarihi geçmemiş ve aktif olanlar)
    const activeExams = filteredExams.filter(e => {
      const now = new Date();
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      return (e.status === 'active' || e.isActive) && start <= now && end >= now;
    }).length;

    const totalSubmissions = uniqueSubmissions.length;
    const gradedSubmissions = uniqueSubmissions.filter(s => s.grade !== null && s.grade !== undefined).length;
    const lateSubmissions = uniqueSubmissions.filter(s => s.isLate).length;

    const allGrades = uniqueSubmissions.filter(s => s.grade !== null && s.grade !== undefined).map(s => s.grade);
    const averageGrade = allGrades.length > 0
      ? Math.round(allGrades.reduce((a, b) => a + b, 0) / allGrades.length)
      : 0;

    const passRate = allGrades.length > 0
      ? Math.round((allGrades.filter(g => g >= 50).length / allGrades.length) * 100)
      : 0;

    return { totalExams, activeExams, totalSubmissions, gradedSubmissions, lateSubmissions, averageGrade, passRate };
  }, [filteredData]);

  const classStats = useMemo(() => {
    const { filteredSubmissions } = filteredData;

    // Öğrenci-sınav bazında grupla (grade'i olanı seç)
    const getUniqueSubmissions = (subs) => {
      const grouped = {};
      subs.forEach(sub => {
        const key = `${sub.examId}-${sub.studentId}`;
        if (!grouped[key] || (sub.grade !== null && sub.grade !== undefined)) {
          grouped[key] = sub;
        }
      });
      return Object.values(grouped);
    };

    return CLASS_LIST.map(className => {
      const classStudents = students.filter(s => s.className === className);
      const classSubmissions = filteredSubmissions.filter(s =>
        s.className === className || s.studentClass === className
      );
      const uniqueSubmissions = getUniqueSubmissions(classSubmissions);
      const gradedSubs = uniqueSubmissions.filter(s => s.grade !== null && s.grade !== undefined);
      const avgGrade = gradedSubs.length > 0
        ? Math.round(gradedSubs.reduce((a, s) => a + s.grade, 0) / gradedSubs.length)
        : 0;
      return {
        name: className,
        students: classStudents.length,
        submissions: uniqueSubmissions.length,
        average: avgGrade
      };
    }).filter(stat => selectedClass === 'all' || stat.name === selectedClass);
  }, [students, filteredData, selectedClass]);

  const gradeDistribution = useMemo(() => {
    const { filteredSubmissions } = filteredData;

    // Öğrenci-sınav bazında grupla (grade'i olanı seç)
    const getUniqueSubmissions = (subs) => {
      const grouped = {};
      subs.forEach(sub => {
        const key = `${sub.examId}-${sub.studentId}`;
        if (!grouped[key] || (sub.grade !== null && sub.grade !== undefined)) {
          grouped[key] = sub;
        }
      });
      return Object.values(grouped);
    };

    const uniqueSubmissions = getUniqueSubmissions(filteredSubmissions);
    const grades = uniqueSubmissions.filter(s => s.grade !== null && s.grade !== undefined).map(s => s.grade);
    return [
      { range: '0-20', count: grades.filter(g => g >= 0 && g < 20).length, fill: '#ef4444' },
      { range: '20-40', count: grades.filter(g => g >= 20 && g < 40).length, fill: '#f59e0b' },
      { range: '40-60', count: grades.filter(g => g >= 40 && g < 60).length, fill: '#eab308' },
      { range: '60-80', count: grades.filter(g => g >= 60 && g < 80).length, fill: '#22c55e' },
      { range: '80-100', count: grades.filter(g => g >= 80 && g <= 100).length, fill: '#10b981' }
    ];
  }, [filteredData]);

  const examTypeDistribution = useMemo(() => {
    const { filteredExams } = filteredData;
    return [
      { name: 'Sınav', value: filteredExams.filter(e => e.type === 'exam' || e.type === 'final_exam').length },
      { name: 'Ödev', value: filteredExams.filter(e => e.type === 'homework').length },
      { name: 'Proje', value: filteredExams.filter(e => e.type === 'project').length }
    ].filter(item => item.value > 0);
  }, [filteredData]);

  const submissionStatus = useMemo(() => {
    const { filteredSubmissions } = filteredData;

    // Öğrenci-sınav bazında grupla (grade'i olanı seç)
    const getUniqueSubmissions = (subs) => {
      const grouped = {};
      subs.forEach(sub => {
        const key = `${sub.examId}-${sub.studentId}`;
        if (!grouped[key] || (sub.grade !== null && sub.grade !== undefined)) {
          grouped[key] = sub;
        }
      });
      return Object.values(grouped);
    };

    const uniqueSubmissions = getUniqueSubmissions(filteredSubmissions);

    // Gönderim bazlı sayım (aynı öğrenci farklı sınavlarda olabilir)
    const gradedCount = uniqueSubmissions.filter(s =>
      s.grade !== null && s.grade !== undefined
    ).length;

    const waitingCount = uniqueSubmissions.filter(s =>
      s.grade === null || s.grade === undefined
    ).length;

    return [
      { name: 'Değerlendirildi', value: gradedCount },
      { name: 'Bekliyor', value: waitingCount }
    ].filter(item => item.value > 0);
  }, [filteredData]);

  const classOptions = [
    { value: 'all', label: 'Tüm Sınıflar' },
    ...CLASS_LIST.map(c => ({ value: c, label: c }))
  ];

  const timeOptions = [
    { value: 'all', label: 'Tüm Zamanlar' },
    { value: 'week', label: 'Bu Hafta' },
    { value: 'month', label: 'Bu Ay' },
    { value: 'semester', label: 'Bu Dönem' }
  ];

  const downloadReport = () => {
    // CSV formatında rapor oluştur
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // UTF-8 BOM for Turkish characters

    // Başlık
    csvContent += `İstatistik Raporu\n`;
    csvContent += `Tarih: ${new Date().toLocaleDateString('tr-TR')}\n`;
    csvContent += `Sınıf Filtresi: ${selectedClass === 'all' ? 'Tüm Sınıflar' : selectedClass}\n`;
    csvContent += `Zaman Dilimi: ${timeOptions.find(t => t.value === timeRange)?.label}\n\n`;

    // Genel İstatistikler
    csvContent += `GENEL İSTATİSTİKLER\n`;
    csvContent += `Toplam Sınav/Ödev,${generalStats.totalExams}\n`;
    csvContent += `Aktif Sınavlar,${generalStats.activeExams}\n`;
    csvContent += `Toplam Gönderim,${generalStats.totalSubmissions}\n`;
    csvContent += `Değerlendirildi,${generalStats.gradedSubmissions}\n`;
    csvContent += `Ortalama Not,${generalStats.averageGrade}\n`;
    csvContent += `Geçme Oranı,%${generalStats.passRate}\n`;
    csvContent += `Geç Gönderim,${generalStats.lateSubmissions}\n\n`;

    // Sınıf Performansı
    csvContent += `SINIF PERFORMANSI\n`;
    csvContent += `Sınıf,Öğrenci Sayısı,Gönderim,Ortalama Not\n`;
    classStats.forEach(stat => {
      csvContent += `${stat.name},${stat.students},${stat.submissions},${stat.average}\n`;
    });
    csvContent += `\n`;

    // Not Dağılımı
    csvContent += `NOT DAĞILIMI\n`;
    csvContent += `Aralık,Öğrenci Sayısı\n`;
    gradeDistribution.forEach(dist => {
      csvContent += `${dist.range},${dist.count}\n`;
    });

    // CSV'yi indir
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `istatistik_raporu_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '14px' }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <TeacherLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>İstatistikler</h1>
            <p style={styles.subtitle}>Detaylı performans analizi</p>
          </div>
          <div style={styles.headerActions}>
            <Select options={classOptions} value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} />
            <Select options={timeOptions} value={timeRange} onChange={(e) => setTimeRange(e.target.value)} />
            <Button variant="outline" onClick={downloadReport}>
              <Download size={16} style={{ marginRight: '8px' }} />
              Rapor İndir
            </Button>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statRow}>
              <div>
                <p style={styles.statLabel}>Toplam Sınav/Ödev</p>
                <p style={styles.statValue}>{generalStats.totalExams}</p>
                <div style={styles.statExtra}>
                  <Badge variant="success" size="sm">{generalStats.activeExams} Aktif</Badge>
                </div>
              </div>
              <div style={styles.iconBox('#f0fdfa')}>
                <FileText size={24} style={{ color: '#0d9488' }} />
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statRow}>
              <div>
                <p style={styles.statLabel}>Toplam Gönderim</p>
                <p style={styles.statValue}>{generalStats.totalSubmissions}</p>
                <div style={styles.statExtra}>
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                  <span style={{ color: '#64748b' }}>{generalStats.gradedSubmissions} değerlendirildi</span>
                </div>
              </div>
              <div style={styles.iconBox('#dcfce7')}>
                <Users size={24} style={{ color: '#10b981' }} />
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statRow}>
              <div>
                <p style={styles.statLabel}>Ortalama Not</p>
                <p style={styles.statValue}>{generalStats.averageGrade}</p>
                <div style={styles.statExtra}>
                  {generalStats.averageGrade >= 60 ? (
                    <TrendingUp size={16} style={{ color: '#10b981' }} />
                  ) : (
                    <TrendingDown size={16} style={{ color: '#ef4444' }} />
                  )}
                  <span style={{ color: '#64748b' }}>%{generalStats.passRate} geçme oranı</span>
                </div>
              </div>
              <div style={styles.iconBox('#fef3c7')}>
                <Award size={24} style={{ color: '#f59e0b' }} />
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statRow}>
              <div>
                <p style={styles.statLabel}>Geç Gönderim</p>
                <p style={styles.statValue}>{generalStats.lateSubmissions}</p>
                <div style={styles.statExtra}>
                  <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                  <span style={{ color: '#64748b' }}>
                    %{generalStats.totalSubmissions > 0
                      ? Math.round((generalStats.lateSubmissions / generalStats.totalSubmissions) * 100)
                      : 0}
                  </span>
                </div>
              </div>
              <div style={styles.iconBox('#fef2f2')}>
                <Clock size={24} style={{ color: '#ef4444' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={styles.chartGrid}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Sınıf Performansı</h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="submissions" name="Gönderim" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="average" name="Ortalama" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Not Dağılımı</h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Öğrenci Sayısı" radius={[4, 4, 0, 0]}>
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={styles.pieGrid}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Sınav/Ödev Dağılımı</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ height: '180px', width: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={examTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {examTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                {examTypeDistribution.map((item, index) => (
                  <div key={item.name} style={styles.legendItem}>
                    <span style={styles.legendDot(COLORS[index])} />
                    <span style={styles.legendLabel}>{item.name}</span>
                    <span style={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Gönderim Durumu</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ height: '180px', width: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={submissionStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {submissionStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                {submissionStatus.map((item, index) => (
                  <div key={item.name} style={styles.legendItem}>
                    <span style={styles.legendDot(COLORS[index])} />
                    <span style={styles.legendLabel}>{item.name}</span>
                    <span style={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Stats;
