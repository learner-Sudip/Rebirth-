import React, { useState, useEffect } from 'react';
import { notificationService, InAppNotification } from '../services/notifications';
import { X, CheckCircle2, AlertTriangle, Sparkles, Brain } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const [notification, setNotification] = useState<InAppNotification | null>(null);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(notif => {
      setNotification(notif);
      const timer = setTimeout(() => {
        setNotification(prev => (prev?.id === notif.id ? null : prev));
      }, 7000);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, []);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.channel) {
      case 'session_start':
        return <Brain className="w-5 h-5 text-[#FFA726]" />;
      case 'session_end':
        return <CheckCircle2 className="w-5 h-5 text-[#00E676]" />;
      case 'streak_warning':
        return <AlertTriangle className="w-5 h-5 text-[#FF3366]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#38BDF8]" />;
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-[#12121C] border border-white/[0.14] shadow-2xl rounded-2xl p-4 glow-amber-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#0A0A10] border border-white/[0.1] shrink-0">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#FFA726] font-bold">
                {notification.channel.replace('_', ' ')}
              </span>
              <button
                onClick={() => setNotification(null)}
                className="text-[#B0B0C4] hover:text-[#FFFFFF] p-1 rounded-md transition-colors cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h4 className="text-sm font-semibold text-[#FFFFFF] mt-0.5 truncate">{notification.title}</h4>
            <p className="text-xs text-[#B0B0C4] mt-0.5 leading-relaxed">{notification.body}</p>

            {(notification.actionPrimaryText || notification.actionSecondaryText) && (
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/[0.1]">
                {notification.actionPrimaryText && (
                  <button
                    onClick={() => {
                      notification.onPrimary?.();
                      setNotification(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-sm shadow-[#FFA726]/20"
                  >
                    {notification.actionPrimaryText}
                  </button>
                )}
                {notification.actionSecondaryText && (
                  <button
                    onClick={() => {
                      notification.onSecondary?.();
                      setNotification(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.1] text-[#FFFFFF] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {notification.actionSecondaryText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
