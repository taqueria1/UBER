import React, { useEffect } from 'react';
import { Bell, X, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationToastProps {
  notification: PushNotification | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-300 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
        <Bell className="w-5 h-5 animate-bounce" />
      </div>

      <div className="flex-1 pr-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {notification.title}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Ahora</span>
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-snug">
          {notification.message}
        </p>
      </div>

      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-white transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
