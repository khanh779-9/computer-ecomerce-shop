import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../../../services/productService';
import type { Product } from '../../../types';
import { useCart } from '../../../stores/cartStore';
import { useToast } from '../../../stores/toastStore';
import { formatVnd } from '../../../lib/cart';
import { Art } from '../../../components/product/Art';
import { Button } from '../../../components/ui/Button';
import { checkPcCompatibility } from '../../../lib/compatibilityEngine';
import {
  Cpu,
  Layers,
  HardDrive,
  Tv,
  Zap,
  Box,
  Fan,
  Plus,
  Trash2,
  ShoppingCart,
  Printer,
  RotateCcw,
  X,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
} from 'lucide-react';

interface ComponentSlot {
  key: string;
  name: string;
  icon: any;
  categoryFilter: string;
  keywords: string[];
}

const PC_PARTS: ComponentSlot[] = [
  { key: 'cpu', name: 'Bộ vi xử lý (CPU)', icon: Cpu, categoryFilter: 'Linh kiện PC', keywords: ['i5', 'i7', 'i9', 'ryzen', 'cpu', 'vi xử lý'] },
  { key: 'mainboard', name: 'Bo mạch chủ (Mainboard)', icon: Layers, categoryFilter: 'Linh kiện PC', keywords: ['b760', 'b650', 'z790', 'mainboard', 'bo mạch'] },
  { key: 'ram', name: 'Bộ nhớ trong (RAM)', icon: Layers, categoryFilter: 'Linh kiện PC', keywords: ['ram', 'vengeance', 'fury', 'ddr4', 'ddr5', 'bộ nhớ'] },
  { key: 'vga', name: 'Card màn hình (VGA / GPU)', icon: Tv, categoryFilter: 'Linh kiện PC', keywords: ['rtx', 'vga', 'geforce', 'card màn hình'] },
  { key: 'ssd', name: 'Ổ cứng SSD / HDD', icon: HardDrive, categoryFilter: 'Linh kiện PC', keywords: ['ssd', 'nv2', '990 pro', 'ổ cứng', 'nvme'] },
  { key: 'psu', name: 'Nguồn máy tính (PSU)', icon: Zap, categoryFilter: 'Linh kiện PC', keywords: ['psu', 'nguồn', '750w', '650w'] },
  { key: 'case', name: 'Vỏ máy tính (Case)', icon: Box, categoryFilter: 'Linh kiện PC', keywords: ['case', 'vỏ', 'nzxt', 'montech'] },
  { key: 'cooler', name: 'Tản nhiệt CPU (Cooler)', icon: Fan, categoryFilter: 'Linh kiện PC', keywords: ['cooler', 'tản nhiệt', 'assassin', 'lt720'] },
];

