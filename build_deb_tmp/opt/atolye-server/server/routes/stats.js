import express from 'express';
import { getData } from '../utils/storage.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import checkDiskSpace from 'check-disk-space';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

// Klasör boyutunu hesapla
const getFolderSize = (folderPath) => {
  let totalSize = 0;
  
  try {
    if (!fs.existsSync(folderPath)) return 0;
    
    const files = fs.readdirSync(folderPath);
    
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getFolderSize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    console.error('Folder size error:', error);
  }
  
  return totalSize;
};

// Bytes'ı okunabilir formata çevir
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Disk boş alanını kontrol et
const getDiskSpace = async (drivePath) => {
  try {
    const diskSpace = await checkDiskSpace(drivePath);
    console.log('✅ Disk bilgisi:', diskSpace);
    return {
      free: diskSpace.free,
      total: diskSpace.size
    };
  } catch (error) {
    console.error('❌ Disk bilgisi alınamadı:', error);
    // Varsayılan değerler
    return {
      free: 50 * 1024 * 1024 * 1024,
      total: 100 * 1024 * 1024 * 1024
    };
  }
};

// GET /api/stats - Sistem istatistikleri
router.get('/', async (req, res) => {
  try {
    const students = getData('students') || [];
    const teachers = getData('teachers') || [];
    const exams = getData('exams') || [];
    const submissions = getData('submissions') || [];
    
    // Aktif sınavlar
    const now = new Date();
    const activeExams = exams.filter(e => {
      const endDate = new Date(e.endDate);
      return endDate > now && !e.archived;
    });
    
    // Depolama hesapla (sadece uploads_student klasörü)
    const uploadsStudentPath = path.join(__dirname, '..', '..', 'src', 'uploads_student');
    const uploadsStudentSize = getFolderSize(uploadsStudentPath);
    
    // Gerçek disk alanını al
    const diskSpace = await getDiskSpace(uploadsStudentPath);
    
    const stats = {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      activeExams: activeExams.length,
      totalSubmissions: submissions.length,
      storageUsed: formatBytes(uploadsStudentSize),
      storageBytes: uploadsStudentSize,
      remainingSpace: formatBytes(diskSpace.free),
      remainingSpaceBytes: diskSpace.free,
      totalSpace: formatBytes(diskSpace.total),
      totalSpaceBytes: diskSpace.total,
      storagePercentage: ((uploadsStudentSize / diskSpace.total) * 100).toFixed(2)
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'İstatistikler yüklenemedi' });
  }
});

export default router;
