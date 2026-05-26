import React, { useEffect } from 'react';

export const Toast = ({ message, type = 'success', duration = 3000, onClose, action = null }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] ${bgColor} text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      <div className="flex items-center space-x-3">
        <span className="text-xl font-bold">{icon}</span>
        <span className="font-medium">{message}</span>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = React.useState(null);

  const show = (message, type = 'success', duration = 3000, action = null) => {
    setToast({ message, type, duration, action });
  };

  const close = () => {
    setToast(null);
  };

  return {
    toast,
    show,
    close,
    success: (msg, duration, action) => show(msg, 'success', duration, action),
    error: (msg, duration, action) => show(msg, 'error', duration, action),
    info: (msg, duration, action) => show(msg, 'info', duration, action),
    warning: (msg, duration, action) => show(msg, 'warning', duration, action),
  };
};
