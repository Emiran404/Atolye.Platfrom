/**
 * PolyOS Service
 * Pardus bilgisayarlarla gerçek zamanlı iletişim servisi
 */

import { io } from 'socket.io-client';

class PolyOSService {
  constructor() {
    this.socket = null;
    this.clients = [];
    this.screenshots = new Map(); // clientId -> screenshot data
    this.commandResults = [];
    this.isConnected = false;
    this.latency = 0;
    this.listeners = new Set();
  }

  /**
   * WebSocket'e bağlan
   */
  connect() {
    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    this.socket = io(serverUrl, {
      path: '/polyos-socket',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupListeners();
    console.log('🔌 PolyOS WebSocket bağlantısı başlatılıyor...');
  }

  /**
   * Event listener'ları ayarla
   */
  setupListeners() {
    // Bağlantı başarılı
    this.socket.on('connect', () => {
      console.log('✅ PolyOS WebSocket bağlantısı kuruldu');
      this.isConnected = true;
      this.notifyListeners({ type: 'connected' });
    });

    // Bağlantı koptu
    this.socket.on('disconnect', () => {
      console.log('❌ PolyOS WebSocket bağlantısı koptu');
      this.isConnected = false;
      this.notifyListeners({ type: 'disconnected' });
    });

    // Yeni istemci bağlandı
    this.socket.on('client-connected', (client) => {
      console.log('✅ Yeni istemci:', client.hostname);

      const existingIndex = this.clients.findIndex(c => c.clientId === client.clientId);
      if (existingIndex >= 0) {
        this.clients[existingIndex] = client;
      } else {
        this.clients.push(client);
      }

      this.notifyListeners({
        type: 'client-connected',
        client
      });
    });

    // İstemci bağlantısı koptu
    this.socket.on('client-disconnected', (data) => {
      console.log('❌ İstemci bağlantısı koptu:', data.clientId);

      const client = this.clients.find(c => c.clientId === data.clientId);
      if (client) {
        client.status = 'offline';
      }

      this.notifyListeners({
        type: 'client-disconnected',
        clientId: data.clientId
      });
    });

    // Ekran görüntüsü güncellendi
    this.socket.on('screenshot-update', (data) => {
      console.log('📸 Screenshot güncellendi:', data.clientId);

      this.screenshots.set(data.clientId, {
        image: data.image,
        timestamp: data.timestamp
      });

      this.notifyListeners({
        type: 'screenshot-update',
        clientId: data.clientId,
        data
      });
    });

    // Ekran yayın verisi (canlı izleme)
    this.socket.on('screen-update', (data) => {
      this.notifyListeners({
        type: 'screen-update',
        clientId: data.clientId,
        data
      });
    });

    // İstemci durumu güncellendi
    this.socket.on('client-status-update', (data) => {
      const client = this.clients.find(c => c.clientId === data.clientId);
      if (client) {
        client.systemStatus = data.status;
        client.lastSeen = data.timestamp;
      }

      this.notifyListeners({
        type: 'client-status-update',
        clientId: data.clientId,
        status: data.status
      });
    });

    // Komut sonucu
    this.socket.on('command-result', (data) => {
      console.log(`📥 Komut sonucu: ${data.clientId} - ${data.command} - ${data.success ? '✅' : '❌'}`);

      this.commandResults.unshift({
        ...data,
        receivedAt: new Date()
      });

      // Son 50 sonucu sakla
      if (this.commandResults.length > 50) {
        this.commandResults = this.commandResults.slice(0, 50);
      }

      this.notifyListeners({
        type: 'command-result',
        data
      });
    });

    // Program listesi güncellendi
    this.socket.on('programs-update', (data) => {
      console.log('📋 Program listesi güncellendi:', data.clientId);

      const client = this.clients.find(c => c.clientId === data.clientId);
      if (client) {
        client.programs = data.programs;
      }

      this.notifyListeners({
        type: 'programs-update',
        clientId: data.clientId,
        programs: data.programs
      });
    });

    // Pong (Latency)
    this.socket.on('pong', () => {
      const latency = Date.now() - this.lastPingTime;
      this.latency = latency;
      this.notifyListeners({
        type: 'latency-update',
        latency
      });
    });

    // Periyodik latency ölçümü
    setInterval(() => this.measureLatency(), 2000);
  }

  /**
   * Latency ölç
   */
  measureLatency() {
    if (this.socket && this.isConnected) {
      this.lastPingTime = Date.now();
      this.socket.emit('ping');
    }
  }

  /**
   * Ekran izlemeyi başlat
   */
  startMonitoring() {
    if (this.socket) {
      this.socket.emit('start-monitoring');
    }
  }

  /**
   * Ekran izlemeyi durdur
   */
  stopMonitoring() {
    if (this.socket) {
      this.socket.emit('stop-monitoring');
    }
  }

  /**
   * Yayın ayarlarını değiştir (FPS/Kalite/Genişlik)
   * width: 0 = Orijinal, 480 = Thumbnail
   */
  setStreamSettings(clientId, fps, quality, width = 480) {
    if (this.socket) {
      this.socket.emit('request-stream-settings', { clientId, fps, quality, width });
    }
  }

  /**
   * Fare kontrolü gönder
   * type: 'move' | 'click'
   * data: { x, y, button }
   */
  sendMouseControl(clientId, data) {
    if (this.socket) {
      this.socket.emit('mouse-control', { clientId, ...data });
    }
  }

  /**
   * Klavye kontrolü gönder
   * data: { key }
   */
  sendKeyboardControl(clientId, data) {
    if (this.socket) {
      this.socket.emit('keyboard-control', { clientId, ...data });
    }
  }

  /**
   * Event listener ekle
   */
  addEventListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Tüm listener'ları bilgilendir
   */
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Bağlantıyı kapat
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * İstemci listesini al (API'den)
   */
  async fetchClients() {
    try {
      const response = await fetch('/api/polyos/clients');
      const data = await response.json();

      if (data.success) {
        this.clients = data.clients;
        return data.clients;
      }
      throw new Error(data.error || 'İstemciler alınamadı');
    } catch (error) {
      console.error('Clients fetch error:', error);
      throw error;
    }
  }

  /**
   * İstatistikleri al
   */
  async fetchStats() {
    try {
      const response = await fetch('/api/polyos/stats');
      const data = await response.json();

      if (data.success) {
        return data.stats;
      }
      throw new Error(data.error || 'İstatistikler alınamadı');
    } catch (error) {
      console.error('Stats fetch error:', error);
      throw error;
    }
  }

  /**
   * Komut gönder
   */
  async sendCommand(clientIds, commandType, options = {}) {
    try {
      const command = {
        type: commandType,
        timestamp: new Date().toISOString(),
        ...options
      };

      const response = await fetch('/api/polyos/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientIds, command })
      });

      const data = await response.json();

      if (data.success) {
        return data;
      }
      throw new Error(data.error || 'Komut gönderilemedi');
    } catch (error) {
      console.error('Command send error:', error);
      throw error;
    }
  }

  /**
   * Tüm istemcilere komut gönder
   */
  async broadcastCommand(commandType, options = {}) {
    try {
      const command = {
        type: commandType,
        timestamp: new Date().toISOString(),
        ...options
      };

      const response = await fetch('/api/polyos/broadcast-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });

      const data = await response.json();

      if (data.success) {
        return data;
      }
      throw new Error(data.error || 'Komut gönderilemedi');
    } catch (error) {
      console.error('Broadcast command error:', error);
      throw error;
    }
  }

  /**
   * Ekran görüntüsü iste (Socket.IO üzerinden)
   */
  async requestScreenshot(clientId) {
    try {
      if (!this.socket || !this.isConnected) {
        throw new Error('WebSocket bağlantısı yok');
      }

      // Socket üzerinden screenshot isteği gönder
      this.socket.emit('request-screenshot', { clientId });
      return { success: true };
    } catch (error) {
      console.error('Screenshot request error:', error);
      throw error;
    }
  }

  /**
   * Tüm ekran görüntülerini iste (Socket.IO üzerinden)
   */
  async requestAllScreenshots() {
    try {
      if (!this.socket || !this.isConnected) {
        throw new Error('WebSocket bağlantısı yok');
      }

      // Tüm online clientler için screenshot isteği gönder
      this.socket.emit('request-all-screenshots');
      return { success: true };
    } catch (error) {
      console.error('All screenshots request error:', error);
      throw error;
    }
  }

  /**
   * Program listesi iste
   */
  async requestPrograms(clientId) {
    try {
      const response = await fetch(`/api/polyos/programs/${clientId}`);
      const data = await response.json();

      if (data.success) {
        return data;
      }
      throw new Error(data.error || 'Program listesi istenemedi');
    } catch (error) {
      console.error('Programs request error:', error);
      throw error;
    }
  }

  /**
   * Mevcut istemcileri al
   */
  getClients() {
    return this.clients;
  }

  /**
   * Online istemcileri al
   */
  getOnlineClients() {
    return this.clients.filter(c => c.status === 'online');
  }

  /**
   * Belirli bir istemciyi al
   */
  getClient(clientId) {
    return this.clients.find(c => c.clientId === clientId);
  }

  /**
   * Screenshot'ı al
   */
  getScreenshot(clientId) {
    return this.screenshots.get(clientId);
  }

  /**
   * Komut geçmişini al
   */
  getCommandHistory() {
    return this.commandResults;
  }

  /**
   * Bağlantı durumunu kontrol et
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Mouse event gönder (remote control)
   */
  async sendMouseEvent(clientId, eventData) {
    try {
      const response = await fetch('/api/polyos/mouse-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, event: eventData })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Mouse event gönderilemedi');
      }

      return data;
    } catch (error) {
      console.error('Mouse event send error:', error);
      throw error;
    }
  }

  /**
   * Keyboard event gönder (remote control)
   */
  async sendKeyboardEvent(clientId, eventData) {
    try {
      const response = await fetch('/api/polyos/keyboard-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, event: eventData })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Keyboard event gönderilemedi');
      }

      return data;
    } catch (error) {
      console.error('Keyboard event send error:', error);
      throw error;
    }
  }

  /**
   * Öğretmen ekran yayınını başlat (Server'a bildir)
   */
  startTeacherStream(clientIds = []) {
    if (this.socket) {
      this.socket.emit('teacher-start-stream', { clientIds });
    }
  }

  /**
   * Öğretmen ekran yayınını durdur
   */
  stopTeacherStream() {
    if (this.socket) {
      this.socket.emit('teacher-stop-stream');
    }
  }

  /**
   * Ekran karesi gönder
   */
  sendTeacherScreenFrame(imageData) {
    if (this.socket) {
      this.socket.emit('teacher-screen-data', { image: imageData });
    }
  }

  /**
   * Dosya gönder
   */
  sendFile(clientIds, filename, content) {
    if (this.socket) {
      this.socket.emit('teacher-send-file', {
        clientIds,
        filename,
        content
      });
    }
  }
}

// Singleton instance
export const polyosService = new PolyOSService();

// Auto-connect
if (typeof window !== 'undefined') {
  polyosService.connect();
}

export default polyosService;
