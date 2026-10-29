import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import { db, initDatabase, hashPassword } from './src/server/db.ts';
import { lookupPinCode } from './src/server/pincodes.ts';

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Initialize SQLite database
initDatabase();

app.use(express.json());

// --- Simple Token/Session Helper ---
// Generates a stateless signed authorization token containing userId, email, and role
const SECRET_KEY = 'vayrivo_haute_parfumerie_secret_token_2026';

function signToken(payload: { userId: string; email: string; role: string; fullName: string }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyToken(token?: string): { userId: string; email: string; role: string; fullName: string } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  if (signature !== expectedSignature) return null;
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

// Authentication middleware
function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyToken(token);
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user || !['owner', 'manager', 'staff'].includes(user.role)) {
    return res.status(403).json({ error: 'Access forbidden. Administrative privileges required.' });
  }
  (req as any).user = user;
  next();
}

function logAdminAction(adminEmail: string, adminId: string, action: string, entityType: string, entityId: string | null, details: any) {
  try {
    db.prepare(`
      INSERT INTO admin_audit_logs (id, admin_id, admin_email, action, entity_type, entity_id, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'log-' + crypto.randomUUID(),
      adminId,
      adminEmail,
      action,
      entityType,
      entityId,
      JSON.stringify(details)
    );
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const hashedPassword = hashPassword(password);
  const user = db.prepare('SELECT id, email, full_name, phone, role FROM users WHERE email = ? AND password_hash = ?').get(email.trim().toLowerCase(), hashedPassword) as any;

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.role,
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName, phone } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Full name, email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const userId = 'usr-' + crypto.randomUUID().slice(0, 8);
  const hashedPassword = hashPassword(password);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, phone, role)
    VALUES (?, ?, ?, ?, ?, 'customer')
  `).run(userId, cleanEmail, hashedPassword, fullName.trim(), phone || '');

  const token = signToken({
    userId,
    email: cleanEmail,
    role: 'customer',
    fullName: fullName.trim(),
  });

  return res.status(201).json({
    token,
    user: {
      id: userId,
      email: cleanEmail,
      fullName: fullName.trim(),
      phone: phone || '',
      role: 'customer',
    },
  });
});

app.get('/api/auth/me', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = db.prepare('SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?').get(authUser.userId) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const addresses = db.prepare('SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(authUser.userId);

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
    },
    addresses,
  });
});