export function PcBuilderPage() {
  const [params, setParams] = useSearchParams();
  const { add } = useCart();
  const toast = useToast();

  const [selectedParts, setSelectedParts] = useState<Record<string, Product | null>>({});
  const [modalSlot, setModalSlot] = useState<ComponentSlot | null>(null);
  const [productsPool, setProductsPool] = useState<Product[]>([]);
  const [allComponents, setAllComponents] = useState<Product[]>([]);
  const [loadingPool, setLoadingPool] = useState(false);
  const [partSearch, setPartSearch] = useState('');

  // Tải sẵn danh sách linh kiện để phục vụ Preset và chia sẻ cấu hình
  useEffect(() => {
    fetchProducts('', 'Linh kiện PC')
      .then((items) => {
        setAllComponents(items);
      })
      .catch(() => {
        setAllComponents([]);
      });
  }, []);

  // Kiểm tra tính tương thích và công suất nguồn
  const compatibilityReport = useMemo(() => {
    return checkPcCompatibility(selectedParts);
  }, [selectedParts]);

  // Fetch products khi mở hộp thoại chọn linh kiện
  useEffect(() => {
    if (!modalSlot) return;
    setLoadingPool(true);
    fetchProducts('', modalSlot.categoryFilter)
      .then((items) => {
        setProductsPool(items);
      })
      .catch(() => {
        setProductsPool([]);
      })
      .finally(() => {
        setLoadingPool(false);
      });
  }, [modalSlot]);

  const handleSelectProduct = (slotKey: string, product: Product) => {
    setSelectedParts((prev) => ({ ...prev, [slotKey]: product }));
    setModalSlot(null);
    setPartSearch('');
    toast.success(`Đã thêm "${product.name}" vào cấu hình!`);
  };

  const handleRemovePart = (slotKey: string) => {
    setSelectedParts((prev) => {
      const copy = { ...prev };
      delete copy[slotKey];
      return copy;
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả linh kiện đã chọn?')) {
      setSelectedParts({});
      toast.info('Đã làm mới cấu hình máy tính.');
    }
  };

  // Áp dụng Cấu hình dựng sẵn (Presets)
  const applyPreset = (presetType: 'esports' | 'workstation' | 'amd') => {
    if (allComponents.length === 0) {
      toast.info('Đang nạp dữ liệu linh kiện, vui lòng thử lại sau giây lát...');
      return;
    }

    const findMatch = (slotKey: string, matchKeyword: string) => {
      const slot = PC_PARTS.find((s) => s.key === slotKey);
      if (!slot) return null;
      return allComponents.find(
        (p) =>
          p.name.toLowerCase().includes(matchKeyword.toLowerCase()) &&
          slot.keywords.some((kw) => p.name.toLowerCase().includes(kw))
      ) || null;
    };

    const newConfig: Record<string, Product | null> = {};

    if (presetType === 'esports') {
      newConfig.cpu = findMatch('cpu', '13400F') || allComponents[0];
      newConfig.mainboard = findMatch('mainboard', 'B760M') || null;
      newConfig.ram = findMatch('ram', 'Corsair') || null;
      newConfig.vga = findMatch('vga', '4060') || null;
      newConfig.ssd = findMatch('ssd', 'Kingston') || null;
      newConfig.psu = findMatch('psu', '650W') || null;
      newConfig.case = findMatch('case', 'Montech') || null;
      newConfig.cooler = findMatch('cooler', 'Thermalright') || null;
      toast.success('Đã áp dụng cấu hình: PC Gaming eSports Quốc Dân (~18-20tr)!');
    } else if (presetType === 'workstation') {
      newConfig.cpu = findMatch('cpu', '14700K') || null;
      newConfig.mainboard = findMatch('mainboard', 'B760M') || null;
      newConfig.ram = findMatch('ram', 'Corsair') || null;
      newConfig.vga = findMatch('vga', '4070 SUPER') || null;
      newConfig.ssd = findMatch('ssd', '990 Pro') || null;
      newConfig.psu = findMatch('psu', '750W') || null;
      newConfig.case = findMatch('case', 'NZXT') || null;
      newConfig.cooler = findMatch('cooler', 'LT720') || null;
      toast.success('Đã áp dụng cấu hình: PC Đồ Họa & Gaming 2K Đỉnh Cao!');
    } else if (presetType === 'amd') {
      newConfig.cpu = findMatch('cpu', '7800X3D') || null;
      newConfig.mainboard = findMatch('mainboard', 'B650') || null;
      newConfig.ram = findMatch('ram', 'Corsair') || null;
      newConfig.vga = findMatch('vga', '4070 SUPER') || null;
      newConfig.ssd = findMatch('ssd', '990 Pro') || null;
      newConfig.psu = findMatch('psu', '750W') || null;
      newConfig.case = findMatch('case', 'NZXT') || null;
      newConfig.cooler = findMatch('cooler', 'Thermalright') || null;
      toast.success('Đã áp dụng cấu hình: PC Gaming AMD Ryzen 7 7800X3D!');
    }

    setSelectedParts(newConfig);
  };

  // Chia sẻ hoặc sao chép văn bản cấu hình
  const handleCopySummary = () => {
    const chosenList = Object.entries(selectedParts).filter(([_, item]) => Boolean(item));
    if (chosenList.length === 0) {
      toast.error('Chưa có linh kiện nào trong cấu hình.');
      return;
    }

    let text = `=== BÁO GIÁ CẤU HÌNH PC - TECHZONE COMPUTER ===\n`;
    chosenList.forEach(([key, item]) => {
      const slot = PC_PARTS.find((s) => s.key === key);
      text += `• ${slot?.name || key}: ${item!.name} — ${formatVnd(item!.price)}\n`;
    });
    text += `----------------------------------------\n`;
    text += `Ước tính công suất: ${compatibilityReport.estimatedTdp}W (Khuyến nghị nguồn >= ${compatibilityReport.recommendedPsuWatt}W)\n`;
    text += `TỔNG CỘNG: ${formatVnd(totalPrice)}\n`;
    text += `Liên hệ đặt hàng: 1900.8888 | TechZone Computer\n`;

    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép bảng báo giá cấu hình vào bộ nhớ tạm!');
  };

  // Thêm toàn bộ linh kiện cấu hình vào giỏ hàng
  const handleAddAllToCart = () => {
    const chosenList = Object.values(selectedParts).filter(Boolean) as Product[];
    if (chosenList.length === 0) {
      toast.error('Vui lòng chọn ít nhất một linh kiện trước khi thêm vào giỏ.');
      return;
    }

    chosenList.forEach((item) => add(item));
    toast.success(`Đã thêm trọn bộ ${chosenList.length} linh kiện cấu hình vào giỏ hàng!`);
  };

  const chosenCount = Object.values(selectedParts).filter(Boolean).length;
  const totalPrice = Object.values(selectedParts).reduce((sum, item) => sum + (item ? item.price : 0), 0);

  // Bộ lọc linh kiện thông minh trong Modal theo đúng loại slot
  const filteredPool = useMemo(() => {
    let pool = productsPool;

    // Ưu tiên các linh kiện phù hợp với slot đang chọn
    if (modalSlot && modalSlot.keywords.length > 0) {
      const matched = pool.filter((p) =>
        modalSlot.keywords.some((kw) => p.name.toLowerCase().includes(kw))
      );
      if (matched.length > 0) {
        pool = matched;
      }
    }

    if (!partSearch.trim()) return pool;
    return pool.filter(
      (p) =>
        p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(partSearch.toLowerCase())
    );
  }, [productsPool, modalSlot, partSearch]);

  return (
    <div className="w-full pb-16">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 text-[#c2410c]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                Xây Dựng Cấu Hình PC (Smart PC Builder)
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Tự động kiểm tra xung đột socket, chuẩn RAM & tính công suất nguồn nguồn điện thông minh
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {chosenCount > 0 && (
            <>
              <button
                onClick={handleCopySummary}
                className="px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 transition flex items-center gap-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"
                title="Sao chép báo giá dạng text"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép cấu hình</span>
              </button>

              <button
                onClick={handleClearAll}
                className="px-3 py-2 text-xs font-semibold text-stone-500 hover:text-rose-600 transition flex items-center gap-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </button>
            </>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 transition flex items-center gap-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In báo giá</span>
          </button>
        </div>
      </div>

      {/* Preset Recommendations Strip */}
      <div className="mt-4 p-3.5 rounded-2xl border border-stone-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#c2410c]" />
          <span className="text-xs font-bold text-stone-900">Gợi ý cấu hình dựng sẵn:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('esports')}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-orange-50 hover:border-orange-300 text-xs font-semibold text-stone-700 hover:text-[#c2410c] transition"
          >
            🎮 eSports Phổ Thông (~18tr)
          </button>
          <button
            onClick={() => applyPreset('workstation')}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-orange-50 hover:border-orange-300 text-xs font-semibold text-stone-700 hover:text-[#c2410c] transition"
          >
            🎨 Đồ Họa & Gaming 2K (i7 + 4070)
          </button>
          <button
            onClick={() => applyPreset('amd')}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-orange-50 hover:border-orange-300 text-xs font-semibold text-stone-700 hover:text-[#c2410c] transition"
          >
            ⚡ Siêu Tốc AMD (Ryzen 7 7800X3D)
          </button>
        </div>
      </div>

      {/* Real-time Hardware Compatibility Banner */}
      {chosenCount > 0 && (
        <div className="mt-4 space-y-2">
          <div
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              !compatibilityReport.isCompatible
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : compatibilityReport.issues.some((i) => i.type === 'warning')
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  !compatibilityReport.isCompatible
                    ? 'bg-rose-100 text-rose-600'
                    : compatibilityReport.issues.some((i) => i.type === 'warning')
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {!compatibilityReport.isCompatible ? (
                  <XCircle className="w-5 h-5" />
                ) : compatibilityReport.issues.some((i) => i.type === 'warning') ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold">
                  {!compatibilityReport.isCompatible
                    ? 'Phát hiện xung đột linh kiện phần cứng!'
                    : compatibilityReport.issues.some((i) => i.type === 'warning')
                    ? 'Cấu hình tương thích — Lưu ý công suất nguồn!'
                    : 'Cấu hình hoàn toàn tương thích và đồng bộ!'}
                </h3>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {!compatibilityReport.isCompatible
                    ? 'Vui lòng kiểm tra lại thông số Socket hoặc Chuẩn RAM để đảm bảo khả năng lắp ghép.'
                    : 'Toàn bộ linh kiện đã chọn tương thích vật lý và điện năng an toàn.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-stone-200/60 shadow-xs text-xs">
                <span className="text-stone-500">TDP dự tính: </span>
                <strong className="font-bold text-stone-900">{compatibilityReport.estimatedTdp}W</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-stone-200/60 shadow-xs text-xs">
                <span className="text-stone-500">Nguồn khuyến nghị: </span>
                <strong className="font-bold text-[#c2410c]">&ge; {compatibilityReport.recommendedPsuWatt}W</strong>
              </div>
            </div>
          </div>

          {compatibilityReport.issues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                issue.type === 'error'
                  ? 'bg-rose-50/60 border-rose-200 text-rose-800'
                  : issue.type === 'warning'
                  ? 'bg-amber-50/60 border-amber-200 text-amber-800'
                  : 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
              }`}
            >
              {issue.type === 'error' ? (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : issue.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="font-bold">{issue.title}: </strong>
                <span>{issue.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Layout: Parts List (8 cols) + Summary Card (4 cols) */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8 space-y-3">
          {PC_PARTS.map((slot, index) => {
            const Icon = slot.icon;
            const currentItem = selectedParts[slot.key];

            return (
              <div
                key={slot.key}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-orange-200"
              >
                <div className="flex items-center gap-3.5 min-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#c2410c]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Linh kiện 0{index + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
                      {slot.name}
                    </h3>
                  </div>
                </div>

                <div className="flex-1">
                  {currentItem ? (
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <div className="w-10 h-10 rounded bg-white p-1 shrink-0 flex items-center justify-center border">
                        <Art type={currentItem.art} tint={currentItem.tint} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-800 truncate">{currentItem.name}</p>
                        <p className="text-[11px] font-black text-[#c2410c]">{formatVnd(currentItem.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModalSlot(slot)}
                          className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 border rounded bg-white hover:bg-stone-100 font-medium"
                        >
                          Đổi
                        </button>
                        <button
                          onClick={() => handleRemovePart(slot.key)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition"
                          title="Xóa linh kiện này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setModalSlot(slot)}
                      className="w-full py-2.5 px-3 rounded-lg border-2 border-dashed border-stone-300 hover:border-[#c2410c] bg-stone-50/50 hover:bg-orange-50/30 text-xs font-bold text-stone-600 hover:text-[#c2410c] transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Chọn {slot.name}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-black text-stone-900">Cấu hình dự tính</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#c2410c]">
                {chosenCount} / {PC_PARTS.length} món
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs divide-y divide-stone-100">
              {PC_PARTS.map((s) => {
                const item = selectedParts[s.key];
                if (!item) return null;
                return (
                  <div key={s.key} className="pt-1.5 flex justify-between items-center text-stone-600">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className="font-bold text-stone-900 shrink-0">{formatVnd(item.price)}</span>
                  </div>
                );
              })}
              {chosenCount === 0 && (
                <p className="text-center py-6 text-stone-400 text-xs">
                  Chưa có linh kiện nào được chọn. Hãy bấm chọn linh kiện bên cạnh hoặc chọn Cấu hình dựng sẵn!
                </p>
              )}
            </div>

            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Điện năng tiêu thụ:</span>
                <span className="font-bold text-stone-800">~{compatibilityReport.estimatedTdp}W</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Nguồn khuyến nghị:</span>
                <span className="font-bold text-[#c2410c]">&ge; {compatibilityReport.recommendedPsuWatt}W</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Công lắp ráp & cài đặt:</span>
                <span className="text-emerald-600 font-bold">Miễn phí (Trị giá 350K)</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Bảo hành phần cứng:</span>
                <span className="font-semibold text-stone-800">36 tháng chính hãng</span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 border-t border-stone-200 pt-3">
                <span>Tổng chi phí:</span>
                <span className="text-xl font-black text-[#c2410c]">{formatVnd(totalPrice)}</span>
              </div>
            </div>

            <Button
              onClick={handleAddAllToCart}
              disabled={chosenCount === 0}
              className="w-full py-3.5 bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Thêm tất cả vào giỏ hàng</span>
            </Button>
          </div>
        </aside>
      </div>

      {modalSlot && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setModalSlot(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b px-5 py-4 bg-stone-50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-100 text-[#c2410c]">
                    <modalSlot.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-stone-900">Chọn {modalSlot.name}</h2>
                    <p className="text-[11px] text-stone-400">Danh sách linh kiện tương thích sẵn hàng tại TechZone</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalSlot(null)}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b bg-stone-50/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder={`Tìm kiếm tên linh kiện ${modalSlot.name}...`}
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c2410c] border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto divide-y divide-stone-100">
                {loadingPool ? (
                  <div className="py-12 text-center text-xs text-stone-400">Đang tải danh sách linh kiện...</div>
                ) : filteredPool.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-400">
                    Không tìm thấy linh kiện nào phù hợp với từ khóa.
                  </div>
                ) : (
                  filteredPool.map((prod) => (
                    <div
                      key={prod.id}
                      className="py-3 flex items-center justify-between gap-4 hover:bg-stone-50 px-2 rounded-lg transition"
                    >
                      <div className="w-14 h-14 rounded-lg border bg-stone-50 p-1 shrink-0 flex items-center justify-center">
                        <Art type={prod.art} tint={prod.tint} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase text-[#c2410c] bg-orange-50 px-1.5 py-0.5 rounded">
                          {prod.brand}
                        </span>
                        <h4 className="text-xs font-bold text-stone-800 truncate mt-1">{prod.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-[#c2410c]">{formatVnd(prod.price)}</span>
                          {prod.old > prod.price && (
                            <span className="text-[10px] text-stone-400 line-through">{formatVnd(prod.old)}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSelectProduct(modalSlot.key, prod)}
                        className="bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs px-3 py-1.5 font-bold shrink-0"
                      >
                        Chọn
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default PcBuilderPage;
