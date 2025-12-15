import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database
export interface Customer {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    address: Record<string, unknown>;
    tier: string;
    points: number;
    total_spent: number;
    style_tags: string[] | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    brand: string | null;
    category: string | null;
    gender: string;
    base_price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    variants?: ProductVariant[];
}

export interface ProductVariant {
    id: string;
    product_id: string;
    sku: string;
    color_name: string | null;
    color_code: string | null;
    frame_material: string | null;
    size_label: string | null;
    price: number;
    cost_price: number;
    images: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
    inventory?: Inventory[];
}

export interface Inventory {
    id: string;
    variant_id: string;
    quantity: number;
    reserved_quantity: number;
    location: string;
    updated_at: string;
}

export interface Order {
    id: string;
    order_number: string;
    customer_id: string | null;
    platform_source: string;
    external_order_ref: string | null;
    subtotal: number;
    discount_amount: number;
    shipping_cost: number;
    total_amount: number;
    payment_status: string;
    fulfillment_status: string;
    slip_image_url: string | null;
    shipping_address: Record<string, unknown> | null;
    tracking_number: string | null;
    shipping_carrier: string | null;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    variant_id: string | null;
    product_name_snapshot: string | null;
    sku_snapshot: string | null;
    quantity: number;
    price_per_unit: number;
}

// Cart item type for local state
export interface CartItem {
    variantId: string;
    productId: string;
    productName: string;
    variantName: string;
    sku: string;
    price: number;
    quantity: number;
    image: string;
    colorName: string | null;
    colorCode: string | null;
}