app.post('/api/auth/addresses', requireAuth, (req, res) => {
  const user = (req as any).user;
  const { fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

  if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
    return res.status(400).json({ error: 'All primary address fields are required' });
  }

  if (isDefault) {
    db.prepare('UPDATE shipping_addresses SET is_default = 0 WHERE user_id = ?').run(user.userId);
  }

  const id = 'addr-' + crypto.randomUUID().slice(0, 8);
  db.prepare(`
    INSERT INTO shipping_addresses (id, user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, user.userId, fullName, phone, addressLine1, addressLine2 || '', city, state, pincode, isDefault ? 1 : 0);

  const addresses = db.prepare('SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY is_default DESC').all(user.userId);
  return res.json({ addresses });
});

// ==========================================
// 2. PRODUCT & CATALOG ENDPOINTS (PUBLIC)
// ==========================================

app.get('/api/products', (req, res) => {
  const { category, search, family, featured, bestseller, sort } = req.query;

  let query = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_published = 1
  `;
  const params: any[] = [];

  if (category) {
    query += ` AND c.slug = ?`;
    params.push(category);
  }

  if (family) {
    query += ` AND p.fragrance_family LIKE ?`;
    params.push(`%${family}%`);
  }

  if (featured === 'true') {
    query += ` AND p.is_featured = 1`;
  }

  if (bestseller === 'true') {
    query += ` AND p.is_bestseller = 1`;
  }

  if (search) {
    query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.top_notes LIKE ? OR p.heart_notes LIKE ? OR p.base_notes LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  // Sorting
  if (sort === 'price-asc' || sort === 'price-desc') {
    // will sort after grouping with variant prices
  } else if (sort === 'name-asc') {
    query += ` ORDER BY p.name ASC`;
  } else {
    query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
  }

  const products = db.prepare(query).all(...params) as any[];

  // Attach variants and images to each product
  const getVariants = db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY size_ml ASC');
  const getImages = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC');

  const detailedProducts = products.map((p) => {
    const variants = getVariants.all(p.id) as any[];
    const images = getImages.all(p.id) as any[];
    const minPrice = variants.length > 0 ? Math.min(...variants.map((v) => v.sale_price || v.price)) : 0;
    const maxPrice = variants.length > 0 ? Math.max(...variants.map((v) => v.price)) : 0;
    const totalStock = variants.reduce((acc, v) => acc + v.stock_quantity, 0);

    return {
      ...p,
      variants,
      images,
      minPrice,
      maxPrice,
      totalStock,
      inStock: totalStock > 0,
    };
  });

  if (sort === 'price-asc') {
    detailedProducts.sort((a, b) => a.minPrice - b.minPrice);
  } else if (sort === 'price-desc') {
    detailedProducts.sort((a, b) => b.minPrice - a.minPrice);
  }

  return res.json(detailedProducts);
});

app.get('/api/products/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE (p.slug = ? OR p.id = ?) AND p.is_published = 1
  `).get(slugOrId, slugOrId) as any;

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY size_ml ASC').all(product.id);
  const images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC').all(product.id);

  return res.json({
    ...product,
    variants,
    images,
  });
});

app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  return res.json(categories);
});

// Indian PIN code lookup
app.post('/api/validate-pincode', (req, res) => {
  const { pincode } = req.body;
  if (!pincode) {
    return res.status(400).json({ error: 'PIN code is required' });
  }
  const result = lookupPinCode(String(pincode));
  if (!result) {
    return res.status(400).json({ error: 'Invalid 6-digit Indian PIN code' });
  }
  return res.json(result);
});

// Coupon verification
app.post('/api/coupons/validate', (req, res) => {
  const { code, cartSubtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required' });
  }

  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code.trim().toUpperCase()) as any;
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired promotional code' });
  }

  const subtotal = Number(cartSubtotal || 0);
  if (subtotal < coupon.min_order_amount) {
    return res.status(400).json({
      error: `This code requires a minimum order value of ₹${coupon.min_order_amount.toLocaleString('en-IN')}`,
    });
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (subtotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  } else {
    discount = coupon.discount_value;
  }

  return res.json({
    code: coupon.code,
    discountAmount: Math.round(discount),
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
  });
});

// ==========================================
// 3. ORDER CREATION & TRACKING
// ==========================================

app.post('/api/orders', (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items, // array of { variantId, quantity }
    couponCode,
    paymentMethod, // 'online_razorpay' or 'cod'
  } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  // Validate Indian PIN code
  const pinCheck = lookupPinCode(shippingAddress.pincode);
  if (!pinCheck || !pinCheck.serviceable) {
    return res.status(400).json({ error: 'Delivery address PIN code is not serviceable' });
  }

  if (paymentMethod === 'cod' && !pinCheck.codAvailable) {
    return res.status(400).json({ error: 'Cash on Delivery is unavailable for this delivery location' });
  }

  // Calculate pricing & verify stock
  let subtotal = 0;
  const processedItems: any[] = [];

  for (const item of items) {
    const variant = db.prepare(`
      SELECT v.*, p.name as product_name
      FROM product_variants v
      JOIN products p ON v.product_id = p.id
      WHERE v.id = ?
    `).get(item.variantId) as any;

    if (!variant) {
      return res.status(404).json({ error: `Product variant not found: ${item.variantId}` });
    }

    if (variant.stock_quantity < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for ${variant.product_name} (${variant.size_ml}ml). Only ${variant.stock_quantity} remaining.`,
      });
    }

    const price = variant.sale_price ? variant.sale_price : variant.price;
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;

    processedItems.push({
      variantId: variant.id,
      productId: variant.product_id,
      productName: `${variant.product_name} (${variant.size_ml}ml Extrait)`,
      sizeMl: variant.size_ml,
      sku: variant.sku,
      unitPrice: price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  // Apply Coupon if any
  let discountAmount = 0;
  if (couponCode) {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(couponCode.trim().toUpperCase()) as any;
    if (coupon && subtotal >= coupon.min_order_amount) {
      if (coupon.discount_type === 'percentage') {
        discountAmount = (subtotal * coupon.discount_value) / 100;
        if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
          discountAmount = coupon.max_discount_amount;
        }
      } else {
        discountAmount = coupon.discount_value;
      }
      discountAmount = Math.round(discountAmount);
      // Increment coupon usage
      db.prepare('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?').run(coupon.id);
    }
  }

  // Dynamic Shipping & Tax calculation from site_settings
  const settingsRows = db.prepare('SELECT key, value FROM site_settings').all() as any[];
  const settings: Record<string, string> = {};
  for (const s of settingsRows) settings[s.key] = s.value;

  const freeThreshold = Number(settings.free_shipping_threshold || 2000);
  const isShippingEnabled = settings.standard_shipping_enabled === 'true';
  const baseShippingFee = isShippingEnabled ? Number(settings.shipping_fee || 0) : 0;
  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = netSubtotal >= freeThreshold ? 0 : baseShippingFee;

  const codFee = (paymentMethod === 'cod' && settings.cod_available !== 'false') ? Number(settings.cod_fee || 50) : 0;
  const totalAmount = netSubtotal + shippingFee + codFee;
  const taxRate = Number(settings.tax_rate_percent || 1);
  const taxAmount = Math.round((totalAmount * taxRate) / (100 + taxRate));

  // Generate Unique Luxury Order Number
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `VAY-2026-${randomSuffix}`;
  const orderId = 'ord-' + crypto.randomUUID().slice(0, 8);

  const authUser = getAuthUser(req);
  const userId = authUser ? authUser.userId : null;

  // Transaction: Create order, order items, deduct stock, record inventory movement
  try {
    db.prepare(`
      INSERT INTO orders (
        id, order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address_json, subtotal, discount_amount, shipping_fee, tax_amount,
        total_amount, payment_method, payment_status, order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      orderNumber,
      userId,
      customerName.trim(),
      customerEmail.trim(),
      customerPhone.trim(),
      JSON.stringify(shippingAddress),
      subtotal,
      discountAmount,
      shippingFee + codFee,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentMethod === 'online_razorpay' ? 'paid' : 'pending',
      'Confirmed'
    );

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, variant_id, historical_product_name, historical_size_ml,
        historical_sku, historical_price, quantity, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const deductStock = db.prepare(`
      UPDATE product_variants
      SET stock_quantity = stock_quantity - ?
      WHERE id = ?
    `);

    const recordMovement = db.prepare(`
      INSERT INTO inventory_movements (id, variant_id, change_quantity, movement_type, reference_order_id, note)
      VALUES (?, ?, ?, 'sale', ?, ?)
    `);

    for (const item of processedItems) {
      insertOrderItem.run(
        'item-' + crypto.randomUUID().slice(0, 8),
        orderId,
        item.productId,
        item.variantId,
        item.productName,
        item.sizeMl,
        item.sku,
        item.unitPrice,
        item.quantity,
        item.subtotal
      );

      deductStock.run(item.quantity, item.variantId);

      recordMovement.run(
        'mov-' + crypto.randomUUID().slice(0, 8),
        item.variantId,
        -item.quantity,
        orderId,
        `Customer Purchase ${orderNumber}`
      );
    }

    // Record payment entry
    if (paymentMethod === 'online_razorpay') {
      db.prepare(`
        INSERT INTO payments (id, order_id, gateway, payment_id, transaction_ref, amount, status)
        VALUES (?, ?, 'razorpay', ?, ?, ?, 'success')
      `).run(
        'pay-' + crypto.randomUUID().slice(0, 8),
        orderId,
        'pay_rzp_' + Math.random().toString(36).substring(2, 10),
        'order_rzp_' + Math.random().toString(36).substring(2, 10),
        totalAmount
      );
    }

    return res.status(201).json({
      orderId,
      orderNumber,
      totalAmount,
      subtotal,
      discountAmount,
      shippingFee: shippingFee + codFee,
      orderStatus: 'Confirmed',
      paymentStatus: paymentMethod === 'online_razorpay' ? 'paid' : 'pending',
      paymentMethod,
      customerEmail,
      items: processedItems,
      shippingAddress,
      estimatedDelivery: `${pinCheck.estimatedDays} - ${pinCheck.estimatedDays + 2} Business Days`,
    });
  } catch (err: any) {
    console.error('Order creation failure:', err);
    return res.status(500).json({ error: 'Failed to process order. ' + err.message });
  }
});

// View order status / invoice by Order Number
app.get('/api/orders/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;
  const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as any;

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(order.id);

  return res.json({
    ...order,
    shippingAddress: JSON.parse(order.shipping_address_json),
    items,
    payment,
  });
});

// Customer's order list
app.get('/api/my-orders', requireAuth, (req, res) => {
  const user = (req as any).user;
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.userId) as any[];

  const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

  const detailedOrders = orders.map((o) => ({
    ...o,
    shippingAddress: JSON.parse(o.shipping_address_json),
    items: getItems.all(o.id),
  }));

  return res.json(detailedOrders);
});

// Newsletter subscription
app.post('/api/subscribers', (req, res) => {
  const { email, source } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  try {
    db.prepare('INSERT OR IGNORE INTO newsletter_subscribers (id, email, source) VALUES (?, ?, ?)').run(
      'sub-' + crypto.randomUUID().slice(0, 8),
      email.trim().toLowerCase(),
      source || 'homepage'
    );
    return res.json({
      success: true,
      message: 'Welcome to the inner circle of VAYRIVO Haute Parfumerie.',
      promoCode: 'FIRSTSCENT',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Store Settings (Public)
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as any[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return res.json(settings);
});

// ==========================================
// 4. ADMIN PANEL ENDPOINTS
// ==========================================

// Dashboard Metrics
app.get('/api/admin/metrics', requireAdmin, (req, res) => {
  const totalOrders = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as any).c;
  const totalSales = (db.prepare("SELECT COALESCE(SUM(total_amount), 0) as s FROM orders WHERE order_status != 'Cancelled'").get() as any).s;
  const totalCustomers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get() as any).c;
  const totalProducts = (db.prepare('SELECT COUNT(*) as c FROM products').get() as any).c;

  // Order counts by status
  const ordersByStatus = db.prepare('SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status').all() as any[];

  // Low stock count
  const lowStockCount = (db.prepare('SELECT COUNT(*) as c FROM product_variants WHERE stock_quantity <= low_stock_threshold').get() as any).c;

  // Today's sales & count
  const todaySales = (db.prepare("SELECT COALESCE(SUM(total_amount), 0) as s, COUNT(*) as c FROM orders WHERE date(created_at) = date('now') AND order_status != 'Cancelled'").get() as any);

  // Recent 5 orders
  const recentOrders = db.prepare(`
    SELECT id, order_number, customer_name, total_amount, order_status, payment_status, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 6
  `).all();

  return res.json({
    totalOrders,
    totalSales,
    totalCustomers,
    totalProducts,
    lowStockCount,
    todaySales: todaySales.s,
    todayOrderCount: todaySales.c,
    ordersByStatus,
    recentOrders,
  });
});

// All Products for Admin
app.get('/api/admin/products', requireAdmin, (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `).all() as any[];

  const getVariants = db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY size_ml ASC');
  const getImages = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC');

  const completeProducts = products.map((p) => {
    const variants = getVariants.all(p.id) as any[];
    const images = getImages.all(p.id) as any[];
    const minPrice = variants.length > 0 ? Math.min(...variants.map((v) => v.sale_price || v.price)) : 0;
    const maxPrice = variants.length > 0 ? Math.max(...variants.map((v) => v.price)) : 0;
    const totalStock = variants.reduce((acc, v) => acc + v.stock_quantity, 0);

    return {
      ...p,
      variants,
      images,
      minPrice,
      maxPrice,
      totalStock,
      inStock: totalStock > 0,
    };
  });

  return res.json(completeProducts);
});

