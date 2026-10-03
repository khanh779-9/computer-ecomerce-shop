import type { Product } from '../types';

export interface CompatibilityIssue {
  type: 'error' | 'warning' | 'success';
  title: string;
  message: string;
}

export interface CompatibilityReport {
  isCompatible: boolean;
  estimatedTdp: number;
  recommendedPsuWatt: number;
  selectedPsuWatt?: number;
  issues: CompatibilityIssue[];
}

/**
 * Trích xuất socket CPU
 */
function extractCpuSocket(name: string, desc = ''): string | null {
  const text = `${name} ${desc}`.toUpperCase();
  if (text.includes('LGA1700') || text.includes('LGA 1700') || text.includes('13TH') || text.includes('14TH') || text.includes('12TH') || text.includes('I5-13') || text.includes('I7-14')) {
    return 'LGA1700';
  }
  if (text.includes('AM5') || text.includes('7800X3D') || text.includes('RYZEN 7000') || text.includes('RYZEN 8000')) {
    return 'AM5';
  }
  if (text.includes('AM4') || text.includes('RYZEN 5 5600') || text.includes('5600G') || text.includes('5700X')) {
    return 'AM4';
  }
  return null;
}

/**
 * Trích xuất socket Mainboard
 */
function extractMotherboardSocket(name: string, desc = ''): string | null {
  const text = `${name} ${desc}`.toUpperCase();
  if (text.includes('LGA1700') || text.includes('LGA 1700') || text.includes('B760') || text.includes('Z790') || text.includes('H610') || text.includes('B660') || text.includes('Z690')) {
    return 'LGA1700';
  }
  if (text.includes('AM5') || text.includes('B650') || text.includes('X670') || text.includes('A620')) {
    return 'AM5';
  }
  if (text.includes('AM4') || text.includes('B450') || text.includes('B550') || text.includes('A520')) {
    return 'AM4';
  }
  return null;
}

/**
 * Trích xuất chuẩn RAM (DDR4 / DDR5)
 */
function extractRamGeneration(name: string, desc = ''): 'DDR4' | 'DDR5' | null {
  const text = `${name} ${desc}`.toUpperCase();
  if (text.includes('DDR5')) return 'DDR5';
  if (text.includes('DDR4')) return 'DDR4';
  return null;
}

/**
 * Trích xuất công suất nguồn (W)
 */
