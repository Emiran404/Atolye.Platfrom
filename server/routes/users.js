import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

const STUDENTS_FILE = path.join(__dirname, '../data/students.json');
const TEACHERS_FILE = path.join(__dirname, '../data/teachers.json');

// Öğrencileri yükle
const loadStudents = () => {
  try {
    if (fs.existsSync(STUDENTS_FILE)) {
      const data = fs.readFileSync(STUDENTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Students load error:', error);
  }
  return [];
};

// Öğretmenleri yükle
const loadTeachers = () => {
  try {
    if (fs.existsSync(TEACHERS_FILE)) {
      const data = fs.readFileSync(TEACHERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Teachers load error:', error);
  }
  return [];
};

// Kaydet
const saveStudents = (students) => {
  try {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Students save error:', error);
    return false;
  }
};

const saveTeachers = (teachers) => {
  try {
    fs.writeFileSync(TEACHERS_FILE, JSON.stringify(teachers, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Teachers save error:', error);
    return false;
  }
};

// GET /api/users/students - Tüm öğrencileri al
router.get('/students', (req, res) => {
  try {
    const students = loadStudents();
    // Şifreleri gizle
    const sanitized = students.map(s => ({
      id: s.id,
      studentNumber: s.studentNumber,
      fullName: s.fullName,
      className: s.className,
      suspended: s.suspended || false,
      createdAt: s.createdAt
    }));
    res.json({ success: true, students: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Öğrenciler yüklenemedi' });
  }
});

// GET /api/users/teachers - Tüm öğretmenleri al
router.get('/teachers', (req, res) => {
  try {
    const teachers = loadTeachers();
    // Şifreleri gizle
    const sanitized = teachers.map(t => ({
      id: t.id,
      username: t.username,
      fullName: t.fullName,
      department: t.department,
      suspended: t.suspended || false,
      createdAt: t.createdAt
    }));
    res.json({ success: true, teachers: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Öğretmenler yüklenemedi' });
  }
});

// DELETE /api/users/:id - Kullanıcı sil
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.body;

    if (userType === 'student') {
      let students = loadStudents();
      const initialLength = students.length;
      students = students.filter(s => s.id !== id);

      if (students.length === initialLength) {
        return res.status(404).json({ success: false, error: 'Öğrenci bulunamadı' });
      }

      if (saveStudents(students)) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, error: 'Silme başarısız' });
      }
    } else if (userType === 'teacher') {
      let teachers = loadTeachers();
      const initialLength = teachers.length;
      teachers = teachers.filter(t => t.id !== id);

      if (teachers.length === initialLength) {
        return res.status(404).json({ success: false, error: 'Öğretmen bulunamadı' });
      }

      if (saveTeachers(teachers)) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, error: 'Silme başarısız' });
      }
    } else {
      res.status(400).json({ success: false, error: 'Geçersiz kullanıcı tipi' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Kullanıcı silinemedi' });
  }
});

// POST /api/users/:id/suspend - Kullanıcıyı askıya al/aktif et
router.post('/:id/suspend', (req, res) => {
  try {
    const { id } = req.params;
    const { userType, suspended } = req.body;

    if (userType === 'student') {
      let students = loadStudents();
      const student = students.find(s => s.id === id);

      if (!student) {
        return res.status(404).json({ success: false, error: 'Öğrenci bulunamadı' });
      }

      student.suspended = suspended;

      if (saveStudents(students)) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, error: 'Güncelleme başarısız' });
      }
    } else if (userType === 'teacher') {
      let teachers = loadTeachers();
      const teacher = teachers.find(t => t.id === id);

      if (!teacher) {
        return res.status(404).json({ success: false, error: 'Öğretmen bulunamadı' });
      }

      teacher.suspended = suspended;

      if (saveTeachers(teachers)) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, error: 'Güncelleme başarısız' });
      }
    } else {
      res.status(400).json({ success: false, error: 'Geçersiz kullanıcı tipi' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'İşlem başarısız' });
  }
});

