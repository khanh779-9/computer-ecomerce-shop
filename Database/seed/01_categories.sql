-- ==============================================================================
-- Categories Seed Data
-- ==============================================================================
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
