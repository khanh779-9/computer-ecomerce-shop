-- Customer-owned data, warranty tracking, and normalized product media.

CREATE TABLE IF NOT EXISTS customer_addresses (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    label VARCHAR(40) NOT NULL DEFAULT 'Nhà riêng',
    recipient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line TEXT NOT NULL,
    province VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);

CREATE TABLE IF NOT EXISTS product_serials (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    serial_number VARCHAR(120) NOT NULL UNIQUE,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_serials_customer ON product_serials(customer_id);

CREATE TABLE IF NOT EXISTS warranties (
    id BIGSERIAL PRIMARY KEY,
    serial_id BIGINT NOT NULL UNIQUE REFERENCES product_serials(id) ON DELETE CASCADE,
    warranty_months INT NOT NULL DEFAULT 12,
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);

CREATE TABLE IF NOT EXISTS warranty_claims (
    id BIGSERIAL PRIMARY KEY,
    warranty_id BIGINT NOT NULL REFERENCES warranties(id) ON DELETE CASCADE,
    rma_code VARCHAR(80) NOT NULL UNIQUE,
    issue TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_rma ON warranty_claims(rma_code);

CREATE TABLE IF NOT EXISTS warranty_repair_events (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES warranty_claims(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (claim_id, step_order)
);

ALTER TABLE product_images ADD COLUMN IF NOT EXISTS object_key VARCHAR(500);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS alt_text VARCHAR(255);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