// Create Product
app.post('/api/admin/products', requireAdmin, (req, res) => {
  const admin = (req as any).user;
  const {
    name,
    tagLine,
    description,
    shortDescription,
    fragranceFamily,
    gender,
    concentration,
    topNotes,
    heartNotes,
    baseNotes,
    longevity,
    sillage,
    categoryId,
    isFeatured,
    isBestseller,
    isPublished,
    variants, // array of { size_ml, sku, price, sale_price, stock_quantity, low_stock_threshold }
    images, // array of { image_url, alt_text, is_primary }
  } = req.body;

  if (!name || !description || !topNotes || !heartNotes || !baseNotes) {
    return res.status(400).json({ error: 'Name, description, and fragrance pyramid notes are required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);
  const productId = 'prd-' + crypto.randomUUID().slice(0, 8);

  db.prepare(`
    INSERT INTO products (
      id, name, slug, tag_line, description, short_description, fragrance_family,
      gender, concentration, top_notes, heart_notes, base_notes, longevity, sillage,
      category_id, is_featured, is_bestseller, is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    productId,
    name.trim(),
    slug,
    tagLine || '',
    description,
    shortDescription || description.slice(0, 120),
    fragranceFamily || 'Woody Oriental',
    gender || 'Unisex',
    concentration || 'Extrait de Parfum',
    topNotes,
    heartNotes,
    baseNotes,
    longevity || '12+ Hours',
    sillage || 'Intimate to Moderate',
    categoryId || null,
    isFeatured ? 1 : 0,
    isBestseller ? 1 : 0,
    isPublished !== false ? 1 : 0
  );

  // Insert variants
  if (variants && Array.isArray(variants)) {
    const insertVariant = db.prepare(`
      INSERT INTO product_variants (id, product_id, size_ml, sku, price, sale_price, stock_quantity, low_stock_threshold)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of variants) {
      insertVariant.run(
        'var-' + crypto.randomUUID().slice(0, 8),
        productId,
        Number(v.size_ml || 50),
        v.sku || `VAY-${productId.slice(-4)}-${v.size_ml}`,
        Number(v.price),
        v.sale_price ? Number(v.sale_price) : null,
        Number(v.stock_quantity || 0),
        Number(v.low_stock_threshold || 5)
      );
    }
  }

  // Insert images
  if (images && Array.isArray(images)) {
    const insertImage = db.prepare(`
      INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    images.forEach((img, idx) => {
      insertImage.run(
        'img-' + crypto.randomUUID().slice(0, 8),
        productId,
        img.image_url,
        img.alt_text || name,
        img.is_primary ? 1 : (idx === 0 ? 1 : 0),
        idx
      );
    });
  }

  logAdminAction(admin.email, admin.userId, 'CREATE_PRODUCT', 'product', productId, { name });

  return res.status(201).json({ id: productId, message: 'Product created successfully' });
});

// Update Product
app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const admin = (req as any).user;
  const { id } = req.params;
  const {
    name,
    tagLine,
    description,
    shortDescription,
    fragranceFamily,
    gender,
    concentration,
    topNotes,
    heartNotes,
    baseNotes,
    longevity,
    sillage,
    categoryId,
    isFeatured,
    isBestseller,
    isPublished,
    variants,
    images,
  } = req.body;

  db.prepare(`
    UPDATE products SET
      name = ?, tag_line = ?, description = ?, short_description = ?, fragrance_family = ?,
      gender = ?, concentration = ?, top_notes = ?, heart_notes = ?, base_notes = ?,
      longevity = ?, sillage = ?, category_id = ?, is_featured = ?, is_bestseller = ?,
      is_published = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name,
    tagLine,
    description,
    shortDescription,
    fragranceFamily,
    gender,
    concentration,
    topNotes,
    heartNotes,
    baseNotes,
    longevity,
    sillage,
    categoryId || null,
    isFeatured ? 1 : 0,
    isBestseller ? 1 : 0,
    isPublished ? 1 : 0,
    id
  );

  // Update variants if provided
  if (variants && Array.isArray(variants)) {
    db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
    const insertVariant = db.prepare(`
      INSERT INTO product_variants (id, product_id, size_ml, sku, price, sale_price, stock_quantity, low_stock_threshold)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of variants) {
      insertVariant.run(
        v.id || ('var-' + crypto.randomUUID().slice(0, 8)),
        id,
        Number(v.size_ml),
        v.sku,
        Number(v.price),
        v.sale_price ? Number(v.sale_price) : null,
        Number(v.stock_quantity),
        Number(v.low_stock_threshold || 5)
      );
    }
  }

  // Update images if provided
  if (images && Array.isArray(images)) {
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
    const insertImage = db.prepare(`
      INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    images.forEach((img, idx) => {
      insertImage.run(
        'img-' + crypto.randomUUID().slice(0, 8),
        id,
        img.image_url,
        img.alt_text || name,
        img.is_primary ? 1 : (idx === 0 ? 1 : 0),
        idx
      );
    });
  }

  logAdminAction(admin.email, admin.userId, 'UPDATE_PRODUCT', 'product', id, { name });

  return res.json({ message: 'Product updated successfully' });
});

// Delete Product
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const admin = (req as any).user;
  const { id } = req.params;
  const product = db.prepare('SELECT name FROM products WHERE id = ?').get(id) as any;

  db.prepare('DELETE FROM products WHERE id = ?').run(id);

  logAdminAction(admin.email, admin.userId, 'DELETE_PRODUCT', 'product', id, { productName: product?.name });

  return res.json({ message: 'Product deleted successfully' });
});

// All Orders for Admin
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const { status, paymentStatus, search } = req.query;

  let query = 'SELECT * FROM orders WHERE 1=1';
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ' AND order_status = ?';
    params.push(status);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    query += ' AND payment_status = ?';
    params.push(paymentStatus);
  }

  if (search) {
    query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  query += ' ORDER BY created_at DESC';

  const orders = db.prepare(query).all(...params) as any[];
  const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

  const detailedOrders = orders.map((o) => ({
    ...o,
    shippingAddress: JSON.parse(o.shipping_address_json),
    items: getItems.all(o.id),
  }));

  return res.json(detailedOrders);
});

