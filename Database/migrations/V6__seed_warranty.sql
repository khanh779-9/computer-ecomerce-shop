-- ==============================================================================
-- V6: Warranty demo data (serials, warranties, claims, repair events)
-- Idempotent: safe to run on every startup (ON CONFLICT DO NOTHING).
-- ==============================================================================

-- 1. PRODUCT SERIALS (linked to seeded products + customers)
INSERT INTO product_serials (product_id, serial_number, customer_id, sold_at)
VALUES (
    (SELECT id FROM products WHERE sku = 'TZ-LT-002'),
    'SN-TZLT-98741',
    (SELECT id FROM customers WHERE email = 'customer@techzone.vn'),
    now() - INTERVAL '11 months'
), (
    (SELECT id FROM products WHERE sku = 'TZ-MH-005'),
    'SN-TZMH-55219',
    (SELECT id FROM customers WHERE email = 'vip@techzone.vn'),
    now() - INTERVAL '8 months'
), (
    (SELECT id FROM products WHERE sku = 'TZ-LK-VGA-02'),
    'SN-TZVGA-7712',
    (SELECT id FROM customers WHERE email = 'customer@techzone.vn'),
    now() - INTERVAL '16 months'
)
ON CONFLICT (serial_number) DO NOTHING;

-- 2. WARRANTIES
INSERT INTO warranties (serial_id, warranty_months, starts_at, expires_at, status)
VALUES (
    (SELECT id FROM product_serials WHERE serial_number = 'SN-TZLT-98741'),
    24,
    now() - INTERVAL '11 months',
    now() + INTERVAL '13 months',
    'IN_REPAIR'
), (
    (SELECT id FROM product_serials WHERE serial_number = 'SN-TZMH-55219'),
    36,
    now() - INTERVAL '8 months',
    now() + INTERVAL '28 months',
    'ACTIVE'
), (
    (SELECT id FROM product_serials WHERE serial_number = 'SN-TZVGA-7712'),
    36,
    now() - INTERVAL '16 months',
    now() + INTERVAL '20 months',
    'READY_FOR_PICKUP'
)
ON CONFLICT (serial_id) DO NOTHING;

-- 3. WARRANTY CLAIMS
INSERT INTO warranty_claims (warranty_id, rma_code, issue, status, received_at, resolved_at)
VALUES (
    (SELECT id FROM warranties WHERE serial_id = (SELECT id FROM product_serials WHERE serial_number = 'SN-TZLT-98741')),
    'RMA-2026-8899',
    'Máy xung đột cáp màn hình khi chơi game nặng, quạt tản nhiệt phát ra tiếng rít nhẹ',
    'TESTING',
    now() - INTERVAL '8 days',
    NULL
), (
    (SELECT id FROM warranties WHERE serial_id = (SELECT id FROM product_serials WHERE serial_number = 'SN-TZVGA-7712')),
    'RMA-2026-7712',
    'Nhiệt độ nóng bất thường khi render Premiere Pro',
    'RESOLVED',
    now() - INTERVAL '19 days',
    now() - INTERVAL '12 days'
)
ON CONFLICT (rma_code) DO NOTHING;

-- 4. REPAIR EVENTS (timeline theo từng claim)
INSERT INTO warranty_repair_events (claim_id, step_order, title, description, event_at, completed)
VALUES
-- Claim 1: RMA-2026-8899 (laptop đang sửa)
((SELECT id FROM warranty_claims WHERE rma_code = 'RMA-2026-8899'), 1, 'Tiếp nhận thiết bị',
 'Đã nhận máy tại Showroom TechZone 123 Đường 3/2, Q.10, TP.HCM kèm củ sạc zin.', now() - INTERVAL '8 days', true),
((SELECT id FROM warranty_claims WHERE rma_code = 'RMA-2026-8899'), 2, 'Kỹ thuật viên kiểm tra phần cứng',
 'Xác định lỗi lỏng cáp EDP hiển thị màn hình, quạt GPU bám bụi nặng cần tra dầu trục.', now() - INTERVAL '7 days', true),
((SELECT id FROM warranty_claims WHERE rma_code = 'RMA-2026-8899'), 3, 'Thay thế linh kiện & Vệ sinh tra keo tản nhiệt',
 'Đã thay mới cụm cáp màn hình chính hãng và thay cụm quạt tản nhiệt buồng hơi.', now() - INTERVAL '5 days', true),
((SELECT id FROM warranty_claims WHERE rma_code = 'RMA-2026-8899'), 4, 'Chạy stress test kiểm chuẩn 24H',
 'Đang chạy phần mềm FurMark và 3DMark TimeSpy liên tục để đảm bảo nhiệt độ ổn định dưới 75°C.', now() - INTERVAL '2 days', false),
((SELECT id FROM warranty_claims WHERE rma_code = 'RMA-2026-8899'), 5, 'Hoàn tất - Sẵn sàng trả máy',
 'Nhân viên chăm sóc khách hàng sẽ gọi điện hoặc gửi SMS khi máy đã sẵn sàng nhận tại Showroom.', now() - INTERVAL '1 day', false),
-- Claim 2: RMA-2026-7712 (VGA đã hoàn tất)
((SELECT id FROM warranty_claims WHERE rma_code = 'RMA-2026-7712'), 1, 'Tiếp nhận thiết bị',
 'Tiếp nhận linh kiện tại trung tâm bảo hành Hà Nội.', now() - INTERVAL '19 days', true),
((SELECT id FROM warranty_claims WHERE rma_code = 'RMA-2026-7712'), 2, 'Kiểm định nhiệt độ',
 'Thermal pad bị khô cứng sau thời gian dài sử dụng liên tục.', now() - INTERVAL '18 days', true),
((SELECT id FROM warranty_claims WHERE rma_code = 'RMA-2026-7712'), 3, 'Đổi mới tản nhiệt Thermal Grizzly',
 'Đã thay mới toàn bộ thermal pad và keo tản nhiệt gốm cao cấp.', now() - INTERVAL '17 days', true),
((SELECT id FROM warranty_claims WHERE rma_code = 'RMA-2026-7712'), 4, 'Chạy stress test kiểm chuẩn',
 'Stress test Furmark 4K nhiệt độ duy trì mát mẻ 64°C.', now() - INTERVAL '15 days', true),
((SELECT id FROM warranty_claims WHERE rma_code = 'RMA-2026-7712'), 5, 'Hoàn tất - Sẵn sàng trả máy',
 'Linh kiện đã kiểm tra hoàn hảo, quý khách có thể đến Showroom nhận máy bất cứ lúc nào.', now() - INTERVAL '12 days', true)
ON CONFLICT (claim_id, step_order) DO NOTHING;
