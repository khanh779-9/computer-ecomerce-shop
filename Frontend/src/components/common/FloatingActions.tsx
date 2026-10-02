import { useEffect, useState } from 'react';
import { ArrowUp, PhoneCall, MessageCircle } from 'lucide-react';

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {/* Hotline / Chat bubble */}
      <a
        href="tel:19008888"
        className="pointer-events-auto flex items-center gap-2 bg-[#c2410c] text-white px-3.5 py-2.5 rounded-full shadow-lg hover:bg-[#9a3412] hover:shadow-xl transition-all duration-200 group animate-bounce-subtle"
        title="Hotline tư vấn kỹ thuật"
      >
        <PhoneCall className="w-4 h-4 animate-pulse" />
        <span className="text-xs font-semibold hidden sm:inline">1900.8888</span>
      </a>

      {/* Back to top button */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-md border border-stone-200 hover:bg-stone-50 hover:text-[#c2410c] hover:border-[#c2410c] transition-all duration-200 animate-in fade-in zoom-in-75"
          aria-label="Cuộn lên đầu trang"
          title="Lên đầu trang"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
