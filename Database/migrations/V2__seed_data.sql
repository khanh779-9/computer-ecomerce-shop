-- ==============================================================================
-- TechZone Computer E-Commerce Initial Seed Data
-- Version: 2.0 (Refactored)
-- ==============================================================================

-- 1. CATEGORIES
INSERT INTO categories (name, slug, icon, display_order) VALUES
('Tất cả', 'all', 'LayoutGrid', 1),
('Laptop', 'laptop', 'Flame', 2),
('PC Gaming', 'pc-gaming', 'Cpu', 3),
('Màn hình', 'monitor', 'Monitor', 4),
('Bàn phím', 'keyboard', 'Keyboard', 5),
('Chuột', 'mouse', 'Mouse', 6),
('Linh kiện PC', 'pc-parts', 'HardDrive', 7),
('Tai nghe & Loa', 'audio', 'Headphones', 8)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

-- 2. BRANDS
INSERT INTO brands (name, slug) VALUES
('Asus', 'asus'),
('Dell', 'dell'),
('MSI', 'msi'),
('Apple', 'apple'),
('Logitech', 'logitech'),
('Akko', 'akko'),
('Sony', 'sony'),
('Anker', 'anker'),
('JBL', 'jbl'),
('Intel', 'intel'),
('AMD', 'amd'),
('Corsair', 'corsair'),
('Kingston', 'kingston'),
('Samsung', 'samsung'),
('NZXT', 'nzxt'),
('DeepCool', 'deepcool'),
('Thermalright', 'thermalright'),
('Montech', 'montech'),
('TechZone', 'techzone')
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug;

-- 3. PRODUCTS CATALOG & PC BUILDER
INSERT INTO products (sku, name, brand, category, price, old_price, rating, review_count, sold, stock, art, tint, description) VALUES
-- Laptops
('TZ-LT-001', 'Laptop Asus Vivobook 15 X1504VA — Core i5-1335U, 16GB, 512GB SSD', 'Asus', 'Laptop', 13490000, 15990000, 4.7, 86, 214, 15, 'laptop', '#c7d2fe', 'Laptop học tập làm việc màn hình 15.6 inch FHD IPS, viền siêu mỏng, pin bền bỉ 42Wh.'),
('TZ-LT-002', 'Laptop Gaming Acer Nitro 5 Tiger — Core i5-12500H, RTX 3050 4GB, 16GB, 512GB, 144Hz', 'Acer', 'Laptop', 17490000, 19990000, 4.8, 142, 430, 8, 'laptop', '#f87171', 'Cỗ máy chiến game quốc dân với tản nhiệt 2 quạt CoolBoost mát mẻ, bàn phím LED RGB 4 vùng.'),
('TZ-LT-003', 'Laptop Lenovo Legion 5 16IRX9 — Core i7-14650HX, RTX 4060 8GB, 16GB DDR5, 1TB SSD, 2.5K 165Hz', 'Lenovo', 'Laptop', 33990000, 37990000, 4.9, 95, 180, 5, 'laptop', '#38bdf8', 'Laptop gaming cao cấp thiết kế sang trọng, màn hình chuẩn màu 100% sRGB phù hợp đồ họa chuyên nghiệp.'),
('TZ-LT-004', 'Apple MacBook Air 13 inch M2 (8GB RAM / 256GB SSD) — Chính hãng Apple Việt Nam', 'Apple', 'Laptop', 24490000, 27990000, 4.9, 320, 950, 20, 'laptop', '#e2e8f0', 'Thiết kế nhôm nguyên khối siêu mỏng nhẹ 1.24kg, chip Apple M2 mạnh mẽ, thời lượng pin lên đến 18 giờ.'),

