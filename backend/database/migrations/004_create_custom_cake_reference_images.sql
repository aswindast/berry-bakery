CREATE TABLE IF NOT EXISTS custom_cake_reference_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_cake_request_id UUID NOT NULL REFERENCES custom_cake_requests(id) ON UPDATE CASCADE ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS custom_cake_reference_images_request_id_idx
ON custom_cake_reference_images (custom_cake_request_id);
