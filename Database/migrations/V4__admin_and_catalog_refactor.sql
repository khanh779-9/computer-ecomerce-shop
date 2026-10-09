-- ==============================================================================
-- TechZone Computer - admin and normalized catalog foundation
-- ==============================================================================

CREATE TABLE IF NOT EXISTS manufacturers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    website VARCHAR(500),
    contact_email VARCHAR(255),
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id BIGINT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id BIGINT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer_id BIGINT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_months INT NOT NULL DEFAULT 12;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE p.brand_id IS NULL AND lower(trim(p.brand)) = lower(b.name);

UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category_id IS NULL AND lower(trim(p.category)) = lower(c.name);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_brand_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_brand_id_fkey
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_manufacturer_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_manufacturer_id_fkey
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer_id ON products(manufacturer_id);

ALTER TABLE product_images ADD COLUMN IF NOT EXISTS alt_text VARCHAR(255);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(120) NOT NULL UNIQUE,
    setting_value TEXT,
    value_type VARCHAR(20) NOT NULL DEFAULT 'STRING',
    description VARCHAR(500),
    is_public BOOLEAN NOT NULL DEFAULT false,
    updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    audience VARCHAR(20) NOT NULL CHECK (audience IN ('CUSTOMER', 'INTERNAL', 'ALL')),
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id BIGINT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
