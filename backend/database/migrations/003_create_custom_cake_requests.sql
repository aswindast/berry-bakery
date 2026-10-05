CREATE TABLE IF NOT EXISTS custom_cake_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  occasion TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  servings INTEGER NOT NULL CHECK (servings > 0),
  flavor TEXT,
  style_description TEXT NOT NULL,
  cake_message TEXT,
  budget_range TEXT,
  special_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS custom_cake_requests_set_updated_at ON custom_cake_requests;
CREATE TRIGGER custom_cake_requests_set_updated_at
BEFORE UPDATE ON custom_cake_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS custom_cake_requests_status_idx ON custom_cake_requests (status);
CREATE INDEX IF NOT EXISTS custom_cake_requests_created_at_idx ON custom_cake_requests (created_at DESC);
