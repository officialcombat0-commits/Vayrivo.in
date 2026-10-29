import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_PATH = path.resolve(process.cwd(), 'vayrivo_ecommerce.sqlite');

// Ensure db directory or file exists
export const db = new DatabaseSync(DB_PATH);

// Helper for hashing passwords
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_vayrivo_salt_2026').digest('hex');
}

export function initDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT CHECK(role IN ('owner', 'manager', 'staff', 'customer')) NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      tag_line TEXT,
      description TEXT NOT NULL,
      short_description TEXT NOT NULL,
      fragrance_family TEXT NOT NULL,
      gender TEXT NOT NULL DEFAULT 'Unisex',
      concentration TEXT NOT NULL DEFAULT 'Extrait de Parfum',
      top_notes TEXT NOT NULL,
      heart_notes TEXT NOT NULL,
      base_notes TEXT NOT NULL,
      longevity TEXT DEFAULT '12+ Hours',
      sillage TEXT DEFAULT 'Intimate to Moderate',
      category_id TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_bestseller INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      size_ml INTEGER NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      sale_price REAL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT,
      is_primary INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id TEXT PRIMARY KEY,
      variant_id TEXT NOT NULL,
      change_quantity INTEGER NOT NULL,
      movement_type TEXT CHECK(movement_type IN ('sale', 'restock', 'cancellation', 'refund', 'adjustment')) NOT NULL,
      reference_order_id TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shipping_addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      shipping_fee REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT CHECK(payment_method IN ('online_razorpay', 'cod')) NOT NULL,
      payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded')) NOT NULL DEFAULT 'pending',
      order_status TEXT CHECK(order_status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned')) NOT NULL DEFAULT 'Pending',
      tracking_number TEXT,
      courier_name TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT,
      variant_id TEXT,
      historical_product_name TEXT NOT NULL,
      historical_size_ml INTEGER NOT NULL,
      historical_sku TEXT NOT NULL,
      historical_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      gateway TEXT NOT NULL DEFAULT 'razorpay',
      payment_id TEXT,
      transaction_ref TEXT,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      refund_amount REAL DEFAULT 0,
      refund_reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed')) NOT NULL,
      discount_value REAL NOT NULL,
      min_order_amount REAL NOT NULL DEFAULT 0,
      max_discount_amount REAL,
      valid_from TEXT,
      valid_to TEXT,
      usage_limit INTEGER,
      times_used INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      source TEXT DEFAULT 'homepage',
      subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
  `);

  seedDefaultData();
}

function seedDefaultData() {
  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    return;
  }

  console.log('[DB] Seeding default VAYRIVO dataset...');

  // 1. Seed Admin & Staff Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, phone, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('usr-admin-01', 'vayrivo360@gmail.com', hashPassword('12January2009@'), 'Sandeep Kumar', '+91 98200 12345', 'owner');
  insertUser.run('usr-mgr-01', 'manager@vayrivo.com', hashPassword('Manager@2026'), 'Ashkand Yadav', '+91 98200 54321', 'manager');
  insertUser.run('usr-mgr-02', 'surya@vayrivo.com', hashPassword('Manager@2026'), 'Surya Kumar', '+91 98200 67890', 'manager');
  insertUser.run('usr-staff-01', 'staff@vayrivo.com', hashPassword('Staff@2026'), 'Rohan Kapoor', '+91 98200 98765', 'staff');
  insertUser.run('usr-cust-01', 'customer@example.com', hashPassword('Customer@2026'), 'Devika Sen', '+91 98111 22334', 'customer');

  // Customer default address
  db.prepare(`
    INSERT INTO shipping_addresses (id, user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'addr-cust-01',
    'usr-cust-01',
    'Devika Sen',
    '+91 98111 22334',
    'Apartment 14B, The Imperial Towers',
    'Tardeo Road, Haji Ali',
    'Mumbai',
    'Maharashtra',
    '400001',
    1
  );

  // 2. Categories
  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, slug, description, image_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertCategory.run('cat-woody', 'Woody & Smoky', 'woody-smoky', 'Enigmatic, deep resinous and smoked timber notes imbued with royal stature.', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80');
  insertCategory.run('cat-floral', 'Haute Floral', 'haute-floral', 'Intoxicating damask roses, blooming peony, and delicate petals bathed in morning dew.', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80');
  insertCategory.run('cat-oriental', 'Amber & Oriental', 'amber-oriental', 'Opulent Mysore sandalwood, golden amber, Cambodian oud, and rare Arabian saffron.', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80');
  insertCategory.run('cat-fresh', 'Fresh & Aromatic', 'fresh-aromatic', 'Vibrant Mediterranean bergamot, crushed vetiver leaves, and rejuvenating sea breezes.', 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80');

  // 3. Products
  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, name, slug, tag_line, description, short_description, fragrance_family,
      gender, concentration, top_notes, heart_notes, base_notes, longevity, sillage,
      category_id, is_featured, is_bestseller, is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT INTO product_variants (id, product_id, size_ml, sku, price, sale_price, stock_quantity, low_stock_threshold)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImage = db.prepare(`
    INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Product 1: Noir Crown
  insertProduct.run(
    'prd-01',
    'Noir Crown',
    'noir-crown',
    'The Sovereign Darkness of Black Fig and Velvet Woods',
    'An imposing declaration of nocturnal majesty. Noir Crown opens with an intoxicating rush of sun-baked Mediterranean black fig and bergamot peel, swirling seamlessly into a heart of rich steeped black tea, crushed saffron threads, and night-blooming jasmine. As twilight settles, the composition deepens into a commanding base of smoked velvet woods, burnished leather, amber noir, and Madagascar vanilla pod.',
    'Black fig, steeped dark tea, saffron threads, and smoldering velvet woods.',
    'Woody Oriental',
    'Unisex',
    'Extrait de Parfum (30% Concentration)',
    'Black Fig, Italian Bergamot, Bitter Almond',
    'Dark Ceylon Tea, Saffron, Night Jasmine, Cardamom',
    'Velvet Woods, Smoked Amber, Tuscan Leather, Madagascar Vanilla',
    '14+ Hours',
    'Commanding & Intoxicating',
    'cat-woody',
    1,
    1,
    1
  );
  insertVariant.run('var-01-50', 'prd-01', 50, 'VAY-NC-50', 3850, 3450, 42, 5);
  insertVariant.run('var-01-100', 'prd-01', 100, 'VAY-NC-100', 5950, 5450, 28, 5);
  insertImage.run('img-01-1', 'prd-01', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85', 'Noir Crown Luxury Extrait Flacon', 1, 1);
  insertImage.run('img-01-2', 'prd-01', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85', 'Noir Crown Box Packaging and Details', 0, 2);

  // Product 2: Verde Woods
  insertProduct.run(
    'prd-02',
    'Verde Woods',
    'verde-woods',
    'Ancient Emerald Canopies & Resinous Mountain Air',
    'A sanctuary of pristine vitality. Verde Woods captures the untamed spirit of lush emerald groves shrouded in early morning fog. Crushed green cypress leaves, zesty Calabrian bergamot, and iced pink pepper open the olfactory journey. The core unfurls with aromatic clary sage, cracked nutmeg, and crushed juniper needles, before anchoring into venerable Virginian cedarwood, earthy Haitian vetiver, and clean oakmoss.',
    'Crisp green leaves, aromatic spice, cypress needles, and deep cedarwood.',
    'Aromatic Woody',
    'Unisex',
    'Extrait de Parfum (28% Concentration)',
    'Crushed Cypress, Calabrian Bergamot, Green Apple, Pink Pepper',
    'Clary Sage, Nutmeg, Siberian Fir, Juniper Needles',
    'Virginian Cedarwood, Haitian Vetiver, Oakmoss, Ambergris',
    '12+ Hours',
    'Elegant & Enveloping',
    'cat-fresh',
    1,
    0,
    1
  );
  insertVariant.run('var-02-50', 'prd-02', 50, 'VAY-VW-50', 3450, null, 35, 5);
  insertVariant.run('var-02-100', 'prd-02', 100, 'VAY-VW-100', 5400, 4950, 19, 5);
  insertImage.run('img-02-1', 'prd-02', 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1000&q=85', 'Verde Woods Emerald Flacon', 1, 1);
  insertImage.run('img-02-2', 'prd-02', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85', 'Verde Woods Botanical Accents', 0, 2);

  // Product 3: Flora Blush
  insertProduct.run(
    'prd-03',
    'Flora Blush',
    'flora-blush',
    'The Velvet Whispers of Damask Roses & Golden Cashmere',
    'An ethereal sonnet to delicate grandeur. Flora Blush weaves hand-harvested Turkish rose damascena with blushing peonies and sparkling lychee in a vibrant opening. The velvety heart radiates sheer elegance with white magnolia petals and powdery Florentine orris, gently resting upon a cloud of warm Bourbon vanilla, white silk musk, and sun-warmed amber wood.',
    'Hand-picked Turkish rose, blushing peony, silk musk, and warm Bourbon vanilla.',
    'Floral Oriental',
    'Feminine & Unisex',
    'Extrait de Parfum (26% Concentration)',
    'Blush Peony, Turkish Rosewater, Lychee, Pink Peppercorn',
    'Rose Damascena Absolu, White Magnolia, Florentine Orris',
    'Bourbon Vanilla Pod, White Musk, Cashmeran, Sandalwood',
    '11+ Hours',
    'Radiant & Sophisticated',
    'cat-floral',
    1,
    1,
    1
  );
  insertVariant.run('var-03-50', 'prd-03', 50, 'VAY-FB-50', 3600, null, 25, 4);
  insertVariant.run('var-03-100', 'prd-03', 100, 'VAY-FB-100', 5600, 5100, 12, 4);
  insertImage.run('img-03-1', 'prd-03', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85', 'Flora Blush Haute Rose Flacon', 1, 1);
  insertImage.run('img-03-2', 'prd-03', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=85', 'Flora Blush Packaging and Ingredients', 0, 2);

  // Product 4: Aurum Oud
  insertProduct.run(
    'prd-04',
    'Aurum Oud',
    'aurum-oud',
    'Liquid Gold Infused with Smoked Cambodian Agarwood',
    'The pinnacle of royal Indian and Middle Eastern fragrance traditions. Aurum Oud opens with Kashmiri saffron strands dipped in golden bergamot. The core reveals 20-year aged Cambodian agarwood distilled with smoked frankincense and labdanum resin. The drydown leaves a lingering sillage of amber resin, dark cocoa bean, and patchouli.',
    'Rare Kashmiri saffron, Cambodian agarwood, frankincense, and warm golden amber.',
    'Amber Woody',
    'Unisex',
    'Pure Parfum (32% Concentration)',
    'Kashmiri Saffron, Mandarin Zest, Thyme Herb',
    'Smoked Frankincense, Cambodian Agarwood, Rose Petals',
    'Golden Amber Resin, Java Patchouli, Tonka Bean, Leather',
    '16+ Hours',
    'Majestic & Imperial',
    'cat-oriental',
    1,
    0,
    1
  );
  insertVariant.run('var-04-50', 'prd-04', 50, 'VAY-AO-50', 4450, null, 18, 3);
  insertVariant.run('var-04-100', 'prd-04', 100, 'VAY-AO-100', 6950, 6450, 9, 3);
  insertImage.run('img-04-1', 'prd-04', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85', 'Aurum Oud Gold Edition Flacon', 1, 1);

  // Product 5: Royal Santal
  insertProduct.run(
    'prd-05',
    'Royal Santal',
    'royal-santal',
    'The Timeless Sovereignty of Aged Mysore Sandalwood',
    'Honoring the sacred heritage of pure Mysore sandalwood. This creation pairs creamy, lactonic sandalwood with warm cardamom pods, crushed coriander seed, and sweet tonka. A base of velvety cedar, benzoin tears, and musk completes this serene, aristocratic fragrance.',
    'Sacred Mysore sandalwood, green cardamom, tonka bean, and benzoin.',
    'Warm Woody',
    'Unisex',
    'Extrait de Parfum (28% Concentration)',
    'Green Cardamom, Italian Lemon, Coriander Seed',
    'Mysore Sandalwood Heart, Violet Leaf, Papyrus',
    'Aged Sandalwood, Tonka Bean, Siam Benzoin, White Cedar',
    '13+ Hours',
    'Serene & Aristocratic',
    'cat-woody',
    0,
    1,
    1
  );
  insertVariant.run('var-05-50', 'prd-05', 50, 'VAY-RS-50', 3950, null, 22, 4);
  insertVariant.run('var-05-100', 'prd-05', 100, 'VAY-RS-100', 6200, 5800, 14, 4);
  insertImage.run('img-05-1', 'prd-05', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85', 'Royal Santal Perfume', 1, 1);

  // 4. Coupons
  const insertCoupon = db.prepare(`
    INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertCoupon.run('cpn-01', 'VAYRIVO10', 'percentage', 10, 2000, 1000, 1);
  insertCoupon.run('cpn-02', 'ROYAL15', 'percentage', 15, 5000, 2000, 1);
  insertCoupon.run('cpn-03', 'FIRSTSCENT', 'fixed', 500, 3000, null, 1);

  // 5. Sample Initial Orders
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, user_id, customer_name, customer_email, customer_phone,
      shipping_address_json, subtotal, discount_amount, shipping_fee, tax_amount,
      total_amount, payment_method, payment_status, order_status, tracking_number,
      courier_name, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, variant_id, historical_product_name, historical_size_ml,
      historical_sku, historical_price, quantity, subtotal
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleAddress = JSON.stringify({
    full_name: 'Devika Sen',
    phone: '+91 98111 22334',
    address_line1: 'Apartment 14B, The Imperial Towers',
    address_line2: 'Tardeo Road, Haji Ali',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  });

  // Order 1: Delivered
  insertOrder.run(
    'ord-01',
    'VAY-2026-8901',
    'usr-cust-01',
    'Devika Sen',
    'customer@example.com',
    '+91 98111 22334',
    sampleAddress,
    5450,
    545,
    0,
    0,
    4905,
    'online_razorpay',
    'paid',
    'Delivered',
    'BLUEDART-88291039',
    'Blue Dart Express',
    '2026-10-20 14:32:00'
  );
  insertOrderItem.run('item-01', 'ord-01', 'prd-01', 'var-01-100', 'Noir Crown (100ml Extrait)', 100, 'VAY-NC-100', 5450, 1, 5450);

  // Order 2: Processing
  insertOrder.run(
    'ord-02',
    'VAY-2026-8902',
    'usr-cust-01',
    'Devika Sen',
    'customer@example.com',
    '+91 98111 22334',
    sampleAddress,
    3450,
    0,
    0,
    0,
    3450,
    'online_razorpay',
    'paid',
    'Processing',
    'DELHIVERY-7740192',
    'Delhivery Surface',
    '2026-10-28 10:15:00'
  );
  insertOrderItem.run('item-02', 'ord-02', 'prd-02', 'var-02-50', 'Verde Woods (50ml Extrait)', 50, 'VAY-VW-50', 3450, 1, 3450);

  // 6. Site Settings
  const insertSetting = db.prepare(`INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)`);
  insertSetting.run('brand_name', 'VAYRIVO');
  insertSetting.run('brand_tagline', 'Your Scent. Your Signature.');
  insertSetting.run('announcement_bar', 'Complimentary Luxury Miniature (10ml) with every 100ml bottle | Free Insured Shipping Across India on orders above ₹2,000');
  insertSetting.run('shipping_fee', '0');
  insertSetting.run('standard_shipping_enabled', 'false');
  insertSetting.run('free_shipping_threshold', '2000');
  insertSetting.run('cod_available', 'true');
  insertSetting.run('cod_fee', '50');
  insertSetting.run('tax_rate_percent', '1');
  insertSetting.run('tax_inclusive', 'true');
  insertSetting.run('currency_symbol', '₹');
  insertSetting.run('currency_code', 'INR');
  insertSetting.run('support_email', 'concierge@vayrivo.com');
  insertSetting.run('support_phone', '+91 98200 12345');
  insertSetting.run('boutique_address', 'Boutique VAYRIVO, The Heritage Galleria, Colaba, Mumbai 400001, India');
  insertSetting.run('razorpay_test_mode', 'true');
  insertSetting.run('razorpay_key_id', 'rzp_test_VayrivoOfficial2026');

  // Initial audit log
  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_id, admin_email, action, entity_type, entity_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'log-init',
    'usr-admin-01',
    'admin@vayrivo.com',
    'SYSTEM_BOOTSTRAP',
    'database',
    'all',
    JSON.stringify({ message: 'Initialized VAYRIVO Haute Parfumerie store and database.' })
  );

  console.log('[DB] Seeding completed successfully.');
}
