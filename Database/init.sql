-- ==============================================================================
-- TechZone Computer E-Commerce Database Master Init Script
-- This script sets up the full database schema and initial seed data.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(150),
    phone VARCHAR(20),
    membership_tier VARCHAR(30) NOT NULL DEFAULT 'Bạc',
    points INT NOT NULL DEFAULT 0,
    avatar VARCHAR(500),
    role VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CATEGORIES & BRANDS
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    display_order INT DEFAULT 0
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
);

ALTER TABLE brands ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(300) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100),
    price BIGINT NOT NULL,
    old_price BIGINT,
    rating NUMERIC(2,1) DEFAULT 5.0,
    review_count INT NOT NULL DEFAULT 0,
    sold INT NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    art VARCHAR(50),
    tint VARCHAR(30),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name_lower ON products(LOWER(name));

-- 5. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

-- 6. VOUCHERS
CREATE TABLE IF NOT EXISTS vouchers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    discount_amount BIGINT NOT NULL DEFAULT 0,
    discount_percent INT DEFAULT 0,
    min_order_amount BIGINT NOT NULL DEFAULT 0,
    is_free_ship BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);

-- 7. CARTS
CREATE TABLE IF NOT EXISTS carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    UNIQUE (cart_id, product_id)
);

-- 8. ORDERS & ITEMS
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    note TEXT,
    voucher_code VARCHAR(50),
    discount_amount BIGINT NOT NULL DEFAULT 0,
    subtotal BIGINT NOT NULL,
    shipping_fee BIGINT NOT NULL,
    total BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(300) NOT NULL,
    unit_price BIGINT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- 9. REVIEWS (REFACTORED)
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    user_avatar VARCHAR(500),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    content TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    likes_count INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name VARCHAR(150);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_avatar VARCHAR(500);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title VARCHAR(200);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS likes_count INT NOT NULL DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'APPROVED';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

ALTER TABLE products ADD COLUMN IF NOT EXISTS favorite_count INT NOT NULL DEFAULT 0;

-- 9. USER WISHLIST (SẢN PHẨM YÊU THÍCH)
CREATE TABLE IF NOT EXISTS wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_wishlists_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);



-- ==============================================================================
-- 10. SEED DATA EXECUTION
-- ==============================================================================

-- Categories
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

-- Brands
INSERT INTO brands (name, slug) VALUES
('Asus', 'asus'), ('Dell', 'dell'), ('MSI', 'msi'), ('Apple', 'apple'),
('Logitech', 'logitech'), ('Akko', 'akko'), ('Sony', 'sony'), ('Anker', 'anker'),
('JBL', 'jbl'), ('Intel', 'intel'), ('AMD', 'amd'), ('Corsair', 'corsair'),
('Kingston', 'kingston'), ('Samsung', 'samsung'), ('NZXT', 'nzxt'),
('DeepCool', 'deepcool'), ('Thermalright', 'thermalright'), ('Montech', 'montech'),
('TechZone', 'techzone')
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug;