// PATCH /api/users/:id/update - Profil ve ayarları güncelle
router.patch('/:id/update', (req, res) => {
  try {
    const { id } = req.params;
    const { userType, updates } = req.body;

    if (userType === 'student') {
      let students = loadStudents();
      const index = students.findIndex(s => s.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Öğrenci bulunamadı' });
      
      // Sadece belirli alanların güncellenmesine izin ver
      const allowedUpdates = ['fullName', 'notificationSettings'];
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          if (key === 'notificationSettings') {
            students[index][key] = {
              ...(students[index][key] || { loginAlerts: true, submissionAlerts: true }),
              ...updates[key]
            };
          } else {
            students[index][key] = updates[key];
          }
        }
      });

      if (saveStudents(students)) {
        res.json({ success: true, user: students[index] });
      } else {
        res.status(500).json({ success: false, error: 'Kaydetme başarısız' });
      }
    } else if (userType === 'teacher') {
      let teachers = loadTeachers();
      const index = teachers.findIndex(t => t.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Öğretmen bulunamadı' });

      const allowedUpdates = ['fullName', 'department', 'notificationSettings'];
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          if (key === 'notificationSettings') {
            teachers[index][key] = {
              ...(teachers[index][key] || { loginAlerts: true, submissionAlerts: true }),
              ...updates[key]
            };
          } else {
            teachers[index][key] = updates[key];
          }
        }
      });

      if (saveTeachers(teachers)) {
        res.json({ success: true, user: teachers[index] });
      } else {
        res.status(500).json({ success: false, error: 'Kaydetme başarısız' });
      }
    } else {
      res.status(400).json({ success: false, error: 'Geçersiz kullanıcı tipi' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});

// Öğrencinin aktivitelerini (login, şifre değişikliği, sınav vb.) döner
router.get('/students/:id/logs', (req, res) => {
  try {
    const { id } = req.params;
    const students = loadStudents();
    const student = students.find(s => s.id === id);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Öğrenci bulunamadı' });
    }

    let logs = [];

    // Hesabın oluşturulması
    if (student.createdAt) {
      logs.push({
        id: `created_${student.id}`,
        type: 'account_created',
        action: 'Hesap oluşturuldu',
        date: student.createdAt,
        details: 'Sisteme kayıt olundu'
      });
    }

    // IP History (Girişler ve şifre sıfırlamaları)
    if (student.ipHistory && Array.isArray(student.ipHistory)) {
      student.ipHistory.forEach((record, index) => {
        if (record.action === 'password_reset') {
          logs.push({
            id: `pwd_${index}`,
            type: 'password_reset',
            action: 'Şifre değiştirildi',
            date: record.date,
            details: `IP: ${record.ip}`
          });
        } else {
          logs.push({
            id: `login_${index}`,
            type: 'login',
            action: 'Sisteme giriş yapıldı',
            date: record.date,
            details: `IP: ${record.ip}`
          });
        }
      });
    }

    // Teslimler
    try {
      import('../utils/storage.js').then(({ getData }) => {
        const submissions = getData('submissions') || [];
        const exams = getData('exams') || [];

        const studentSubmissions = submissions.filter(s => s.studentId === id);

        studentSubmissions.forEach(sub => {
          const exam = exams.find(e => e.id === sub.examId);
          const examName = exam ? exam.title : 'Silinen Sınav';

          if (sub.status === 'edit_granted') {
            logs.push({
              id: `sub_${sub.id}`,
              type: 'edit_granted',
              action: 'Düzenleme izni kullanıldı',
              date: sub.grantedAt || sub.updatedAt,
              details: `${examName}`
            });
            return;
          }

          logs.push({
            id: `sub_${sub.id}`,
            type: 'submission',
            action: sub.type === 'quiz' ? 'Quiz tamamlandı' : 'Sınav dosyası yüklendi',
            date: sub.submittedAt,
            details: `${examName} ${sub.fileName ? `(${sub.fileName})` : ''}`
          });

          if (sub.editHistory && Array.isArray(sub.editHistory)) {
            sub.editHistory.forEach((edit, eIndex) => {
              logs.push({
                id: `sub_edit_${sub.id}_${eIndex}`,
                type: 'submission_update',
                action: 'Sınav dosyası güncellendi',
                date: edit.editedAt,
                details: `${examName} (${edit.fileName})`
              });
            });
          }
        });

        // Tarihe göre yeninden eskiye sırala
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json({ success: true, logs });
      });
    } catch (err) {
      console.error('Storage import error', err);
      // Hata olursa yine de login loglarını gönder
      logs.sort((a, b) => new Date(b.date) - new Date(a.date));
      res.json({ success: true, logs });
    }

  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).json({ success: false, error: 'Kayıtlar alınamadı' });
  }
});

export default router;