// Update Order Status
app.patch('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const admin = (req as any).user;
  const { id } = req.params;
  const { orderStatus, trackingNumber, courierName, notes } = req.body;

  const currentOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!currentOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // If transitioning to Cancelled or Returned from a non-cancelled state, restore inventory!
  if (
    (orderStatus === 'Cancelled' || orderStatus === 'Returned') &&
    currentOrder.order_status !== 'Cancelled' &&
    currentOrder.order_status !== 'Returned'
  ) {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id) as any[];
    const restoreStock = db.prepare('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?');
    const recordMovement = db.prepare(`
      INSERT INTO inventory_movements (id, variant_id, change_quantity, movement_type, reference_order_id, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      if (item.variant_id) {
        restoreStock.run(item.quantity, item.variant_id);
        recordMovement.run(
          'mov-' + crypto.randomUUID().slice(0, 8),
          item.variant_id,
          item.quantity,
          orderStatus === 'Cancelled' ? 'cancellation' : 'refund',
          id,
          `Restored from ${orderStatus} order ${currentOrder.order_number}`
        );
      }
    }
  }

  db.prepare(`
    UPDATE orders SET
      order_status = COALESCE(?, order_status),
      tracking_number = COALESCE(?, tracking_number),
      courier_name = COALESCE(?, courier_name),
      notes = COALESCE(?, notes),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(orderStatus, trackingNumber, courierName, notes, id);

  logAdminAction(admin.email, admin.userId, 'UPDATE_ORDER_STATUS', 'order', id, {
    oldStatus: currentOrder.order_status,
    newStatus: orderStatus,
    trackingNumber,
  });

  return res.json({ message: 'Order status updated successfully' });
});

