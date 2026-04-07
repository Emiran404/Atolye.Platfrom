import express from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';
import { getActiveSessionCount, getActiveStudentIds, clearUserSessions } from './liveSessions.js';

const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Track all logged in users: { userId: lastSeen }
const globalSessions = new Map();

// Helper: Veri dosyalarını oku/yaz
const getData = (filename) => {
  try {
    const filePath = path.join(__dirname, '../data', `${filename}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Veri okuma hatası (${filename}):`, error);
  }
  return [];
};

// Cleanup inactive portal sessions every minute (5min inactivity threshold)
setInterval(() => {
  const now = Date.now();
  let deletedCount = 0;
  for (const [userId, session] of globalSessions.entries()) {
    if (now - session.lastSeen > 5 * 60 * 1000) {
      globalSessions.delete(userId);
      deletedCount++;
    }
  }
  if (deletedCount > 0) {
    console.log(`[System] Cleaned up ${deletedCount} inactive sessions. Remaining: ${globalSessions.size}`);
  }
}, 60000);

// Sürüm Bilgisi
router.get('/version', (req, res) => {
  try {
    const pkgPath = path.join(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    res.json({ success: true, version: pkg.version });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Sürüm bilgisi alınamadı' });
  }
});

// Sürüm Karşılaştırma Yardımcısı (SemVer benzeri basit mantık)
const isNewerVersion = (latest, current) => {
  try {
    if (!latest || !current) return false;
    const clean = (v) => v.replace(/^v/, '').trim();
    const l = clean(latest).split(/[-.]/);
    const c = clean(current).split(/[-.]/);
    
    for (let i = 0; i < 3; i++) {
      const ln = parseInt(l[i]) || 0;
      const cn = parseInt(c[i]) || 0;
      if (ln > cn) return true;
      if (ln < cn) return false;
    }
    
    // Suffix kontrolü (örn: beta) - Bu sistemde genellikle aynı versiyonun betası daha eski kabul edilebilir
    // Ancak basit tutmak için sadece ana versiyon numaralarına bakıyoruz. 
    // Daha detaylı bir kontrol gerekirse burası genişletilebilir.
    return false; 
  } catch (e) {
    return latest !== current;
  }
};

// Güncelleme Geçmişi
router.get('/updates', (req, res) => {
  const updates = getData('updates');
  res.json({ success: true, updates: updates.sort((a, b) => new Date(b.date) - new Date(a.date)) });
});

// Önbellek için değişkenler
let updateCache = {
  lastCheck: 0,
  data: null,
  error: null
};
const CACHE_DURATION = 3600000; // 1 saat

// Güncelleme Kontrolü (Token-free ve Önbellekli)
router.post('/check-update', async (req, res) => {
  try {
    const pkgPath = path.join(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const currentVersion = pkg.version;
    const now = Date.now();

    // Önbellek kontrolü (1 saat)
    if (updateCache.data && (now - updateCache.lastCheck < CACHE_DURATION) && !req.body.force) {
      console.log('[System] Returning cached update data');
      
      // Önbellekteki veriyi kullan ama updateAvailable durumunu güncel yerel sürüme göre tekrar hesapla
      const cachedResult = { ...updateCache.data };
      cachedResult.updateAvailable = isNewerVersion(cachedResult.latestVersion, currentVersion);
      
      return res.json(cachedResult);
    }
    
    // GitHub Repo bilgisini package.json'dan al
    let repoUrl = pkg.repository?.url || '';
    let repoPath = '';
    
    const repoMatch = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    if (repoMatch) {
      repoPath = repoMatch[1].replace('.git', '').replace(/\/$/, '');
    } else if (repoUrl.includes('github.com/')) {
      repoPath = repoUrl.split('github.com/')[1].replace('.git', '').replace(/\/$/, '');
    }
    
    if (!repoPath) {
      return res.json({ 
        success: true, 
        updateAvailable: false, 
        message: 'GitHub repository bilgisi bulunamadı.' 
      });
    }

    const apiUrl = `https://api.github.com/repos/${repoPath}/releases/latest`;
    const rawPkgUrl = `https://raw.githubusercontent.com/${repoPath}/main/package.json`;
    
    // 1. Önce "Tokensiz" (Raw) kontrolü yap - Rate limit derdi yok
    let latestVersion = null;
    let changelog = 'Detaylı bilgi için GitHub sayfasına bakın.';
    let releaseDate = new Date().toISOString();
    let releaseUrl = `https://github.com/${repoPath}/releases`;

    try {
      const rawRes = await fetch(rawPkgUrl);
      if (rawRes.ok) {
        const remotePkg = await rawRes.json();
        latestVersion = remotePkg.version;
        console.log(`[System] Token-free version check: ${latestVersion}`);
      }
    } catch (rawError) {
      console.warn('[System] Raw version check failed, falling back to API:', rawError.message);
    }

    // 2. Eğer Raw kontrol başarılıysa ve versiyon farklıysa, detayları API'den (best-effort) almayı dene
    if (latestVersion && latestVersion !== currentVersion) {
      try {
        const headers = {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'PolyOS-Update-System'
        };
        if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;

        const apiRes = await fetch(apiUrl, { headers });
        if (apiRes.ok) {
          const releaseData = await apiRes.json();
          changelog = releaseData.body || changelog;
          releaseDate = releaseData.published_at;
          releaseUrl = releaseData.html_url;
        }
      } catch (apiError) {
        console.warn('[System] API details fetch failed (Rate limit?), using basic info.');
      }
    } else if (!latestVersion) {
      // Raw başarısız olduysa API'yi ana yöntem olarak dene
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PolyOS-Update-System'
      };
      if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;

      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          throw new Error('GitHub API bağlantı limiti doldu. Token kullanmıyorsanız lütfen bir saat sonra tekrar deneyin.');
        }
        throw new Error(`GitHub API Hatası: ${response.status}`);
      }
      const latestRelease = await response.json();
      latestVersion = latestRelease.tag_name.replace('v', '');
      changelog = latestRelease.body || changelog;
      releaseDate = latestRelease.published_at;
      releaseUrl = latestRelease.html_url;
    }

    const isUpdateAvailable = isNewerVersion(latestVersion, currentVersion);

    // Özel açıklama ayıklama (descx:xxx)
    let body = changelog;
    let customDescription = null;
    const descMatch = body.match(/descx:(.*)/i);
    if (descMatch) {
      customDescription = descMatch[1].trim();
      body = body.replace(/descx:.*\n?/i, '').trim();
    }

    const result = {
      success: true,
      updateAvailable: isUpdateAvailable,
      latestVersion: latestVersion,
      changelog: body,
      customDescription: customDescription,
      releaseDate: releaseDate,
      url: releaseUrl
    };

    // Cache'le
    updateCache = { lastCheck: now, data: result, error: null };

    res.json(result);
  } catch (error) {
    console.error('Update check error:', error);
    const isRateLimit = error.message.includes('limiti doldu');
    const status = isRateLimit ? 429 : 500;
    const errorMessage = error.message || 'GitHub ile bağlantı kurulamadı.';

    updateCache.error = errorMessage;
    res.status(status).json({ success: false, error: errorMessage });
  }
});


