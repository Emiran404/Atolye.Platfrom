import { create } from 'zustand';
import { examApi } from '../services/api';

const useExamStore = create((set, get) => ({
  exams: [],
  currentExam: null,
  loading: false,

  // Sınavları yükle - Backend API
  loadExams: async (teacherId) => {
    try {
      set({ loading: true });
      const response = await examApi.getAll(teacherId);
      if (response.success) {
        set({ exams: response.exams, loading: false });
        return response.exams;
      }
      set({ loading: false });
      return [];
    } catch (error) {
      console.error('Sınavlar yüklenemedi:', error);
      set({ loading: false });
      return [];
    }
  },

  // Tek sınav getir
  getExam: (examId) => {
    return get().exams.find(e => e.id === examId);
  },

  // Aktif sınavları getir
  getActiveExams: () => {
    const exams = get().exams;
    const now = new Date();
    return exams.filter(exam => {
      const start = new Date(exam.startDate);
      const end = new Date(exam.endDate);
      return start <= now && end >= now && (exam.status === 'active' || exam.isActive);
    });
  },

  // Yaklaşan sınavları getir
  getUpcomingExams: () => {
    const exams = get().exams;
    const now = new Date();
    return exams.filter(exam => {
      const start = new Date(exam.startDate);
      return start > now && (exam.status === 'active' || exam.isActive);
    });
  },

  // Geçmiş sınavları getir
  getPastExams: () => {
    const exams = get().exams;
    const now = new Date();
    return exams.filter(exam => {
      const end = new Date(exam.endDate);
      return end < now || exam.status === 'completed';
    });
  },

  getExamsForStudent: (studentId, studentClass) => {
    const { exams } = get();
    if (!exams) return [];

    return exams.filter(exam => {
      // isActive kontrolü
      if (exam.isActive === false) return false;

      // 1. Hedef Tip Kontrolü
      if (exam.targetType === 'all') {
        return true;
      }

      // 2. Sınıf Kontrolü
      if (exam.targetType === 'class' && exam.targetClasses && Array.isArray(exam.targetClasses)) {
        const sClass = (studentClass || '').toString().trim().toLowerCase();
        return exam.targetClasses.some(c => (c || '').toString().trim().toLowerCase() === sClass);
      }

      // 3. Özel Öğrenci Kontrolü
      if (exam.targetType === 'student' && exam.targetStudents && Array.isArray(exam.targetStudents)) {
        const sId = (studentId || '').toString();
        return exam.targetStudents.some(id => (id || '').toString() === sId);
      }

      // Geriye dönük uyumluluk (Eski verilerde targetType olmayabilir)
      if (!exam.targetType) {
        if (exam.targetClasses && Array.isArray(exam.targetClasses) && exam.targetClasses.length > 0) {
          const sClass = (studentClass || '').toString().trim().toLowerCase();
          return exam.targetClasses.some(c => (c || '').toString().trim().toLowerCase() === sClass);
        }
      }

      return false;
    });
  },

  // Yeni sınav oluştur - Backend API
  createExam: async (examData) => {
    try {
      const response = await examApi.create(examData);
      if (response.success) {
        const exams = [...get().exams, response.exam];
        set({ exams });
        return response.exam;
      }
      return null;
    } catch (error) {
      console.error('Sınav oluşturulamadı:', error);
      return null;
    }
  },

  // Sınavı güncelle - Backend API
  updateExam: async (examId, updates) => {
    try {
      const response = await examApi.update(examId, updates);
      if (response.success) {
        const exams = get().exams.map(exam =>
          exam.id === examId ? response.exam : exam
        );
        set({ exams });
        return response.exam;
      }
      return null;
    } catch (error) {
      console.error('Sınav güncellenemedi:', error);
      return null;
    }
  },

  // Sınavı sil - Backend API
  deleteExam: async (examId) => {
    try {
      const response = await examApi.delete(examId);
      if (response.success) {
        const exams = get().exams.filter(exam => exam.id !== examId);
        set({ exams });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sınav silinemedi:', error);
      return false;
    }
  },

  // Sınav süresini uzat
  extendExamTime: async (examId, minutes) => {
    const exam = get().exams.find(e => e.id === examId);
    if (exam) {
      const newEndDate = new Date(new Date(exam.endDate).getTime() + minutes * 60 * 1000);
      return get().updateExam(examId, { endDate: newEndDate.toISOString() });
    }
  },

  // Sınavı bitir
  endExam: async (examId) => {
    return get().updateExam(examId, {
      status: 'completed',
      isActive: false,
      endDate: new Date().toISOString()
    });
  },

  // Sınav istatistiklerini getir
  getExamStats: (examId) => {
    const exam = get().exams.find(e => e.id === examId);
    if (!exam) return null;

    const submissions = exam.submissions || [];
    const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined);

    return {
      totalStudents: exam.targetClasses?.length * 30 || 0, // Tahmini
      submittedCount: submissions.length,
      gradedCount: gradedSubmissions.length,
      averageGrade: gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length
        : 0,
      pendingCount: submissions.filter(s => s.grade === null || s.grade === undefined).length
    };
  },

  // Geçerli sınavı ayarla
  setCurrentExam: (exam) => {
    set({ currentExam: exam });
  }
}));

export { useExamStore };
