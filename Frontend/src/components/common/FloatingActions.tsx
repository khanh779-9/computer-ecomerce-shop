import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

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

  if (!showTop) return null;

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <button
        onClick={scrollToTop}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-stone-700 shadow-md border border-stone-200 hover:bg-stone-50 hover:text-[#c2410c] hover:border-[#c2410c] transition-all duration-200 animate-in fade-in zoom-in-75"
        aria-label="Cuộn lên đầu trang"
        title="Lên đầu trang"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  );
}
