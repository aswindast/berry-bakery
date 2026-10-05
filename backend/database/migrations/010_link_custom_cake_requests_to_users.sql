ALTER TABLE custom_cake_requests
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX custom_cake_requests_user_created_idx
ON custom_cake_requests (user_id, created_at DESC);