-- Products
INSERT INTO products (sku, name, brand, category, price, old_price, rating, review_count, sold, stock, art, tint, description) VALUES
('TZ-LT-001', 'Laptop Asus Vivobook 15 X1504VA — Core i5-1335U, 16GB, 512GB SSD', 'Asus', 'Laptop', 13490000, 15990000, 4.7, 86, 214, 15, 'laptop', '#c7d2fe', 'Laptop học tập làm việc màn hình 15.6 inch FHD IPS, viền siêu mỏng, pin bền bỉ 42Wh.'),
('TZ-LT-002', 'Laptop Gaming Acer Nitro 5 Tiger — Core i5-12500H, RTX 3050 4GB, 16GB, 512GB, 144Hz', 'Acer', 'Laptop', 17490000, 19990000, 4.8, 142, 430, 8, 'laptop', '#f87171', 'Cỗ máy chiến game quốc dân với tản nhiệt 2 quạt CoolBoost mát mẻ, bàn phím LED RGB 4 vùng.'),
('TZ-LT-003', 'Laptop Lenovo Legion 5 16IRX9 — Core i7-14650HX, RTX 4060 8GB, 16GB DDR5, 1TB SSD, 2.5K 165Hz', 'Lenovo', 'Laptop', 33990000, 37990000, 4.9, 95, 180, 5, 'laptop', '#38bdf8', 'Laptop gaming cao cấp thiết kế sang trọng, màn hình chuẩn màu 100% sRGB phù hợp đồ họa chuyên nghiệp.'),
('TZ-LT-004', 'Apple MacBook Air 13 inch M2 (8GB RAM / 256GB SSD) — Chính hãng Apple Việt Nam', 'Apple', 'Laptop', 24490000, 27990000, 4.9, 320, 950, 20, 'laptop', '#e2e8f0', 'Thiết kế nhôm nguyên khối siêu mỏng nhẹ 1.24kg, chip Apple M2 mạnh mẽ, thời lượng pin lên đến 18 giờ.'),
('TZ-PC-005', 'PC Gaming TechZone Ultra — Core i5-13400F, RTX 4060 8GB, 16GB RAM, 500GB SSD NVMe', 'TechZone', 'PC Gaming', 18990000, 20990000, 4.9, 118, 342, 15, 'pc', '#38bdf8', 'Bộ máy tính chơi game tối ưu hiệu năng trên giá thành, chiến mượt mà mọi tựa game AAA ở độ phân giải FHD và 2K.'),
('TZ-PC-006', 'PC Workstation TechZone Creator Pro — Core i7-14700K, RTX 4070 Super 12GB, 32GB DDR5, 1TB SSD', 'TechZone', 'PC Gaming', 39990000, 44990000, 4.9, 64, 115, 6, 'pc', '#a855f7', 'Cỗ máy đồ họa chuyên nghiệp chuyên render 3D, dựng phim 4K After Effects, Premiere và mô phỏng AI.'),
('TZ-PC-007', 'PC Gaming TechZone Starter — AMD Ryzen 5 5600, GTX 1650 4GB, 16GB RAM, 256GB SSD', 'TechZone', 'PC Gaming', 10490000, 11990000, 4.6, 75, 260, 18, 'pc', '#fb923c', 'Cấu hình phổ thông lý tưởng cho học sinh, sinh viên chơi mượt Liên Minh Huyền Thoại, Valorant, CS2, FO4.'),
('TZ-MH-005', 'Màn hình Dell S2722QC 27 inch 4K IPS 60Hz, viền mỏng, sạc Type-C 65W', 'Dell', 'Màn hình', 9390000, 10990000, 4.7, 58, 121, 10, 'monitor', '#bae6fd', 'Màn hình 4K siêu sắc nét, tích hợp cổng USB-C truyền hình ảnh và sạc ngược tiện lợi cho laptop MacBook/Windows.'),
('TZ-MH-006', 'Màn hình Gaming ASUS TUF VG27AQ3A 27 inch 2K Fast IPS 180Hz 1ms G-Sync', 'Asus', 'Màn hình', 5890000, 6890000, 4.8, 140, 480, 14, 'monitor', '#f43f5e', 'Tần số quét cao 180Hz kết hợp Fast IPS siêu tốc mang lại chuyển động mượt mà không bóng mờ cho game thủ FPS.'),
('TZ-MH-007', 'Màn hình LG 24MP400-B 24 inch FHD IPS 75Hz viền siêu mỏng AMD FreeSync', 'LG', 'Màn hình', 2190000, 2690000, 4.6, 210, 890, 25, 'monitor', '#a3e635', 'Màn hình văn phòng quốc dân hiển thị màu sắc trung thực, bảo vệ mắt chống nhấp nháy Flicker Safe.'),
('TZ-BP-032', 'Bàn phím cơ Akko 3087S Plus, switch Cherry MX Red, LED RGB', 'Akko', 'Bàn phím', 1450000, 1690000, 4.6, 97, 388, 12, 'keyboard', '#fca5a5', 'Layout TKL gọn gàng, keycap PBT Double-Shot bền bỉ chống bám bóng, gõ êm mượt thích hợp văn phòng và chơi game.'),
('TZ-BP-033', 'Bàn phím Logitech MX Keys S full-size, đèn nền thông minh, kết nối 3 thiết bị', 'Logitech', 'Bàn phím', 2390000, 2790000, 4.7, 76, 240, 11, 'keyboard', '#a8a29e', 'Bàn phím cao cấp dành cho lập trình viên và sáng tạo nội dung, phím lõm hình cầu bấm cực êm.'),
('TZ-BP-034', 'Bàn phím cơ không dây Keychron K2 Pro QMK/VIA Hot-swap RGB Gateron Red', 'Keychron', 'Bàn phím', 2150000, 2490000, 4.8, 89, 310, 16, 'keyboard', '#60a5fa', 'Hỗ trợ tùy biến phím qua QMK/VIA, kết nối Bluetooth 5.1 tương thích hoàn hảo cả macOS và Windows.'),
('TZ-CH-008', 'Chuột không dây Logitech G304 Lightspeed, cảm biến HERO 12K DPI, đen', 'Logitech', 'Chuột', 749000, 899000, 4.8, 1204, 5621, 41, 'mouse', '#52525b', 'Chuột gaming không dây bền bỉ, pin dùng liên tục tới 250 giờ với độ trễ cực thấp 1ms Lightspeed.'),
('TZ-CH-009', 'Chuột không dây Logitech MX Master 3S Quiet Clicks 8K DPI Darkfield', 'Logitech', 'Chuột', 2290000, 2690000, 4.9, 340, 1120, 15, 'mouse', '#71717a', 'Con lăn MagSpeed siêu nhanh, mắt đọc trên mọi bề mặt kính, nút bấm giảm 90% tiếng ồn click.'),
('TZ-CH-010', 'Chuột Gaming Razer DeathAdder Essential 6400 DPI công thái học, LED xanh', 'Razer', 'Chuột', 390000, 590000, 4.6, 560, 2800, 30, 'mouse', '#22c55e', 'Thiết kế công thái học huyền thoại ôm sát lòng bàn tay, switch độ bền 10 triệu lần bấm.'),
('TZ-TH-014', 'Tai nghe chụp tai Sony WH-CH720N chống ồn chủ động ANC, đen nhám', 'Sony', 'Tai nghe & Loa', 2690000, 3290000, 4.8, 412, 1530, 23, 'headphone', '#e4e4e7', 'Trọng lượng siêu nhẹ chỉ 192g, chip V1 tích hợp nâng cao chất lượng âm thanh và lọc ồn đàm thoại sắc nét.'),
('TZ-TN-041', 'Tai nghe True Wireless Anker Soundcore Life P3i, chống ồn, pin 36h', 'Anker', 'Tai nghe & Loa', 1290000, 1590000, 4.4, 341, 1092, 30, 'earbuds', '#d6d3d1', '4 micro lọc ồn AI, driver 10mm mang lại âm bass uy lực, sạc nhanh 10 phút dùng 2 giờ.'),
('TZ-LO-009', 'Loa để bàn vi tính JBL Flip 6 Bluetooth 5.1 & Type-C chống nước IP67', 'JBL', 'Tai nghe & Loa', 2490000, 2990000, 4.9, 528, 2310, 8, 'speaker', '#4d7c0f', 'Hệ thống loa 2 chiều cho âm thanh mạnh mẽ, thời lượng pin 12 giờ phát nhạc liên tục.'),
('TZ-LK-CPU-01', 'Bộ vi xử lý Intel Core i5-13400F (LGA1700, 10 nhân 16 luồng, Up to 4.6GHz, 20MB Cache)', 'Intel', 'Linh kiện PC', 4990000, 5690000, 4.9, 210, 840, 25, 'component', '#0284c7', 'CPU quốc dân phân khúc tầm trung, hiệu năng chơi game và đa nhiệm vượt trội với kiến trúc kết hợp P-core và E-core.'),
('TZ-LK-CPU-02', 'Bộ vi xử lý Intel Core i7-14700K (LGA1700, 20 nhân 28 luồng, Up to 5.6GHz, 33MB Cache)', 'Intel', 'Linh kiện PC', 10890000, 11990000, 4.9, 85, 230, 12, 'component', '#0369a1', 'Vi xử lý thế hệ 14 Raptor Lake Refresh cao cấp, xử lý đồ họa 3D render và gaming đỉnh cao.'),
('TZ-LK-CPU-03', 'Bộ vi xử lý AMD Ryzen 7 7800X3D (AM5, 8 nhân 16 luồng, 3D V-Cache 104MB, Up to 5.0GHz)', 'AMD', 'Linh kiện PC', 9890000, 10990000, 5.0, 140, 450, 10, 'component', '#ea580c', 'Vua vi xử lý gaming thế giới hiện nay với bộ nhớ đệm 3D V-Cache khổng lồ.'),
('TZ-LK-MB-01', 'Bo mạch chủ ASUS TUF Gaming B760M-PLUS WIFI DDR5 (Socket LGA1700)', 'Asus', 'Linh kiện PC', 4290000, 4790000, 4.8, 95, 310, 15, 'component', '#d97706', 'Thiết kế độ bền chuẩn quân sự TUF, dàn VRM 12+1 DrMOS mạnh mẽ, tích hợp sẵn WiFi 6 và PCIe 5.0.'),
('TZ-LK-MB-02', 'Bo mạch chủ MSI MAG B650 TOMAHAWK WIFI (Socket AM5, DDR5)', 'MSI', 'Linh kiện PC', 5490000, 6190000, 4.9, 68, 190, 8, 'component', '#dc2626', 'Bo mạch chủ AM5 phân khúc cao cấp cho AMD Ryzen 7000/8000 series, tản nhiệt nhôm mở rộng tối ưu nhiệt độ.'),
('TZ-LK-RAM-01', 'Bộ nhớ RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz Black', 'Corsair', 'Linh kiện PC', 2890000, 3290000, 4.8, 130, 520, 20, 'component', '#eab308', 'Tốc độ bus cực cao 6000MHz, dải LED RGB 10 vùng siêu sáng tương thích iCUE, hỗ trợ Intel XMP 3.0 & AMD EXPO.'),
('TZ-LK-RAM-02', 'Bộ nhớ RAM Kingston Fury Beast 16GB (1x16GB) DDR4 3200MHz tản nhiệt thép', 'Kingston', 'Linh kiện PC', 950000, 1150000, 4.7, 310, 1420, 40, 'component', '#475569', 'Thanh RAM chuẩn DDR4 bền bỉ, cắm là chạy tương thích với mọi bo mạch chủ phổ thông.'),
('TZ-LK-018', 'Card màn hình ASUS Dual GeForce RTX 4060 EVO OC 8GB GDDR6', 'Asus', 'Linh kiện PC', 8490000, 9490000, 4.8, 92, 215, 12, 'component', '#f43f5e', 'Kiến trúc Ada Lovelace mới nhất, công nghệ DLSS 3 và Ray Tracing thế hệ 3 đem lại trải nghiệm game chân thực.'),
('TZ-LK-VGA-02', 'Card màn hình MSI GeForce RTX 4070 SUPER 12G VENTUS 2X OC GDDR6X', 'MSI', 'Linh kiện PC', 16990000, 18990000, 4.9, 45, 110, 6, 'component', '#9333ea', 'Sức mạnh đồ họa vượt bậc cho gaming 2K/4K max setting và công việc AI dựng hình chuyên sâu.'),
('TZ-LK-SSD-01', 'Ổ cứng SSD Samsung 990 Pro 1TB M.2 NVMe PCIe Gen 4.0 x4 (Đọc 7450MB/s - Ghi 6900MB/s)', 'Samsung', 'Linh kiện PC', 2790000, 3190000, 5.0, 180, 640, 18, 'component', '#059669', 'Đỉnh cao tốc độ ổ cứng NVMe Gen 4, kiểm soát nhiệt độ thông minh bảo toàn tuổi thọ chip nhớ NAND.'),
('TZ-LK-SSD-02', 'Ổ cứng SSD Kingston NV2 500GB M.2 2280 NVMe PCIe 4.0 (Đọc 3500MB/s)', 'Kingston', 'Linh kiện PC', 990000, 1290000, 4.6, 420, 1950, 35, 'component', '#64748b', 'Giải pháp nâng cấp lưu trữ khởi động Windows và tải ứng dụng siêu tốc với chi phí tiết kiệm.'),
('TZ-LK-PSU-01', 'Nguồn máy tính Corsair RM750e 750W 80 Plus Gold — Full Modular ATX 3.0 PCIe 5.0', 'Corsair', 'Linh kiện PC', 2690000, 3090000, 4.9, 85, 290, 15, 'component', '#f59e0b', 'Chuẩn nguồn ATX 3.0 với cáp 12VHPWR cấp điện ổn định cho card đồ họa RTX 40 Series, dây cáp rời gọn gàng.'),
('TZ-LK-PSU-02', 'Nguồn máy tính DeepCool PK650D 650W 80 Plus Bronze', 'DeepCool', 'Linh kiện PC', 1250000, 1490000, 4.7, 160, 680, 22, 'component', '#0284c7', 'Nguồn công suất thực 650W chuẩn 80 Plus Bronze đạt hiệu suất chuyển đổi 85%, quạt 120mm êm ái.'),
('TZ-LK-CASE-01', 'Vỏ case máy tính NZXT H5 Flow RGB Black (Mid Tower, Kèm sẵn 2 Fan RGB + 2 Fan case)', 'NZXT', 'Linh kiện PC', 2290000, 2690000, 4.9, 72, 210, 10, 'component', '#18181b', 'Mặt trước dạng lưới thoáng khí tối ưu luồng gió, kính cường lực khoe trọn linh kiện phần cứng bên trong.'),
('TZ-LK-CASE-02', 'Vỏ case máy tính Montech Air 100 ARGB Black (Kèm sẵn 4 Quạt ARGB, Cửa kính đóng mở)', 'Montech', 'Linh kiện PC', 1190000, 1390000, 4.7, 110, 480, 18, 'component', '#334155', 'Case nhỏ gọn chuẩn Micro-ATX, tích hợp sẵn 4 quạt LED đổi màu theo nút bấm hoặc đồng bộ Mainboard.'),
('TZ-LK-CLR-01', 'Tản nhiệt khí CPU Thermalright Peerless Assassin 120 SE (6 Ống đồng, 2 Quạt PWM 120mm)', 'Thermalright', 'Linh kiện PC', 790000, 990000, 4.9, 290, 1150, 25, 'component', '#6b7280', 'Vua tản nhiệt khí tầm giá dưới 1 triệu, hạ nhiệt dễ dàng cho các dòng CPU Core i5/i7 và Ryzen 5/7.'),
('TZ-LK-CLR-02', 'Tản nhiệt nước AIO DeepCool LT720 360mm ARGB Gương vô cực', 'DeepCool', 'Linh kiện PC', 2890000, 3290000, 4.9, 65, 180, 8, 'component', '#06b6d4', 'Bơm nước thế hệ thứ 4 công suất cao, nắp bơm thiết kế khối lập phương gương vô cực sang trọng.')
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name, brand = EXCLUDED.brand, category = EXCLUDED.category,
    price = EXCLUDED.price, old_price = EXCLUDED.old_price, rating = EXCLUDED.rating,
    review_count = EXCLUDED.review_count, sold = EXCLUDED.sold, stock = EXCLUDED.stock,
    art = EXCLUDED.art, tint = EXCLUDED.tint, description = EXCLUDED.description;

