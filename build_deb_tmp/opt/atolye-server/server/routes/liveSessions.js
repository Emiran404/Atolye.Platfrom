import express from 'express';
import { getData, setData, generateId } from '../utils/storage.js';

const router = express.Router();

// Memory store for live sessions: { examId: { studentId: { ...data, lastSeen: timestamp } } }
const activeSessions = {};

// Get total active sessions across all exams
export const getActiveSessionCount = () => {
  let count = 0;
  Object.keys(activeSessions).forEach(examId => {
    count += Object.keys(activeSessions[examId]).length;
  });
  return count;
};

// Get set of unique student IDs active in exams
export const getActiveStudentIds = () => {
  const ids = new Set();
  Object.keys(activeSessions).forEach(examId => {
    Object.keys(activeSessions[examId]).forEach(studentId => {
      ids.add(studentId);
    });
  });
  return ids;
};

// Clear all sessions for a specific student (used on logout)
export const clearUserSessions = (studentId) => {
  Object.keys(activeSessions).forEach(examId => {
    if (activeSessions[examId][studentId]) {
      delete activeSessions[examId][studentId];
    }
  });
};

// Cleanup interval: remove sessions inactive for > 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(activeSessions).forEach(examId => {
    Object.keys(activeSessions[examId]).forEach(studentId => {
      if (now - activeSessions[examId][studentId].lastSeen > 5 * 60 * 1000) {
        delete activeSessions[examId][studentId];
      }
    });
    // Remove exam map if empty
    if (Object.keys(activeSessions[examId]).length === 0) {
      delete activeSessions[examId];
    }
  });
}, 60000);

// Client sends heartbeat every ~15-30s during active exam
router.post('/heartbeat', (req, res) => {
  const { examId, studentId, studentName, studentNumber, className, currentQuestion } = req.body;
  if (!examId || !studentId) return res.status(400).json({ error: 'Missing ids' });
  
  if (!activeSessions[examId]) activeSessions[examId] = {};
  
  if (!activeSessions[examId][studentId]) {
    activeSessions[examId][studentId] = {
      studentId, studentName, studentNumber, className,
      warnings: [],
      startTime: Date.now(),
      status: 'active'
    };
  }
  
  // If cancelled by teacher, don't update lastSeen but let them know
  if (activeSessions[examId][studentId].status === 'cancelled') {
    return res.json({ success: true, status: 'cancelled' });
  }

  activeSessions[examId][studentId].lastSeen = Date.now();
  if (currentQuestion !== undefined) {
      activeSessions[examId][studentId].currentQuestion = currentQuestion;
  }
  
  res.json({ success: true, status: 'active' });
});

// Report a security warning
router.post('/warning', (req, res) => {
  const { examId, studentId, type, message } = req.body;
  if (activeSessions[examId] && activeSessions[examId][studentId]) {
    activeSessions[examId][studentId].warnings.push({
      type: type || 'warning',
      message: message || 'Şüpheli hareket tespit edildi',
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
  }
  res.json({ success: true });
});

// Teacher gets active sessions
router.get('/exam/:examId', (req, res) => {
  const { examId } = req.params;
  const sessions = activeSessions[examId] || {};
  
  const now = Date.now();
  const activeStudents = Object.values(sessions).map(student => ({
    ...student,
    // Considered offline if no heartbeat in last 60 seconds
    status: (now - student.lastSeen) > 60000 ? 'offline' : 'online'
  }));
  
  res.json({ success: true, sessions: activeStudents });
});

// End session
router.post('/finish', (req, res) => {
  const { examId, studentId } = req.body;
  if (activeSessions[examId] && activeSessions[examId][studentId]) {
    delete activeSessions[examId][studentId];
  }
  res.json({ success: true });
});

// Cancel student exam (teacher action)
router.post('/cancel', (req, res) => {
  const { examId, studentId } = req.body;
  const studentInfo = activeSessions[examId]?.[studentId] || {};
  
  if (activeSessions[examId] && activeSessions[examId][studentId]) {
    activeSessions[examId][studentId].status = 'cancelled';
  }

  // Create or update submission with 'K' grade
  const submissions = getData('submissions') || [];
  let existingSubmission = submissions.find(s => s.examId === examId && s.studentId === studentId && s.status !== 'edit_granted');
  
  if (existingSubmission) {
    existingSubmission.grade = 'K';
    existingSubmission.feedback = 'Sınav kuralları ihlal edildiği için iptal edilmiştir (Kopya).';
    existingSubmission.status = 'graded';
    existingSubmission.isLocked = true;
    existingSubmission.updatedAt = new Date().toISOString();
  } else {
    const exams = getData('exams') || [];
    const exam = exams.find(e => e.id === examId);
    
    submissions.push({
      id: generateId(),
      examId,
      studentId,
      studentNumber: studentInfo.studentNumber || 'Bilinmiyor',
      studentName: studentInfo.studentName || 'Bilinmiyor',
      studentClass: studentInfo.className || 'Bilinmiyor',
      type: exam ? (exam.isQuiz ? 'quiz' : 'classic') : 'unknown',
      grade: 'K',
      feedback: 'Sınav kuralları ihlal edildiği için iptal edilmiştir (Kopya).',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isLocked: true,
      isReady: true,
      status: 'graded'
    });
  }
  setData('submissions', submissions);

  // Send Notification to student
  const notifications = getData('notifications') || [];
  notifications.push({
    id: generateId(),
    type: 'alert',
    title: 'Sınav İptal Edildi',
    message: 'Sınav sırasındaki kural ihlallerinizden dolayı sınavınız iptal edilmiştir ve "K" (Kopya) notu verilmiştir.',
    targetType: 'student',
    targetId: studentId,
    relatedId: examId,
    createdAt: new Date().toISOString(),
    isRead: false
  });
  setData('notifications', notifications);

  res.json({ success: true });
});

export default router;
