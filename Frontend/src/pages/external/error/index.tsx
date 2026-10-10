import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, RefreshCw, AlertTriangle, ShieldAlert, FileQuestion } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export interface ErrorPageProps {
  code?: '404' | '403' | '500' | string;
  title?: string;
  message?: string;
}

const ERROR_CONFIG: Record<string, { badge: string; title: string; desc: string; icon: typeof AlertTriangle }> = {
  '404': {
    badge: '404 Not Found',
    title: 'Không tìm thấy trang yêu cầu',
    desc: 'Đường dẫn bạn đang tìm kiếm có thể đã bị di dời, đổi tên hoặc tạm thời không khả dụng trên hệ thống.',
    icon: FileQuestion,
  },
  '403': {
    badge: '403 Forbidden',
    title: 'Không có quyền truy cập',
    desc: 'Tài khoản của bạn không có thẩm quyền truy cập vào tài nguyên hoặc trang quản trị này.',
    icon: ShieldAlert,
  },
  '500': {
    badge: '500 Internal Error',
    title: 'Hệ thống gặp sự cố',
    desc: 'Đã có lỗi bất ngờ xảy ra phía máy chủ hoặc trình duyệt. Vui lòng thử tải lại trang sau giây lát.',
    icon: AlertTriangle,
  },
};

export function ErrorPage({ code = '404', title, message }: ErrorPageProps) {
  const navigate = useNavigate();
  const config = ERROR_CONFIG[code] || ERROR_CONFIG['404'];
  const IconComponent = config.icon;

  const displayTitle = title || config.title;
  const displayDesc = message || config.desc;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-stone-50/50 to-stone-100/40">
      <div className="max-w-md w-full text-center">
        {/* Visual Badge / Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-2xl bg-orange-50 border border-orange-200/70 flex items-center justify-center text-[#c2410c] shadow-sm">
            <IconComponent className="w-12 h-12 stroke-[1.6]" />
          </div>
          <span className="absolute -bottom-2.5 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[#c2410c] text-white shadow-sm">
            {code}
          </span>
        </div>

        {/* Text Details */}
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-3">
          {displayTitle}
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed mb-8 max-w-sm mx-auto">
          {displayDesc}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại
          </Button>

          <Button
            variant="light"
            className="w-full sm:w-auto"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Tải lại trang
          </Button>

          <Link to="/" className="w-full sm:w-auto">
            <Button variant="solid" className="w-full">
              <Home className="w-4 h-4 mr-1.5" />
              Về trang chủ
            </Button>
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-10 pt-6 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-center gap-4">
          <Link to="/products" className="hover:text-[#c2410c] transition-colors underline-offset-4 hover:underline">
            Sản phẩm
          </Link>
          <span>•</span>
          <Link to="/build-pc" className="hover:text-[#c2410c] transition-colors underline-offset-4 hover:underline">
            Xây dựng PC
          </Link>
          <span>•</span>
          <Link to="/support" className="hover:text-[#c2410c] transition-colors underline-offset-4 hover:underline">
            Trung tâm hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
