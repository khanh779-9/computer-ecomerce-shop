-- ==============================================================================
-- V7: Internal admin modules — brands lifecycle columns, manufacturers seed,
--     default system settings. Idempotent (safe on every startup).
-- ==============================================================================

-- 1. BRANDS lifecycle columns (bảng brands gốc chưa có các cột này)
ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE brands ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. MANUFACTURERS seed (đồng bộ với các hãng chính trong catalog)
INSERT INTO manufacturers (name, slug, website, contact_email, phone, is_active) VALUES
('ASUSTeK Computer', 'asustek', 'https://www.asus.com/vn/', 'vn-support@asus.com', '19001231', true),
('Dell Technologies', 'dell', 'https://www.dell.com/vn-vi', 'vn_care@dell.com', '18001521', true),
('Micro-Star International (MSI)', 'msi', 'https://www.msi.com/', 'service@msi.com', '19001235', true),
('Apple Inc.', 'apple', 'https://www.apple.com/vn/', 'vn_care@apple.com', '18001281', true),
('Logitech International', 'logitech', 'https://www.logitech.com/vn-vi', 'support@logitech.com', '19001509', true),
('Akko (YUNZIKEY)', 'akko', 'https://www.akkogear.com/', 'support@akkogear.com', NULL, true),
('Sony Corporation', 'sony', 'https://www.sony.com.vn/', 'vn-support@sony.com', '18001523', true),
('Anker Innovations', 'anker', 'https://www.anker.com/', 'support@anker.com', NULL, true),
('Harman International (JBL)', 'jbl', 'https://www.jbl.com.vn/', 'vn-support@jbl.com', '19001521', true),
('Intel Corporation', 'intel', 'https://www.intel.com/vn', 'vn-support@intel.com', NULL, true),
('Advanced Micro Devices (AMD)', 'amd', 'https://www.amd.com/vn', 'vn-support@amd.com', NULL, true),
('Corsair Memory', 'corsair', 'https://www.corsair.com/vi', 'support@corsair.com', NULL, true)
ON CONFLICT (name) DO NOTHING;

-- 3. SYSTEM SETTINGS defaults (chính sách vận hành của TechZone)
INSERT INTO system_settings (setting_key, setting_value, value_type, description, is_public) VALUES
('warranty_return_days', '30', 'NUMBER', 'Chính sách 1 đổi 1 trong 30 ngày đầu cho lỗi nhà sản xuất', true),
('warranty_standard_processing_days', '7', 'NUMBER', 'Thời gian xử lý bảo hành thông thường (ngày làm việc)', true),
('low_stock_threshold', '5', 'NUMBER', 'Ngưỡng cảnh báo tồn kho thấp trên dashboard nội bộ', false),
('payment_methods_enabled', 'COD,VNPAY', 'STRING', 'Các phương thức thanh toán đang được bật', true),
('internal_session_minutes', '120', 'NUMBER', 'Thời gian phiên đăng nhập trang nội bộ (phút)', false),
('product_review_points_bonus', '50', 'NUMBER', 'Điểm TechPoints thưởng cho mỗi lượt đánh giá sản phẩm', true),
('customer_hotline', '1900.8888', 'STRING', 'Hotline hỗ trợ kỹ thuật hiển thị trên storefront', true)
ON CONFLICT (setting_key) DO NOTHING;
