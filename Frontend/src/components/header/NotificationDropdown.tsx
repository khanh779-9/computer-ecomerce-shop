import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../stores/notificationStore';
import { Bell } from 'lucide-react';

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

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 hover:border-[#c2410c] hover:text-[#c2410c] transition"
        aria-label="Thông báo"
        title="Thông báo"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#c2410c] px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel - Clean Typography */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden z-50 animate-in fade-in duration-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">Thông báo</span>
              {unreadCount > 0 && (
                <span className="text-stone-500 font-medium">({unreadCount} chưa đọc)</span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="font-medium text-[#c2410c] hover:underline"
                >
                  Đọc hết
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-stone-400 hover:text-stone-700"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                Không có thông báo mới nào
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3 cursor-pointer transition ${
                    item.read ? 'bg-white hover:bg-stone-50 opacity-70' : 'bg-stone-50/70 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-stone-900 line-clamp-1">
                      {item.title}
                    </p>
                    {!item.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    {item.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