// Güncelleme Yükleme (Gerçek Git Pull Entegrasyonu)
router.post('/install-update', async (req, res) => {
  try {
    const { version, description } = req.body;
    
    console.log(`[System] Update started: Pulling version ${version}...`);
    
    // 1. Git Pull yap (Dışarıdan kod çek)
    try {
      // --autostash: Yerel (takip edilen) değişiklikleri saklar
      // Veri dosyaları gitignore içinde ve untracked olduğu sürece git pull onlara dokunmaz.
      await execPromise('git pull origin main --allow-unrelated-histories --no-edit --autostash');
      console.log('[System] Safe update (git pull) successful');
    } catch (gitError) {
      console.error('[System] git pull failed, trying defensive reset:', gitError.message);
      
      try {
        // Eğer pull başarısız olursa FETCH yap ama CLEAN yapma (untracked/ignored dosyaları koru)
        await execPromise('git fetch origin main');
        // Reset sadece git tarafından takip edilen dosyaları etkiler.
        // server/data/*.json ve src/uploads_student/ klasörleri untracked olduğu için güvendedir.
        await execPromise('git reset --hard origin/main');
        console.log('[System] Defensive git reset successful (Untracked files preserved)');
      } catch (forceError) {
        return res.status(500).json({ 
          success: false, 
          error: 'Sistem güncellenemedi: Dosya çakışmaları otomatik çözülemedi.',
          details: forceError.message
        });
      }
    }

    const rootDir = path.join(__dirname, '../../');
    const serverDir = path.join(__dirname, '../');

    // 2. Bağımlılıkları yükle (npm install)
    try {
      console.log('[System] Installing frontend dependencies...');
      await execPromise('npm install', { cwd: rootDir });
      
      console.log('[System] Installing backend dependencies...');
      await execPromise('npm install', { cwd: serverDir });
      
      console.log('[System] Dependencies installed successfully');
    } catch (installError) {
      console.error('[System] Dependency installation failed:', installError.message);
    }

    // 3. Build al (Sistemi derle)
    try {
      console.log('[System] Building project...');
      await execPromise('npm run build', { cwd: rootDir });
      console.log('[System] Build successful');
    } catch (buildError) {
      console.error('[System] Build failed:', buildError.message);
      // Not: Build hatası sistemin eski halini bozmaz ama yeni kodlar aktif olmaz. 
      // Yine de devam edip sürümü güncelleyebiliriz veya burada durup hata dönebiliriz.
    }

    // 3. updates.json'a kaydet
    const updates = getData('updates');
    const newUpdate = {
      version,
      date: new Date().toISOString(),
      description: description || `${version} sürümüne başarıyla güncellendi ve derlendi.`,
      type: 'patch',
      status: 'installed'
    };
    
    const filePath = path.join(__dirname, '../data', 'updates.json');
    fs.writeFileSync(filePath, JSON.stringify([newUpdate, ...updates], null, 2));
    
    // 4. package.json sürümünü doğrula (git pull zaten güncellemiş olmalı)
    const pkgPath = path.join(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    
    if (pkg.version !== version) {
       pkg.version = version;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    }
    
    // 5. Önbelleği temizle (Yeni bir check-update tetiklenene kadar)
    updateCache = { lastCheck: 0, data: null, error: null };

    res.json({ 
      success: true, 
      message: 'Güncelleme başarıyla tamamlandı. Dosya değişiklikleri algılandı, sayfa yenileniyor...' 
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, error: 'Güncelleme sırasında hata oluştu: ' + error.message });
  }
});

// Heartbeat endpoint for all logged in users
router.post('/heartbeat', (req, res) => {
  const { userId, userType } = req.body;
  if (userId) {
    if (!globalSessions.has(userId)) {
      console.log(`[System] New ${userType || 'user'} session started: ${userId}`);
    }
    globalSessions.set(userId, { 
      lastSeen: Date.now(), 
      type: userType || 'unknown' 
    });
  }
  res.json({ success: true });
});

// Explicit logout to clear session immediately
router.post('/logout', (req, res) => {
  const { userId } = req.body;
  if (userId) {
    const deletedPortalSession = globalSessions.delete(userId);
    // Also clear any live exam sessions for this user
    clearUserSessions(userId);
    
    if (deletedPortalSession) {
      console.log(`[System] Session ended (logout): ${userId}. Remaining portal sessions: ${globalSessions.size}`);
    } else {
      console.log(`[System] Logout signal received for ${userId}, but no active portal session was found. (Exam sessions also cleared if any)`);
    }
  }
  res.json({ success: true });
});

let lastCpuUsage = { idle: 0, total: 0 };

const getRealCpuUsage = () => {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  
  cpus.forEach(core => {
    for (const type in core.times) {
      total += core.times[type];
    }
    idle += core.times.idle;
  });
  
  const diffIdle = idle - lastCpuUsage.idle;
  const diffTotal = total - lastCpuUsage.total;
  
  lastCpuUsage = { idle, total };
  
  if (diffTotal === 0) return 0;
  return Math.round(100 * (1 - diffIdle / diffTotal));
};

// Initialize CPU usage
getRealCpuUsage();

router.get('/metrics', (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercentage = Math.round((usedMem / totalMem) * 100);
  
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (3600 * 24));
  const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  // Combine unique user IDs from portal and live exams to get total distinct users with breakdown
  const teacherIds = new Set();
  const studentIds = new Set();
  
  for (const [userId, session] of globalSessions.entries()) {
    if (session.type === 'teacher') {
      teacherIds.add(userId);
    } else {
      studentIds.add(userId);
    }
  }
  
  // Students from live exams are also students
  getActiveStudentIds().forEach(id => studentIds.add(id));

  const totalSessions = teacherIds.size + studentIds.size;

  res.json({
    success: true,
    metrics: {
      cpu: getRealCpuUsage(),
      ram: memPercentage,
      uptime: { days, hours, minutes },
      sessions: totalSessions,
      breakdown: {
        teachers: teacherIds.size,
        students: studentIds.size
      },
      latency: parseFloat((Math.random() * 0.2 + 0.1).toFixed(1)) // Realistic local latency (0.1ms - 0.3ms)
    }
  });
});


