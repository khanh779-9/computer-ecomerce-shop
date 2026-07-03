-- ==============================================================================
-- Brands Seed Data
-- ==============================================================================
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
