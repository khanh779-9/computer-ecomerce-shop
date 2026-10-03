import { describe, it, expect } from 'vitest';
import { checkPcCompatibility } from '../lib/compatibilityEngine';
import type { Product } from '../types';

const mockProduct = (id: number, name: string, brand: string, price = 1000000): Product => ({
  id,
  sku: `SKU-${id}`,
  name,
  brand,
  cat: 'Linh kiện PC',
  price,
  old: price,
  rate: 5,
  reviews: 10,
  sold: 50,
  stock: 10,
  art: 'component',
  tint: '#0284c7',
  tags: [],
});

describe('compatibilityEngine', () => {
  it('detects LGA1700 CPU and AM5 Motherboard conflict', () => {
    const cpu = mockProduct(1, 'Bộ vi xử lý Intel Core i5-13400F (LGA1700, 10 nhân)', 'Intel');
    const mainboard = mockProduct(2, 'Bo mạch chủ MSI MAG B650 TOMAHAWK WIFI (Socket AM5, DDR5)', 'MSI');

    const report = checkPcCompatibility({ cpu, mainboard });

    expect(report.isCompatible).toBe(false);
    expect(report.issues.some((i) => i.title.includes('Xung đột Socket'))).toBe(true);
  });

  it('detects matching LGA1700 CPU and LGA1700 Motherboard', () => {
    const cpu = mockProduct(1, 'Bộ vi xử lý Intel Core i5-13400F (LGA1700, 10 nhân)', 'Intel');
    const mainboard = mockProduct(2, 'Bo mạch chủ ASUS TUF Gaming B760M-PLUS WIFI DDR5 (Socket LGA1700)', 'Asus');
    const ram = mockProduct(3, 'Bộ nhớ RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz', 'Corsair');

    const report = checkPcCompatibility({ cpu, mainboard, ram });

    expect(report.isCompatible).toBe(true);
    expect(report.issues.some((i) => i.type === 'error')).toBe(false);
  });

  it('detects DDR5 Motherboard vs DDR4 RAM conflict', () => {
    const mainboard = mockProduct(1, 'Bo mạch chủ ASUS TUF Gaming B760M-PLUS WIFI DDR5 (Socket LGA1700)', 'Asus');
    const ram = mockProduct(2, 'Bộ nhớ RAM Kingston Fury Beast 16GB DDR4 3200MHz', 'Kingston');

    const report = checkPcCompatibility({ mainboard, ram });

    expect(report.isCompatible).toBe(false);
    expect(report.issues.some((i) => i.title.includes('Chuẩn RAM không tương thích'))).toBe(true);
  });

  it('calculates TDP and warns when PSU is underpowered', () => {
    const cpu = mockProduct(1, 'Bộ vi xử lý Intel Core i7-14700K (LGA1700)', 'Intel'); // ~190W
    const vga = mockProduct(2, 'Card màn hình MSI RTX 4070 SUPER 12G', 'MSI'); // ~220W
    const psu = mockProduct(3, 'Nguồn máy tính 450W Phổ Thông', 'TechZone'); // 450W, trong khi khuyến nghị >= 600W

    const report = checkPcCompatibility({ cpu, vga, psu });

    expect(report.estimatedTdp).toBeGreaterThan(400);
    expect(report.recommendedPsuWatt).toBeGreaterThanOrEqual(550);
    expect(report.issues.some((i) => i.type === 'warning' && i.title.toLowerCase().includes('công suất nguồn'))).toBe(true);
  });
});
