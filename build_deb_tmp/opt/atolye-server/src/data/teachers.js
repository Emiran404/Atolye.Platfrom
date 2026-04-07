// Öğretmen verileri
import { hashPassword } from '../utils/crypto';

// Demo öğretmen hesabı
export const DEMO_TEACHER = {
  username: 'ogretmen',
  password: 'Test1234',
  fullName: 'Ahmet Öğretmen',
  department: 'Siber Güvenlik'
};

// Gerçek öğretmen verileri
export const teachers = [
  {
    id: 'teacher-1',
    username: 'ogretmen',
    fullName: 'Ahmet Öğretmen',
    email: 'ahmet.ogretmen@okul.edu.tr',
    department: 'Siber Güvenlik',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    assignedClasses: ['11-A', '11-B', '11-C', '10-A', '10-B', '10-C'],
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-13T09:00:00.000Z',
    status: 'active',
    role: 'teacher'
  },
  {
    id: 'teacher-2',
    username: 'mehmet_hoca',
    fullName: 'Mehmet Yılmaz',
    email: 'mehmet.yilmaz@okul.edu.tr',
    department: 'Bilgisayar Programlama',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    assignedClasses: ['12-A', '12-B', '12-C', '11-A', '11-B'],
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-12T11:30:00.000Z',
    status: 'active',
    role: 'teacher'
  },
  {
    id: 'teacher-3',
    username: 'ayse_hoca',
    fullName: 'Ayşe Kaya',
    email: 'ayse.kaya@okul.edu.tr',
    department: 'Ağ Teknolojileri',
    passwordHash: hashPassword('Test1234'),
    avatar: null,
    assignedClasses: ['9-A', '9-B', '9-C', '10-A', '10-B'],
    createdAt: '2024-09-01T08:00:00.000Z',
    lastLogin: '2024-01-11T14:00:00.000Z',
    status: 'active',
    role: 'teacher'
  }
];

// Öğretmen bulma fonksiyonları
export const findTeacherByUsername = (username) => {
  return teachers.find(t => t.username === username);
};

export const findTeacherById = (id) => {
  return teachers.find(t => t.id === id);
};

export const getTeachersByDepartment = (department) => {
  return teachers.filter(t => t.department === department);
};
