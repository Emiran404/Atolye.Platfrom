import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');

// Ayarları yükle
const loadSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Settings load error:', error);
  }

  // Default settings
  return {
    registrationEnabled: true,
    teacherRegistrationEnabled: true,
    allowedClasses: [
      "9-A", "9-B", "9-C", "9-D", "9-E", "9-F",
      "10-A", "10-B", "10-C", "10-D", "10-E", "10-F",
      "11-A", "11-B", "11-C", "11-D", "11-E", "11-F",
      "12-A", "12-B", "12-C", "12-D", "12-E", "12-F"
    ]
  };
};

// Ayarları kaydet
const saveSettings = (settings) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Settings save error:', error);
    return false;
  }
};

// GET /api/settings - Ayarları al
router.get('/', (req, res) => {
  try {
    const settings = loadSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ayarlar yüklenemedi' });
  }
});

// POST /api/settings - Ayarları güncelle
router.post('/', (req, res) => {
  try {
    const { registrationEnabled, teacherRegistrationEnabled, allowedClasses, ogsEnabled, ogsClasses, passwordChangeModeExpiresAt } = req.body;

    const currentSettings = loadSettings();
    const settings = {
      ...currentSettings,
      registrationEnabled: registrationEnabled !== undefined ? registrationEnabled : currentSettings.registrationEnabled,
      teacherRegistrationEnabled: teacherRegistrationEnabled !== undefined ? teacherRegistrationEnabled : currentSettings.teacherRegistrationEnabled,
      allowedClasses: Array.isArray(allowedClasses) ? allowedClasses : currentSettings.allowedClasses,
      ogsEnabled: ogsEnabled !== undefined ? ogsEnabled : currentSettings.ogsEnabled,
      ogsClasses: Array.isArray(ogsClasses) ? ogsClasses : currentSettings.ogsClasses,
      passwordChangeModeExpiresAt: passwordChangeModeExpiresAt !== undefined ? passwordChangeModeExpiresAt : currentSettings.passwordChangeModeExpiresAt
    };

    if (saveSettings(settings)) {
      res.json({ success: true, settings });
    } else {
      res.status(500).json({ success: false, error: 'Ayarlar kaydedilemedi' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ayarlar güncellenemedi' });
  }
});

export default router;
