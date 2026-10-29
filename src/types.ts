export interface ProductVariant {
  id: string;
  product_id: string;
  size_ml: number;
  sku: string;
  price: number;
  sale_price?: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_primary: number;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tag_line?: string;
  description: string;
  short_description: string;
  fragrance_family: string;
  gender: string;
  concentration: string;
  top_notes: string;
  heart_notes: string;
  base_notes: string;
  longevity: string;
  sillage: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  is_featured: number;
  is_bestseller: number;
  is_published: number;
  created_at?: string;
  updated_at?: string;
  variants: ProductVariant[];
  images: ProductImage[];
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  historical_product_name: string;
  historical_size_ml: number;
  historical_sku: string;
  historical_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'online_razorpay' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  tracking_number?: string;
  courier_name?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'owner' | 'manager' | 'staff' | 'customer';
  createdAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  times_used: number;
  is_active: number;
}

export interface InventoryMovement {
  id: string;
  variant_id: string;
  sku: string;
  size_ml: number;
  product_name: string;
  change_quantity: number;
  movement_type: 'sale' | 'restock' | 'cancellation' | 'refund' | 'adjustment';
  reference_order_id?: string;
  note?: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id?: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details_json?: string;
  created_at: string;
}

export interface SiteSettings {
  brand_name?: string;
  brand_tagline?: string;
  announcement_bar?: string;
  shipping_fee?: string;
  standard_shipping_enabled?: string;
  free_shipping_threshold?: string;
  cod_available?: string;
  cod_fee?: string;
  tax_rate_percent?: string;
  currency_symbol?: string;
  currency_code?: string;
  support_email?: string;
  support_phone?: string;
  boutique_address?: string;
  razorpay_test_mode?: string;
  razorpay_key_id?: string;
}
