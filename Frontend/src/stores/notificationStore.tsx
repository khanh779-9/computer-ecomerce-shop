import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'promo' | 'order' | 'system';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Mã giảm giá 100.000đ đã sẵn sàng!',
    desc: 'Ưu đãi mã "SINHVIEN" cho dòng laptop gaming & văn phòng. Hết hạn sau 3 ngày.',
    time: '15 phút trước',
    read: false,
    type: 'promo',
  },
  {
    id: 'n2',
    title: 'Đơn hàng #ORD-1 đã xuất kho',
    desc: 'Kiện hàng linh kiện máy tính đang được vận chuyển hỏa tốc tới bạn.',
    time: '2 giờ trước',
    read: false,
    type: 'order',
  },
  {
    id: 'n3',
    title: 'Chúc mừng thăng hạng Thành Viên Vàng!',
    desc: 'Bạn nhận được quyền lợi miễn phí vệ sinh laptop trọn đời tại tất cả showroom.',
    time: '1 ngày trước',
    read: false,
    type: 'system',
  },
  {
    id: 'n4',
    title: 'Flash Sale Giờ Vàng giảm đến 40%',
    desc: 'Chuột không dây Logitech G304 và bàn phím cơ DareU số lượng có hạn.',
    time: '2 ngày trước',
    read: true,
    type: 'promo',
  },
];

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
