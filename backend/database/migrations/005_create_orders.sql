CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('delivery', 'pickup')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_state TEXT,
  delivery_pincode TEXT,
  delivery_instructions TEXT,
  pickup_instructions TEXT,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (total = subtotal + delivery_fee),
  CHECK (
    (fulfillment_type = 'delivery' AND delivery_address IS NOT NULL AND delivery_city IS NOT NULL AND delivery_state IS NOT NULL AND delivery_pincode IS NOT NULL AND pickup_instructions IS NULL)
    OR (fulfillment_type = 'pickup' AND delivery_address IS NULL AND delivery_city IS NULL AND delivery_state IS NULL AND delivery_pincode IS NULL AND delivery_instructions IS NULL)
  )
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10, 2) NOT NULL CHECK (line_total = unit_price * quantity),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_user_created_at_idx ON orders (user_id, created_at DESC);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);

CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_select_own ON orders
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY order_items_select_own ON order_items
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

GRANT SELECT ON orders, order_items TO authenticated;
