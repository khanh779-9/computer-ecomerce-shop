import { useState, useRef, useEffect } from 'react';
import { useNotifications, type NotificationItem } from '../../stores/notificationStore';
import { Bell, Tag, Package, Sparkles, CheckCheck, Trash2, X } from 'lucide-react';

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'promo':
        return <Tag className="w-4 h-4 text-[#c2410c]" />;
      case 'order':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'system':
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-stone-50/80 text-stone-700 hover:border-[#c2410c] hover:bg-white hover:text-[#c2410c] transition shadow-sm"
        aria-label="Thông báo"
        title="Thông báo"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-stone-900">Thông báo</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  {unreadCount} mới
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#c2410c] hover:underline"
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đã đọc hết</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1 text-stone-400 hover:text-stone-700 transition rounded"
                  title="Xóa tất cả"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                <Bell className="mx-auto w-8 h-8 stroke-1 text-stone-300 mb-2" />
                <span>Không có thông báo mới nào</span>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3.5 flex gap-3 items-start cursor-pointer transition ${
                    item.read ? 'bg-white hover:bg-stone-50/80 opacity-75' : 'bg-orange-50/30 hover:bg-orange-50/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold leading-snug line-clamp-1 ${item.read ? 'text-stone-700' : 'text-stone-900'}`}>
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#c2410c] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                    <span className="text-[10px] text-stone-400 font-mono mt-1 block">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