// Process Order Refund
app.post('/api/admin/orders/:id/refund', requireAdmin, (req, res) => {
  const admin = (req as any).user;
  const { id } = req.params;
  const { refundAmount, refundReason } = req.body;

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const refundAmt = Number(refundAmount || order.total_amount);

  db.prepare(`
    UPDATE orders SET
      payment_status = 'refunded',
      order_status = 'Cancelled',
      updated_at = datetime('now')
    WHERE id = ?
  `).run(id);

  db.prepare(`
    INSERT INTO payments (id, order_id, gateway, amount, status, refund_amount, refund_reason)
    VALUES (?, ?, 'razorpay', ?, 'refunded', ?, ?)
  `).run('pay-' + crypto.randomUUID().slice(0, 8), id, order.total_amount, refundAmt, refundReason || 'Customer requested refund');

  // Restore inventory
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id) as any[];
  for (const item of items) {
    if (item.variant_id) {
      db.prepare('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?').run(item.quantity, item.variant_id);
      db.prepare(`
        INSERT INTO inventory_movements (id, variant_id, change_quantity, movement_type, reference_order_id, note)
        VALUES (?, ?, ?, 'refund', ?, ?)
      `).run('mov-' + crypto.randomUUID().slice(0, 8), item.variant_id, item.quantity, id, `Refund for order ${order.order_number}`);
    }
  }

  logAdminAction(admin.email, admin.userId, 'PROCESS_REFUND', 'order', id, { refundAmount: refundAmt, refundReason });

  return res.json({ message: 'Refund recorded and stock restored successfully' });
});

