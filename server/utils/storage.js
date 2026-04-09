import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '../data');

// JSON dosyasından veri oku
export const getData = (key) => {
  const filePath = join(dataPath, `${key}.json`);
  try {
    if (fs.existsSync(filePath)) {
      let data = fs.readFileSync(filePath, 'utf8');
      // Remove Byte Order Mark (BOM) if it exists
      if (data.charCodeAt(0) === 0xFEFF) {
        data = data.slice(1);
      }
      return JSON.parse(data.trim());
    }
    return null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
};

// JSON dosyasına veri yaz
export const setData = (key, data) => {
  const filePath = join(dataPath, `${key}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
};

// Benzersiz ID oluştur
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
