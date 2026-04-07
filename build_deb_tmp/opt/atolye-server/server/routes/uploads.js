import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import fs from 'fs';
import { hashFile } from '../utils/crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Upload klasörü
const uploadsBase = join(__dirname, '../../src/uploads_student');

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Geçici olarak uploads_student klasörüne yükle
    // Dosya yüklendikten sonra doğru klasöre taşınacak
    if (!fs.existsSync(uploadsBase)) {
      fs.mkdirSync(uploadsBase, { recursive: true });
    }
    cb(null, uploadsBase);
  },
  filename: (req, file, cb) => {
    // Benzersiz dosya adı oluştur
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = extname(originalName);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `temp_${timestamp}_${randomStr}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // İzin verilen dosya tipleri
    const allowedTypes = [
      '.pdf', 
      '.doc', '.docx', '.txt',
      '.jpg', '.jpeg', '.png', '.gif',
      '.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm',
      '.zip', '.rar',
      '.pkt', // Cisco Packet Tracer
      '.xls', '.xlsx', // Excel
      '.ppt', '.pptx' // PowerPoint
    ];
    const ext = extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Bu dosya tipi izin verilmiyor: ${ext}`));
    }
  }
});

// Dosya yükle
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Dosya yüklenmedi' });
    }

    const { folderPath, examId, studentId } = req.body;
    
    if (!folderPath) {
      // Geçici dosyayı sil
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'folderPath gerekli' });
    }
    
    // Hedef klasörü oluştur
    const targetFolder = join(uploadsBase, folderPath);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    
    // Orijinal dosya adını kullan, çakışma varsa numara ekle
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const ext = extname(originalName);
    const baseName = originalName.slice(0, -ext.length);
    
    let finalName = originalName;
    let counter = 1;
    while (fs.existsSync(join(targetFolder, finalName))) {
      finalName = `${baseName}_${counter}${ext}`;
      counter++;
    }
    
    // Dosyayı hedef klasöre taşı
    const targetPath = join(targetFolder, finalName);
    fs.renameSync(req.file.path, targetPath);
    
    // Dosya hash hesapla
    const fileBuffer = fs.readFileSync(targetPath);
    const fileHash = hashFile(fileBuffer);

    // Relative path oluştur (frontend için)
    const relativePath = `/uploads/${folderPath}/${finalName}`.replace(/\\/g, '/');

    res.json({
      success: true,
      file: {
        fileName: finalName,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        filePath: relativePath,
        fullPath: targetPath,
        fileHash,
        folderPath
      }
    });
  } catch (error) {
    // Hata durumunda geçici dosyayı temizle
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dosya indir
router.get('/download/*', (req, res) => {
  try {
    const filePath = req.params[0];
    const fullPath = join(uploadsBase, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, error: 'Dosya bulunamadı' });
    }

    res.download(fullPath);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dosya görüntüle
router.get('/view/*', (req, res) => {
  try {
    const filePath = req.params[0];
    const fullPath = join(uploadsBase, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, error: 'Dosya bulunamadı' });
    }

    res.sendFile(fullPath);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Klasör içeriğini listele
router.get('/list/*', (req, res) => {
  try {
    const folderPath = req.params[0] || '';
    const fullPath = join(uploadsBase, folderPath);
    
    if (!fs.existsSync(fullPath)) {
      return res.json({ success: true, files: [] });
    }

    const files = fs.readdirSync(fullPath).map(name => {
      const fileStat = fs.statSync(join(fullPath, name));
      return {
        name,
        isDirectory: fileStat.isDirectory(),
        size: fileStat.size,
        modified: fileStat.mtime
      };
    });

    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dosya sil
router.delete('/*', (req, res) => {
  try {
    const filePath = req.params[0];
    const fullPath = join(uploadsBase, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, error: 'Dosya bulunamadı' });
    }

    fs.unlinkSync(fullPath);
    res.json({ success: true, message: 'Dosya silindi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
