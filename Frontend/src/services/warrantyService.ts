import { apiClient } from './apiClient';

export interface WarrantyRepairStep {
  step: string;
  title: string;
  date: string;
  description: string;
  completed: boolean;
}

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
  claimStatus?: string;
  repairTimeline?: WarrantyRepairStep[];
}

// Backend DTO: WarrantyLookupItem
interface WarrantyLookupItemDto {
  serialNumber: string;
  customerName?: string | null;
  customerPhone?: string | null;
  productName?: string | null;
  productBrand?: string | null;
  productCategory?: string | null;
  purchaseDate?: string | null;
  warrantyPeriodMonths?: number | null;
  warrantyExpiryDate?: string | null;
  status?: string | null;
  rmaCode?: string | null;
  repairIssue?: string | null;
  claimStatus?: string | null;
  repairTimeline?: {
    step: string;
    title: string;
    description?: string | null;
    completed?: boolean | null;
    eventAt?: string | null;
  }[] | null;
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function mapWarrantyDto(dto: WarrantyLookupItemDto): WarrantyRecord {
  return {
    serialNumber: dto.serialNumber,
    customerName: dto.customerName || 'Khách vãng lai',
    customerPhone: dto.customerPhone || '',
    productName: dto.productName || '',
    productBrand: dto.productBrand || '',
    productCategory: dto.productCategory || '',
    purchaseDate: dto.purchaseDate || '',
    warrantyPeriodMonths: dto.warrantyPeriodMonths ?? 12,
    warrantyExpiryDate: dto.warrantyExpiryDate || '',
    status: (dto.status as WarrantyRecord['status']) || 'ACTIVE',
    rmaCode: dto.rmaCode || undefined,
    repairIssue: dto.repairIssue || undefined,
    claimStatus: dto.claimStatus || undefined,
    repairTimeline: dto.repairTimeline
      ? dto.repairTimeline.map((s) => ({
          step: s.step,
          title: s.title,
          date: formatDateTime(s.eventAt),
          description: s.description || '',
          completed: !!s.completed,
        }))
      : undefined,
  };
}

/** GET /api/warranty/lookup?q= — tra cứu công khai theo Serial / SĐT / Mã RMA */
export async function lookupWarranty(query: string): Promise<WarrantyRecord[]> {
  const q = query.trim();
  if (!q) return [];
  const data = await apiClient.get<WarrantyLookupItemDto[]>('/api/warranty/lookup', { q });
  return (data || []).map(mapWarrantyDto);
}

/** GET /api/warranty/my-warranties — bảo hành của khách hàng đang đăng nhập */
export async function fetchMyWarranties(): Promise<WarrantyRecord[]> {
  const data = await apiClient.get<WarrantyLookupItemDto[]>('/api/warranty/my-warranties');
  return (data || []).map(mapWarrantyDto);
}

/** POST /api/warranty/claims — khách hàng tạo yêu cầu bảo hành theo serial của mình */
export async function createWarrantyClaim(payload: {
  serialNumber: string;
  issue: string;
}): Promise<WarrantyRecord> {
  const data = await apiClient.post<WarrantyLookupItemDto>('/api/warranty/claims', payload);
  return mapWarrantyDto(data);
}

// =============== ADMIN (quản lý bảo hành nội bộ) ===============

export interface AdminWarrantyRow {
  warrantyId?: number | null;
  serialId: number;
  serialNumber: string;
  productId: number;
  productName: string;
  productBrand?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  warrantyMonths?: number | null;
  status?: string | null;
  claimId?: number | null;
  rmaCode?: string | null;
  claimIssue?: string | null;
  claimStatus?: string | null;
  receivedAt?: string | null;
  resolvedAt?: string | null;
  repairTimeline?: {
    step: string;
    title: string;
    description?: string | null;
    completed?: boolean | null;
    eventAt?: string | null;
  }[] | null;
}

/** GET /api/warranty/admin/warranties */
export async function fetchAdminWarranties(): Promise<AdminWarrantyRow[]> {
  return apiClient.get<AdminWarrantyRow[]>('/api/warranty/admin/warranties');
}

/** POST /api/warranty/admin/serials — đăng ký serial & kích hoạt bảo hành */
export async function registerSerial(payload: {
  productId: number;
  serialNumber: string;
  warrantyMonths?: number;
  customerEmail?: string;
  orderId?: number;
}): Promise<AdminWarrantyRow> {
  return apiClient.post<AdminWarrantyRow>('/api/warranty/admin/serials', payload);
}

/** PATCH /api/warranty/admin/claims/{id}/status */
export async function updateClaimStatus(claimId: number, status: string): Promise<AdminWarrantyRow> {
  return apiClient.patch<AdminWarrantyRow>(`/api/warranty/admin/claims/${claimId}/status`, { status });
}

/** POST /api/warranty/admin/claims/{id}/events — thêm bước xử lý vào timeline */
export async function addRepairEvent(
  claimId: number,
  payload: { title: string; description?: string; completed?: boolean }
): Promise<AdminWarrantyRow> {
  return apiClient.post<AdminWarrantyRow>(`/api/warranty/admin/claims/${claimId}/events`, payload);
}
