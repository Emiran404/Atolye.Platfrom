import crypto from 'crypto';

// Şifre hashleme
export const hashPassword = (password, salt) => {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
};

// Şifre doğrulama
export const verifyPassword = (password, hashedPassword, salt) => {
  const hash = hashPassword(password, salt);
  return hash === hashedPassword;
};

// Dosya hash hesaplama
export const hashFile = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