-- PC Gaming
('TZ-PC-005', 'PC Gaming TechZone Ultra — Core i5-13400F, RTX 4060 8GB, 16GB RAM, 500GB SSD NVMe', 'TechZone', 'PC Gaming', 18990000, 20990000, 4.9, 118, 342, 15, 'pc', '#38bdf8', 'Bộ máy tính chơi game tối ưu hiệu năng trên giá thành, chiến mượt mà mọi tựa game AAA ở độ phân giải FHD và 2K.'),
('TZ-PC-006', 'PC Workstation TechZone Creator Pro — Core i7-14700K, RTX 4070 Super 12GB, 32GB DDR5, 1TB SSD', 'TechZone', 'PC Gaming', 39990000, 44990000, 4.9, 64, 115, 6, 'pc', '#a855f7', 'Cỗ máy đồ họa chuyên nghiệp chuyên render 3D, dựng phim 4K After Effects, Premiere và mô phỏng AI.'),
('TZ-PC-007', 'PC Gaming TechZone Starter — AMD Ryzen 5 5600, GTX 1650 4GB, 16GB RAM, 256GB SSD', 'TechZone', 'PC Gaming', 10490000, 11990000, 4.6, 75, 260, 18, 'pc', '#fb923c', 'Cấu hình phổ thông lý tưởng cho học sinh, sinh viên chơi mượt Liên Minh Huyền Thoại, Valorant, CS2, FO4.'),

-- Màn hình
('TZ-MH-005', 'Màn hình Dell S2722QC 27 inch 4K IPS 60Hz, viền mỏng, sạc Type-C 65W', 'Dell', 'Màn hình', 9390000, 10990000, 4.7, 58, 121, 10, 'monitor', '#bae6fd', 'Màn hình 4K siêu sắc nét, tích hợp cổng USB-C truyền hình ảnh và sạc ngược tiện lợi cho laptop MacBook/Windows.'),
('TZ-MH-006', 'Màn hình Gaming ASUS TUF VG27AQ3A 27 inch 2K Fast IPS 180Hz 1ms G-Sync', 'Asus', 'Màn hình', 5890000, 6890000, 4.8, 140, 480, 14, 'monitor', '#f43f5e', 'Tần số quét cao 180Hz kết hợp Fast IPS siêu tốc mang lại chuyển động mượt mà không bóng mờ cho game thủ FPS.'),
('TZ-MH-007', 'Màn hình LG 24MP400-B 24 inch FHD IPS 75Hz viền siêu mỏng AMD FreeSync', 'LG', 'Màn hình', 2190000, 2690000, 4.6, 210, 890, 25, 'monitor', '#a3e635', 'Màn hình văn phòng quốc dân hiển thị màu sắc trung thực, bảo vệ mắt chống nhấp nháy Flicker Safe.'),

-- Bàn phím
('TZ-BP-032', 'Bàn phím cơ Akko 3087S Plus, switch Cherry MX Red, LED RGB', 'Akko', 'Bàn phím', 1450000, 1690000, 4.6, 97, 388, 12, 'keyboard', '#fca5a5', 'Layout TKL gọn gàng, keycap PBT Double-Shot bền bỉ chống bám bóng, gõ êm mượt thích hợp văn phòng và chơi game.'),
('TZ-BP-033', 'Bàn phím Logitech MX Keys S full-size, đèn nền thông minh, kết nối 3 thiết bị', 'Logitech', 'Bàn phím', 2390000, 2790000, 4.7, 76, 240, 11, 'keyboard', '#a8a29e', 'Bàn phím cao cấp dành cho lập trình viên và sáng tạo nội dung, phím lõm hình cầu bấm cực êm.'),
('TZ-BP-034', 'Bàn phím cơ không dây Keychron K2 Pro QMK/VIA Hot-swap RGB Gateron Red', 'Keychron', 'Bàn phím', 2150000, 2490000, 4.8, 89, 310, 16, 'keyboard', '#60a5fa', 'Hỗ trợ tùy biến phím qua QMK/VIA, kết nối Bluetooth 5.1 tương thích hoàn hảo cả macOS và Windows.'),