// Printable Invoice Data
app.get('/api/admin/orders/:id/invoice', requireAdmin, (req, res) => {
  const { id } = req.params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
  const settingsRows = db.prepare('SELECT key, value FROM site_settings').all() as any[];
  const settings: Record<string, string> = {};
  for (const s of settingsRows) settings[s.key] = s.value;

  return res.json({
    invoiceNumber: 'INV-' + order.order_number.replace('VAY-', ''),
    invoiceDate: order.created_at,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    shippingAddress: JSON.parse(order.shipping_address_json),
    items,
    subtotal: order.subtotal,
    discountAmount: order.discount_amount,
    shippingFee: order.shipping_fee,
    taxAmount: order.tax_amount,
    totalAmount: order.total_amount,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    gstNumber: '27AABCU9603R1ZM', // Verified format Indian GSTIN
    hsnCode: '33030010', // Standard Indian HSN for Perfumes & Scents
    brandDetails: {
      name: 'VAYRIVO Luxury Parfumerie Private Limited',
      address: settings.boutique_address || 'The Heritage Galleria, Colaba, Mumbai 400001, Maharashtra, India',
      email: settings.support_email || 'concierge@vayrivo.com',
      phone: settings.support_phone || '+91 98200 12345',
    },
  });
});

// Admin Customers Directory
app.get('/api/admin/customers', requireAdmin, (req, res) => {
  const customers = db.prepare(`
    SELECT 
      u.id, u.email, u.full_name, u.phone, u.created_at,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(o.total_amount), 0) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id AND o.order_status != 'Cancelled'
    WHERE u.role = 'customer'
    GROUP BY u.id
    ORDER BY total_spent DESC
  `).all();

  return res.json(customers);
});

