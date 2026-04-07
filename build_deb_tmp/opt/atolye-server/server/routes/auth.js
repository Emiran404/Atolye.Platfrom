
import express from 'express';
import { getData, setData, generateId } from '../utils/storage.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import base64url from 'base64url';
import crypto from 'crypto';

const router = express.Router();

// Sınıf listesi
const CLASS_LIST = ['9-A', '9-B', '10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];

// Öğrenci klasör yolu oluştur
const generateStudentFolderPath = (className, fullName, studentNumber) => {
  const sanitizedName = fullName.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '').trim();
  return `${className} ogrenciler/${sanitizedName}-${studentNumber}`;
};

// Öğrenci kayıt
router.post('/register/student', async (req, res) => {
  try {
    const { studentNumber, fullName, className, password } = req.body;

    if (!studentNumber || !fullName || !className || !password) {
      return res.status(400).json({ success: false, error: 'Tüm alanlar gerekli!' });
    }

    const students = getData('students') || [];

    if (students.find(s => s.studentNumber === studentNumber)) {
      return res.status(400).json({ success: false, error: 'Bu okul numarası zaten kayıtlı!' });
    }

    const hashedPassword = hashPassword(password, studentNumber);
    const folderPath = generateStudentFolderPath(className, fullName, studentNumber);

    const newStudent = {
      id: generateId(),
      studentNumber,
      fullName,
      className,
      password: hashedPassword,
      folderPath,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      ipHistory: []
    };

    students.push(newStudent);
    setData('students', students);

    // Şifre olmadan döndür
    const { password: _, ...studentData } = newStudent;
    res.json({ success: true, user: studentData, userType: 'student' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Öğrenci giriş
router.post('/login/student', async (req, res) => {
  try {
    const { studentNumber, password } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!studentNumber || !password) {
      return res.status(400).json({ success: false, error: 'Okul numarası ve şifre gerekli!' });
    }

    const students = getData('students') || [];
    const student = students.find(s => s.studentNumber === studentNumber);

    if (!student) {
      return res.status(401).json({ success: false, error: 'Bu okul numarası kayıtlı değil! Lütfen kayıt olun.' });
    }

    const settings = getData('settings') || {};
    const globalResetActive = settings.passwordChangeModeExpiresAt && new Date(settings.passwordChangeModeExpiresAt) > new Date();
    const studentResetActive = student.passwordChangeModeExpiresAt && new Date(student.passwordChangeModeExpiresAt) > new Date();

    if (globalResetActive || studentResetActive) {
      return res.json({ success: true, action: 'reset_password_required', studentNumber: student.studentNumber });
    }

    const isValid = verifyPassword(password, student.password, studentNumber);

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Hatalı şifre! Lütfen tekrar deneyin.' });
    }

    // Suspended kontrolü
    if (student.suspended) {
      return res.status(403).json({ success: false, error: 'Hesabınız askıya alınmış. Lütfen yönetici ile iletişime geçin.' });
    }

    // IP ve son giriş güncelle
    student.ipHistory.push({
      ip: clientIp,
      date: new Date().toISOString()
    });
    student.lastLogin = new Date().toISOString();

    const updatedStudents = students.map(s =>
      s.studentNumber === studentNumber ? student : s
    );
    setData('students', updatedStudents);

    const { password: _, ...studentData } = student;
    res.json({ success: true, user: studentData, userType: 'student', clientIp });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Öğrenci şifre sıfırlama (Sadece mod aktifken)
router.post('/login/student-reset', async (req, res) => {
  try {
    const { studentNumber, newPassword } = req.body;

    if (!studentNumber || !newPassword) {
      return res.status(400).json({ success: false, error: 'Eksik bilgi gonderildi.' });
    }

    const settings = getData('settings') || {};
    const globalResetActive = settings.passwordChangeModeExpiresAt && new Date(settings.passwordChangeModeExpiresAt) > new Date();

    const students = getData('students') || [];
    const student = students.find(s => s.studentNumber === studentNumber);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Öğrenci bulunamadı.' });
    }

    const studentResetActive = student.passwordChangeModeExpiresAt && new Date(student.passwordChangeModeExpiresAt) > new Date();

    if (!globalResetActive && !studentResetActive) {
      return res.status(403).json({ success: false, error: 'Şifre değiştirme modu aktif değil veya süresi dolmuş.' });
    }

    student.password = hashPassword(newPassword, studentNumber);

    // İşlem başarılı olduktan sonra kişisel modu kaldır.
    student.passwordChangeModeExpiresAt = null;

    // Log entry for reset
    student.ipHistory.push({
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      date: new Date().toISOString(),
      action: 'password_reset'
    });

    const updatedStudents = students.map(s => s.studentNumber === studentNumber ? student : s);
    setData('students', updatedStudents);

    res.json({ success: true, message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Belirli bir öğrenci için şifre sıfırlama modunu aktif et
router.post('/login/enable-student-reset-mode', async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Öğrenci ID gerekli.' });
    }

    const students = getData('students') || [];
    const student = students.find(s => s.id === studentId);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Öğrenci bulunamadı.' });
    }

    // 10 dakika geçerli
    student.passwordChangeModeExpiresAt = new Date(Date.now() + 10 * 60000).toISOString();

    const updatedStudents = students.map(s => s.id === studentId ? student : s);
    setData('students', updatedStudents);

    res.json({ success: true, message: 'Öğrenci için şifre değiştirme modu 10 dakikalığına aktif edildi.' });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Öğretmen giriş
router.post('/login/teacher', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // username veya email ile giriş yapılabilir
    const loginId = username || email;

    if (!loginId || !password) {
      return res.status(400).json({ success: false, error: 'Kullanıcı adı ve şifre gerekli!' });
    }

    const teachers = getData('teachers') || [];
    // username veya email ile ara
    const teacher = teachers.find(t => t.username === loginId || t.email === loginId);

    if (!teacher) {
      return res.status(401).json({ success: false, error: 'Kullanıcı bulunamadı! Lütfen kayıt olun.' });
    }

    // Şifre doğrulama - username veya email ile
    const salt = teacher.username || teacher.email;
    const isValid = verifyPassword(password, teacher.password, salt);

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Hatalı şifre! Lütfen tekrar deneyin.' });
    }

    // Suspended kontrolü
    if (teacher.suspended) {
      return res.status(403).json({ success: false, error: 'Hesabınız askıya alınmış. Lütfen yönetici ile iletişime geçin.' });
    }

    teacher.lastLogin = new Date().toISOString();
    const updatedTeachers = teachers.map(t => (t.username === loginId || t.email === loginId) ? teacher : t);
    setData('teachers', updatedTeachers);

    const { password: _, ...teacherData } = teacher;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.json({ success: true, user: teacherData, userType: 'teacher', clientIp });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Sunucu hatası: ' + error.message });
  }
});

// Öğretmen kayıt
router.post('/register/teacher', async (req, res) => {
  try {
    const { username, fullName, password, department, email } = req.body;

    if (!username || !fullName || !password) {
      return res.status(400).json({ success: false, error: 'Kullanıcı adı, ad soyad ve şifre gerekli!' });
    }

    const teachers = getData('teachers') || [];

    if (teachers.find(t => t.username === username)) {
      return res.status(400).json({ success: false, error: 'Bu kullanıcı adı zaten kayıtlı!' });
    }

    const hashedPassword = hashPassword(password, username);

    const newTeacher = {
      id: generateId(),
      username,
      email: email || null,
      fullName,
      department: department || null,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    teachers.push(newTeacher);
    setData('teachers', teachers);

    const { password: _, ...teacherData } = newTeacher;
    res.json({ success: true, user: teacherData, userType: 'teacher' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tüm öğrencileri getir
router.get('/students', (req, res) => {
  try {
    const students = getData('students') || [];
    // Şifreleri çıkar
    const safeStudents = students.map(({ password, ...rest }) => rest);
    res.json({ success: true, students: safeStudents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sınıf listesi
router.get('/classes', (req, res) => {
  res.json({ success: true, classes: CLASS_LIST });
});

// Passkey (WebAuthn) Endpoints
// Passkey kayıt için challenge oluştur
router.post('/passkey/register-challenge', (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Kullanıcı adı gerekli!' });
    const challenge = base64url(crypto.randomBytes(32));
    res.json({ challenge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Passkey kaydını tamamla
router.post('/passkey/register', (req, res) => {
  try {
    const { username, credentialId, publicKey } = req.body;
    if (!username || !credentialId || !publicKey) {
      return res.status(400).json({ error: 'Eksik veri!' });
    }

    const teachers = getData('teachers') || [];
    const teacherIndex = teachers.findIndex(t => t.username === username);

    if (teacherIndex === -1) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı!' });
    }

    teachers[teacherIndex].passkeyEnabled = true;
    teachers[teacherIndex].credentialId = credentialId;
    teachers[teacherIndex].publicKey = publicKey;

    setData('teachers', teachers);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Passkey ile giriş için challenge
router.post('/passkey/login-challenge', (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Kullanıcı adı gerekli!' });

    const teachers = getData('teachers') || [];
    const teacher = teachers.find(t => t.username === username);

    if (!teacher || !teacher.passkeyEnabled) {
      return res.json({ success: false, error: 'Passkey aktif değil!' });
    }

    const challenge = base64url(crypto.randomBytes(32));
    res.json({ challenge, credentialId: teacher.credentialId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Öğrenci şifre değiştirme (Öğretmen tarafından)
router.post('/change-student-password', async (req, res) => {
  try {
    const { studentId, studentNumber, newPassword } = req.body;

    if (!studentId || !studentNumber || !newPassword) {
      return res.status(400).json({ success: false, error: 'Tüm alanlar gerekli!' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Şifre en az 6 karakter olmalıdır!' });
    }

    const students = getData('students') || [];
    const studentIndex = students.findIndex(s => s.id === studentId && s.studentNumber === studentNumber);

    if (studentIndex === -1) {
      return res.status(404).json({ success: false, error: 'Öğrenci bulunamadı!' });
    }

    // Yeni şifreyi hash'le
    const hashedPassword = hashPassword(newPassword, studentNumber);
    students[studentIndex].password = hashedPassword;

    setData('students', students);

    res.json({ success: true, message: 'Şifre başarıyla değiştirildi!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Passkey ile giriş doğrulama
router.post('/passkey/login', (req, res) => {
  try {
    const { username, credentialId, authenticatorData, clientDataJSON, signature } = req.body;

    if (!username || !credentialId || !authenticatorData || !clientDataJSON || !signature) {
      return res.status(400).json({ error: 'Eksik veri!' });
    }

    const teachers = getData('teachers') || [];
    const teacherIndex = teachers.findIndex(t => t.username === username);

    if (teacherIndex === -1) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı!' });
    }

    const teacher = teachers[teacherIndex];

    if (!teacher.passkeyEnabled || teacher.credentialId !== credentialId) {
      return res.status(404).json({ error: 'Passkey bulunamadı!' });
    }

    // Gerçek WebAuthn doğrulaması için publicKey ile signature doğrulanmalı
    // Şimdilik basit kontrol: credentialId eşleşirse başarılı
    teacher.lastLogin = new Date().toISOString();
    teachers[teacherIndex] = teacher;
    setData('teachers', teachers);

    const { password: _, ...teacherData } = teacher;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.json({ success: true, user: teacherData, userType: 'teacher', clientIp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Master Recovery Key Oluştur
router.post('/recovery-key/generate', (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Kullanıcı adı gerekli!' });

    const teachers = getData('teachers') || [];
    const teacherIndex = teachers.findIndex(t => t.username === username);

    if (teacherIndex === -1) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı!' });
    }

    // 1. Rastgele güvenli bir anahtar oluştur (Örn: POLYOS-REC-A1B2-C3D4)
    const randomBytes = crypto.randomBytes(8).toString('hex').toUpperCase(); // 16 karakter
    const key = `POLYOS-REC-${randomBytes.slice(0, 4)}-${randomBytes.slice(4, 8)}-${randomBytes.slice(8, 12)}-${randomBytes.slice(12, 16)}`;

    // 2. Anahtarı hashle
    const hashedKey = hashPassword(key, username); // Salt olarak username kullanıyoruz

    // 3. Kaydet
    teachers[teacherIndex].recoveryKeyHash = hashedKey;
    teachers[teacherIndex].recoveryKeyCreatedAt = new Date().toISOString();

    setData('teachers', teachers);

    // 4. Plaintext key'i döndür (Sadece bu seferlik!)
    res.json({ success: true, recoveryKey: key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recovery Key ile Şifre Sıfırla
router.post('/recovery-key/reset', (req, res) => {
  try {
    const { username, recoveryKey, newPassword } = req.body;

    if (!username || !recoveryKey || !newPassword) {
      return res.status(400).json({ error: 'Eksik veri!' });
    }

    const teachers = getData('teachers') || [];
    const teacherIndex = teachers.findIndex(t => t.username === username);

    if (teacherIndex === -1) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı!' });
    }

    const teacher = teachers[teacherIndex];

    if (!teacher.recoveryKeyHash) {
      return res.status(400).json({ error: 'Bu hesap için kurtarma anahtarı oluşturulmamış.' });
    }

    // 1. Anahtarı doğrula
    const isValidKey = verifyPassword(recoveryKey, teacher.recoveryKeyHash, username);

    if (!isValidKey) {
      return res.status(401).json({ error: 'Geçersiz kurtarma anahtarı!' });
    }

    // 2. Yeni şifreyi ayarla
    const hashedNewPassword = hashPassword(newPassword, username);
    teachers[teacherIndex].password = hashedNewPassword;

    // Opsiyonel: Anahtarı tek kullanımlık yapmak isterseniz burayı açın
    // teachers[teacherIndex].recoveryKeyHash = null; 

    setData('teachers', teachers);

    res.json({ success: true, message: 'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OGA (Öğrenci Gönderme) Token Doğrulama
router.post('/oga-verify', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Token bulunamadı!' });

    // Token Decode
    const data = JSON.parse(Buffer.from(token, 'base64').toString());
    const { studentIds, exp } = data;

    if (!studentIds || !exp) {
      return res.status(400).json({ success: false, error: 'Geçersiz token formatı!' });
    }

    // Süre kontrolü
    if (Date.now() > exp) {
      return res.status(410).json({ success: false, error: 'Token süresi dolmuş!' });
    }

    res.json({ success: true, studentCount: studentIds.length, expiry: exp });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Token çözülemedi!' });
  }
});

// OGA Login - Sadece OGA seansına dahil öğrenciler için
router.post('/oga-login', async (req, res) => {
  try {
    const { studentNumber, password, token } = req.body;
    if (!studentNumber || !password || !token) {
      return res.status(400).json({ success: false, error: 'Eksik bilgi!' });
    }

    // Token Decode & Verify
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    if (Date.now() > tokenData.exp) {
      return res.status(410).json({ success: false, error: 'Oturum süresi dolmuş!' });
    }

    const students = getData('students') || [];
    const student = students.find(s => s.studentNumber === studentNumber);

    if (!student) {
      return res.status(401).json({ success: false, error: 'Öğrenci bulunamadı!' });
    }

    // Bu öğrenci bu transfer seansına (token) dahil mi?
    if (!tokenData.studentIds.includes(student.id)) {
      return res.status(403).json({ success: false, error: 'Bu aktarım oturumu sizin için aktif değil!' });
    }

    // Şifre kontrolü
    const isValid = verifyPassword(password, student.password, studentNumber);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Hatalı şifre!' });
    }

    const { password: _, ...studentData } = student;
    res.json({ success: true, user: studentData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Aktarım sırasında hata oluştu.' });
  }
});

// Setup Settings - Öğretmen hesabı var mı?
router.get('/setup-status', (req, res) => {
  try {
    console.log('🔍 Setup status check requested');
    const teachers = getData('teachers') || [];
    const isSetupRequired = teachers.length === 0;
    console.log('✅ Setup status:', { isSetupRequired });
    res.json({ success: true, isSetupRequired });
  } catch (error) {
    console.error('❌ Setup status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
