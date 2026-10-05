CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  flavor TEXT,
  eggless BOOLEAN,
  preparation_time TEXT,
  minimum_advance_notice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (category_id);
CREATE INDEX IF NOT EXISTS products_available_idx ON products (is_available);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products (is_featured);
