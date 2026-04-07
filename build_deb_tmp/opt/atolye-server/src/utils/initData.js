import { setData, getData } from './storage';

// Verileri temizle - tüm localStorage'ı sıfırla
export const clearAllData = () => {
  // atolye_ prefix'li tüm verileri temizle
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('atolye_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // auth-storage'ı da temizle (Zustand persist)
  localStorage.removeItem('auth-storage');
  
  console.log('Tüm veriler temizlendi!');
};

// Başlangıç verileri - boş yapı oluştur (demo veri YOK)
export const initializeEmptyData = () => {
  // Sadece gerekli boş dizileri oluştur, eğer yoksa
  if (!getData('students')) setData('students', []);
  if (!getData('teachers')) setData('teachers', []);
  if (!getData('exams')) setData('exams', []);
  if (!getData('submissions')) setData('submissions', []);
  if (!getData('notifications')) setData('notifications', []);
  
  console.log('Sistem hazır - Kayıt olarak başlayın!');
};

// Eski fonksiyon adı uyumluluk için
export const initializeDemoData = initializeEmptyData;

export const resetAllData = async () => {
  try {
    // Sunucudaki verileri sıfırla
    const response = await fetch('/api/reset-all-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Sunucu verileri sıfırlanamadı');
    }
    
    // LocalStorage'ı temizle
    clearAllData();
    
    // Boş yapıyı oluştur
    initializeEmptyData();
    
    console.log('✅ Tüm veriler başarıyla sıfırlandı (sunucu + localStorage)');
    return { success: true };
  } catch (error) {
    console.error('Veri sıfırlama hatası:', error);
    // Hata olsa bile localStorage'ı temizle
    clearAllData();
    initializeEmptyData();
    return { success: false, error: error.message };
  }
};
