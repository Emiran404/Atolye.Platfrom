// Öğrenci verileri
import { hashPassword } from '../utils/crypto';

// Demo öğrenci hesabı
export const DEMO_STUDENT = {
  studentNumber: '1001',
  password: 'Test1234',
  fullName: 'Ahmet Yılmaz',
  className: '11-A'
};

// Gerçek öğrenci verileri
export const students = [
  {
    id: 'student-1',
    studentNumber: '1001',
    fullName: 'Ahmet Yılmaz',
    className: '11-A',
    email: 'ahmet.yilmaz@okul.edu.tr',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-13T10:30:00.000Z',
    status: 'active'
  },
  {
    id: 'student-2',
    studentNumber: '1002',
    fullName: 'Ayşe Demir',
    className: '11-A',
    email: 'ayse.demir@okul.edu.tr',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-12T14:20:00.000Z',
    status: 'active'
  },
  {
    id: 'student-3',
    studentNumber: '1003',
    fullName: 'Mehmet Kaya',
    className: '11-A',
    email: 'mehmet.kaya@okul.edu.tr',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-11T09:15:00.000Z',
    status: 'active'
  },
  {
    id: 'student-4',
    studentNumber: '1004',
    fullName: 'Zeynep Öztürk',
    className: '11-B',
    email: 'zeynep.ozturk@okul.edu.tr',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-10T16:45:00.000Z',
    status: 'active'
  },
  {
    id: 'student-5',
    studentNumber: '1005',
    fullName: 'Can Arslan',
    className: '11-B',
    email: 'can.arslan@okul.edu.tr',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-09T11:30:00.000Z',
    status: 'active'
  },
  {
    id: 'student-6',
    studentNumber: '1006',
    fullName: 'Elif Çelik',
    className: '10-A',
    email: 'elif.celik@okul.edu.tr',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-08T13:00:00.000Z',
    status: 'active'
  },
  {
    id: 'student-7',
    studentNumber: '1007',
    fullName: 'Burak Şahin',
    className: '10-A',
    email: 'burak.sahin@okul.edu.tr',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-07T15:20:00.000Z',
    status: 'active'
  },
  {
    id: 'student-8',
    studentNumber: '1008',
    fullName: 'Selin Yıldız',
    className: '10-B',
    email: 'selin.yildiz@okul.edu.tr',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-06T10:45:00.000Z',
    status: 'active'
  },
  {
    id: 'student-9',
    studentNumber: '1009',
    fullName: 'Emre Koç',
    className: '12-A',
    email: 'emre.koc@okul.edu.tr',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-05T09:30:00.000Z',
    status: 'active'
  },
  {
    id: 'student-10',
    studentNumber: '1010',
    fullName: 'Deniz Aydın',
    className: '12-A',
    email: 'deniz.aydin@okul.edu.tr',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-04T14:15:00.000Z',
    status: 'active'
  }
];

// Öğrenci bulma fonksiyonları
export const findStudentByNumber = (studentNumber) => {
  return students.find(s => s.studentNumber === studentNumber);
};

export const findStudentById = (id) => {
  return students.find(s => s.id === id);
};

export const getStudentsByClass = (className) => {
  return students.filter(s => s.className === className);
};