-- Vouchers
INSERT INTO vouchers (code, description, discount_amount, discount_percent, min_order_amount, is_free_ship, is_active) VALUES
('TECHZONE50', 'Giảm 50.000đ cho đơn hàng linh kiện và phụ kiện từ 1.000.000đ', 50000, 0, 1000000, false, true),
('FREESHIP', 'Miễn phí vận chuyển toàn quốc cho mọi đơn hàng', 0, 0, 0, true, true),
('SINHVIEN', 'Giảm 100.000đ đặc quyền dành cho học sinh - sinh viên (đơn từ 5.000.000đ)', 100000, 0, 5000000, false, true),
('TECHZONE100', 'Mã giảm giá 100.000đ cho đơn hàng xây cấu hình PC hoặc Laptop từ 10.000.000đ', 100000, 0, 10000000, false, true)
ON CONFLICT (code) DO UPDATE SET
    description = EXCLUDED.description, discount_amount = EXCLUDED.discount_amount,
    discount_percent = EXCLUDED.discount_percent, min_order_amount = EXCLUDED.min_order_amount,
    is_free_ship = EXCLUDED.is_free_ship, is_active = EXCLUDED.is_active;

-- Users
INSERT INTO users (email, password_hash, full_name, phone, membership_tier, points, role) VALUES
('quock@techzone.vn', '$2a$10$wNqH.3tP2N0/k3zXv8gNceJ90K1Xz4aI.R5d7uI2eY3B8M4Q2qT6a', 'Quốc Khánh', '0912345678', 'Vàng', 850, 'ADMIN'),
('customer@techzone.vn', '$2a$10$wNqH.3tP2N0/k3zXv8gNceJ90K1Xz4aI.R5d7uI2eY3B8M4Q2qT6a', 'Nguyễn Văn An', '0987654321', 'Bạc', 120, 'CUSTOMER'),
('vip@techzone.vn', '$2a$10$wNqH.3tP2N0/k3zXv8gNceJ90K1Xz4aI.R5d7uI2eY3B8M4Q2qT6a', 'Trần Minh Đức (VIP)', '0909123456', 'Kim Cương', 3450, 'CUSTOMER')
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name, phone = EXCLUDED.phone,
    membership_tier = EXCLUDED.membership_tier, points = EXCLUDED.points, role = EXCLUDED.role;