-- Chuột
('TZ-CH-008', 'Chuột không dây Logitech G304 Lightspeed, cảm biến HERO 12K DPI, đen', 'Logitech', 'Chuột', 749000, 899000, 4.8, 1204, 5621, 41, 'mouse', '#52525b', 'Chuột gaming không dây bền bỉ, pin dùng liên tục tới 250 giờ với độ trễ cực thấp 1ms Lightspeed.'),
('TZ-CH-009', 'Chuột không dây Logitech MX Master 3S Quiet Clicks 8K DPI Darkfield', 'Logitech', 'Chuột', 2290000, 2690000, 4.9, 340, 1120, 15, 'mouse', '#71717a', 'Con lăn MagSpeed siêu nhanh, mắt đọc trên mọi bề mặt kính, nút bấm giảm 90% tiếng ồn click.'),
('TZ-CH-010', 'Chuột Gaming Razer DeathAdder Essential 6400 DPI công thái học, LED xanh', 'Razer', 'Chuột', 390000, 590000, 4.6, 560, 2800, 30, 'mouse', '#22c55e', 'Thiết kế công thái học huyền thoại ôm sát lòng bàn tay, switch độ bền 10 triệu lần bấm.'),

-- Tai nghe & Loa
('TZ-TH-014', 'Tai nghe chụp tai Sony WH-CH720N chống ồn chủ động ANC, đen nhám', 'Sony', 'Tai nghe & Loa', 2690000, 3290000, 4.8, 412, 1530, 23, 'headphone', '#e4e4e7', 'Trọng lượng siêu nhẹ chỉ 192g, chip V1 tích hợp nâng cao chất lượng âm thanh và lọc ồn đàm thoại sắc nét.'),
('TZ-TN-041', 'Tai nghe True Wireless Anker Soundcore Life P3i, chống ồn, pin 36h', 'Anker', 'Tai nghe & Loa', 1290000, 1590000, 4.4, 341, 1092, 30, 'earbuds', '#d6d3d1', '4 micro lọc ồn AI, driver 10mm mang lại âm bass uy lực, sạc nhanh 10 phút dùng 2 giờ.'),
('TZ-LO-009', 'Loa để bàn vi tính JBL Flip 6 Bluetooth 5.1 & Type-C chống nước IP67', 'JBL', 'Tai nghe & Loa', 2490000, 2990000, 4.9, 528, 2310, 8, 'speaker', '#4d7c0f', 'Hệ thống loa 2 chiều cho âm thanh mạnh mẽ, thời lượng pin 12 giờ phát nhạc liên tục.'),

-- Linh kiện PC Builder
-- CPU
('TZ-LK-CPU-01', 'Bộ vi xử lý Intel Core i5-13400F (LGA1700, 10 nhân 16 luồng, Up to 4.6GHz, 20MB Cache)', 'Intel', 'Linh kiện PC', 4990000, 5690000, 4.9, 210, 840, 25, 'component', '#0284c7', 'CPU quốc dân phân khúc tầm trung, hiệu năng chơi game và đa nhiệm vượt trội với kiến trúc kết hợp P-core và E-core.'),
('TZ-LK-CPU-02', 'Bộ vi xử lý Intel Core i7-14700K (LGA1700, 20 nhân 28 luồng, Up to 5.6GHz, 33MB Cache)', 'Intel', 'Linh kiện PC', 10890000, 11990000, 4.9, 85, 230, 12, 'component', '#0369a1', 'Vi xử lý thế hệ 14 Raptor Lake Refresh cao cấp, xử lý đồ họa 3D render và gaming đỉnh cao.'),
('TZ-LK-CPU-03', 'Bộ vi xử lý AMD Ryzen 7 7800X3D (AM5, 8 nhân 16 luồng, 3D V-Cache 104MB, Up to 5.0GHz)', 'AMD', 'Linh kiện PC', 9890000, 10990000, 5.0, 140, 450, 10, 'component', '#ea580c', 'Vua vi xử lý gaming thế giới hiện nay với bộ nhớ đệm 3D V-Cache khổng lồ.'),

