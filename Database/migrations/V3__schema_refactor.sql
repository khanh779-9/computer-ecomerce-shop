-- ==============================================================================
-- TechZone Computer - schema refactor
-- Safe to run repeatedly against an existing PostgreSQL database.
-- ==============================================================================

-- Product image records used to be stored with object_key only. Keep that
-- value for MinIO cleanup while exposing the public URL used by the API.
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS object_key VARCHAR(500);
UPDATE product_images
SET image_url = object_key
WHERE image_url IS NULL AND object_key IS NOT NULL;

-- Orders are updated by the internal status-management screen.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
UPDATE orders SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE orders ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE orders ALTER COLUMN updated_at SET NOT NULL;

-- Keep cart timestamps usable for existing rows and future inserts.
ALTER TABLE carts ALTER COLUMN updated_at SET DEFAULT now();
UPDATE carts SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE carts ALTER COLUMN updated_at SET NOT NULL;

-- These columns are required by the current JPA entities and repositories.
UPDATE categories
SET slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR trim(slug) = '';
ALTER TABLE categories ALTER COLUMN slug SET NOT NULL;

UPDATE brands
SET slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR trim(slug) = '';
ALTER TABLE brands ALTER COLUMN slug SET NOT NULL;

UPDATE reviews SET content = '' WHERE content IS NULL;
ALTER TABLE reviews ALTER COLUMN content SET NOT NULL;

-- Customer-owned records must point at the separated customers table.
UPDATE wishlists w
SET customer_id = c.id
FROM customers c
WHERE w.customer_id IS NULL AND w.user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = w.user_id AND u.email = c.email
  );

UPDATE carts ca
SET customer_id = c.id
FROM customers c
WHERE ca.customer_id IS NULL AND ca.user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = ca.user_id AND u.email = c.email
  );

UPDATE orders o
SET customer_id = c.id
FROM customers c
WHERE o.customer_id IS NULL AND o.user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = o.user_id AND u.email = c.email
  );

UPDATE reviews r
SET customer_id = c.id
FROM customers c
WHERE r.customer_id IS NULL AND r.user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = r.user_id AND u.email = c.email
  );

ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlists_customer_id_fkey;
ALTER TABLE wishlists
    ADD CONSTRAINT wishlists_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_wishlists_customer_id ON wishlists(customer_id);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE orders
    ADD CONSTRAINT orders_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_customer_id_fkey;
ALTER TABLE reviews
    ADD CONSTRAINT reviews_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);

ALTER TABLE carts DROP CONSTRAINT IF EXISTS carts_customer_id_fkey;
ALTER TABLE carts
    ADD CONSTRAINT carts_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id);

-- Product image URLs may be unavailable for old records; keep those rows
-- valid until the storage service has a chance to replace them.
