import express from 'express';
import { getData, setData, generateId } from '../utils/storage.js';

const router = express.Router();

// Tüm ders programlarını getir
router.get('/', (req, res) => {
  try {
    const schedules = getData('schedules') || [];
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Belirli bir sınıfın ders programını getir
router.get('/class/:className', (req, res) => {
  try {
    const { className } = req.params;
    const schedules = getData('schedules') || [];
    const classSchedules = schedules.filter(s => s.className === className);
    res.json({ success: true, schedules: classSchedules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Yeni ders ekle
router.post('/', (req, res) => {
  try {
    const schedules = getData('schedules') || [];
    const newSchedule = {
      id: generateId(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    schedules.push(newSchedule);
    setData('schedules', schedules);
    
    res.json({ success: true, schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toplu ders ekle
router.post('/bulk', (req, res) => {
  try {
    const schedules = getData('schedules') || [];
    const { newSchedules } = req.body;
    
    const addedSchedules = newSchedules.map(schedule => ({
      id: generateId(),
      ...schedule,
      createdAt: new Date().toISOString()
    }));
    
    schedules.push(...addedSchedules);
    setData('schedules', schedules);
    
    res.json({ success: true, schedules: addedSchedules, count: addedSchedules.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ders güncelle
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const schedules = getData('schedules') || [];
    const index = schedules.findIndex(s => s.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Ders bulunamadı' });
    }
    
    schedules[index] = {
      ...schedules[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    setData('schedules', schedules);
    res.json({ success: true, schedule: schedules[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ders sil
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const schedules = getData('schedules') || [];
    const filtered = schedules.filter(s => s.id !== id);
    
    if (schedules.length === filtered.length) {
      return res.status(404).json({ success: false, error: 'Ders bulunamadı' });
    }
    
    setData('schedules', filtered);
    res.json({ success: true, message: 'Ders silindi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
