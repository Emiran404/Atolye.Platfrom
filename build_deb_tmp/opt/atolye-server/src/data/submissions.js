// Gönderim verileri

export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  LATE: 'late',
  MISSING: 'missing'
};

export const SUBMISSION_STATUS_LABELS = {
  [SUBMISSION_STATUS.PENDING]: 'Bekliyor',
  [SUBMISSION_STATUS.SUBMITTED]: 'Gönderildi',
  [SUBMISSION_STATUS.GRADED]: 'Notlandırıldı',
  [SUBMISSION_STATUS.LATE]: 'Geç Gönderim',
  [SUBMISSION_STATUS.MISSING]: 'Eksik'
};

// Gerçek gönderim verileri
export const submissions = [
  {
    id: 'submission-1',
    examId: 'exam-1',
    studentId: 'student-1',
    studentNumber: '1001',
    studentName: 'Ahmet Yılmaz',
    className: '11-A',
    fileName: 'siber_guvenlik_vize_ahmet.pdf',
    fileSize: 2456789,
    fileType: 'application/pdf',
    fileHash: 'sha256-abc123def456...',
    submittedAt: '2024-01-13T14:30:00.000Z',
    editedAt: null,
    editCount: 0,
    status: SUBMISSION_STATUS.SUBMITTED,
    grade: null,
    feedback: null,
    gradedBy: null,
    gradedAt: null
  },
  {
    id: 'submission-2',
    examId: 'exam-1',
    studentId: 'student-2',
    studentNumber: '1002',
    studentName: 'Ayşe Demir',
    className: '11-A',
    fileName: 'vize_ayse_demir.pdf',
    fileSize: 1876543,
    fileType: 'application/pdf',
    fileHash: 'sha256-xyz789ghi012...',
    submittedAt: '2024-01-12T16:45:00.000Z',
    editedAt: '2024-01-12T16:48:00.000Z',
    editCount: 1,
    status: SUBMISSION_STATUS.GRADED,
    grade: 85,
    feedback: 'İyi bir çalışma. Şifreleme bölümü daha detaylı olabilirdi.',
    gradedBy: 'teacher-1',
    gradedAt: '2024-01-13T10:00:00.000Z'
  },
  {
    id: 'submission-3',
    examId: 'exam-1',
    studentId: 'student-3',
    studentNumber: '1003',
    studentName: 'Mehmet Kaya',
    className: '11-A',
    fileName: 'mehmet_kaya_siber_guvenlik.pdf',
    fileSize: 3245678,
    fileType: 'application/pdf',
    fileHash: 'sha256-jkl345mno678...',
    submittedAt: '2024-01-11T09:20:00.000Z',
    editedAt: null,
    editCount: 0,
    status: SUBMISSION_STATUS.GRADED,
    grade: 92,
    feedback: 'Mükemmel çalışma! Tüm konular detaylı işlenmiş.',
    gradedBy: 'teacher-1',
    gradedAt: '2024-01-12T15:30:00.000Z'
  },
  {
    id: 'submission-4',
    examId: 'exam-2',
    studentId: 'student-9',
    studentNumber: '1009',
    studentName: 'Emre Koç',
    className: '12-A',
    fileName: 'python_projesi_emre.zip',
    fileSize: 5678901,
    fileType: 'application/zip',
    fileHash: 'sha256-pqr901stu234...',
    submittedAt: '2024-01-10T20:15:00.000Z',
    editedAt: null,
    editCount: 0,
    status: SUBMISSION_STATUS.SUBMITTED,
    grade: null,
    feedback: null,
    gradedBy: null,
    gradedAt: null
  },
  {
    id: 'submission-5',
    examId: 'exam-3',
    studentId: 'student-6',
    studentNumber: '1006',
    studentName: 'Elif Çelik',
    className: '10-A',
    fileName: 'ag_quiz_elif.pdf',
    fileSize: 987654,
    fileType: 'application/pdf',
    fileHash: 'sha256-vwx567yza890...',
    submittedAt: '2024-01-14T16:55:00.000Z',
    editedAt: null,
    editCount: 0,
    status: SUBMISSION_STATUS.LATE,
    grade: null,
    feedback: null,
    gradedBy: null,
    gradedAt: null
  },
  {
    id: 'submission-6',
    examId: 'exam-4',
    studentId: 'student-1',
    studentNumber: '1001',
    studentName: 'Ahmet Yılmaz',
    className: '11-A',
    fileName: 'web_guvenlik_raporu.pdf',
    fileSize: 8765432,
    fileType: 'application/pdf',
    fileHash: 'sha256-bcd123efg456...',
    submittedAt: '2024-01-13T11:00:00.000Z',
    editedAt: '2024-01-13T11:03:00.000Z',
    editCount: 1,
    status: SUBMISSION_STATUS.SUBMITTED,
    grade: null,
    feedback: null,
    gradedBy: null,
    gradedAt: null
  }
];

// Gönderim bulma fonksiyonları
export const findSubmissionById = (id) => {
  return submissions.find(s => s.id === id);
};

export const getSubmissionsByExam = (examId) => {
  return submissions.filter(s => s.examId === examId);
};

export const getSubmissionsByStudent = (studentId) => {
  return submissions.filter(s => s.studentId === studentId);
};

export const getSubmissionByExamAndStudent = (examId, studentId) => {
  return submissions.find(s => s.examId === examId && s.studentId === studentId);
};

export const getPendingSubmissions = () => {
  return submissions.filter(s => s.status === SUBMISSION_STATUS.SUBMITTED);
};

export const getGradedSubmissions = () => {
  return submissions.filter(s => s.status === SUBMISSION_STATUS.GRADED);
};

// İstatistik fonksiyonları
export const getExamStats = (examId) => {
  const examSubmissions = getSubmissionsByExam(examId);
  const graded = examSubmissions.filter(s => s.status === SUBMISSION_STATUS.GRADED);
  const grades = graded.map(s => s.grade).filter(g => g !== null);
  
  return {
    totalSubmissions: examSubmissions.length,
    gradedCount: graded.length,
    pendingCount: examSubmissions.filter(s => s.status === SUBMISSION_STATUS.SUBMITTED).length,
    lateCount: examSubmissions.filter(s => s.status === SUBMISSION_STATUS.LATE).length,
    averageGrade: grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : 0,
    highestGrade: grades.length > 0 ? Math.max(...grades) : 0,
    lowestGrade: grades.length > 0 ? Math.min(...grades) : 0
  };
};
