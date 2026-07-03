-- ==============================================================================
-- Discount Vouchers Seed Data
-- ==============================================================================
INSERT INTO vouchers (code, description, discount_amount, discount_percent, min_order_amount, is_free_ship, is_active) VALUES
('TECHZONE50', 'Giảm 50.000đ cho đơn hàng linh kiện và phụ kiện từ 1.000.000đ', 50000, 0, 1000000, false, true),
('FREESHIP', 'Miễn phí vận chuyển toàn quốc cho mọi đơn hàng', 0, 0, 0, true, true),
('SINHVIEN', 'Giảm 100.000đ đặc quyền dành cho học sinh - sinh viên (đơn từ 5.000.000đ)', 100000, 0, 5000000, false, true),
('TECHZONE100', 'Mã giảm giá 100.000đ cho đơn hàng xây cấu hình PC hoặc Laptop từ 10.000.000đ', 100000, 0, 10000000, false, true)
ON CONFLICT (code) DO UPDATE SET
    description = EXCLUDED.description,
    discount_amount = EXCLUDED.discount_amount,
    discount_percent = EXCLUDED.discount_percent,
    min_order_amount = EXCLUDED.min_order_amount,
    is_free_ship = EXCLUDED.is_free_ship,
    is_active = EXCLUDED.is_active;
