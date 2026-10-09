-- Keep the runtime database initializer aligned with Database/migrations/V3.
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS object_key VARCHAR(500);
UPDATE product_images SET image_url = object_key WHERE image_url IS NULL AND object_key IS NOT NULL;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
UPDATE orders SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE orders ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE orders ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE carts ALTER COLUMN updated_at SET DEFAULT now();
UPDATE carts SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE carts ALTER COLUMN updated_at SET NOT NULL;

UPDATE reviews SET content = '' WHERE content IS NULL;
ALTER TABLE reviews ALTER COLUMN content SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_customer_id ON wishlists(customer_id);
