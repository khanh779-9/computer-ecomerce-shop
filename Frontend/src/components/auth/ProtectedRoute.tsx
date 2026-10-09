import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  requiredRole?: 'ADMIN' | 'USER';
}

export function ProtectedRoute({ requiredRole = 'ADMIN' }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/internal/login" replace />;
  }

  if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-red-200 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-sm text-stone-600 mb-6">
            Tài khoản hiện tại ({user.email}) chỉ có quyền <b>{user.role}</b>. Bạn cần quyền Quản trị viên (<b>ADMIN</b>) để xem khu vực này.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Về trang chủ
            </Button>
            <Link
              to="/internal/login"
              className="inline-flex items-center justify-center rounded-lg bg-[#c2410c] px-4 py-2 text-xs font-bold text-white hover:bg-[#9a3412]"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              Đăng nhập tài khoản nội bộ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
