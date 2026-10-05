CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9_-]{3,40}$'),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  minimum_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (minimum_order_value >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (starts_at < expires_at),
  CHECK (discount_type <> 'percentage' OR discount_value <= 100)
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 2 AND 120),
  body TEXT NOT NULL CHECK (length(trim(body)) BETWEEN 10 AND 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX coupons_active_dates_idx ON coupons (is_active, starts_at, expires_at);
CREATE INDEX reviews_status_created_idx ON reviews (status, created_at DESC);

CREATE TRIGGER coupons_set_updated_at
BEFORE UPDATE ON coupons
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER reviews_set_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE admin_users, coupons, reviews FROM anon, authenticated, PUBLIC;

CREATE TABLE business_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bakery_name TEXT NOT NULL CHECK (length(trim(bakery_name)) BETWEEN 2 AND 120),
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  location TEXT,
  business_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivery_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  pickup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(social_links) = 'array'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE business_settings FROM anon, authenticated, PUBLIC;