import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Filter, CheckCircle, XCircle, AlertCircle, Info, FileText, Award, Home, ArrowRight } from 'lucide-react';
import StudentSidebar from '../../components/layout/StudentSidebar';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { getRelativeTime } from '../../utils/dateHelpers';
import { t } from '../../utils/i18n';

const Notifications = () => {
  const { user, userType } = useAuthStore();
  const { notifications, loadNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      await loadNotifications(userType, user?.id);
      setLoading(false);
    };
    if (user?.id) {
      fetchNotifications();

      // Otomatik yenileme - Her 10 saniyede bir
      const refreshInterval = setInterval(() => {
        loadNotifications(userType, user?.id);
      }, 10000);

      return () => clearInterval(refreshInterval);
    }
  }, [user, userType]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    const iconStyle = { width: '20px', height: '20px' };
    if (type.includes('graded')) return <Award style={{ ...iconStyle, color: '#10b981' }} />;
    if (type.includes('approved')) return <CheckCircle style={{ ...iconStyle, color: '#10b981' }} />;
    if (type.includes('rejected')) return <XCircle style={{ ...iconStyle, color: '#ef4444' }} />;
    if (type.includes('edit_granted')) return <AlertCircle style={{ ...iconStyle, color: '#f59e0b' }} />;
    if (type.includes('reminder') || type.includes('warning')) return <AlertCircle style={{ ...iconStyle, color: '#f59e0b' }} />;
    if (type.includes('exam')) return <FileText style={{ ...iconStyle, color: '#3b82f6' }} />;
    return <Info style={{ ...iconStyle, color: '#3b82f6' }} />;
  };

  const handleMarkAllRead = () => {
    markAllAsRead(userType, user?.id);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const styles = {
    container: { maxWidth: '800px', margin: '0 auto' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
    subtitle: { fontSize: '14px', color: '#64748b' },
    markAllBtn: {
      padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569',
      border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer'
    },
    filterContainer: { display: 'flex', gap: '8px', marginBottom: '24px' },
    filterBtn: (active) => ({
      padding: '10px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '500',
      backgroundColor: active ? '#eff6ff' : 'transparent',
      color: active ? '#3b82f6' : '#64748b',
      border: 'none', cursor: 'pointer', transition: 'all 0.2s'
    }),
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      marginBottom: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    cardUnread: {
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe'
    },
    notificationContent: { display: 'flex', alignItems: 'flex-start', gap: '16px' },
    iconWrapper: (unread) => ({
      padding: '10px', borderRadius: '10px',
      backgroundColor: unread ? '#dbeafe' : '#f1f5f9'
    }),
    textContent: { flex: 1, minWidth: 0 },
    notificationTitle: (unread) => ({
      fontSize: '15px', fontWeight: unread ? '600' : '500',
      color: unread ? '#1e293b' : '#64748b', marginBottom: '4px'
    }),
    notificationMessage: { fontSize: '14px', color: '#64748b', marginBottom: '8px' },
    notificationTime: { fontSize: '12px', color: '#94a3b8' },
    rightSection: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
    badge: { padding: '4px 8px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '6px', fontSize: '11px', fontWeight: '600' },
    deleteBtn: {
      padding: '8px', backgroundColor: 'transparent', border: 'none',
      color: '#94a3b8', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s'
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      minHeight: '300px'
    },
    emptyIcon: { marginBottom: '16px', color: '#cbd5e1' },
    emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
    emptyText: { fontSize: '14px', color: '#64748b' }
  };

  return (
    <>
      <StudentSidebar />

      {/* Main Content */}
      <div style={{
        marginLeft: '288px',
        minHeight: '100vh',
        background: '#f6f6f8'
      }}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #f0f1f4',
          padding: '20px 48px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          {/* Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#94a3b8',
            marginBottom: '16px'
          }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#2463eb'}
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
              {t('home')}
            </span>
            <ArrowRight size={14} />
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#2463eb'}
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
              {t('dashboard')}
            </span>
            <ArrowRight size={14} />
            <span style={{ color: '#2463eb', fontWeight: '500' }}>{t('notifications')}</span>
          </div>

          {/* User info */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '4px'
              }}>
                {t('notifications')}
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                {user?.studentNumber} • {user?.fullName || user?.name || t('student')}
              </p>
            </div>

            {/* User Avatar */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              {(user?.fullName || user?.name)?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '48px' }}>
          <div style={styles.container}>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>{t('notifications')}</h1>
                <p style={styles.subtitle}>{t('viewAllNotifications')}</p>
              </div>
              {unreadCount > 0 && (
                <button style={styles.markAllBtn} onClick={handleMarkAllRead}>
                  {t('markAllAsRead')}
                </button>
              )}
            </div>

            {/* Filters */}
            <div style={styles.filterContainer}>
              {[
                { value: 'all', label: t('all') },
                { value: 'unread', label: `${t('unread')} (${unreadCount})` },
                { value: 'read', label: t('read') }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  style={styles.filterBtn(filter === f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div style={styles.emptyState}>
                <Bell size={64} style={styles.emptyIcon} />
                <h3 style={styles.emptyTitle}>{t('noNotificationsYet')}</h3>
                <p style={styles.emptyText}>
                  {filter === 'unread' ? t('noUnreadNotifications') : t('noNotificationsYet')}
                </p>
              </div>
            ) : (
              <div>
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    style={{
                      ...styles.card,
                      ...(notification.isRead ? {} : styles.cardUnread)
                    }}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
                  >
                    <div style={styles.notificationContent}>
                      <div style={styles.iconWrapper(!notification.isRead)}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div style={styles.textContent}>
                        <p style={styles.notificationTitle(!notification.isRead)}>
                          {notification.title}
                        </p>
                        <p style={styles.notificationMessage}>
                          {notification.message}
                        </p>
                        <p style={styles.notificationTime}>
                          {getRelativeTime(notification.createdAt)}
                        </p>
                      </div>

                      <div style={styles.rightSection}>
                        {!notification.isRead && (
                          <span style={styles.badge}>{t('newBadge')}</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          style={styles.deleteBtn}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
