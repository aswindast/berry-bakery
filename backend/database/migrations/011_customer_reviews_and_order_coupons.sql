ALTER TABLE coupons
  ADD COLUMN maximum_discount_amount NUMERIC(10, 2) CHECK (maximum_discount_amount IS NULL OR maximum_discount_amount > 0);

ALTER TABLE orders
  ADD COLUMN coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  ADD COLUMN coupon_code_snapshot TEXT,
  ADD COLUMN discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0 AND discount_amount <= subtotal);

DO $$
DECLARE
  existing_constraint RECORD;
BEGIN
  FOR existing_constraint IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%total = (subtotal + delivery_fee)%'
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', existing_constraint.conname);
  END LOOP;
END;
$$;

ALTER TABLE orders
  ADD CONSTRAINT orders_total_after_discount_check
  CHECK (total = subtotal + delivery_fee - discount_amount);

ALTER TABLE order_items
  ADD COLUMN review_submitted_at TIMESTAMPTZ;

ALTER TABLE reviews
  ALTER COLUMN title DROP NOT NULL,
  DROP CONSTRAINT reviews_title_check,
  ADD COLUMN order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  ADD COLUMN order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  ADD CONSTRAINT reviews_optional_title_check CHECK (title IS NULL OR length(trim(title)) BETWEEN 2 AND 120);

CREATE UNIQUE INDEX reviews_one_per_order_item_idx ON reviews (order_item_id) WHERE order_item_id IS NOT NULL;
CREATE INDEX reviews_product_approved_created_idx ON reviews (product_id, created_at DESC) WHERE status = 'approved';
CREATE INDEX orders_coupon_id_idx ON orders (coupon_id) WHERE coupon_id IS NOT NULL;
