-- Performance Indexes for My Visionary Shop CRM
-- Run this in Supabase SQL Editor

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_birthday ON customers(birthday);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status_combo ON orders(payment_status, fulfillment_status);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Order items indexes  
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- Campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- Social identities index
CREATE INDEX IF NOT EXISTS idx_social_identities_customer_id ON social_identities(customer_id);
CREATE INDEX IF NOT EXISTS idx_social_identities_social_user_id ON social_identities(social_user_id);

-- Point transactions index
CREATE INDEX IF NOT EXISTS idx_point_transactions_customer_id ON point_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- Messages and conversations indexes



-- Inventory index
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON inventory(variant_id);

-- Analyze tables to update statistics
ANALYZE customers;
ANALYZE orders;
ANALYZE products;
ANALYZE product_variants;
ANALYZE order_items;
ANALYZE campaigns;
