ALTER TABLE orders
  DROP CONSTRAINT orders_payment_status_check,
  ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'failed')),
  ADD COLUMN payment_provider TEXT CHECK (payment_provider IS NULL OR payment_provider = 'razorpay'),
  ADD COLUMN razorpay_order_id TEXT,
  ADD COLUMN razorpay_payment_id TEXT,
  ADD COLUMN paid_at TIMESTAMPTZ;

CREATE UNIQUE INDEX orders_razorpay_order_id_unique_idx ON orders (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE UNIQUE INDEX orders_razorpay_payment_id_unique_idx ON orders (razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

ALTER TABLE orders
  ADD CONSTRAINT orders_paid_payment_details_check
  CHECK (payment_status <> 'paid' OR (payment_provider = 'razorpay' AND razorpay_order_id IS NOT NULL AND razorpay_payment_id IS NOT NULL AND paid_at IS NOT NULL));
