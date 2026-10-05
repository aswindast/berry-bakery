ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_cake_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_cake_reference_images ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE categories, products, custom_cake_requests, custom_cake_reference_images FROM anon, authenticated, PUBLIC;
