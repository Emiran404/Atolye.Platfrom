import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  TrendingUp, 
  ChevronRight, 
  ChevronDown, 
  FileText,
  User,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  Download
} from 'lucide-react';
import { TeacherLayout } from '../../components/layouts';
import { useAuthStore, CLASS_LIST } from '../../store/authStore';
import { useExamStore } from '../../store/examStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { formatDateTime } from '../../utils/dateHelpers';

const Grades = () => {
  const students = useAuthStore(state => state.students);
  const loadStudents = useAuthStore(state => state.loadStudents);
  const exams = useExamStore(state => state.exams);
  const loadExams = useExamStore(state => state.loadExams);
  const submissions = useSubmissionStore(state => state.submissions);
  const loadSubmissions = useSubmissionStore(state => state.loadSubmissions);
  const user = useAuthStore(state => state.user);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadStudents(),
          loadExams(), // Load all exams to show grades from all teachers
          loadSubmissions() // Load all submissions to show all grades
        ]);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, [user?.id, loadStudents, loadExams, loadSubmissions]);

  // Filter and process students
  const filteredStudents = (students || []).filter(student => {
    const matchesSearch = student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.studentNumber?.includes(searchQuery);
    const matchesClass = selectedClass === 'all' || student.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Calculate stats for a student
  const getStudentStats = (studentId) => {
    const studentSubmissions = (submissions || []).filter(s => s.studentId === studentId && s.grade !== null);
    if (studentSubmissions.length === 0) return { avg: 0, count: 0, latest: null };
    
    const sum = studentSubmissions.reduce((acc, current) => acc + (Number(current.grade) || 0), 0);
    const avg = Math.round(sum / studentSubmissions.length);
    const latest = studentSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
    
    return { avg, count: studentSubmissions.length, latest };
  };

  const tableHeaderStyle = {
    padding: '16px 24px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0'
  };

  const studentRowStyle = (isExpanded) => ({
    backgroundColor: isExpanded ? '#f8fafc' : '#ffffff',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9'
  });

  const badgeStyle = (grade) => {
    const g = Number(grade);
    let colors = { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
    if (g >= 85) colors = { bg: '#ecfdf5', text: '#059669', border: '#10b981' };
    else if (g >= 70) colors = { bg: '#eff6ff', text: '#2563eb', border: '#3b82f6' };
    else if (g >= 50) colors = { bg: '#fffbeb', text: '#d97706', border: '#f59e0b' };
    else if (g > 0) colors = { bg: '#fef2f2', text: '#dc2626', border: '#ef4444' };
    
    return {
      padding: '4px 10px',
      borderRadius: '20px',
      backgroundColor: colors.bg,
      color: colors.text,
      fontSize: '13px',
      fontWeight: '600',
      border: `1px solid ${colors.border}33`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    };
  };
  
  const handleExportCSV = () => {
    // CSV Header
    const headers = ['Öğrenci No', 'Ad Soyad', 'Sınıf', 'Sınav Sayısı', 'Ortalama Puan', 'Son Sınav Tarihi', 'Son Sınav Puanı'];
    
    // CSV Data
    const rows = filteredStudents.map(student => {
      const stats = getStudentStats(student.id);
      return [
        student.studentNumber,
        student.fullName,
        student.className,
        stats.count,
        stats.avg,
        stats.latest ? formatDateTime(stats.latest.submittedAt) : '-',
        stats.latest ? stats.latest.grade : '-'
      ];
    });
    
    // Create CSV content (UTF-8 with BOM for Excel compatibility)
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(';')).join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Sınav_Notları_${new Date().toLocaleDateString('tr-TR')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TeacherLayout>
      <div style={{ padding: '32px' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
            }}>
              <Award size={22} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
              Öğrenci Notları
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Tüm sınıflardaki öğrencilerin başarı durumlarını ve sınav sonuçlarını inceleyin.
          </p>
        </div>

        {/* Action Bar */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '16px', 
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
            />
            <input
              type="text"
              placeholder="Öğrenci adı veya numara ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 42px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#f8fafc'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Class Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
            <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} /> Sınıf:
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                flex: 1
              }}
            >
              <option value="all">Tüm Sınıflar</option>
              {CLASS_LIST.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <Download size={18} />
            Tabloyu İndir
          </button>
        </div>

        {/* Students Table */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={tableHeaderStyle}>Öğrenci Bilgileri</th>
                <th style={tableHeaderStyle}>Sınıf</th>
                <th style={tableHeaderStyle}>Sınav Sayısı</th>
                <th style={tableHeaderStyle}>Ortalama Puan</th>
                <th style={tableHeaderStyle}>Son Sınav</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%' }}></div>
                      Veriler yükleniyor...
                    </div>
                  </td>
                </tr>
              ) : (filteredStudents || []).length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8' }}>Öğrenci bulunamadı.</div>
                  </td>
                </tr>
              ) : (
                (filteredStudents || []).map(student => {
                  const stats = getStudentStats(student.id);
                  const isExpanded = expandedStudent === student.id;
                  
                  return (
                    <React.Fragment key={student.id}>
                      <tr 
                        style={studentRowStyle(isExpanded)}
                        onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                        onMouseEnter={(e) => { if(!isExpanded) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                        onMouseLeave={(e) => { if(!isExpanded) e.currentTarget.style.backgroundColor = '#ffffff'; }}
                      >
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '10px', 
                              backgroundColor: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#64748b'
                            }}>
                              <User size={20} />
                            </div>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{student.fullName}</div>
                              <div style={{ fontSize: '13px', color: '#64748b' }}>#{student.studentNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            backgroundColor: '#f1f5f9', 
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#475569'
                          }}>
                            {student.className}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>
                          {stats.count} Sınav
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {stats.count > 0 ? (
                            <div style={badgeStyle(stats.avg)}>
                              <TrendingUp size={14} />
                              {stats.avg}
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {stats.latest ? (
                            <div>
                              <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>
                                {(exams || []).find(e => e.id === stats.latest.examId)?.title || 'Bilinmeyen Sınav'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {(exams || []).find(e => e.id === stats.latest.examId)?.department || 'Genel'} • {formatDateTime(stats.latest.submittedAt)}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          {isExpanded ? <ChevronDown size={20} color="#94a3b8" /> : <ChevronRight size={20} color="#94a3b8" />}
                        </td>
                      </tr>
                      
                      {/* Expanded View */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" style={{ padding: '24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                              {(submissions || [])
                                .filter(s => s.studentId === student.id && s.grade !== null)
                                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                                .map(sub => {
                                  const exam = (exams || []).find(e => e.id === sub.examId);
                                  return (
                                    <div key={sub.id} style={{
                                      backgroundColor: '#ffffff',
                                      padding: '16px',
                                      borderRadius: '12px',
                                      border: '1px solid #e2e8f0',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '12px',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                          <div style={{ 
                                            padding: '8px', 
                                            borderRadius: '8px', 
                                            backgroundColor: '#f5f3ff',
                                            color: '#7c3aed'
                                          }}>
                                            <FileText size={16} />
                                          </div>
                                          <div>
                                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                                              {exam?.title || 'Bilinmeyen Sınav'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '500', marginBottom: '2px' }}>
                                              {exam?.department || 'Genel Ders'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                              <Calendar size={10} /> {formatDateTime(sub.submittedAt)}
                                            </div>
                                          </div>
                                        </div>
                                        <div style={badgeStyle(sub.grade)}>{sub.grade}</div>
                                      </div>
                                      
                                      {sub.feedback && (
                                        <div style={{ 
                                          fontSize: '12px', 
                                          color: '#475569', 
                                          padding: '8px', 
                                          backgroundColor: '#f1f5f9', 
                                          borderRadius: '8px',
                                          lineHeight: '1.5'
                                        }}>
                                          <strong>Geri Bildirim:</strong> {sub.feedback}
                                        </div>
                                      )}
                                      
                                      <div style={{ 
                                        paddingTop: '8px', 
                                        borderTop: '1px dashed #e2e8f0',
                                        fontSize: '11px',
                                        color: '#94a3b8',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                      }}>
                                        <span>ID: {sub.id.substring(0, 8)}...</span>
                                        <span>Dosya: {sub.fileName?.substring(0, 15)}...</span>
                                      </div>
                                    </div>
                                  );
                                })}
                                
                              {(submissions || []).filter(s => s.studentId === student.id && s.grade !== null).length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '14px' }}>
                                  Bu öğrenciye ait değerlendirilmiş bir sınav bulunamadı.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Grades;
