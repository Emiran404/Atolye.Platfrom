import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

const UPLOADS_BASE = path.join(__dirname, '..', 'uploads_student');

// uploads_student klasörünün içeriğini listele
router.get('/browse', (req, res) => {
  try {
    // Query'den path parametresini al (örn: /10-A%20ogrenciler)
    const requestedPath = req.query.path || '';
    
    // Path traversal güvenlik kontrolü
    const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(UPLOADS_BASE, normalizedPath);

    // Güvenlik: UPLOADS_BASE dışına çıkmasın
    if (!fullPath.startsWith(UPLOADS_BASE)) {
      return res.status(403).json({ error: 'Geçersiz yol' });
    }

    // Klasör yoksa oluştur
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    // Klasör içeriğini oku
    const items = fs.readdirSync(fullPath, { withFileTypes: true });

    const result = items.map(item => {
      const itemPath = path.join(fullPath, item.name);
      const stats = fs.statSync(itemPath);
      const relativePath = path.relative(UPLOADS_BASE, itemPath).replace(/\\/g, '/');

      return {
        name: item.name,
        path: relativePath,
        type: item.isDirectory() ? 'folder' : 'file',
        size: item.isFile() ? stats.size : null,
        modified: stats.mtime,
        url: item.isFile() ? `/uploads_student/${relativePath}` : null
      };
    });

    // Klasörleri önce, sonra dosyaları sırala
    result.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name, 'tr');
      }
      return a.type === 'folder' ? -1 : 1;
    });

    res.json({
      currentPath: normalizedPath,
      items: result
    });

  } catch (error) {
    console.error('Dosya listeleme hatası:', error);
    res.status(500).json({ error: 'Dosyalar listelenemedi' });
  }
});

// Dosya silme endpoint'i
router.delete('/delete', (req, res) => {
  try {
    const { path: itemPath } = req.body;
    if (!itemPath) {
      return res.status(400).json({ error: 'Dosya yolu gerekli' });
    }

    const normalizedPath = path.normalize(itemPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(UPLOADS_BASE, normalizedPath);

    if (!fullPath.startsWith(UPLOADS_BASE)) {
      return res.status(403).json({ error: 'Geçersiz yol' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }

    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }

    res.json({ message: 'Başarıyla silindi' });

  } catch (error) {
    console.error('Dosya silme hatası:', error);
    res.status(500).json({ error: 'Dosya silinemedi' });
  }
});

// Klasör oluşturma endpoint'i
router.post('/create-folder', (req, res) => {
  try {
    const { path: parentPath, folderName } = req.body;
    if (!folderName) {
      return res.status(400).json({ error: 'Klasör adı gerekli' });
    }

    const normalizedParent = path.normalize(parentPath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const fullParentPath = path.join(UPLOADS_BASE, normalizedParent);
    const fullFolderPath = path.join(fullParentPath, folderName);

    if (!fullFolderPath.startsWith(UPLOADS_BASE)) {
      return res.status(403).json({ error: 'Geçersiz yol' });
    }

    if (fs.existsSync(fullFolderPath)) {
      return res.status(400).json({ error: 'Klasör zaten mevcut' });
    }

    fs.mkdirSync(fullFolderPath, { recursive: true });

    res.json({ message: 'Klasör oluşturuldu' });

  } catch (error) {
    console.error('Klasör oluşturma hatası:', error);
    res.status(500).json({ error: 'Klasör oluşturulamadı' });
  }
});

export default router;
