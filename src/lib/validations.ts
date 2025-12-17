import { z } from 'zod';

// ==========================================
// CUSTOMER SCHEMAS
// ==========================================

export const customerCreateSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    phone: z.string().min(9, 'Invalid phone number').max(15),
    email: z.string().email('Invalid email').optional().nullable(),
    address: z.record(z.string(), z.unknown()).optional(),
    birthday: z.string().optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
});

export const customerUpdateSchema = customerCreateSchema.partial();

// ==========================================
// ORDER SCHEMAS
// ==========================================

export const orderItemSchema = z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    productName: z.string(),
    sku: z.string(),
});

export const orderCreateSchema = z.object({
    customerId: z.string().uuid().optional(),
    customer: z.object({
        name: z.string().min(1),
        phone: z.string().min(9).max(15),
        email: z.string().email().optional().nullable(),
    }),
    shippingAddress: z.object({
        street: z.string().optional(),
        district: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
    }).optional(),
    items: z.array(orderItemSchema).min(1, 'At least one item required'),
    subtotal: z.number().nonnegative(),
    shippingCost: z.number().nonnegative().default(0),
    totalAmount: z.number().positive(),
});

export const orderStatusUpdateSchema = z.object({
    payment_status: z.enum(['pending_payment', 'verifying', 'paid', 'cancelled', 'refunded']).optional(),
    fulfillment_status: z.enum(['unfulfilled', 'packing', 'shipped', 'delivered', 'returned']).optional(),
    tracking_number: z.string().optional(),
    shipping_carrier: z.string().optional(),
});

// ==========================================
// PRODUCT SCHEMAS
// ==========================================

export const productVariantSchema = z.object({
    sku: z.string().min(1),
    color_name: z.string().optional().nullable(),
    color_code: z.string().optional().nullable(),
    frame_material: z.string().optional().nullable(),
    size_label: z.string().optional().nullable(),
    price: z.number().positive(),
    cost_price: z.number().nonnegative().default(0),
    images: z.array(z.string().url()).default([]),
    is_active: z.boolean().default(true),
});

export const productCreateSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional().nullable(),
    brand: z.string().max(100).optional().nullable(),
    category: z.string().max(100).optional().nullable(),
    gender: z.enum(['men', 'women', 'unisex']).default('unisex'),
    base_price: z.number().positive(),
    is_active: z.boolean().default(true),
    variants: z.array(productVariantSchema).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

// ==========================================
// CAMPAIGN SCHEMAS
// ==========================================

export const campaignCreateSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional().nullable(),
    campaignType: z.enum(['birthday', 're_engagement', 'point_expiration', 'promotion', 'custom']),
    messageTemplate: z.string().min(1).max(1000),
    couponId: z.string().uuid().optional().nullable(),
    sendChannel: z.enum(['line', 'sms', 'email']).default('line'),
    scheduleType: z.enum(['manual', 'daily', 'weekly', 'monthly']).default('manual'),
    scheduledAt: z.string().optional().nullable(),
    targetAudience: z.record(z.string(), z.unknown()).optional(),
});

// ==========================================
// COUPON SCHEMAS
// ==========================================

export const couponCreateSchema = z.object({
    code: z.string().min(3).max(20).toUpperCase(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().positive(),
    minPurchase: z.number().nonnegative().default(0),
    maxUses: z.number().int().positive().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
});

// ==========================================
// CLAIM SCHEMAS
// ==========================================

export const claimCreateSchema = z.object({
    orderId: z.string().uuid().optional().nullable(),
    orderItemId: z.string().uuid().optional().nullable(),
    customerId: z.string().uuid(),
    claimType: z.enum(['claim', 'return', 'exchange']),
    reason: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
    images: z.array(z.string()).default([]),
});

// ==========================================
// POINTS SCHEMAS
// ==========================================

export const pointsAdjustSchema = z.object({
    customerId: z.string().uuid(),
    points: z.number().int(),
    type: z.enum(['earn_purchase', 'earn_review', 'earn_referral', 'earn_birthday', 'redeem_discount', 'redeem_item', 'expire', 'adjust']),
    description: z.string().max(200).optional(),
});

// ==========================================
// HELPER FUNCTION
// ==========================================

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; issues: z.ZodIssue[] } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, issues: result.error.issues };
}
