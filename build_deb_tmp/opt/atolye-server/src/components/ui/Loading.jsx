import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <Loader2 className={`${sizes[size]} animate-spin text-blue-600 ${className}`} />
  );
};

const LoadingScreen = ({ message = 'Yükleniyor...' }) => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-50">
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
};

const LoadingOverlay = ({ message = 'Yükleniyor...' }) => {
  return (
    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-4 z-40 rounded-lg">
      <Spinner size="md" />
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
};

const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-32 w-full',
    button: 'h-10 w-24'
  };

  return (
    <div
      className={`
        ${variants[variant]}
        bg-slate-200 rounded animate-pulse
        ${className}
      `}
    />
  );
};

export { Spinner, LoadingScreen, LoadingOverlay, Skeleton };
const Loading = LoadingScreen;
export { Loading };