-- Reviews Seed
INSERT INTO reviews (product_id, user_id, user_name, user_avatar, rating, title, content, is_verified_purchase, likes_count, status, created_at)
SELECT p.id, u.id, 'Nguyễn Văn An', u.avatar, 5, 'Máy chạy cực kỳ êm và mượt mà', 'Mình mua máy này được 2 tuần để làm đồ họa và code. Máy mát, màn hình đẹp sắc nét, bàn phím gõ êm tay, pin dùng văn phòng được tầm 5-6 tiếng. Shop giao hàng siêu nhanh chỉ trong 2 tiếng tại TP.HCM!', true, 12, 'APPROVED', now() - interval '5 days'
FROM products p, users u
WHERE p.sku = 'TZ-LT-001' AND u.email = 'customer@techzone.vn'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (product_id, user_id, user_name, user_avatar, rating, title, content, is_verified_purchase, likes_count, status, created_at)
SELECT p.id, u.id, 'Trần Minh Đức', u.avatar, 5, 'Chất lượng hoàn thiện tuyệt hảo', 'Sản phẩm chính hãng nguyên seal, đúng như mô tả. Đóng gói 3 lớp chống sốc cẩn thận. Rất hài lòng về dịch vụ tư vấn nhiệt tình của TechZone!', true, 8, 'APPROVED', now() - interval '3 days'
FROM products p, users u
WHERE p.sku = 'TZ-LT-001' AND u.email = 'vip@techzone.vn'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at)
SELECT p.id, 'Hoàng Long Vũ', 4, 'Tốt trong tầm giá', 'Hiệu năng tốt, build cứng cáp. Chỉ tiếc là loa ngoài hơi bé một chút khi ở phòng rộng, còn lại mọi thứ đều ổn định.', true, 3, 'APPROVED', now() - interval '8 days'
FROM products p
WHERE p.sku = 'TZ-LT-001'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at)
SELECT p.id, 'Lê Tuấn Kiệt', 5, 'Chiến game mát mẻ, fps cao', 'Đã test thử CS2 và Black Myth Wukong trên con Acer Nitro này, tản nhiệt CoolBoost chạy rất êm và hiệu quả. Màn hình 144Hz mượt mà không bị xé hình. 10 điểm cho shop!', true, 15, 'APPROVED', now() - interval '2 days'
FROM products p
WHERE p.sku = 'TZ-LT-002'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at)
SELECT p.id, 'Phạm Quỳnh Nga', 5, 'Thiết kế mỏng nhẹ sang trọng', 'MacBook Air M2 cầm nhẹ tênh mang đi cafe rất tiện. Màn hình Retina sắc nét, loa nghe nhạc rất hay. Mua đợt khuyến mãi giá tốt còn được tặng túi chống sốc cao cấp.', true, 19, 'APPROVED', now() - interval '4 days'
FROM products p
WHERE p.sku = 'TZ-LT-004'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at)
SELECT p.id, 'Đặng Minh Quân', 5, 'Cấu hình khủng, đi dây gọn gàng', 'TechZone lắp ráp PC cực kỳ có tâm, đi dây giấu gọn gàng sạch sẽ. Test thử Render 3D và Premiere Pro xuất video 4K nhanh như chớp. Đáng từng đồng bát gạo!', true, 24, 'APPROVED', now() - interval '1 day'
FROM products p
WHERE p.sku = 'TZ-PC-005'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at)
SELECT p.id, 'Vũ Đức Thịnh', 5, 'Màn hình 4K siêu sắc nét', 'Cổng Type-C 65W vừa xuất hình vừa sạc ngược cho laptop MacBook cực kỳ tiện lợi, chỉ cần 1 cọng cáp là bàn làm việc gọn gàng. Màu sắc chuẩn IPS rực rỡ.', true, 7, 'APPROVED', now() - interval '6 days'
FROM products p
WHERE p.sku = 'TZ-MH-005'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at)
SELECT p.id, 'Nguyễn Hữu Đạt', 5, 'Chuột quốc dân dùng cực bền', 'Logitech G304 pin trâu vô địch, mình dùng 4 tháng rồi chưa phải thay pin. Mắt đọc HERO vẩy súng CS2 cực chuẩn không hề bị delay hay delay tín hiệu.', true, 42, 'APPROVED', now() - interval '10 days'
FROM products p
WHERE p.sku = 'TZ-CH-008'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at)
SELECT p.id, 'Trịnh Công Sơn', 5, 'Gõ rất đầm tay, switch êm', 'Akko switch Cherry Red gõ rất êm và mượt, không bị ồn khi làm việc ban đêm. Keycap PBT dầy dặn không lo mờ chữ. LED RGB nhiều hiệu ứng đẹp mắt.', true, 11, 'APPROVED', now() - interval '7 days'
FROM products p
WHERE p.sku = 'TZ-BP-032'
ON CONFLICT DO NOTHING;