// Admin Inventory Directory & Movements
app.get('/api/admin/inventory', requireAdmin, (req, res) => {
  const stockOverview = db.prepare(`
    SELECT 
      v.*,
      p.name as product_name,
      p.slug as product_slug,
      p.fragrance_family
    FROM product_variants v
    JOIN products p ON v.product_id = p.id
    ORDER BY (v.stock_quantity <= v.low_stock_threshold) DESC, v.stock_quantity ASC
  `).all();

  const movements = db.prepare(`
    SELECT m.*, v.sku, v.size_ml, p.name as product_name
    FROM inventory_movements m
    JOIN product_variants v ON m.variant_id = v.id
    JOIN products p ON v.product_id = p.id
    ORDER BY m.created_at DESC
    LIMIT 50
  `).all();

  return res.json({ stockOverview, movements });
});

// Manual Stock Adjustment
app.post('/api/admin/inventory/adjust', requireAdmin, (req, res) => {
  const admin = (req as any).user;
  const { variantId, changeQuantity, note } = req.body;

  if (!variantId || changeQuantity === undefined) {
    return res.status(400).json({ error: 'Variant ID and change quantity are required' });
  }

  const delta = Number(changeQuantity);
  db.prepare('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?').run(delta, variantId);

  db.prepare(`
    INSERT INTO inventory_movements (id, variant_id, change_quantity, movement_type, note)
    VALUES (?, ?, ?, 'adjustment', ?)
  `).run('mov-' + crypto.randomUUID().slice(0, 8), variantId, delta, note || 'Manual Admin Stock Adjustment');

  logAdminAction(admin.email, admin.userId, 'ADJUST_STOCK', 'inventory', variantId, { delta, note });

  return res.json({ message: 'Stock adjusted successfully' });
});

