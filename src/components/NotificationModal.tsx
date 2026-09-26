import React from 'react';
import { X, Bell, Package, Tag, Radio, Sparkles, CheckCheck } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onOpenLive: () => void;
  onOpenTryOn: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onOpenLive,
  onOpenTryOn
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0e1114] border border-[#2b333a] rounded-3xl p-5 shadow-2xl flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#22282e]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#cbb592]" />
            <h3 className="font-serif-luxury text-sm font-bold text-white tracking-wide">
              ศูนย์การแจ้งเตือน
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-[#cbb592] hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>อ่านทั้งหมด</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.type === 'live') {
                  onClose();
                  onOpenLive();
                } else if (n.type === 'tryon') {
                  onClose();
                  onOpenTryOn();
                }
              }}
              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                n.isRead ? 'bg-[#13171a] border-[#22292f] opacity-80' : 'bg-[#182025] border-[#34414c] hover:border-[#cbb592]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-white block">{n.title}</span>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-snug">{n.message}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
