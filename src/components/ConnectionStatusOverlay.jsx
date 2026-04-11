import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const ConnectionStatusOverlay = () => {
  const isServerOnline = useAuthStore((state) => state.isServerOnline);
  const setServerOnline = useAuthStore((state) => state.setServerOnline);

  if (isServerOnline) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:justify-end p-6 pointer-events-none">
      {/* Backdrop Blur effect is handled in App.jsx globally when isServerOnline is false */}
      
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
        {/* Animated Circular Progress Icon */}
        <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="3"
              stroke="currentColor"
              fill="transparent"
              r="18"
              cx="24"
              cy="24"
            />
            <circle
              className="text-indigo-600 dark:text-indigo-400"
              strokeWidth="3"
              strokeDasharray={113}
              strokeDashoffset={30}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="18"
              cx="24"
              cy="24"
              style={{
                animation: 'dash 1.5s ease-in-out infinite'
              }}
            />
          </svg>
          <RefreshCw size={18} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
            Sunucu bağlantısı koptu
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
            Sizi tekrar bağlamaya çalışıyoruz...
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setServerOnline(true)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <style>{`
        @keyframes dash {
          0% { stroke-dashoffset: 113; transform: rotate(0deg); }
          50% { stroke-dashoffset: 40; transform: rotate(180deg); }
          100% { stroke-dashoffset: 113; transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConnectionStatusOverlay;
