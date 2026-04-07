// API Base URL - Vite proxy kullanıldığı için sadece /api yeterli
const API_BASE = '/api';

// Generic fetch wrapper
const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // FormData için Content-Type header'ı silmeli
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Bir hata oluştu');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authApi = {
  // Öğrenci kayıt
  registerStudent: (data) =>
    fetchApi('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Öğrenci giriş
  loginStudent: (studentNumber, password) =>
    fetchApi('/auth/login/student', {
      method: 'POST',
      body: JSON.stringify({ studentNumber, password }),
    }),

  // Öğrenci şifre sıfırlama
  resetStudentPassword: (studentNumber, newPassword) =>
    fetchApi('/auth/login/student-reset', {
      method: 'POST',
      body: JSON.stringify({ studentNumber, newPassword }),
    }),

  // Öğretmen kayıt
  registerTeacher: (data) =>
    fetchApi('/auth/register/teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Öğretmen giriş
  loginTeacher: (username, password) =>
    fetchApi('/auth/login/teacher', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Tüm öğrencileri getir
  getStudents: () => fetchApi('/auth/students'),

  // Sınıf listesi
  getClasses: () => fetchApi('/auth/classes'),

  // Passkey API
  passkeyRegisterChallenge: (username) =>
    fetchApi('/auth/passkey/register-challenge', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),

  passkeyRegister: (username, credentialId, publicKey) =>
    fetchApi('/auth/passkey/register', {
      method: 'POST',
      body: JSON.stringify({ username, credentialId, publicKey }),
    }),

  passkeyLoginChallenge: (username) =>
    fetchApi('/auth/passkey/login-challenge', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),

  passkeyLogin: (username, credentialId, authenticatorData, clientDataJSON, signature) =>
    fetchApi('/auth/passkey/login', {
      method: 'POST',
      body: JSON.stringify({ username, credentialId, authenticatorData, clientDataJSON, signature }),
    }),

  // Recovery Key
  generateRecoveryKey: (username) =>
    fetchApi('/auth/recovery-key/generate', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),

  resetPasswordWithKey: (username, recoveryKey, newPassword) =>
    fetchApi('/auth/recovery-key/reset', {
      method: 'POST',
      body: JSON.stringify({ username, recoveryKey, newPassword }),
    }),
};

// User API
export const userApi = {
  // Kullanıcı güncelle (Profil ve ayarlar)
  update: (id, userType, updates) =>
    fetchApi(`/users/${id}/update`, {
      method: 'PATCH',
      body: JSON.stringify({ userType, updates }),
    }),

  // Tüm öğrencileri al
  getStudents: () => fetchApi('/users/students'),

  // Tüm öğretmenleri al
  getTeachers: () => fetchApi('/users/teachers'),

  // Kullanıcı sil
  delete: (id, userType) =>
    fetchApi(`/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ userType }),
    }),

  // Kullanıcıyı askıya al
  suspend: (id, userType, suspended) =>
    fetchApi(`/users/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ userType, suspended }),
    }),
};

