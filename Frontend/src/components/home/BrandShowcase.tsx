import { ShieldCheck } from 'lucide-react';

interface BrandShowcaseProps {
  onSelectBrand?: (brand: string) => void;
  selectedBrand?: string;
}

const BRANDS = [
  { name: 'ASUS', logo: 'ASUS ROG', tag: 'Bo mạch & Laptop gaming' },
  { name: 'MSI', logo: 'MSI Gaming', tag: 'VGA & Màn hình' },
  { name: 'Dell', logo: 'DELL', tag: 'Laptop văn phòng & Màn hình' },
  { name: 'Apple', logo: 'APPLE', tag: 'MacBook & Phụ kiện' },
  { name: 'Gigabyte', logo: 'GIGABYTE', tag: 'Mainboard & GPU AORUS' },
  { name: 'Corsair', logo: 'CORSAIR', tag: 'RAM, Nguồn & Case' },
  { name: 'Kingston', logo: 'KINGSTON', tag: 'SSD NVMe & RAM Fury' },
  { name: 'Logitech', logo: 'LOGITECH G', tag: 'Chuột & Bàn phím cơ' },
  { name: 'Intel', logo: 'INTEL', tag: 'CPU Core i5, i7, i9' },
  { name: 'AMD', logo: 'AMD RYZEN', tag: 'CPU Ryzen & Card Radeon' },
];

export function BrandShowcase({ onSelectBrand, selectedBrand }: BrandShowcaseProps) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#c2410c]" />
          <h2 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight">
            Thương Hiệu Đồng Hành Chính Hãng
          </h2>
        </div>
        <span className="text-xs text-stone-500 hidden sm:inline">Phân phối ủy quyền 100% Full VAT</span>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {BRANDS.map((b) => {
          const isSelected = selectedBrand?.toLowerCase() === b.name.toLowerCase();
          return (
            <button
              key={b.name}
              onClick={() => onSelectBrand && onSelectBrand(isSelected ? '' : b.name)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-center group ${
                isSelected
                  ? 'border-[#c2410c] bg-orange-50 shadow-sm ring-2 ring-[#c2410c]/20'
                  : 'border-stone-200 bg-white hover:border-orange-300 hover:shadow-sm'
              }`}
            >
              <span className="font-black text-xs sm:text-sm tracking-tight text-stone-800 group-hover:text-[#c2410c] transition-colors">
                {b.name}
              </span>
              <span className="text-[9px] text-stone-400 mt-0.5 line-clamp-1 group-hover:text-stone-600">
                {b.tag}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
