-- ==========================================
-- 📊 PHASE 5: ANALYTICS DASHBOARD
-- ==========================================
-- รันหลังจาก schema_phase4.sql

-- ==========================================
-- 📈 1. REVENUE SUMMARY VIEW
-- ==========================================

CREATE OR REPLACE VIEW v_revenue_daily AS
SELECT 
    DATE(created_at) as date,
    SUM(total_amount) as revenue,
    COUNT(*) as order_count
FROM orders
WHERE payment_status = 'paid'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ==========================================
-- 📊 2. ORDER STATUS DISTRIBUTION
-- ==========================================

CREATE OR REPLACE VIEW v_order_status_stats AS
SELECT 
    payment_status,
    COUNT(*) as count,
    SUM(total_amount) as total_amount
FROM orders
GROUP BY payment_status;

-- ==========================================
-- 👥 3. CUSTOMER TIER DISTRIBUTION
-- ==========================================

CREATE OR REPLACE VIEW v_customer_tiers AS
SELECT 
    tier,
    COUNT(*) as count,
    SUM(total_spent) as total_spent,
    SUM(points) as total_points
FROM customers
GROUP BY tier;

-- ==========================================
-- 🛍️ 4. TOP PRODUCTS VIEW
-- ==========================================

CREATE OR REPLACE VIEW v_top_products AS
SELECT 
    p.id,
    p.name,
    p.brand,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.price_per_unit * oi.quantity), 0) as revenue
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN order_items oi ON oi.variant_id = pv.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.payment_status = 'paid'
GROUP BY p.id, p.name, p.brand
ORDER BY total_sold DESC
LIMIT 10;

-- ==========================================
-- 📅 5. MONTHLY SUMMARY
-- ==========================================

CREATE OR REPLACE VIEW v_revenue_monthly AS
SELECT 
    DATE_TRUNC('month', created_at)::date as month,
    SUM(total_amount) as revenue,
    COUNT(*) as order_count,
    COUNT(DISTINCT customer_id) as unique_customers
FROM orders
WHERE payment_status = 'paid'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- ==========================================
-- 🔄 6. ANALYTICS HELPER FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'today_revenue', COALESCE((
            SELECT SUM(total_amount) 
            FROM orders 
            WHERE payment_status = 'paid' 
            AND DATE(created_at) = CURRENT_DATE
        ), 0),
        'today_orders', COALESCE((
            SELECT COUNT(*) 
            FROM orders 
            WHERE DATE(created_at) = CURRENT_DATE
        ), 0),
        'month_revenue', COALESCE((
            SELECT SUM(total_amount) 
            FROM orders 
            WHERE payment_status = 'paid' 
            AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        ), 0),
        'month_orders', COALESCE((
            SELECT COUNT(*) 
            FROM orders 
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        ), 0),
        'total_customers', (SELECT COUNT(*) FROM customers),
        'total_products', (SELECT COUNT(*) FROM products WHERE is_active = true),
        'pending_orders', COALESCE((
            SELECT COUNT(*) 
            FROM orders 
            WHERE payment_status = 'pending_payment'
        ), 0)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