// Exam API
export const examApi = {
  // Tüm sınavlar
  getAll: (teacherId) => {
    const endpoint = teacherId ? `/exams?createdBy=${teacherId}` : '/exams';
    return fetchApi(endpoint);
  },

  // Aktif sınavlar
  getActive: () => fetchApi('/exams/active'),

  // Sınıfa göre aktif sınavlar
  getActiveByClass: (className) => fetchApi(`/exams/active/${encodeURIComponent(className)}`),

  // Tek sınav
  getById: (id) => fetchApi(`/exams/${id}`),

  // Sınav oluştur
  create: (data) =>
    fetchApi('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Sınav güncelle
  update: (id, data) =>
    fetchApi(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Sınav sil
  delete: (id) =>
    fetchApi(`/exams/${id}`, {
      method: 'DELETE',
    }),

  // Sınavı aç/kapat
  toggle: (id) =>
    fetchApi(`/exams/${id}/toggle`, {
      method: 'PATCH',
    }),
};

// Submission API
export const submissionApi = {
  // Tüm teslimler
  getAll: () => fetchApi('/submissions'),

  // Öğrenci teslimleri
  getByStudent: (studentId) => fetchApi(`/submissions/student/${studentId}`),

  // Sınav teslimleri
  getByExam: (examId) => fetchApi(`/submissions/exam/${examId}`),

  // Tek teslim
  get: (examId, studentId) => fetchApi(`/submissions/${examId}/${studentId}`),

  // Teslim oluştur
  create: (data) =>
    fetchApi('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Quiz teslimi
  submitQuiz: (data) =>
    fetchApi('/submissions/quiz', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Klasik sınav teslimi
  submitClassic: (data) =>
    fetchApi('/submissions/classic', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Kilitle
  lock: (id) =>
    fetchApi(`/submissions/${id}/lock`, {
      method: 'PATCH',
    }),

  // Hazırım işaretle
  markReady: (id) =>
    fetchApi(`/submissions/${id}/ready`, {
      method: 'PATCH',
    }),

  // Not ver
  grade: (id, grade, feedback, gradedBy) =>
    fetchApi(`/submissions/${id}/grade`, {
      method: 'PATCH',
      body: JSON.stringify({ grade, feedback, gradedBy }),
    }),

  // Düzenleme talebi
  requestEdit: (id, reason) =>
    fetchApi(`/submissions/${id}/edit-request`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Düzenleme talebini yanıtla
  respondEditRequest: (id, requestId, approved, response, respondedBy, editDuration) =>
    fetchApi(`/submissions/${id}/edit-request/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, response, respondedBy, editDuration }),
    }),

  // Öğretmen direkt düzenleme izni ver (mevcut dosyaları sil)
  grantEditPermission: (submissionId, examId, studentId, note, teacherId) =>
    fetchApi(`/submissions/${submissionId}/grant-edit-permission`, {
      method: 'POST',
      body: JSON.stringify({ examId, studentId, note, teacherId }),
    }),

  // Benzer dosya kontrol et (Kopya tespiti)
  checkDuplicate: (fileHash, examId, studentId) =>
    fetchApi('/submissions/check-duplicate', {
      method: 'POST',
      body: JSON.stringify({ fileHash, examId, studentId }),
    }),

  // Sınav bazında kopya listesi (Öğretmen için)
  getExamDuplicates: (examId) =>
    fetchApi(`/submissions/exam/${examId}/duplicates`),
};

// Upload API
export const uploadApi = {
  // Dosya yükle
  upload: async (file, folderPath, examId, studentId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderPath', folderPath);
    formData.append('examId', examId);
    formData.append('studentId', studentId);

    const response = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Dosya yüklenemedi');
    }
    return data;
  },

  // Dosya indir
  getDownloadUrl: (filePath) => `${API_BASE}/uploads/download/${filePath}`,

  // Dosya görüntüle
  getViewUrl: (filePath) => `${API_BASE}/uploads/view/${filePath}`,

  // Klasör içeriği
  listFolder: (folderPath) => fetchApi(`/uploads/list/${folderPath}`),

  // Dosya sil
  delete: (filePath) =>
    fetchApi(`/uploads/${filePath}`, {
      method: 'DELETE',
    }),
};

// Schedule API
export const scheduleApi = {
  // Tüm programları getir
  getAll: () => fetchApi('/schedules'),

  // Sınıfa göre program getir
  getByClass: (className) => fetchApi(`/schedules/class/${className}`),

  // Yeni ders ekle
  create: (data) =>
    fetchApi('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Toplu ders ekle
  createBulk: (schedules) =>
    fetchApi('/schedules/bulk', {
      method: 'POST',
      body: JSON.stringify({ newSchedules: schedules }),
    }),

  // Ders güncelle
  update: (id, data) =>
    fetchApi(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Ders sil
  delete: (id) =>
    fetchApi(`/schedules/${id}`, {
      method: 'DELETE',
    }),
};

// Notification API
export const notificationApi = {
  // Kullanıcı bildirimleri
  getByUser: (userType, userId) => fetchApi(`/notifications/user/${userType}/${userId}`),

  // Bildirim oluştur
  create: (data) =>
    fetchApi('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Toplu bildirim
  createBulk: (data) =>
    fetchApi('/notifications/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Okundu işaretle
  markAsRead: (id) =>
    fetchApi(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // Tümünü okundu işaretle
  markAllAsRead: (userType, userId) =>
    fetchApi(`/notifications/read-all/${userType}/${userId}`, {
      method: 'PATCH',
    }),

  // Bildirim sil
  delete: (id) =>
    fetchApi(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

// Live Sessions API
export const liveSessionApi = {
  // Send heartbeat validation
  heartbeat: (data) =>
    fetchApi('/live-sessions/heartbeat', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Report security warning
  reportWarning: (data) =>
    fetchApi('/live-sessions/warning', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Get active student sessions for an exam (teacher side)
  getExamSessions: (examId) => fetchApi(`/live-sessions/exam/${examId}`),

  // Finish passing exam session
  finishSession: (examId, studentId) =>
    fetchApi('/live-sessions/finish', {
      method: 'POST',
      body: JSON.stringify({ examId, studentId })
    }),

  // Cancel student exam (Teacher UI)
  cancelSession: (examId, studentId) => 
    fetchApi('/live-sessions/cancel', {
      method: 'POST',
      body: JSON.stringify({ examId, studentId })
    })
};

// Health check
export const healthCheck = () => fetchApi('/health');

export default {
  auth: authApi,
  exam: examApi,
  submission: submissionApi,
  upload: uploadApi,
  notification: notificationApi,
  schedule: scheduleApi,
  liveSession: liveSessionApi,
  user: userApi,
  healthCheck,
};
