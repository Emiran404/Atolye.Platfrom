import { create } from 'zustand';
import { submissionApi, uploadApi } from '../services/api';

const useSubmissionStore = create((set, get) => ({
  submissions: [],
  currentSubmission: null,
  editTimer: null,
  editTimeRemaining: 0,

  // Tüm teslimleri yükle - Backend API
  loadSubmissions: async () => {
    try {
      const response = await submissionApi.getAll();
      if (response.success) {
        set({ submissions: response.submissions });
        return response.submissions;
      }
      return [];
    } catch (error) {
      console.error('Teslimler yüklenemedi:', error);
      return [];
    }
  },

  // Öğrencinin teslimlerini getir
  getStudentSubmissions: (studentId) => {
    return get().submissions.filter(s => s.studentId === studentId);
  },

  // Sınav teslimlerini getir
  getExamSubmissions: (examId) => {
    return get().submissions.filter(s => s.examId === examId);
  },

  // Belirli teslimi getir
  getSubmission: (examId, studentId) => {
    return get().submissions.find(s => s.examId === examId && s.studentId === studentId);
  },

  // Dosya teslimi - Backend API
  submitFile: async (examId, studentId, studentInfo, file, clientIp) => {
    try {
      // Önce dosyayı yükle
      const uploadResponse = await uploadApi.upload(file, studentInfo.folderPath, examId, studentId);

      if (!uploadResponse.success) {
        return { success: false, error: 'Dosya yüklenemedi' };
      }

      // Sonra teslim kaydı oluştur
      const submissionData = {
        examId,
        studentId,
        studentNumber: studentInfo.studentNumber,
        studentName: studentInfo.fullName,
        studentClass: studentInfo.className,
        folderPath: studentInfo.folderPath,
        fileName: uploadResponse.file.fileName,
        fileSize: uploadResponse.file.fileSize,
        fileType: uploadResponse.file.fileType,
        filePath: uploadResponse.file.filePath,
        fileHash: uploadResponse.file.fileHash,
        clientIp: clientIp || 'Bilinmiyor'
      };

      const response = await submissionApi.create(submissionData);

      if (response.success) {
        // Store'u güncelle
        await get().loadSubmissions();
        set({ currentSubmission: response.submission });
        return { success: true, submission: response.submission, isUpdate: response.isUpdate };
      }

      return { success: false, error: 'Teslim kaydedilemedi' };
    } catch (error) {
      console.error('Dosya teslim hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Quiz teslimi - Backend API
  submitQuiz: async (quizData) => {
    try {
      const response = await submissionApi.submitQuiz(quizData);

      if (response.success) {
        // Store'u güncelle
        await get().loadSubmissions();
        set({ currentSubmission: response.submission });
        return { success: true, submission: response.submission, score: response.score };
      }

      return { success: false, error: 'Quiz teslim edilemedi' };
    } catch (error) {
      console.error('Quiz teslim hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Klasik (Metin Açık Uçlu) teslimi - Backend API
  submitClassic: async (classicData) => {
    try {
      const response = await submissionApi.submitClassic(classicData);

      if (response.success) {
        // Store'u güncelle
        await get().loadSubmissions();
        set({ currentSubmission: response.submission });
        return { success: true, submission: response.submission, isUpdate: response.isUpdate };
      }

      return { success: false, error: 'Klasik sınav teslim edilemedi' };
    } catch (error) {
      console.error('Klasik sınav teslim hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Teslimi kilitle
  lockSubmission: async (submissionId) => {
    try {
      const response = await submissionApi.lock(submissionId);
      if (response.success) {
        await get().loadSubmissions();
      }
    } catch (error) {
      console.error('Kilitleme hatası:', error);
    }
  },

  // "Hazırım" işaretle
  markAsReady: async (submissionId) => {
    try {
      const response = await submissionApi.markReady(submissionId);
      if (response.success) {
        await get().loadSubmissions();
      }
    } catch (error) {
      console.error('Hazır işaretleme hatası:', error);
    }
  },

  // Düzenleme izni talebi
  requestEditPermission: async (submissionId, reason) => {
    try {
      const response = await submissionApi.requestEdit(submissionId, reason);
      if (response.success) {
        await get().loadSubmissions();
        return response.submission.editRequests?.slice(-1)[0];
      }
    } catch (error) {
      console.error('Talep hatası:', error);
    }
  },

  // Düzenleme iznini onayla/reddet
  respondToEditRequest: async (submissionId, requestId, approved, teacherId, note = '', editDuration = 10) => {
    try {
      const response = await submissionApi.respondEditRequest(
        submissionId,
        requestId,
        approved,
        note,
        teacherId,
        editDuration
      );
      if (response.success) {
        await get().loadSubmissions();
      }
    } catch (error) {
      console.error('Yanıt hatası:', error);
    }
  },

  // Not ver
  gradeSubmission: async (submissionId, grade, feedback, teacherId) => {
    try {
      const response = await submissionApi.grade(submissionId, grade, feedback, teacherId);
      if (response.success) {
        await get().loadSubmissions();
        return response;
      } else {
        throw new Error(response.error || 'Not kaydedilemedi');
      }
    } catch (error) {
      console.error('Notlandırma hatası:', error);
      throw error; // Hatayı yukarı fırlat
    }
  },

  // Düzenleme zamanlayıcısını başlat
  startEditTimer: (submissionId, duration = 300) => {
    set({ editTimeRemaining: duration });

    const timer = setInterval(() => {
      const remaining = get().editTimeRemaining;
      if (remaining <= 0) {
        clearInterval(timer);
        get().lockSubmission(submissionId);
        set({ editTimer: null, editTimeRemaining: 0 });
      } else {
        set({ editTimeRemaining: remaining - 1 });
      }
    }, 1000);

    set({ editTimer: timer });
  },

  // Zamanlayıcıyı durdur
  stopEditTimer: () => {
    const timer = get().editTimer;
    if (timer) {
      clearInterval(timer);
      set({ editTimer: null, editTimeRemaining: 0 });
    }
  },

  // Geçerli teslimi ayarla
  setCurrentSubmission: (submission) => {
    set({ currentSubmission: submission });
  }
}));

export { useSubmissionStore };
