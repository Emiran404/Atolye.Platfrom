import { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/layouts';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { formatRelativeTime } from '../../utils/dateHelpers';
import {
  Bell, Check, CheckCheck, Trash2, Filter, Search, AlertTriangle,
  FileText, Edit, Clock
} from 'lucide-react';
import { t } from '../../utils/i18n';

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  filterCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px'
  },
  filterRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' },
  searchBox: {
    flex: '1',
    minWidth: '200px',
    maxWidth: '300px',
    position: 'relative'
  },
  searchInput: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '10px',
    paddingBottom: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none'
  },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' },
  select: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '14px',
    color: '#1e293b',
    cursor: 'pointer'
  },
  emptyState: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center'
  },
  emptyIcon: { width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 16px' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
  emptyText: { color: '#64748b' },
  notificationCard: (isUnread) => ({
    backgroundColor: isUnread ? '#f0fdfa' : '#ffffff',
    border: isUnread ? '1px solid #99f6e4' : '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '8px',
    transition: 'all 0.2s'
  }),
  notificationRow: { display: 'flex', alignItems: 'flex-start', gap: '16px' },
  iconBox: (bg) => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }),
  notificationContent: { flex: '1', minWidth: 0 },
  notificationHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
  notificationTitle: { fontWeight: '600', color: '#1e293b' },
  unreadDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0d9488' },
  notificationMessage: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  notificationTime: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' },
  notificationActions: { display: 'flex', alignItems: 'center', gap: '4px' },
  infoCard: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  infoTitle: { fontWeight: '600', color: '#1e293b' },
  infoText: { fontSize: '14px', color: '#64748b', marginTop: '4px' }
};

const TeacherNotifications = () => {
  const { notifications, loadNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      await loadNotifications('teacher', user?.id);
      setLoading(false);
    };
    fetchNotifications();
  }, [loadNotifications, user?.id]);

  const teacherNotifications = notifications.filter(n =>
    n.targetType === 'teacher' || n.targetType === 'all' || !n.targetId
  );

  const filteredNotifications = teacherNotifications.filter(n => {
    const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !n.isRead) ||
      (filter === 'read' && n.isRead);
    return matchesSearch && matchesFilter;
  });

  const unreadCount = teacherNotifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_submission':
        return { icon: FileText, color: '#0d9488', bg: '#f0fdfa' };
      case 'edit_request':
        return { icon: Edit, color: '#f59e0b', bg: '#fffbeb' };
      case 'late_submission':
        return { icon: Clock, color: '#ef4444', bg: '#fef2f2' };
      case 'system':
        return { icon: AlertTriangle, color: '#3b82f6', bg: '#eff6ff' };
      default:
        return { icon: Bell, color: '#64748b', bg: '#f8fafc' };
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead('teacher', user?.id);
  };

  return (
    <TeacherLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{t('notifications')}</h1>
            <p style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} ${t('unreadNotificationsCount')}` : t('allNotificationsRead')}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck size={16} style={{ marginRight: '8px' }} />
              {t('markAllAsRead')}
            </Button>
          )}
        </div>

        <div style={styles.filterCard}>
          <div style={styles.filterRow}>
            <div style={styles.searchBox}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder={t('searchNotifications')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: '#64748b' }} />
              <select
                style={styles.select}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">{t('all')}</option>
                <option value="unread">{t('unread')}</option>
                <option value="read">{t('read')}</option>
              </select>
            </div>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div style={styles.emptyState}>
            <Bell style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>{t('noNotificationsYet')}</h3>
            <p style={styles.emptyText}>
              {filter === 'unread' ? t('noUnreadNotifications') : t('noNotificationsYet')}
            </p>
          </div>
        ) : (
          <div>
            {filteredNotifications.map((notification) => {
              const { icon: Icon, color, bg } = getNotificationIcon(notification.type);

              return (
                <div key={notification.id} style={styles.notificationCard(!notification.isRead)}>
                  <div style={styles.notificationRow}>
                    <div style={styles.iconBox(bg)}>
                      <Icon size={20} style={{ color }} />
                    </div>

                    <div style={styles.notificationContent}>
                      <div style={styles.notificationHeader}>
                        <h4 style={styles.notificationTitle}>{notification.title}</h4>
                        {!notification.isRead && <span style={styles.unreadDot} />}
                      </div>
                      <p style={styles.notificationMessage}>{notification.message}</p>
                      <p style={styles.notificationTime}>{formatRelativeTime(notification.createdAt)}</p>
                    </div>

                    <div style={styles.notificationActions}>
                      {!notification.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} title={t('markAsRead')}>
                          <Check size={16} />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)} title={t('delete')}>
                        <Trash2 size={16} style={{ color: '#ef4444' }} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={styles.infoCard}>
          <AlertTriangle size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={styles.infoTitle}>{t('notificationSettings')}</h4>
            <p style={styles.infoText}>
              {t('notificationSettingsDesc')}
              {t('notificationSettingsMore')}
            </p>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherNotifications;
