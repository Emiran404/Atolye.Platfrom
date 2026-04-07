import { getData, setData } from '../utils/storage.js';

// Random ID helper for notifications
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const startNotificationWorker = () => {
    console.log('🔔 Bildirim Kontrol Servisi Başlatıldı (Her 60 saniyede bir çalışacak)');

    setInterval(() => {
        try {
            const exams = getData('exams') || [];
            const students = getData('students') || [];
            let notifications = getData('notifications') || [];
            let examsUpdated = false;

            const now = new Date();

            exams.forEach(exam => {
                // Initialize tracking object if missing
                if (!exam.notificationsSent) {
                    exam.notificationsSent = { start: false, before30: false, before5: false, end: false };
                    examsUpdated = true; // Needs saving
                } else if (exam.notificationsSent.end === undefined) {
                    exam.notificationsSent.end = false;
                    examsUpdated = true;
                }

                // Check for exam end (for Teacher Notification)
                const endDate = new Date(exam.endDate);
                if (now >= endDate && !exam.notificationsSent.end) {
                    notifications.push({
                        id: generateId(),
                        type: 'info',
                        title: 'Sınav Sona Erdi',
                        message: `"${exam.title}" sınavı sona erdi. Teslimleri kontrol edebilirsiniz.`,
                        targetType: 'teacher',
                        targetId: exam.createdBy || null,
                        relatedId: exam.id,
                        isRead: false,
                        createdAt: new Date().toISOString()
                    });
                    exam.notificationsSent.end = true;
                    examsUpdated = true;
                    console.log(`[Bildirim Servisi] "${exam.title}" için 'end' (bitiş) bildirimi öğretmene gönderildi.`);
                }

                // Only active exams that have student notifications enabled
                if (!exam.isActive || !exam.sendNotification) return;

                const startDate = new Date(exam.startDate);
                const diffMs = startDate.getTime() - now.getTime();
                const diffMinutes = Math.floor(diffMs / 60000);

                let triggerType = null;
                let title = '';
                let message = '';

                // Check which notification to trigger
                if (exam.notifyOnStart && diffMinutes <= 0 && diffMinutes >= -5 && !exam.notificationsSent.start) {
                    triggerType = 'start';
                    title = 'Sınav Başladı!';
                    message = `"${exam.title}" adlı sınav şimdi başladı. Başarılar dileriz!`;
                } else if (exam.notifyBefore5 && diffMinutes > 0 && diffMinutes <= 5 && !exam.notificationsSent.before5) {
                    triggerType = 'before5';
                    title = '⏳ Sınava 5 Dakika Kaldı!';
                    message = `"${exam.title}" sınavının başlamasına 5 dakikadan az bir süre kaldı! Lütfen yerinizi alınız.`;
                } else if (exam.notifyBefore30 && diffMinutes > 5 && diffMinutes <= 30 && !exam.notificationsSent.before30) {
                    triggerType = 'before30';
                    title = '⏰ Sınava 30 Dakika Kaldı!';
                    message = `"${exam.title}" sınavına sadece 30 dakika kaldı. Hazırlıklarınızı tamamlayınız.`;
                }

                if (triggerType) {
                    // Find target students
                    let targetStudentIds = [];
                    if (exam.targetType === 'all') {
                        targetStudentIds = students.map(s => s.id);
                    } else if (exam.targetType === 'class') {
                        targetStudentIds = students
                            .filter(s => (exam.targetClasses || []).includes(s.className))
                            .map(s => s.id);
                    } else if (exam.targetType === 'custom') {
                        targetStudentIds = exam.targetStudents || [];
                    }

                    // Create notifications for targeted students
                    targetStudentIds.forEach(studentId => {
                        notifications.push({
                            id: generateId(),
                            type: 'exam_reminder', // generic warning type
                            title: title,
                            message: message,
                            targetType: 'student',
                            targetId: studentId,
                            relatedId: exam.id,
                            isRead: false,
                            createdAt: new Date().toISOString()
                        });
                    });

                    // Mark as sent
                    exam.notificationsSent[triggerType] = true;
                    examsUpdated = true;

                    console.log(`[Bildirim Servisi] "${exam.title}" için '${triggerType}' bildirimi ${targetStudentIds.length} öğrenciye gönderildi.`);
                }
            });

            // Save changes if any
            if (examsUpdated) {
                setData('exams', exams);
                setData('notifications', notifications);
            }

        } catch (error) {
            console.error('Bildirim Servisi Hatası:', error);
        }
    }, 60000); // 1 minute
};
