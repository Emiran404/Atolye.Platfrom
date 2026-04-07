import { create } from 'zustand';
import { notificationApi } from '../services/api';
import { generateId } from '../utils/stringHelpers';
import { t } from '../utils/i18n';

// Browser push notification desteği
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Bu tarayıcı bildirim desteklemiyor');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showPushNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options
    });
  }
};

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  toasts: [],
  pushEnabled: false,

  // Toast ekle
  addToast: (toast) => {
    const id = generateId();
    const newToast = { id, ...toast };
    set(state => ({ toasts: [...state.toasts, newToast] }));
    
    // 5 saniye sonra otomatik kaldır
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 5000);
    
    return id;
  },

  // Toast kaldır
  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  // Bildirimleri yükle - Backend API
  loadNotifications: async (userType, userId) => {
    try {
      const response = await notificationApi.getByUser(userType, userId);
      if (response.success) {
        set({ 
          notifications: response.notifications, 
          unreadCount: response.unreadCount 
        });
        return response.notifications;
      }
      return [];
    } catch (error) {
      console.error('Bildirimler yüklenemedi:', error);
      return [];
    }
  },

  // Push notification'ı etkinleştir
  enablePushNotifications: async () => {
    const granted = await requestNotificationPermission();
    set({ pushEnabled: granted });
    return granted;
  },

  // Bildirim oluştur - Backend API + Push
  createNotification: async (data, showPush = false) => {
    try {
      const response = await notificationApi.create(data);
      
      // Push notification göster (eğer izin verilmişse)
      if (response.success && showPush && get().pushEnabled) {
        showPushNotification(data.title, {
          body: data.message,
          tag: data.type,
          requireInteraction: data.type === 'grade_published' || data.type === 'exam_published'
        });
      }
      
      return response.success;
    } catch (error) {
      console.error('Bildirim oluşturulamadı:', error);
      return false;
    }
  },

  // Okundu işaretle - Backend API
  markAsRead: async (notificationId) => {
    try {
      const response = await notificationApi.markAsRead(notificationId);
      if (response.success) {
        const currentNotifications = get().notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        const unreadCount = currentNotifications.filter(n => !n.isRead).length;
        set({ notifications: currentNotifications, unreadCount });
      }
    } catch (error) {
      console.error('Okundu işaretlenemedi:', error);
    }
  },

  // Tümünü okundu işaretle - Backend API
  markAllAsRead: async (userType, userId) => {
    try {
      const response = await notificationApi.markAllAsRead(userType, userId);
      if (response.success) {
        const currentNotifications = get().notifications.map(n => ({ ...n, isRead: true }));
        set({ notifications: currentNotifications, unreadCount: 0 });
      }
    } catch (error) {
      console.error('Tümü okundu işaretlenemedi:', error);
    }
  },

  // Bildirimi sil - Backend API
  deleteNotification: async (notificationId) => {
    try {
      const response = await notificationApi.delete(notificationId);
      if (response.success) {
        const currentNotifications = get().notifications.filter(n => n.id !== notificationId);
        const unreadCount = currentNotifications.filter(n => !n.isRead).length;
        set({ notifications: currentNotifications, unreadCount });
      }
    } catch (error) {
      console.error('Bildirim silinemedi:', error);
    }
  },

  // Sınav bildirimi oluştur - Backend API
  createExamNotification: async (exam, type, targetStudentIds = []) => {
    const typeMessages = {
      'exam_started': { title: t('notifExamStarted'), message: `${exam.title} ${t('notifExamStartedMsg')}` },
      'exam_reminder_30': { title: t('notifExamReminder30'), message: `${exam.title} ${t('notifExamReminder30Msg')}` },
      'exam_reminder_5': { title: t('notifExamReminder5'), message: `${exam.title} ${t('notifExamReminder5Msg')}` },
      'exam_ended': { title: t('notifExamEnded'), message: `${exam.title} ${t('notifExamEndedMsg')}` },
      'new_exam': { title: t('notifNewExam'), message: `${exam.title} ${t('notifNewExamMsg')}` }
    };

    const { title, message } = typeMessages[type] || { title: t('notification'), message: '' };

    if (targetStudentIds.length > 0) {
      try {
        await notificationApi.createBulk({
          type,
          title,
          message,
          targetType: 'student',
          targetIds: targetStudentIds,
          relatedId: exam.id
        });
      } catch (error) {
        console.error('Toplu bildirim oluşturulamadı:', error);
      }
    }
  }
}));

export { useNotificationStore };
