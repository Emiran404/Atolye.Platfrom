import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Emin misiniz?',
  message,
  confirmText = 'Tamam',
  cancelText = 'İptal',
  type = 'warning' // warning, danger, info
}) => {
  const colors = {
    warning: {
      icon: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      button: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
    },
    danger: {
      icon: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      button: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/20'
    },
    info: {
      icon: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      button: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
    }
  };

  const color = colors[type] || colors.warning;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="sm">
      <div className="text-center p-6">
        <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-3xl ${color.bg} ${color.border} border border-dashed mb-6 animate-pulse`}>
          <AlertTriangle className={`h-10 w-10 ${color.icon}`} aria-hidden="true" />
        </div>
        
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">
          {title}
        </h3>
        
        <div className="mt-2 px-1">
          <p className="text-[15px] font-medium text-slate-600 whitespace-pre-line leading-relaxed text-left bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
            {message}
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1 order-2 sm:order-1 py-4 font-bold rounded-2xl hover:bg-slate-100"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 order-1 sm:order-2 py-4 font-black rounded-2xl text-white border-none shadow-xl transition-all active:scale-95 ${color.button}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export { ConfirmModal };
