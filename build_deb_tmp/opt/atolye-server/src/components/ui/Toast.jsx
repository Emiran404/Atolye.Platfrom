import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { create } from 'zustand';

// Toast store
let toastIdCounter = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const { toasts } = get();
    
    // Aynı tip ve mesajdaki toast zaten varsa tekrar ekleme (spam engelleme)
    const isDuplicate = toasts.some(t => t.message === toast.message && t.type === toast.type);
    if (isDuplicate) return null;

    const id = `${Date.now()}-${toastIdCounter++}`;
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }]
    }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));

// Toast hook
export const useToast = () => {
  const { addToast, removeToast } = useToastStore();

  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options })
  };

  return { toast, removeToast };
};

// Toast component
const Toast = ({ id, type, message, duration = 5000 }) => {
  const { removeToast } = useToastStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Giriş animasyonu
    requestAnimationFrame(() => setIsVisible(true));
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => removeToast(id), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, removeToast]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(id), 300);
  };

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      border: '#10b981',
      iconColor: '#059669',
      title: 'Başarılı'
    },
    error: {
      icon: XCircle,
      bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      border: '#ef4444',
      iconColor: '#dc2626',
      title: 'Hata'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      border: '#f59e0b',
      iconColor: '#d97706',
      title: 'Uyarı'
    },
    info: {
      icon: Info,
      bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      border: '#3b82f6',
      iconColor: '#2563eb',
      title: 'Bilgi'
    }
  };

  const { icon: Icon, bg, border, iconColor, title } = config[type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 18px',
        background: bg,
        borderRadius: '14px',
        border: `2px solid ${border}`,
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.05)',
        minWidth: '320px',
        maxWidth: '420px',
        transform: isVisible && !isLeaving ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible && !isLeaving ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* İkon Container */}
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 2px 8px ${border}40`,
        flexShrink: 0
      }}>
        <Icon style={{ width: '22px', height: '22px', color: iconColor }} />
      </div>
      
      {/* İçerik */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ 
          fontSize: '14px', 
          fontWeight: '700', 
          color: iconColor,
          marginBottom: '4px',
          letterSpacing: '-0.01em'
        }}>
          {title}
        </p>
        <p style={{ 
          fontSize: '14px', 
          color: '#374151',
          lineHeight: '1.5',
          wordBreak: 'break-word'
        }}>
          {message}
        </p>
      </div>
      
      {/* Kapatma Butonu */}
      <button
        onClick={handleClose}
        style={{
          padding: '6px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: 'rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
      >
        <X style={{ width: '16px', height: '16px', color: '#6b7280' }} />
      </button>
    </div>
  );
};

// Toast container
export const ToastContainer = () => {
  const { toasts } = useToastStore();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
};

export { Toast };
