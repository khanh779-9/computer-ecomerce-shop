export interface WarrantyRecord {
  serialNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  productBrand: string;
  productCategory: string;
  purchaseDate: string;
  warrantyPeriodMonths: number;
  warrantyExpiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'IN_REPAIR' | 'READY_FOR_PICKUP';
  rmaCode?: string;
  repairIssue?: string;
  repairTimeline?: {
    step: string;
    title: string;
    date: string;
    description: string;
    completed: boolean;
  }[];
}

const SAMPLE_WARRANTY_DB: WarrantyRecord[] = [
  {
    serialNumber: 'SN-ASUS-98741',
    customerName: 'Nguyễn Văn Hùng',
    customerPhone: '0901234567',
    productName: 'Laptop Gaming ASUS ROG Strix G16 (i9-13980HX / RTX 4070)',
    productBrand: 'ASUS',
    productCategory: 'Laptop',
    purchaseDate: '2025-11-15',
    warrantyPeriodMonths: 24,
    warrantyExpiryDate: '2027-11-15',
    status: 'IN_REPAIR',
    rmaCode: 'RMA-2026-8899',
    repairIssue: 'Màn hình chớp nháy khi chơi game nặng, quạt tản nhiệt phát ra tiếng rít nhẹ',
    repairTimeline: [
      {
        step: '1',
        title: 'Tiếp nhận thiết bị',
        date: '28/09/2026 09:30',
        description: 'Đã nhận máy tại Showroom TechZone 123 Đường 3/2, Q.10, TP.HCM kèm củ sạc zin.',
        completed: true,
      },
      {
        step: '2',
        title: 'Kỹ thuật viên kiểm tra phần cứng',
        date: '29/09/2026 14:15',
        description: 'Xác định lỗi lỏng cáp EDP hiển thị màn hình 240Hz, quạt GPU bám bụi nặng cần tra dầu trục.',
        completed: true,
      },
      {
        step: '3',
        title: 'Thay thế linh kiện & Vệ sinh tra keo tản nhiệt',
        date: '01/10/2026 10:45',
        description: 'Đã thay mới cụm cáp màn hình chính hãng Asus và thay cụm quạt tản nhiệt buồng hơi.',
        completed: true,
      },
      {
        step: '4',
        title: 'Chạy stress test kiểm chuẩn 24H',
        date: '02/10/2026 16:00',
        description: 'Đang chạy phần mềm FurMark và 3DMark TimeSpy liên tục để đảm bảo nhiệt độ ổn định dưới 75°C.',
        completed: false,
      },
      {
        step: '5',
        title: 'Hoàn tất - Sẵn sàng trả máy',
        date: 'Dự kiến 04/10/2026',
        description: 'Nhân viên chăm sóc khách hàng sẽ gọi điện hoặc gửi SMS khi máy đã sẵn sàng nhận tại Showroom.',
        completed: false,
      },
    ],
  },
  {
    serialNumber: 'SN-DELL-55219',
    customerName: 'Trần Thị Mai',
    customerPhone: '0988776655',
    productName: 'Màn hình đồ họa Dell UltraSharp U2724D 2K 120Hz IPS Black',
    productBrand: 'Dell',
    productCategory: 'Màn hình',
    purchaseDate: '2026-02-10',
    warrantyPeriodMonths: 36,
    warrantyExpiryDate: '2029-02-10',
    status: 'ACTIVE',
  },
  {
    serialNumber: 'SN-VGA-4070S',
    customerName: 'Lê Minh Tuấn',
    customerPhone: '0912345678',
    productName: 'Card Màn Hình MSI GeForce RTX 4070 SUPER 12G Gaming X Slim',
    productBrand: 'MSI',
    productCategory: 'Linh kiện PC',
    purchaseDate: '2025-06-20',
    warrantyPeriodMonths: 36,
    warrantyExpiryDate: '2028-06-20',
    status: 'READY_FOR_PICKUP',
    rmaCode: 'RMA-2026-7712',
    repairIssue: 'Nhiệt độ nóng bất thường khi render Premiere Pro',
    repairTimeline: [
      {
        step: '1',
        title: 'Tiếp nhận thiết bị',
        date: '20/09/2026 10:00',
        description: 'Tiếp nhận linh kiện tại trung tâm bảo hành Hà Nội.',
        completed: true,
      },
      {
        step: '2',
        title: 'Kiểm định nhiệt độ',
        date: '21/09/2026 11:30',
        description: 'Thermal pad bị khô cứng sau thời gian dài sử dụng liên tục.',
        completed: true,
      },
      {
        step: '3',
        title: 'Đổi mới tản nhiệt Thermal Grizzly',
        date: '22/09/2026 15:00',
        description: 'Đã thay mới toàn bộ thermal pad và keo tản nhiệt gốm cao cấp.',
        completed: true,
      },
      {
        step: '4',
        title: 'Chạy stress test kiểm chuẩn',
        date: '23/09/2026 18:00',
        description: 'Stress test Furmark 4K nhiệt độ duy trì mát mẻ 64°C.',
        completed: true,
      },
      {
        step: '5',
        title: 'Hoàn tất - Sẵn sàng trả máy',
        date: '24/09/2026 09:00',
        description: 'Linh kiện đã kiểm tra hoàn hảo, quý khách có thể đến Showroom nhận máy bất cứ lúc nào.',
        completed: true,
      },
    ],
  },
];

export async function lookupWarranty(query: string): Promise<WarrantyRecord[]> {
  await new Promise((r) => setTimeout(r, 400));
  const q = query.trim().toUpperCase();
  if (!q) return [];

  return SAMPLE_WARRANTY_DB.filter(
    (item) =>
      item.serialNumber.toUpperCase().includes(q) ||
      item.customerPhone.includes(q) ||
      (item.rmaCode && item.rmaCode.toUpperCase().includes(q))
  );
}
