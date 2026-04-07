// Sınav verileri

export const EXAM_TYPES = {
  EXAM: 'exam',
  HOMEWORK: 'homework',
  PROJECT: 'project',
  QUIZ: 'quiz'
};

export const EXAM_TYPE_LABELS = {
  [EXAM_TYPES.EXAM]: 'Sınav',
  [EXAM_TYPES.HOMEWORK]: 'Ödev',
  [EXAM_TYPES.PROJECT]: 'Proje',
  [EXAM_TYPES.QUIZ]: 'Quiz'
};

// Gerçek sınav verileri
export const exams = [
  {
    id: 'exam-1',
    title: 'Siber Güvenlik Vize Sınavı',
    description: 'Ağ güvenliği, şifreleme ve güvenlik protokolleri konularını kapsayan vize sınavı.',
    type: EXAM_TYPES.EXAM,
    teacherId: 'teacher-1',
    teacherName: 'Ahmet Öğretmen',
    classes: ['11-A', '11-B'],
    dueDate: '2024-01-20T23:59:00.000Z',
    createdAt: '2024-01-10T09:00:00.000Z',
    allowedExtensions: ['.pdf', '.docx', '.doc'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    editTimeLimit: 5, // dakika
    status: 'active',
    totalPoints: 100
  },
  {
    id: 'exam-2',
    title: 'Python Programlama Ödevi',
    description: 'Nesne yönelimli programlama kavramlarını kullanarak bir proje geliştirin.',
    type: EXAM_TYPES.HOMEWORK,
    teacherId: 'teacher-2',
    teacherName: 'Mehmet Yılmaz',
    classes: ['12-A', '12-B'],
    dueDate: '2024-01-25T23:59:00.000Z',
    createdAt: '2024-01-08T14:30:00.000Z',
    allowedExtensions: ['.py', '.zip', '.pdf'],
    maxFileSize: 20 * 1024 * 1024, // 20MB
    editTimeLimit: 5,
    status: 'active',
    totalPoints: 50
  },
  {
    id: 'exam-3',
    title: 'Ağ Teknolojileri Quiz',
    description: 'OSI modeli ve TCP/IP protokolü hakkında kısa sınav.',
    type: EXAM_TYPES.QUIZ,
    teacherId: 'teacher-3',
    teacherName: 'Ayşe Kaya',
    classes: ['10-A', '10-B'],
    dueDate: '2024-01-15T17:00:00.000Z',
    createdAt: '2024-01-05T10:00:00.000Z',
    allowedExtensions: ['.pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    editTimeLimit: 5,
    status: 'active',
    totalPoints: 20
  },
  {
    id: 'exam-4',
    title: 'Web Güvenliği Projesi',
    description: 'Bir web uygulamasının güvenlik açıklarını tespit edin ve raporlayın.',
    type: EXAM_TYPES.PROJECT,
    teacherId: 'teacher-1',
    teacherName: 'Ahmet Öğretmen',
    classes: ['11-A'],
    dueDate: '2024-02-01T23:59:00.000Z',
    createdAt: '2024-01-01T09:00:00.000Z',
    allowedExtensions: ['.pdf', '.docx', '.zip'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    editTimeLimit: 10,
    status: 'active',
    totalPoints: 100
  },
  {
    id: 'exam-5',
    title: 'Veritabanı Yönetimi Final',
    description: 'SQL sorguları ve veritabanı tasarımı konularında final sınavı.',
    type: EXAM_TYPES.EXAM,
    teacherId: 'teacher-2',
    teacherName: 'Mehmet Yılmaz',
    classes: ['11-A', '12-A'],
    dueDate: '2024-01-30T23:59:00.000Z',
    createdAt: '2024-01-12T11:00:00.000Z',
    allowedExtensions: ['.pdf', '.sql'],
    maxFileSize: 10 * 1024 * 1024,
    editTimeLimit: 5,
    status: 'active',
    totalPoints: 100
  }
];

// Sınav bulma fonksiyonları
export const findExamById = (id) => {
  return exams.find(e => e.id === id);
};

export const getExamsByTeacher = (teacherId) => {
  return exams.filter(e => e.teacherId === teacherId);
};

export const getExamsByClass = (className) => {
  return exams.filter(e => e.classes.includes(className));
};

export const getActiveExams = () => {
  return exams.filter(e => e.status === 'active' && new Date(e.dueDate) > new Date());
};

export const getExpiredExams = () => {
  return exams.filter(e => new Date(e.dueDate) <= new Date());
};
