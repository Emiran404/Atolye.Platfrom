import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeacherLayout } from '../../components/layouts';
import { Button, Input, Badge, Modal, Select, ConfirmModal } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useExamStore } from '../../store/examStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useAuthStore, CLASS_LIST } from '../../store/authStore';
import { formatDate, formatDateTime } from '../../utils/dateHelpers';
import {
  Search, Filter, Archive as ArchiveIcon, FileText, Users, Calendar,
  Eye, Download, Trash2, BarChart2, FileSpreadsheet, FileDown, X, TrendingUp
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2pdf from 'html2pdf.js';

const styles = {
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '32px',
    animation: 'fadeIn 0.5s ease-out'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    flexWrap: 'wrap', 
    gap: '24px',
    padding: '0 4px'
  },
  title: { 
    fontSize: '32px', 
    fontWeight: '800', 
    color: '#0f172a', 
    margin: 0,
    letterSpacing: '-0.02em',
    fontFamily: 'Lexend, sans-serif'
  },
  subtitle: { 
    fontSize: '15px', 
    color: '#64748b', 
    marginTop: '6px',
    fontWeight: '500'
  },
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
    gap: '20px' 
  },
  statCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden'
  },
  iconBox: (bg, color) => ({
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 16px -4px ${bg}40`,
    flexShrink: 0
  }),
  statValue: { 
    fontSize: '32px', 
    fontWeight: '800', 
    color: '#0f172a', 
    lineHeight: 1, 
    marginBottom: '6px',
    fontFamily: 'Lexend, sans-serif'
  },
  statLabel: { 
    fontSize: '13px', 
    fontWeight: '700', 
    color: '#64748b', 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em' 
  },
  filterCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  filterRow: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    gap: '20px' 
  },
  searchContainer: { 
    flex: '1', 
    minWidth: '280px', 
    maxWidth: '400px',
    position: 'relative'
  },
  select: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s',
    minWidth: '160px'
  },
  emptyState: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '80px 48px',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  emptyIcon: { 
    width: '80px', 
    height: '80px', 
    color: '#cbd5e1', 
    margin: '0 auto 24px',
    opacity: 0.5 
  },
  emptyTitle: { 
    fontSize: '22px', 
    fontWeight: '700', 
    color: '#0f172a', 
    marginBottom: '12px',
    fontFamily: 'Lexend, sans-serif'
  },
  emptyText: { 
    color: '#64748b', 
    fontSize: '16px',
    maxWidth: '400px',
    margin: '0 auto'
  },
  examCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  examRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: '20px' 
  },
  examInfo: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px',
    flex: 1,
    minWidth: 0
  },
  examIcon: (bg, color) => ({
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    backgroundColor: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '24px',
    fontWeight: '800'
  }),
  examTitle: { 
    fontSize: '20px', 
    fontWeight: '800', 
    color: '#0f172a', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    margin: 0,
    fontFamily: 'Lexend, sans-serif'
  },
  examDesc: { 
    fontSize: '14px', 
    color: '#64748b', 
    marginTop: '4px', 
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  examMeta: { 
    display: 'flex', 
    alignItems: 'center', 
    flexWrap: 'wrap',
    gap: '16px', 
    marginTop: '12px' 
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  examActions: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px' 
  },
  modalContent: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '32px', 
    padding: '8px' 
  },
  modalHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f1f5f9'
  },
  modalIcon: (bg, color) => ({
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    backgroundColor: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '800',
    boxShadow: `0 12px 24px -6px ${bg}40`
  }),
  modalTitle: { 
    fontSize: '24px', 
    fontWeight: '800', 
    color: '#0f172a',
    marginBottom: '6px',
    fontFamily: 'Lexend, sans-serif'
  },
  detailGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: '24px',
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '20px',
    border: '1px solid #e2e8f0'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  detailLabel: { 
    fontSize: '12px', 
    color: '#94a3b8', 
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '700'
  },
  detailValue: { 
    fontWeight: '700', 
    color: '#334155',
    fontSize: '16px'
  },
  statsRow: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
    gap: '16px'
  },
  statBox: (color) => ({
    padding: '20px',
    backgroundColor: '#ffffff',
    border: `2px solid ${color}15`,
    borderRadius: '16px',
    textAlign: 'center',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }),
  statBoxValue: (color) => ({ 
    fontSize: '30px', 
    fontWeight: '800', 
    color: color,
    fontFamily: 'Lexend, sans-serif'
  }),
  statBoxLabel: { 
    fontSize: '12px', 
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '700'
  },
  actionButton: (bg, color) => ({
    padding: '12px 20px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: bg,
    color: color,
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: `0 4px 12px -2px ${bg}30`
  })
};

const Archive = () => {
  const navigate = useNavigate();
  const { exams, loadExams, deleteExam } = useExamStore();
  const { submissions, loadSubmissions } = useSubmissionStore();
  const { user, getAllStudents, loadUsers, students, loadStudents } = useAuthStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showClassReportModal, setShowClassReportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedClassForReport, setSelectedClassForReport] = useState('all');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Tamam',
    onConfirm: () => {},
    type: 'warning'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadExams(user?.id);
      await loadSubmissions();
      setLoading(false);
    };
    fetchData();
  }, []);

  const archivedExams = exams.filter(e => e.status === 'completed' || new Date(e.endDate) < new Date());

  const filteredExams = archivedExams.filter(exam => {
    const title = exam.title || '';
    const desc = exam.description || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tür filtresi (exam ve final_exam'ı "Sınav" olarak birleştir)
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'exam' && (exam.type === 'exam' || exam.type === 'final_exam')) ||
                       (typeFilter === 'assignment' && (exam.type !== 'exam' && exam.type !== 'final_exam' && exam.type !== 'project')) ||
                       (exam.type === typeFilter);
    
    // Sınıf filtresi (Hedef sınıflar içinde ara)
    const matchesClass = classFilter === 'all' || 
                        (exam.targetType === 'all') ||
                        (exam.targetClasses && exam.targetClasses.includes(classFilter));
                        
    return matchesSearch && matchesType && matchesClass;
  }).sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  const getExamStats = (examId) => {
    // edit_granted durumundaki gönderimleri filtrele
    const examSubmissions = submissions.filter(s => s.examId === examId && s.status !== 'edit_granted');
    
    // Öğrenci-sınav bazında grupla (aynı öğrenci için birden fazla dosya varsa 1 gönderim say)
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
    
    const uniqueSubmissions = getUniqueSubmissions(examSubmissions);
    const totalSubmissions = uniqueSubmissions.length;
    const gradedSubmissions = uniqueSubmissions.filter(s => s.grade !== null && s.grade !== undefined);
    const numGrades = gradedSubmissions.filter(s => typeof s.grade === 'number');
    const averageGrade = numGrades.length > 0
      ? Math.round(numGrades.reduce((acc, s) => acc + (s.grade || 0), 0) / numGrades.length)
      : null;
    const passRate = gradedSubmissions.length > 0
      ? Math.round((gradedSubmissions.filter(s => typeof s.grade === 'number' && s.grade >= 50).length / gradedSubmissions.length) * 100)
      : null;
    return { totalSubmissions, gradedCount: gradedSubmissions.length, averageGrade, passRate };
  };

  const getExamSubmissionsWithGrades = (examId) => {
    // edit_granted durumundaki gönderimleri filtrele
    const activeSubmissions = submissions.filter(s => 
      s.examId === examId && 
      s.grade !== null && 
      s.grade !== undefined &&
      s.status !== 'edit_granted'
    );
    
    // Öğrenci bazında grupla (aynı öğrenci için birden fazla dosya varsa sadece biri gösterilsin)
    const grouped = {};
    activeSubmissions.forEach(s => {
      const key = `${s.examId}-${s.studentId}`;
      if (!grouped[key]) {
        grouped[key] = {
          studentName: s.studentName,
          studentNumber: s.studentNumber,
          studentClass: s.studentClass || s.className,
          grade: s.grade,
          submittedAt: s.submittedAt,
          feedback: s.feedback || '-'
        };
      }
    });
    
    return Object.values(grouped).sort((a, b) => {
      const gA = typeof a.grade === 'number' ? a.grade : -1;
      const gB = typeof b.grade === 'number' ? b.grade : -1;
      return gB - gA;
    });
  };

  const downloadReport = (exam, format) => {
    const submissionsData = getExamSubmissionsWithGrades(exam.id);
    const stats = getExamStats(exam.id);

    if (format === 'csv') {
      downloadCSV(exam, submissionsData, stats);
    } else if (format === 'excel') {
      downloadExcel(exam, submissionsData, stats);
    } else if (format === 'pdf') {
      downloadPDF(exam, submissionsData, stats);
    }
    setShowDownloadModal(false);
  };

  const downloadCSV = (exam, submissionsData, stats) => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    
    csvContent += `${exam.title}\n`;
    csvContent += `Tarih: ${formatDate(exam.endDate)}\n`;
    csvContent += `Tip: ${(exam.type === 'exam' || exam.type === 'final_exam') ? 'Sınav' : 'Ödev'}\n\n`;
    
    csvContent += `İSTATİSTİKLER\n`;
    csvContent += `Toplam Gönderim,${stats.totalSubmissions}\n`;
    csvContent += `Değerlendirilen,${stats.gradedCount}\n`;
    csvContent += `Ortalama Not,${stats.averageGrade || '-'}\n`;
    csvContent += `Geçme Oranı,${stats.passRate !== null ? '%' + stats.passRate : '-'}\n\n`;
    
    csvContent += `ÖĞRENCİ NOTLARI\n`;
    csvContent += `Okul No,Ad Soyad,Sınıf,Not,Gönderim Tarihi,Geri Bildirim\n`;
    submissionsData.forEach(s => {
      csvContent += `${s.studentNumber},${s.studentName},${s.studentClass},${s.grade},${formatDateTime(s.submittedAt)},"${s.feedback}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exam.title}_rapor_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV raporu indirildi');
  };

  const downloadExcel = (exam, submissionsData, stats) => {
    // Excel için HTML tablosu oluştur (Excel HTML formatını destekler)
    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
        <table>
          <tr><td colspan="6" style="font-size:18px;font-weight:bold;">${exam.title}</td></tr>
          <tr><td colspan="6">Tarih: ${formatDate(exam.endDate)}</td></tr>
          <tr><td colspan="6">Tip: ${(exam.type === 'exam' || exam.type === 'final_exam') ? 'Sınav' : 'Ödev'}</td></tr>
          <tr><td colspan="6"></td></tr>
          <tr><td colspan="6" style="font-weight:bold;">İSTATİSTİKLER</td></tr>
          <tr><td>Toplam Gönderim</td><td>${stats.totalSubmissions}</td></tr>
          <tr><td>Değerlendirilen</td><td>${stats.gradedCount}</td></tr>
          <tr><td>Ortalama Not</td><td>${stats.averageGrade || '-'}</td></tr>
          <tr><td>Geçme Oranı</td><td>${stats.passRate !== null ? '%' + stats.passRate : '-'}</td></tr>
          <tr><td colspan="6"></td></tr>
          <tr><td colspan="6" style="font-weight:bold;">ÖĞRENCİ NOTLARI</td></tr>
          <tr style="font-weight:bold;">
            <td>Okul No</td>
            <td>Ad Soyad</td>
            <td>Sınıf</td>
            <td>Not</td>
            <td>Gönderim Tarihi</td>
            <td>Geri Bildirim</td>
          </tr>
    `;
    
    submissionsData.forEach(s => {
      excelContent += `
        <tr>
          <td>${s.studentNumber}</td>
          <td>${s.studentName}</td>
          <td>${s.studentClass}</td>
          <td>${s.grade}</td>
          <td>${formatDateTime(s.submittedAt)}</td>
          <td>${s.feedback}</td>
        </tr>
      `;
    });
    
    excelContent += `</table></body></html>`;
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exam.title}_rapor_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Excel raporu indirildi');
  };

  const downloadPDF = (exam, submissionsData, stats) => {
    try {
      const doc = new jsPDF();
      
      // Helper function to convert Turkish characters to ASCII
      const toAscii = (text) => {
        if (!text) return text;
        return text
          .replace(/ı/g, 'i').replace(/İ/g, 'I')
          .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
          .replace(/ü/g, 'u').replace(/Ü/g, 'U')
          .replace(/ş/g, 's').replace(/Ş/g, 'S')
          .replace(/ö/g, 'o').replace(/Ö/g, 'O')
          .replace(/ç/g, 'c').replace(/Ç/g, 'C');
      };
      
      // Baslik
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(toAscii(exam.title), 14, 20);
      
      // Temel bilgiler
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Tarih: ${formatDate(exam.endDate)}`, 14, 30);
      doc.text(`Tip: ${(exam.type === 'exam' || exam.type === 'final_exam') ? 'Sinav' : 'Odev'}`, 14, 37);
      
      // Istatistikler basligi
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text('ISTATISTIKLER', 14, 50);
      
      // Istatistikler tablosu
      autoTable(doc, {
        startY: 55,
        head: [['Metrik', 'Deger']],
        body: [
          ['Toplam Gonderim', stats.totalSubmissions.toString()],
          ['Degerlendirilen', stats.gradedCount.toString()],
          ['Ortalama Not', stats.averageGrade ? stats.averageGrade.toString() : '-'],
          ['Gecme Orani', stats.passRate !== null ? `%${stats.passRate}` : '-']
        ],
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold' },
        styles: { font: 'helvetica', fontSize: 10 },
        margin: { left: 14, right: 14 }
      });
      
      // Ogrenci notlari basligi
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text('OGRENCI NOTLARI', 14, finalY);
      
      // Ogrenci notlari tablosu
      const tableData = submissionsData.map(s => [
        s.studentNumber,
        toAscii(s.studentName),
        toAscii(s.studentClass),
        s.grade.toString(),
        formatDateTime(s.submittedAt),
        toAscii(s.feedback.length > 30 ? s.feedback.substring(0, 30) + '...' : s.feedback)
      ]);
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Okul No', 'Ad Soyad', 'Sinif', 'Not', 'Gonderim Tarihi', 'Geri Bildirim']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [71, 85, 105], 
          textColor: 255, 
          fontStyle: 'bold',
          fontSize: 9
        },
        styles: { 
          font: 'helvetica', 
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 20 },
          3: { cellWidth: 15 },
          4: { cellWidth: 40 },
          5: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          // Sayfa numarasi ekle
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setFont(undefined, 'normal');
          doc.text(
            `Sayfa ${data.pageNumber} / ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      });
      
      // PDF'i indir
      doc.save(`${toAscii(exam.title)}_rapor_${Date.now()}.pdf`);
      toast.success('PDF raporu indirildi');
    } catch (error) {
      console.error('PDF olusturma hatasi:', error);
      toast.error('PDF olusturulurken bir hata olustu');
    }
  };

  const handleDelete = (exam) => {
    setConfirmModal({
      isOpen: true,
      title: 'Sınavı Sil',
      message: `"${exam.title}" isimli sınavı ve buna bağlı tüm öğrenci gönderimlerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Sınavı Sil',
      type: 'danger',
      onConfirm: async () => {
        try {
          const success = await deleteExam(exam.id);
          if (success) {
            toast.success('Sınav başarıyla silindi');
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            setSelectedExam(null);
            // Listeyi yeniden yükle
            await loadExams();
            await loadSubmissions();
          } else {
            toast.error('Sınav silinemedi');
          }
        } catch (error) {
          console.error('Silme hatası:', error);
          toast.error('Bir hata oluştu: ' + error.message);
        }
      }
    });
  };

  const getClassReportData = () => {
    // loadUsers() is called on mount, so getAllStudents() should have data. If not, use students from store.
    const allStudentsList = students && students.length > 0 ? students : (typeof getAllStudents === 'function' ? getAllStudents() : []);
    
    // Sınıf filtresi
    const targetStudents = selectedClassForReport === 'all' 
      ? allStudentsList 
      : allStudentsList.filter(s => s.className === selectedClassForReport);

    // İlgili sınavları/ödevleri al (kronolojik sıralı)
    const reportExams = archivedExams.slice().sort((a,b) => new Date(a.endDate) - new Date(b.endDate));

    // Her öğrenci için notları eşleştir
    const rows = targetStudents.map(student => {
      const studentName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim();
      const studentRow = {
        studentNumber: student.studentNumber,
        studentName: studentName || 'Bilinmiyor',
        studentClass: student.className,
        grades: {}
      };

      reportExams.forEach(exam => {
        // Bu öğrencinin bu sınava ait geçerli bir gönderimini bul
        const sub = submissions.find(s => s.examId === exam.id && s.studentId === student.id && s.status !== 'edit_granted');
        studentRow.grades[exam.id] = (sub && sub.grade !== null && sub.grade !== undefined) ? sub.grade : 'G';
      });

      return studentRow;
    });

    return { targetStudents, reportExams, rows };
  };

  const downloadClassReportExcel = () => {
    const { targetStudents, reportExams, rows } = getClassReportData();
    
    if (targetStudents.length === 0) {
      toast.error('Görüntülenecek öğrenci bulunamadı.');
      return;
    }

    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
        <table>
          <tr><td colspan="${3 + reportExams.length}" style="font-size:18px;font-weight:bold;text-align:center;">Sınıf Raporu: ${selectedClassForReport === 'all' ? 'Tüm Sınıflar' : selectedClassForReport}</td></tr>
          <tr><td colspan="${3 + reportExams.length}">Rapor Tarihi: ${formatDate(new Date())}</td></tr>
          <tr><td colspan="${3 + reportExams.length}"></td></tr>
          <tr style="font-weight:bold; background-color:#f1f5f9;">
            <td>Okul No</td>
            <td>Ad Soyad</td>
            <td>Sınıf</td>
            ${reportExams.map(e => `<td>${e.title}</td>`).join('')}
          </tr>
    `;

    rows.forEach(r => {
      excelContent += `
        <tr>
          <td>${r.studentNumber}</td>
          <td>${r.studentName}</td>
          <td>${r.studentClass}</td>
          ${reportExams.map(e => {
            const grade = r.grades[e.id];
            const color = (grade === 'G' || grade === 'K') ? '#ef4444' : (grade >= 50 ? '#10b981' : '#f59e0b');
            return `<td style="color:${color};font-weight:bold;text-align:center;">${grade}</td>`;
          }).join('')}
        </tr>
      `;
    });

    excelContent += `</table></body></html>`;
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sinif_Raporu_${selectedClassForReport}_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Excel sınıf raporu indirildi');
    setShowClassReportModal(false);
  };

  const downloadClassReportCSV = () => {
    const { targetStudents, reportExams, rows } = getClassReportData();
    if (targetStudents.length === 0) {
      toast.error('Görüntülenecek öğrenci bulunamadı.');
      return;
    }

    const headers = ['Okul No', 'Ad Soyad', 'Sinif', ...reportExams.map(e => e.title), 'ORTALAMA'];
    const replacer = (key, value) => value === null ? '' : value;
    
    const csvRows = [headers.join(',')];

    rows.forEach(r => {
      let totalScore = 0;
      let validExamCount = 0;
      const examGrades = reportExams.map(e => {
          const grade = r.grades[e.id];
          if (grade !== 'G' && !isNaN(parseInt(grade))) {
              totalScore += parseInt(grade);
              validExamCount++;
          }
          return grade;
      });
      const avg = validExamCount > 0 ? Math.round(totalScore / validExamCount) : 'G';
      const row = [r.studentNumber, `"${r.studentName}"`, r.studentClass, ...examGrades, avg];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sinif_Raporu_${selectedClassForReport === 'all' ? 'Tum_Okul' : selectedClassForReport}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV sınıf raporu indirildi');
    setShowClassReportModal(false);
  };

  const getReportHtmlString = () => {
    const { targetStudents, reportExams, rows } = getClassReportData();
    if (targetStudents.length === 0) return '';
    const reportDate = formatDateTime(new Date());

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; background: white; color: #0f172a; width: 1000px; margin: 0 auto; border: 2px solid #1e293b; position: relative;">
        <!-- Digital Stamp (Kaşe Altta) -->
        <div style="position: absolute; bottom: 40px; left: 70px; border: 3px double #0f172a; color: #0f172a; border-radius: 50%; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; transform: rotate(-12deg); opacity: 0.3; pointer-events: none; z-index: 9;">
          <div style="text-align: center; border: 1px solid #0f172a; border-radius: 50%; width: 120px; height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">PolyOS</div>
            <div style="font-size: 10px; font-weight: bold; margin: 6px 0; border-top: 1px dashed #0f172a; border-bottom: 1px dashed #0f172a; padding: 3px 0; width: 90%;">RESMİ SİSTEM</div>
            <div style="font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">İMZASI</div>
          </div>
        </div>

        <!-- Digital Signature Image (Kaşenin Üstünde) -->
        <div style="position: absolute; bottom: 75px; left: 45px; transform: rotate(-5deg); opacity: 0.9; pointer-events: none; z-index: 10;">
          <img src="/polyos_izma_sirküsü.png" style="width: 150px; height: auto;" alt="PolyOS Imza" />
        </div>
        
        <!-- Başlık Alanı -->
        <div style="display: flex; align-items: center; justify-content: center; border-bottom: 3px double #1e293b; padding-bottom: 15px; margin-bottom: 20px; position: relative;">
          <img src="/milli_egitim_bakani_arma.png" style="position: absolute; left: 10px; top: -10px; width: 120px; height: auto;" alt="MEB Logo" />
          <div style="text-align: center;">
            <p style="font-size: 14px; font-weight: bold; margin: 0; color: #475569; text-transform: uppercase;">PolyOS Eğitim Platformu</p>
            <h1 style="font-size: 26px; font-weight: 800; margin: 10px 0 5px 0; letter-spacing: 1px;">DÖNEM SONU SINIF RAPORU</h1>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Bu belge sistem tarafından otomatik olarak oluşturulmuştur.</p>
          </div>
        </div>

        <!-- Bilgi Paneli -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; padding: 10px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div>
            <p style="margin: 0; font-size: 14px;"><strong>Sınıf:</strong> ${selectedClassForReport === 'all' ? 'Tüm Okul' : selectedClassForReport}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Öğrenci Sayısı:</strong> ${rows.length}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px;"><strong>Rapor Tarihi:</strong> ${reportDate}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #ef4444; font-weight: bold;">"G" : Sınava veya Ödeve Girmedi</p>
          </div>
        </div>

        <!-- Puan Tablosu -->
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr>
              <th style="border: 1px solid #cbd5e1; padding: 8px; background-color: #f1f5f9; text-align: center; width: 45px;">Ogr. No</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; background-color: #f1f5f9; text-align: left; width: 140px;">Ad Soyad</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; background-color: #f1f5f9; text-align: center; width: 40px;">Sınıf</th>
              ${reportExams.map(e => `
                <th style="border: 1px solid #cbd5e1; background-color: #f1f5f9; position: relative; height: 160px; min-width: 40px;">
                  <div style="position: absolute; bottom: 15px; left: 50%; width: 12px; margin-left: -6px;">
                    <span style="display: inline-block; transform: rotate(-90deg); transform-origin: left bottom; white-space: nowrap; font-size: 11px; font-weight: bold; color: #334155;">
                      ${e.title}
                    </span>
                  </div>
                </th>
              `).join('')}
              <th style="border: 1px solid #cbd5e1; padding: 8px; background-color: #e2e8f0; text-align: center; width: 40px; font-weight: 800; font-size: 12px;">ORT.</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => {
              let totalScore = 0;
              let validExamCount = 0;

              const examCols = reportExams.map(e => {
                const grade = r.grades[e.id];
                if (grade !== 'G' && !isNaN(parseInt(grade))) {
                  totalScore += parseInt(grade);
                  validExamCount++;
                }
                
                // Renklendirme
                let colorStyles = '';
                if (grade === 'G') {
                  colorStyles = 'color: #dc2626; font-weight: bold;';
                } else if (grade < 50) {
                  colorStyles = 'color: #d97706; font-weight: bold;';
                } else if (grade >= 85) {
                  colorStyles = 'color: #059669; font-weight: bold;';
                } else {
                  colorStyles = 'color: #1e293b; font-weight: bold;';
                }

                return `<td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; ${colorStyles}">${grade}</td>`;
              }).join('');

              const avg = validExamCount > 0 ? Math.round(totalScore / validExamCount) : 'G';
              const avgColor = avg === 'G' ? '#dc2626' : (avg < 50 ? '#d97706' : '#1e293b');

              const bgColor = i % 2 === 0 ? '#ffffff' : '#f8fafc';

              return `
                <tr style="background-color: ${bgColor}; page-break-inside: avoid;">
                  <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #475569;">${r.studentNumber}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: 600;">${r.studentName}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; color: #475569;">${r.studentClass}</td>
                  ${examCols}
                  <td style="border: 1px solid #94a3b8; padding: 8px; text-align: center; background-color: #f1f5f9; font-weight: 800; color: ${avgColor}; font-size: 13px;">${avg}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- İmza Alanı -->
        <div style="margin-top: 50px; display: flex; justify-content: flex-end; padding-right: 50px; position: relative;">
          <div style="text-align: center;">
            <p style="margin: 0; font-size: 14px;"><strong>Onaylayan</strong></p>
            <br><br>
            <p style="margin: 0; font-size: 14px; border-top: 1px solid #cbd5e1; padding-top: 5px; width: 150px;">Okul Müdürü / Öğretmen</p>
          </div>
        </div>
        
      </div>
    `;
  };

  const downloadClassReportPDF = () => {
    try {
      const { targetStudents } = getClassReportData();
      if (targetStudents.length === 0) {
        toast.error('Görüntülenecek öğrenci bulunamadı.');
        return;
      }

      const htmlContent = getReportHtmlString();

      // html2pdf Konfigürasyonu
      const opt = {
        margin:       0.5,
        filename:     `Sinif_Raporu_${selectedClassForReport}_${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
      };

      // Geçici bir eleman oluştur HTML'i bas
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      
      // Oluştur
      html2pdf().set(opt).from(element).save().then(() => {
         toast.success('PDF sınıf raporu başarıyla indirildi');
         setShowClassReportModal(false);
      });

    } catch (error) {
      console.error('PDF hatası:', error);
      toast.error('PDF oluşturulurken hata');
    }
  };

  const totalSubmissions = archivedExams.reduce((acc, e) => acc + getExamStats(e.id).totalSubmissions, 0);

  // Available classes for dropdown
  const availableClasses = [...new Set((students && students.length > 0 ? students : (typeof getAllStudents === 'function' ? getAllStudents() : [])).map(s => s.className).filter(Boolean))].sort();

  return (
    <TeacherLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Arşiv</h1>
            <p style={styles.subtitle}>Tamamlanmış sınavlar ve geçmiş raporlar</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowClassReportModal(true)}
              style={styles.actionButton('white', '#475569')}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <FileSpreadsheet size={18} />
              Sınıf Bazlı Rapor
            </button>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.iconBox('rgba(13, 148, 136, 0.1)', '#0d9488')}>
              <ArchiveIcon size={28} />
            </div>
            <div>
              <div style={styles.statValue}>{archivedExams.length}</div>
              <div style={styles.statLabel}>Toplam Arşiv</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.iconBox('rgba(59, 130, 246, 0.1)', '#3b82f6')}>
              <FileText size={28} />
            </div>
            <div>
              <div style={styles.statValue}>{totalSubmissions}</div>
              <div style={styles.statLabel}>Toplam Gönderim</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.iconBox('rgba(168, 85, 247, 0.1)', '#a855f7')}>
              <Users size={28} />
            </div>
            <div>
              <div style={styles.statValue}>{availableClasses.length}</div>
              <div style={styles.statLabel}>Aktif Sınıf</div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '28px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
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
                placeholder="Sınav adı veya açıklama ile ara..."
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
                placeholder="Tüm Sınıflar"
              >
                <option value="all">Tüm Sınıflar</option>
                {CLASS_LIST.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>

              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                icon={Filter}
                style={{ height: '52px', borderRadius: '16px', border: '2px solid #f1f5f9' }}
                placeholder="Kategoriler"
              >
                <option value="all">Tüm Kategoriler</option>
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
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <X size={18} />
                  Sıfırla
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredExams.length > 0 ? (
            filteredExams.map((exam) => {
              const stats = getExamStats(exam.id);
              const isExam = exam.type === 'exam' || exam.type === 'final_exam';
              const iconColor = isExam ? '#0ea5e9' : '#8b5cf6';
              const iconBg = isExam ? '#f0f9ff' : '#f5f3ff';
              
              return (
                <div
                  key={exam.id}
                  style={styles.examCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 20px -8px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = iconColor + '40';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={styles.examRow}>
                    <div style={styles.examInfo}>
                      <div style={styles.examIcon(iconBg, iconColor)}>
                        {isExam ? <BarChart2 size={28} /> : <FileText size={28} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.examTitle}>
                          {exam.title}
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            textTransform: 'uppercase',
                            backgroundColor: iconBg,
                            color: iconColor,
                            letterSpacing: '0.05em'
                          }}>
                            {isExam ? 'Sınav' : 'Ödev'}
                          </span>
                        </div>
                        <div style={styles.examDesc}>{exam.description || 'Açıklama belirtilmemiş'}</div>
                        
                        <div style={styles.examMeta}>
                          <div style={styles.metaItem}>
                            <Calendar size={15} />
                            {formatDate(exam.endDate)}
                          </div>
                          <div style={styles.metaItem}>
                            <Users size={15} />
                            {exam.targetType === 'all'
                              ? 'Tüm sınıflar'
                              : exam.targetType === 'class'
                                ? exam.targetClasses?.join(', ')
                                : `${(exam.targetStudents?.length || 0) === 0 && stats.totalSubmissions > 0 ? stats.totalSubmissions : (exam.targetStudents?.length || 0)} öğrenci`}
                          </div>
                          <div style={styles.metaItem}>
                            <FileText size={15} />
                            {stats.totalSubmissions} gönderim
                          </div>
                          {stats.averageGrade !== null && (
                            <div style={{
                              ...styles.metaItem,
                              color: stats.averageGrade >= 70 ? '#10b981' : stats.averageGrade >= 50 ? '#f59e0b' : '#ef4444'
                            }}>
                              <TrendingUp size={15} />
                              Ortalama: {stats.averageGrade}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.examActions}>
                      <button 
                        onClick={() => { setSelectedExam(exam); setShowDetailModal(true); }}
                        style={{ ...styles.actionButton('#f8fafc', '#64748b'), padding: '10px' }}
                        title="İncele"
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        onClick={() => { setSelectedExam(exam); setShowDownloadModal(true); }}
                        style={{ ...styles.actionButton('#f0f9ff', '#0369a1'), padding: '10px' }}
                        title="İndir"
                      >
                        <Download size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(exam)}
                        style={{ ...styles.actionButton('#fef2f2', '#ef4444'), padding: '10px' }}
                        title="Sil"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyState}>
              <ArchiveIcon style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>Arşiv boş</h3>
              <p style={styles.emptyText}>Henüz tamamlanmış veya süresi geçmiş bir sınav bulunmuyor.</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Arşiv Detayı" size="lg">
          {selectedExam && (
            <div style={styles.modalContent}>
              {/* Header */}
              {(() => {
                const isExam = selectedExam.type === 'exam';
                const iconColor = isExam ? '#0ea5e9' : '#8b5cf6';
                const iconBg = isExam ? '#f0f9ff' : '#f5f3ff';
                return (
                  <div style={styles.modalHeader}>
                    <div style={styles.modalIcon(iconBg, iconColor)}>
                      {isExam ? <BarChart2 size={36} /> : <FileText size={36} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.modalTitle}>{selectedExam.title}</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          backgroundColor: iconBg,
                          color: iconColor,
                          letterSpacing: '0.05em'
                        }}>
                          {isExam ? 'Sınav' : 'Ödev'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Tarih Bilgileri */}
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <p style={styles.detailLabel}>Başlangıç Tarihi</p>
                  <p style={styles.detailValue}>{formatDate(selectedExam.startDate)}</p>
                </div>
                <div style={styles.detailItem}>
                  <p style={styles.detailLabel}>Bitiş Tarihi</p>
                  <p style={styles.detailValue}>{formatDate(selectedExam.endDate)}</p>
                </div>
              </div>

              {/* Açıklama */}
              {selectedExam.description && (
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: '#ffffff', 
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <p style={styles.detailLabel}>Açıklama</p>
                  <p style={{ ...styles.detailValue, marginTop: '8px', lineHeight: '1.6', color: '#64748b', fontWeight: '500' }}>
                    {selectedExam.description}
                  </p>
                </div>
              )}

              {/* İstatistikler */}
              {(() => {
                const stats = getExamStats(selectedExam.id);
                return (
                  <div>
                    <h4 style={{ 
                      fontSize: '13px', 
                      fontWeight: '800', 
                      color: '#94a3b8', 
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      Sınav Performansı
                    </h4>
                    <div style={styles.statsRow}>
                      <div style={styles.statBox('#3b82f6')}>
                        <p style={styles.statBoxValue('#3b82f6')}>{stats.totalSubmissions}</p>
                        <p style={styles.statBoxLabel}>Gönderim</p>
                      </div>
                      <div style={styles.statBox('#8b5cf6')}>
                        <p style={styles.statBoxValue('#8b5cf6')}>{stats.gradedCount}</p>
                        <p style={styles.statBoxLabel}>Değerlendirilen</p>
                      </div>
                      <div style={styles.statBox(stats.averageGrade >= 50 ? '#10b981' : '#ef4444')}>
                        <p style={styles.statBoxValue(stats.averageGrade >= 50 ? '#10b981' : '#ef4444')}>{stats.averageGrade !== null ? stats.averageGrade : '-'}</p>
                        <p style={styles.statBoxLabel}>Ortalama Not</p>
                      </div>
                      <div style={styles.statBox('#f59e0b')}>
                        <p style={styles.statBoxValue('#f59e0b')}>{stats.passRate !== null ? `%${stats.passRate}` : '-'}</p>
                        <p style={styles.statBoxLabel}>Başarı Oranı</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Öğrenci Notları Tablosu */}
              {(() => {
                const gradesData = getExamSubmissionsWithGrades(selectedExam.id);
                return gradesData.length > 0 && (
                  <div>
                    <h4 style={{ 
                      fontSize: '13px', 
                      fontWeight: '800', 
                      color: '#94a3b8', 
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      Öğrenci Puanları
                    </h4>
                    <div style={{ 
                      maxHeight: '320px', 
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      backgroundColor: '#ffffff',
                      overflow: 'hidden'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ 
                          position: 'sticky', 
                          top: 0, 
                          backgroundColor: '#f8fafc',
                          zIndex: 1
                        }}>
                          <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Okul No</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Ad Soyad</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Sınıf</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Not</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradesData.map((item, idx) => (
                            <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '14px 16px', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{item.studentNumber}</td>
                              <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>{item.studentName}</td>
                              <td style={{ padding: '14px 16px', fontSize: '14px', color: '#64748b' }}>{item.studentClass}</td>
                              <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '6px 12px',
                                  borderRadius: '10px',
                                  fontSize: '14px',
                                  fontWeight: '800',
                                  backgroundColor: item.grade >= 85 ? '#dcfce7' : item.grade >= 70 ? '#eff6ff' : item.grade >= 50 ? '#fffbeb' : '#fef2f2',
                                  color: item.grade >= 85 ? '#166534' : item.grade >= 70 ? '#1d4ed8' : item.grade >= 50 ? '#b45309' : '#b91c1c',
                                  minWidth: '45px'
                                }}>
                                  {item.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px',
                paddingTop: '24px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <button 
                  onClick={() => { setShowDetailModal(false); setShowDownloadModal(true); }}
                  style={styles.actionButton('#f0f9ff', '#0369a1')}
                >
                  <Download size={18} />
                  Rapor İndir
                </button>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  style={styles.actionButton('#f1f5f9', '#475569')}
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Download Format Modal */}
        <Modal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} title="Rapor İndir">
          {selectedExam && (
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                &quot;{selectedExam.title}&quot; için rapor formatını seçin
              </p>
              <div style={{ display: 'grid', gap: '12px' }}>
                <button
                  onClick={() => downloadReport(selectedExam, 'csv')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0d9488';
                    e.currentTarget.style.backgroundColor = '#f0fdfa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={24} style={{ color: '#059669' }} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>CSV Dosyası</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Excel ve diğer programlarda açılabilir</div>
                  </div>
                  <Download size={20} style={{ color: '#64748b' }} />
                </button>

                <button
                  onClick={() => downloadReport(selectedExam, 'excel')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.backgroundColor = '#ecfdf5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileSpreadsheet size={24} style={{ color: '#1e40af' }} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Excel Dosyası</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Microsoft Excel formatında</div>
                  </div>
                  <Download size={20} style={{ color: '#64748b' }} />
                </button>

                <button
                  onClick={() => downloadReport(selectedExam, 'pdf')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    opacity: 0.6
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ef4444';
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileDown size={24} style={{ color: '#dc2626' }} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>PDF Dosyası</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Profesyonel PDF raporu</div>
                  </div>
                  <Download size={20} style={{ color: '#64748b' }} />
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <Button variant="outline" onClick={() => setShowDownloadModal(false)}>
                  <X size={16} style={{ marginRight: '8px' }} />
                  İptal
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Class Report Modal */}
        <Modal isOpen={showClassReportModal} onClose={() => setShowClassReportModal(false)} title="Toplu Sınıf Raporu Al">
          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              İstediğiniz sınıfı seçerek tüm sınav/ödev sonuçlarını tek bir tabloda görün. (Girmeyenler "G" olarak görünür).
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                Raporlanacak Sınıf
              </label>
              <select
                style={{ ...styles.select, width: '100%', padding: '12px' }}
                value={selectedClassForReport}
                onChange={(e) => setSelectedClassForReport(e.target.value)}
              >
                <option value="all">Tüm Öğrenciler</option>
                {availableClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <button
                onClick={downloadClassReportExcel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.backgroundColor = '#ecfdf5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet size={24} style={{ color: '#059669' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Excel Dosyası</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Düzenlenebilir liste arşivi (G harfli)</div>
                </div>
                <Download size={20} style={{ color: '#64748b' }} />
              </button>

              <button
                onClick={() => {
                  const { targetStudents } = getClassReportData();
                  if (targetStudents.length === 0) {
                    toast.error('Görüntülenecek öğrenci bulunamadı.');
                    return;
                  }
                  setShowPreviewModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.backgroundColor = '#e0e7ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={24} style={{ color: '#4f46e5' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Önizleme Görüntüle</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Rapor dökümünü indirmeden incele</div>
                </div>
              </button>

              <button
                onClick={downloadClassReportCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f59e0b';
                  e.currentTarget.style.backgroundColor = '#fef3c7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} style={{ color: '#d97706' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>CSV Dosyası</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Saf veri tablosu formatı</div>
                </div>
                <Download size={20} style={{ color: '#64748b' }} />
              </button>

              <button
                onClick={downloadClassReportPDF}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileDown size={24} style={{ color: '#dc2626' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>PDF Dosyası</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Yazdırılabilir profesyonel rapor (G harfli)</div>
                </div>
                <Download size={20} style={{ color: '#64748b' }} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <Button variant="outline" onClick={() => setShowClassReportModal(false)}>Kapat</Button>
            </div>
          </div>
        </Modal>

        {/* Preview Modal */}
        {showPreviewModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', padding: '40px'
          }}>
            <div style={{
              backgroundColor: '#e2e8f0', borderRadius: '16px', width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ padding: '16px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Rapor Önizlemesi</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Bu ekran PDF dökümünün birebir aynısıdır.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="outline" onClick={() => setShowPreviewModal(false)}>Geri Dön</Button>
                  <Button variant="primary" onClick={downloadClassReportPDF}>
                    <Download size={16} /> PDF İndir
                  </Button>
                </div>
              </div>
              
              <div style={{ flex: 1, overflow: 'auto', padding: '40px', display: 'flex', justifyContent: 'center' }}>
                <div 
                  style={{ transform: 'scale(1)', transformOrigin: 'top center' }} 
                  dangerouslySetInnerHTML={{ __html: getReportHtmlString() }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          type={confirmModal.type}
        />
      </div>
    </TeacherLayout>
  );
};

export default Archive;
