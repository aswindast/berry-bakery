INSERT INTO categories (name, slug, description, sort_order, is_active)
VALUES
  ('Birthday Cakes', 'birthday-cakes', 'A centrepiece for their day.', 1, TRUE),
  ('Custom Cakes', 'custom-cakes', 'Made around your moment.', 2, TRUE),
  ('Pastries', 'pastries', 'Little layers of joy.', 3, TRUE),
  ('Cupcakes', 'cupcakes', 'Small treats, big smiles.', 4, TRUE),
  ('Brownies', 'brownies', 'Fudgy, rich and generous.', 5, TRUE),
  ('Cookies', 'cookies', 'For the sweet pause.', 6, TRUE),
  ('Desserts', 'desserts', 'A soft landing after dinner.', 7, TRUE),
  ('Sweets', 'sweets', 'A little celebration, anytime.', 8, TRUE),
  ('Seasonal Specials', 'seasonal-specials', 'Limited-time little pleasures.', 9, TRUE),
  ('Other Products', 'other-products', 'More ways to make it sweet.', 10, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO products (name, slug, description, category_id, price, image, is_featured, is_available, flavor, eggless, preparation_time, minimum_advance_notice)
VALUES
  ('Chocolate Truffle Cake', 'chocolate-truffle-cake', 'Deep cocoa sponge with a glossy ganache finish.', (SELECT id FROM categories WHERE slug = 'birthday-cakes'), 850.00, NULL, TRUE, TRUE, 'Dark chocolate', TRUE, '1 day', '24 hours'),
  ('Strawberry Cream Cake', 'strawberry-cream-cake', 'Soft vanilla layers with berry cream and fresh notes.', (SELECT id FROM categories WHERE slug = 'birthday-cakes'), 950.00, NULL, TRUE, TRUE, 'Strawberry and vanilla', NULL, '1 day', '24 hours'),
  ('Red Velvet Cake', 'red-velvet-cake', 'Velvety cocoa crumb with a smooth cream cheese-style finish.', (SELECT id FROM categories WHERE slug = 'birthday-cakes'), 900.00, NULL, TRUE, FALSE, 'Cocoa and vanilla', NULL, '1 day', '48 hours'),
  ('Classic Brownie Box', 'classic-brownie-box', 'A fudgy box for sharing, gifting or keeping close.', (SELECT id FROM categories WHERE slug = 'brownies'), 420.00, NULL, TRUE, TRUE, 'Cocoa', TRUE, 'Same day', '12 hours'),
  ('Vanilla Celebration Cupcakes', 'vanilla-celebration-cupcakes', 'Soft vanilla cupcakes finished for small celebrations.', (SELECT id FROM categories WHERE slug = 'cupcakes'), 480.00, NULL, FALSE, TRUE, 'Vanilla', NULL, 'Same day', '12 hours'),
  ('Berry Pastry Box', 'berry-pastry-box', 'A delicate selection of pastry-sized sweet treats.', (SELECT id FROM categories WHERE slug = 'pastries'), 560.00, NULL, FALSE, TRUE, 'Seasonal berry', NULL, '1 day', '24 hours'),
  ('Butter Cookie Tin', 'butter-cookie-tin', 'A crisp, buttery companion for tea and gifting.', (SELECT id FROM categories WHERE slug = 'cookies'), 360.00, NULL, FALSE, TRUE, 'Butter and vanilla', TRUE, 'Same day', '12 hours'),
  ('Seasonal Sweet Box', 'seasonal-sweet-box', 'A rotating selection for the season’s sweetest occasions.', (SELECT id FROM categories WHERE slug = 'seasonal-specials'), 650.00, NULL, FALSE, FALSE, NULL, NULL, 'By request', '48 hours')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  is_featured = EXCLUDED.is_featured,
  is_available = EXCLUDED.is_available,
  flavor = EXCLUDED.flavor,
  eggless = EXCLUDED.eggless,
  preparation_time = EXCLUDED.preparation_time,
  minimum_advance_notice = EXCLUDED.minimum_advance_notice;
