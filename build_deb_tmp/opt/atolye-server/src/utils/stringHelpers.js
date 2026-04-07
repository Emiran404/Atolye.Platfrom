// Metni kısalt
export const truncate = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Türkçe karakter düzelt (URL-safe)
export const slugify = (text) => {
  const turkishMap = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I',
    'İ': 'I', 'i': 'i',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  
  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// İlk harfleri büyük yap
export const capitalize = (text) => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Okul numarası formatla
export const formatStudentNumber = (number) => {
  return number.toString().padStart(4, '0');
};

// Klasör yolu oluştur (Öğrenci için)
export const generateStudentFolderPath = (className, fullName, studentNumber) => {
  const safeName = slugify(fullName);
  const formattedNumber = formatStudentNumber(studentNumber);
  return `${className} ogrenciler/${capitalize(fullName)}-${formattedNumber}`;
};

// Ad Soyad'dan baş harfleri al
export const getInitials = (fullName) => {
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Email formatı kontrol
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Okul numarası formatı kontrol
export const isValidStudentNumber = (number) => {
  return /^\d{4,}$/.test(number.toString());
};

// Unique ID oluştur
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
