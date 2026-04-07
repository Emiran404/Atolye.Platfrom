import express from 'express';
import { getData, setData, generateId } from '../utils/storage.js';

const router = express.Router();

// Tüm sınavları getir
router.get('/', (req, res) => {
  try {
    const { createdBy } = req.query;
    let exams = getData('exams') || [];
    
    if (createdBy) {
      exams = exams.filter(e => e.createdBy === createdBy);
    }
    
    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Aktif sınavları getir
router.get('/active', (req, res) => {
  try {
    const exams = getData('exams') || [];
    const now = new Date();

    const activeExams = exams.filter(exam => {
      const startDate = new Date(exam.startDate);
      const endDate = new Date(exam.endDate);
      return exam.isActive && now >= startDate && now <= endDate;
    });

    res.json({ success: true, exams: activeExams });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sınıfa göre aktif sınavları getir
router.get('/active/:className', (req, res) => {
  try {
    const { className } = req.params;
    const exams = getData('exams') || [];
    const now = new Date();

    const activeExams = exams.filter(exam => {
      const startDate = new Date(exam.startDate);
      const endDate = new Date(exam.endDate);
      
      const isDateValid = exam.isActive && now >= startDate && now <= endDate;
      if (!isDateValid) return false;

      // Tüm öğrencilere yönelikse veya bu sınıfa yönelikse
      return exam.targetType === 'all' || (exam.targetClasses && exam.targetClasses.includes(className));
    });

    res.json({ success: true, exams: activeExams });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tek sınav getir
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const exams = getData('exams') || [];
    const exam = exams.find(e => e.id === id);

    if (!exam) {
      return res.status(404).json({ success: false, error: 'Sınav bulunamadı' });
    }

    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Yeni sınav oluştur
router.post('/', (req, res) => {
  try {
    const {
      title,
      description,
      targetClasses,
      startDate,
      endDate,
      allowedFileTypes,
      maxFileSize,
      multipleFiles,
      maxFileCount,
      createdBy,
      questions,
      isQuiz
    } = req.body;

    if (!title || !targetClasses || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Gerekli alanlar eksik!' });
    }

    const exams = getData('exams') || [];
    const examId = generateId();

    const newExam = {
      ...req.body,
      id: examId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    exams.push(newExam);
    setData('exams', exams);

    // Öğretmene bildirim gönder
    const notifications = getData('notifications') || [];
    notifications.push({
      id: generateId(),
      type: 'success',
      title: 'Sınav Oluşturuldu',
      message: `"${title}" adlı sınav başarıyla oluşturuldu.`,
      targetType: 'teacher',
      targetId: createdBy || null,
      relatedId: examId,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    setData('notifications', notifications);

    res.json({ success: true, exam: newExam });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sınav güncelle
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const exams = getData('exams') || [];
    const examIndex = exams.findIndex(e => e.id === id);

    if (examIndex === -1) {
      return res.status(404).json({ success: false, error: 'Sınav bulunamadı' });
    }

    exams[examIndex] = {
      ...exams[examIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setData('exams', exams);
    res.json({ success: true, exam: exams[examIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sınav sil
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const exams = getData('exams') || [];
    const filteredExams = exams.filter(e => e.id !== id);

    if (exams.length === filteredExams.length) {
      return res.status(404).json({ success: false, error: 'Sınav bulunamadı' });
    }

    setData('exams', filteredExams);
    res.json({ success: true, message: 'Sınav silindi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sınavı aktif/pasif yap
router.patch('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const exams = getData('exams') || [];
    const exam = exams.find(e => e.id === id);

    if (!exam) {
      return res.status(404).json({ success: false, error: 'Sınav bulunamadı' });
    }

    exam.isActive = !exam.isActive;
    exam.updatedAt = new Date().toISOString();

    setData('exams', exams);
    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