// Coupons Management
app.get('/api/admin/coupons', requireAdmin, (req, res) => {
  const coupons = db.prepare('SELECT * FROM coupons ORDER BY is_active DESC, code ASC').all();
  return res.json(coupons);
});

app.post('/api/admin/coupons', requireAdmin, (req, res) => {
  const admin = (req as any).user;
  const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, isActive } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({ error: 'Code, type, and discount value are required' });
  }

  const id = 'cpn-' + crypto.randomUUID().slice(0, 8);
  db.prepare(`
    INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    code.trim().toUpperCase(),
    discountType,
    Number(discountValue),
    Number(minOrderAmount || 0),
    maxDiscountAmount ? Number(maxDiscountAmount) : null,
    isActive !== false ? 1 : 0
  );

  logAdminAction(admin.email, admin.userId, 'CREATE_COUPON', 'coupon', id, { code });

  return res.status(201).json({ id, message: 'Coupon created successfully' });
});

app.delete('/api/admin/coupons/:id', requireAdmin, (req, res) => {
  const admin = (req as any).user;
  const { id } = req.params;
  db.prepare('DELETE FROM coupons WHERE id = ?').run(id);

  logAdminAction(admin.email, admin.userId, 'DELETE_COUPON', 'coupon', id, {});

  return res.json({ message: 'Coupon deleted successfully' });
});

// Admin Subscribers List
app.get('/api/admin/subscribers', requireAdmin, (req, res) => {
  const subscribers = db.prepare('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC').all();
  return res.json(subscribers);
});

// Admin Settings
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as any[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return res.json(settings);
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const admin = (req as any).user;
  const settings = req.body;

  const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(settings)) {
    stmt.run(key, String(value));
  }

  logAdminAction(admin.email, admin.userId, 'UPDATE_SETTINGS', 'settings', null, { keys: Object.keys(settings) });

  return res.json({ message: 'Settings saved successfully' });
});

// Admin Update Credentials (Email & Password)
app.post('/api/admin/update-credentials', requireAdmin, (req, res) => {
  const admin = (req as any).user;
  const { newEmail, newPassword } = req.body;

  if (!newEmail && !newPassword) {
    return res.status(400).json({ error: 'Please provide a new email or password to update.' });
  }

  try {
    if (newEmail && newEmail.trim()) {
      const cleanEmail = newEmail.trim().toLowerCase();
      // Check if email already used by another account
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(cleanEmail, admin.userId);
      if (existing) {
        return res.status(409).json({ error: 'This email is already in use by another user' });
      }
      db.prepare('UPDATE users SET email = ? WHERE id = ?').run(cleanEmail, admin.userId);
    }

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const hashed = hashPassword(newPassword.trim());
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashed, admin.userId);
    }

    logAdminAction(admin.email, admin.userId, 'UPDATE_ADMIN_CREDENTIALS', 'user', admin.userId, {
      updatedEmail: !!newEmail,
      updatedPassword: !!newPassword,
    });

    return res.json({ message: 'Administrative credentials updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update credentials: ' + err.message });
  }
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  const logs = db.prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 100').all();
  return res.json(logs);
});

// ==========================================
// 5. VITE MIDDLEWARE & SERVER STARTUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VAYRIVO] Luxury Haute Parfumerie server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[VAYRIVO] Failed to start server:', err);
  process.exit(1);
});