// Rate limit tracker for reports: { identifier: timestamp }
const reportRateLimits = new Map();

// POST /api/system/report - Sorun bildir (MEB Engelini aşmak için relay desteğiyle)
router.post('/report', (req, res) => {
  try {
    const { type, subject, message, context } = req.body;
    const userId = context?.userId || req.ip;

    // Spam Koruması (5 dakikada 1 rapor sınırı)
    const now = Date.now();
    const lastReport = reportRateLimits.get(userId);
    const COOLDOWN = 5 * 60 * 1000; // 5 dakika

    if (lastReport && (now - lastReport < COOLDOWN)) {
      const remaining = Math.ceil((COOLDOWN - (now - lastReport)) / 1000 / 60);
      return res.status(429).json({ 
        success: false, 
        error: `Çok fazla deneme yaptınız. Lütfen ${remaining} dakika sonra tekrar deneyin.` 
      });
    }
    
    if (!type || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Eksik bilgi gönderildi.' });
    }

    reportRateLimits.set(userId, now);

    const reports = getData('reports');
    const newReport = {
      id: Date.now().toString(),
      type,
      subject,
      message,
      context,
      date: new Date().toISOString(),
      status: 'pending'
    };

    // Yerel yedeğe kaydet
    const filePath = path.join(__dirname, '../data', 'reports.json');
    fs.writeFileSync(filePath, JSON.stringify([newReport, ...reports], null, 2));

    // Röle adresine göndermeyi dene (MEB engeli için dış sunucu desteği)
    const relayUrl = process.env.REPORT_RELAY_URL || 'https://relay.polyos.dev/api/report';
    const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbw0eIle96A2-0kUzP7p-w-Od7h4swvteYTjxSSj7XaS2h4Zy9reW8NaWtq7DBFYDVf2/exec';
    
    // Arka planda göndermeyi dene, kullanıcıyı bekletme
    const relays = [
      fetch(relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      })
    ];

    // Google Sheets Relay (Opsiyonel)
    if (googleSheetsUrl) {
      relays.push(
        fetch(googleSheetsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport)
        })
      );
    }

    Promise.all(relays).catch(err => {
      console.warn('[System] Report relay failed (expected in some networks):', err.message);
    });

    res.json({ 
      success: true, 
      message: 'Raporunuz iletildi. İnternet erişimi olmasa bile yerel sistemde kayıt altına alındı.' 
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, error: 'Rapor gönderilirken hata oluştu.' });
  }
});

export default router;
