REVOKE ALL PRIVILEGES ON TABLE orders, order_items FROM anon, authenticated, PUBLIC;
GRANT SELECT ON TABLE orders, order_items TO authenticated;
