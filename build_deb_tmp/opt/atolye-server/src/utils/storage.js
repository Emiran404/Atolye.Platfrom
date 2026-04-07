// Storage Helper Functions
// Window Storage API kullanarak veri saklama

const STORAGE_PREFIX = 'atolye_';

// Veri alma
export const getData = (key) => {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Storage read error:', error);
    return null;
  }
};

// Veri kaydetme
export const setData = (key, value) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Storage write error:', error);
    return false;
  }
};

// Veri silme
export const deleteData = (key) => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (error) {
    console.error('Storage delete error:', error);
    return false;
  }
};

// Prefix ile başlayan tüm verileri listele
export const listData = (prefix = '') => {
  try {
    const results = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_PREFIX + prefix)) {
        results.push({
          key: key.replace(STORAGE_PREFIX, ''),
          value: JSON.parse(localStorage.getItem(key))
        });
      }
    }
    return results;
  } catch (error) {
    console.error('Storage list error:', error);
    return [];
  }
};

// Tüm verileri temizle
export const clearAllData = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
};
