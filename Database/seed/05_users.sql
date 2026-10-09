-- Internal users seed data
INSERT INTO users (email, password_hash, full_name, phone, membership_tier, points, role) VALUES
('quock@techzone.vn', '$2a$10$0Bb6Qx9ty6F0WcnZa3qJsuKGSBXuVCNGnNN4p9Ffx3oJ.qf0HCuXe', 'Quốc Khánh', '0912345678', 'Vàng', 850, 'ADMIN'),
('ops@techzone.vn', '$2a$10$0Bb6Qx9ty6F0WcnZa3qJsuKGSBXuVCNGnNN4p9Ffx3oJ.qf0HCuXe', 'TechZone Operations', '0900000000', 'Bạc', 0, 'ADMIN')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    membership_tier = EXCLUDED.membership_tier,
    points = EXCLUDED.points,
    role = EXCLUDED.role;

-- External customer seed data
INSERT INTO customers (email, password_hash, full_name, phone, membership_tier, points) VALUES
('customer@techzone.vn', '$2a$10$wNqH.3tP2N0/k3zXv8gNCeJ90K1Xz4aI.R5d7uI2eY3B8M4Q2qT6a', 'Nguyễn Văn An', '0987654321', 'Bạc', 120),
('vip@techzone.vn', '$2a$10$wNqH.3tP2N0/k3zXv8gNCeJ90K1Xz4aI.R5d7uI2eY3B8M4Q2qT6a', 'Trần Minh Đức (VIP)', '0909123456', 'Kim Cương', 3450)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    membership_tier = EXCLUDED.membership_tier,
    points = EXCLUDED.points;
