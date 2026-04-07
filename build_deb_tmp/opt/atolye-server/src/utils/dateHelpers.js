import { t } from './i18n';

// Tarih formatla (DD/MM/YYYY)
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Saat formatla (HH:MM)
export const formatTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Tarih ve saat formatla
export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// Göreceli zaman (X dakika önce)
export const getRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return t('justNow');
  if (diffMinutes < 60) return `${diffMinutes} ${t('minutesAgo')}`;
  if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
  if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`;
  return formatDate(date);
};

// Geri sayım hesapla
export const calculateCountdown = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end - now;

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false };
};

// Tarih geçmiş mi kontrol
export const isExpired = (date) => {
  return new Date(date) < new Date();
};

// Dakika/Saat/Gün ekleme
export const addMinutes = (date, minutes) => {
  return new Date(new Date(date).getTime() + minutes * 60 * 1000);
};

export const addHours = (date, hours) => {
  return new Date(new Date(date).getTime() + hours * 60 * 60 * 1000);
};

export const addDays = (date, days) => {
  return new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000);
};

// ISO formatına çevir
export const toISOString = (date) => {
  return new Date(date).toISOString();
};

// Tarih aralığında mı kontrol
export const isDateInRange = (date, startDate, endDate) => {
  const d = new Date(date);
  return d >= new Date(startDate) && d <= new Date(endDate);
};

// Kalan süre hesapla (okunabilir format)
export const calculateTimeLeft = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end - now;

  if (diffMs <= 0) {
    return t('timeUp');
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} ${t('remainingDays')} ${hours} ${t('remainingHours')}`;
  }
  if (hours > 0) {
    return `${hours} ${t('remainingHours')} ${minutes} ${t('remainingMinutes')}`;
  }
  return `${minutes} ${t('remainingMinutes')}`;
};

// Göreceli zaman alias
export const formatRelativeTime = getRelativeTime;