-- Mainboard
('TZ-LK-MB-01', 'Bo mạch chủ ASUS TUF Gaming B760M-PLUS WIFI DDR5 (Socket LGA1700)', 'Asus', 'Linh kiện PC', 4290000, 4790000, 4.8, 95, 310, 15, 'component', '#d97706', 'Thiết kế độ bền chuẩn quân sự TUF, dàn VRM 12+1 DrMOS mạnh mẽ, tích hợp sẵn WiFi 6 và PCIe 5.0.'),
('TZ-LK-MB-02', 'Bo mạch chủ MSI MAG B650 TOMAHAWK WIFI (Socket AM5, DDR5)', 'MSI', 'Linh kiện PC', 5490000, 6190000, 4.9, 68, 190, 8, 'component', '#dc2626', 'Bo mạch chủ AM5 phân khúc cao cấp cho AMD Ryzen 7000/8000 series, tản nhiệt nhôm mở rộng tối ưu nhiệt độ.'),

-- RAM
('TZ-LK-RAM-01', 'Bộ nhớ RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz Black', 'Corsair', 'Linh kiện PC', 2890000, 3290000, 4.8, 130, 520, 20, 'component', '#eab308', 'Tốc độ bus cực cao 6000MHz, dải LED RGB 10 vùng siêu sáng tương thích iCUE, hỗ trợ Intel XMP 3.0 & AMD EXPO.'),
('TZ-LK-RAM-02', 'Bộ nhớ RAM Kingston Fury Beast 16GB (1x16GB) DDR4 3200MHz tản nhiệt thép', 'Kingston', 'Linh kiện PC', 950000, 1150000, 4.7, 310, 1420, 40, 'component', '#475569', 'Thanh RAM chuẩn DDR4 bền bỉ, cắm là chạy tương thích với mọi bo mạch chủ phổ thông.'),

-- VGA
('TZ-LK-018', 'Card màn hình ASUS Dual GeForce RTX 4060 EVO OC 8GB GDDR6', 'Asus', 'Linh kiện PC', 8490000, 9490000, 4.8, 92, 215, 12, 'component', '#f43f5e', 'Kiến trúc Ada Lovelace mới nhất, công nghệ DLSS 3 và Ray Tracing thế hệ 3 đem lại trải nghiệm game chân thực.'),
('TZ-LK-VGA-02', 'Card màn hình MSI GeForce RTX 4070 SUPER 12G VENTUS 2X OC GDDR6X', 'MSI', 'Linh kiện PC', 16990000, 18990000, 4.9, 45, 110, 6, 'component', '#9333ea', 'Sức mạnh đồ họa vượt bậc cho gaming 2K/4K max setting và công việc AI dựng hình chuyên sâu.'),

-- SSD
('TZ-LK-SSD-01', 'Ổ cứng SSD Samsung 990 Pro 1TB M.2 NVMe PCIe Gen 4.0 x4 (Đọc 7450MB/s - Ghi 6900MB/s)', 'Samsung', 'Linh kiện PC', 2790000, 3190000, 5.0, 180, 640, 18, 'component', '#059669', 'Đỉnh cao tốc độ ổ cứng NVMe Gen 4, kiểm soát nhiệt độ thông minh bảo toàn tuổi thọ chip nhớ NAND.'),
('TZ-LK-SSD-02', 'Ổ cứng SSD Kingston NV2 500GB M.2 2280 NVMe PCIe 4.0 (Đọc 3500MB/s)', 'Kingston', 'Linh kiện PC', 990000, 1290000, 4.6, 420, 1950, 35, 'component', '#64748b', 'Giải pháp nâng cấp lưu trữ khởi động Windows và tải ứng dụng siêu tốc với chi phí tiết kiệm.'),

