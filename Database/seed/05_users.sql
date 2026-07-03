-- ==============================================================================
-- Users Seed Data (Admin & Customer Profiles)
-- ==============================================================================
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