function extractPsuWatt(name: string, desc = ''): number | null {
  const text = `${name} ${desc}`.toUpperCase();
  const match = text.match(/(\d{3,4})\s*W/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Ước tính công suất TDP cho từng linh kiện
 */
function estimateItemTdp(key: string, product: Product): number {
  const text = `${product.name} ${product.description || ''}`.toUpperCase();

  if (key === 'cpu') {
    if (text.includes('I9') || text.includes('14900') || text.includes('13900')) return 250;
    if (text.includes('I7') || text.includes('14700') || text.includes('13700')) return 190;
    if (text.includes('7800X3D') || text.includes('RYZEN 7')) return 120;
    if (text.includes('I5') || text.includes('RYZEN 5')) return 95;
    return 65;
  }

  if (key === 'vga') {
    if (text.includes('4090')) return 450;
    if (text.includes('4080')) return 320;
    if (text.includes('4070 SUPER') || text.includes('4070 TI')) return 220;
    if (text.includes('4070')) return 200;
    if (text.includes('4060')) return 125;
    if (text.includes('1650')) return 75;
    return 150;
  }

  if (key === 'mainboard') return 50;
  if (key === 'ram') return 15;
  if (key === 'ssd') return 10;
  if (key === 'cooler') return 25;
  if (key === 'case') return 15; // Quạt case & led
  return 0;
}

/**
 * Kiểm tra tính tương thích và công suất giữa các linh kiện đã chọn
 */
export function checkPcCompatibility(selectedParts: Record<string, Product | null>): CompatibilityReport {
  const issues: CompatibilityIssue[] = [];
  let isCompatible = true;
  let estimatedTdp = 0;

  // 1. Tính tổng TDP tiêu thụ
  for (const [key, part] of Object.entries(selectedParts)) {
    if (part) {
      estimatedTdp += estimateItemTdp(key, part);
    }
  }

  // Khuyến nghị nguồn = TDP + 30% headroom để hoạt động bền bỉ, làm tròn lên mốc 50W
  const recommendedPsuWatt = estimatedTdp > 0 ? Math.max(500, Math.ceil((estimatedTdp * 1.35) / 50) * 50) : 500;

  const cpu = selectedParts.cpu;
  const mainboard = selectedParts.mainboard;
  const ram = selectedParts.ram;
  const psu = selectedParts.psu;

  // 2. Kiểm tra Socket CPU vs Mainboard
  if (cpu && mainboard) {
    const cpuSocket = extractCpuSocket(cpu.name, cpu.description);
    const mbSocket = extractMotherboardSocket(mainboard.name, mainboard.description);

    if (cpuSocket && mbSocket) {
      if (cpuSocket !== mbSocket) {
        isCompatible = false;
        issues.push({
          type: 'error',
          title: 'Xung đột Socket CPU và Mainboard',
          message: `CPU yêu cầu Socket ${cpuSocket} nhưng Bo mạch chủ lại là Socket ${mbSocket}. Không thể lắp đặt vật lý!`,
        });
      } else {
        issues.push({
          type: 'success',
          title: `Tương thích Socket (${cpuSocket})`,
          message: `Vi xử lý ${cpu.brand} và bo mạch chủ khớp socket ${cpuSocket} hoàn hảo.`,
        });
      }
    }
  }

  // 3. Kiểm tra Chuẩn RAM Mainboard vs RAM đã chọn
  if (mainboard && ram) {
    const mbRamGen = extractRamGeneration(mainboard.name, mainboard.description);
    const ramGen = extractRamGeneration(ram.name, ram.description);

    if (mbRamGen && ramGen) {
      if (mbRamGen !== ramGen) {
        isCompatible = false;
        issues.push({
          type: 'error',
          title: 'Chuẩn RAM không tương thích',
          message: `Bo mạch chủ chỉ hỗ trợ chuẩn khe cắm ${mbRamGen}, nhưng thanh RAM bạn chọn lại là ${ramGen}.`,
        });
      } else {
        issues.push({
          type: 'success',
          title: `Tương thích chuẩn RAM (${ramGen})`,
          message: `Bo mạch chủ và thanh nhớ đều hỗ trợ chuẩn ${ramGen} tốc độ cao.`,
        });
      }
    }
  }

  // 4. Kiểm tra công suất Nguồn (PSU)
  let selectedPsuWatt: number | undefined;
  if (psu) {
    const psuWatt = extractPsuWatt(psu.name, psu.description);
    if (psuWatt) {
      selectedPsuWatt = psuWatt;
      if (psuWatt < recommendedPsuWatt - 50) {
        issues.push({
          type: 'warning',
          title: 'Công suất nguồn có thể bị thiếu',
          message: `Nguồn bạn chọn là ${psuWatt}W. Với cấu hình này, TechZone khuyến nghị nguồn tối thiểu ${recommendedPsuWatt}W để tránh sập nguồn khi chơi game tải nặng.`,
        });
      } else {
        issues.push({
          type: 'success',
          title: `Công suất nguồn đáp ứng tốt (${psuWatt}W)`,
          message: `Nguồn ${psuWatt}W dư sức gánh tải toàn bộ linh kiện và có đủ khoảng đệm an toàn.`,
        });
      }
    }
  }

  // Nếu đã chọn ít nhất 2 linh kiện và không có lỗi nào
  if (isCompatible && issues.filter((i) => i.type === 'error').length === 0) {
    const chosenCount = Object.values(selectedParts).filter(Boolean).length;
    if (chosenCount >= 2 && issues.length === 0) {
      issues.push({
        type: 'success',
        title: 'Linh kiện hoạt động ổn định',
        message: 'Các linh kiện bạn đã chọn hiện không phát hiện bất kỳ xung đột phần cứng nào.',
      });
    }
  }

  return {
    isCompatible,
    estimatedTdp,
    recommendedPsuWatt,
    selectedPsuWatt,
    issues,
  };
}