-- PSU
('TZ-LK-PSU-01', 'Nguồn máy tính Corsair RM750e 750W 80 Plus Gold — Full Modular ATX 3.0 PCIe 5.0', 'Corsair', 'Linh kiện PC', 2690000, 3090000, 4.9, 85, 290, 15, 'component', '#f59e0b', 'Chuẩn nguồn ATX 3.0 với cáp 12VHPWR cấp điện ổn định cho card đồ họa RTX 40 Series, dây cáp rời gọn gàng.'),
('TZ-LK-PSU-02', 'Nguồn máy tính DeepCool PK650D 650W 80 Plus Bronze', 'DeepCool', 'Linh kiện PC', 1250000, 1490000, 4.7, 160, 680, 22, 'component', '#0284c7', 'Nguồn công suất thực 650W chuẩn 80 Plus Bronze đạt hiệu suất chuyển đổi 85%, quạt 120mm êm ái.'),

-- CASE
('TZ-LK-CASE-01', 'Vỏ case máy tính NZXT H5 Flow RGB Black (Mid Tower, Kèm sẵn 2 Fan RGB + 2 Fan case)', 'NZXT', 'Linh kiện PC', 2290000, 2690000, 4.9, 72, 210, 10, 'component', '#18181b', 'Mặt trước dạng lưới thoáng khí tối ưu luồng gió, kính cường lực khoe trọn linh kiện phần cứng bên trong.'),
('TZ-LK-CASE-02', 'Vỏ case máy tính Montech Air 100 ARGB Black (Kèm sẵn 4 Quạt ARGB, Cửa kính đóng mở)', 'Montech', 'Linh kiện PC', 1190000, 1390000, 4.7, 110, 480, 18, 'component', '#334155', 'Case nhỏ gọn chuẩn Micro-ATX, tích hợp sẵn 4 quạt LED đổi màu theo nút bấm hoặc đồng bộ Mainboard.'),

-- COOLER
('TZ-LK-CLR-01', 'Tản nhiệt khí CPU Thermalright Peerless Assassin 120 SE (6 Ống đồng, 2 Quạt PWM 120mm)', 'Thermalright', 'Linh kiện PC', 790000, 990000, 4.9, 290, 1150, 25, 'component', '#6b7280', 'Vua tản nhiệt khí tầm giá dưới 1 triệu, hạ nhiệt dễ dàng cho các dòng CPU Core i5/i7 và Ryzen 5/7.'),
('TZ-LK-CLR-02', 'Tản nhiệt nước AIO DeepCool LT720 360mm ARGB Gương vô cực', 'DeepCool', 'Linh kiện PC', 2890000, 3290000, 4.9, 65, 180, 8, 'component', '#06b6d4', 'Bơm nước thế hệ thứ 4 công suất cao, nắp bơm thiết kế khối lập phương gương vô cực sang trọng.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    brand = EXCLUDED.brand,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    old_price = EXCLUDED.old_price,
    rating = EXCLUDED.rating,
    review_count = EXCLUDED.review_count,
    sold = EXCLUDED.sold,
    stock = EXCLUDED.stock,
    art = EXCLUDED.art,
    tint = EXCLUDED.tint,
    description = EXCLUDED.description;

-- 4. VOUCHERS
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

-- 5. USERS
INSERT INTO users (email, password_hash, full_name, phone, membership_tier, points, role) VALUES
('quock@techzone.vn', '$2a$10$wNqH.3tP2N0/k3zXv8gNceJ90K1Xz4aI.R5d7uI2eY3B8M4Q2qT6a', 'Quốc Khánh', '0912345678', 'Vàng', 850, 'ADMIN'),
('customer@techzone.vn', '$2a$10$wNqH.3tP2N0/k3zXv8gNceJ90K1Xz4aI.R5d7uI2eY3B8M4Q2qT6a', 'Nguyễn Văn An', '0987654321', 'Bạc', 120, 'CUSTOMER'),
('vip@techzone.vn', '$2a$10$wNqH.3tP2N0/k3zXv8gNceJ90K1Xz4aI.R5d7uI2eY3B8M4Q2qT6a', 'Trần Minh Đức (VIP)', '0909123456', 'Kim Cương', 3450, 'CUSTOMER')
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    membership_tier = EXCLUDED.membership_tier,
    points = EXCLUDED.points,
    role = EXCLUDED.role;
