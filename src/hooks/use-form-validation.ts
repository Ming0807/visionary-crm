"use client";

import { useState, useCallback } from "react";
import { z } from "zod";

/**
 * Form validation hook using Zod schemas
 * Provides real-time validation and error messages
 */

export interface FormErrors {
    [key: string]: string | undefined;
}

export interface UseFormValidationReturn<T> {
    errors: FormErrors;
    isValid: boolean;
    validate: (data: unknown) => { success: true; data: T } | { success: false; errors: FormErrors };
    clearErrors: () => void;
    setFieldError: (field: string, message: string) => void;
}

export function useFormValidation<T>(
    schema: z.ZodType<T>
): UseFormValidationReturn<T> {
    const [errors, setErrors] = useState<FormErrors>({});

    // Validate entire form data
    const validate = useCallback((data: unknown): { success: true; data: T } | { success: false; errors: FormErrors } => {
        const result = schema.safeParse(data);

        if (result.success) {
            setErrors({});
            return { success: true, data: result.data };
        }

        const newErrors: FormErrors = {};
        result.error.issues.forEach((issue) => {
            const path = issue.path.join(".");
            if (!newErrors[path]) {
                newErrors[path] = issue.message;
            }
        });

        setErrors(newErrors);
        return { success: false, errors: newErrors };
    }, [schema]);

    // Clear all errors
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    // Set field error manually
    const setFieldError = useCallback((field: string, message: string) => {
        setErrors(prev => ({ ...prev, [field]: message }));
    }, []);

    return {
        errors,
        isValid: Object.keys(errors).length === 0,
        validate,
        clearErrors,
        setFieldError,
    };
}

// ==========================================
// FORM SCHEMAS FOR CLIENT-SIDE VALIDATION
// ==========================================

// Checkout form schema
export const checkoutFormSchema = z.object({
    name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
    phone: z.string()
        .min(9, "เบอร์โทรไม่ถูกต้อง")
        .max(15, "เบอร์โทรไม่ถูกต้อง")
        .regex(/^[0-9]+$/, "เบอร์โทรต้องเป็นตัวเลขเท่านั้น"),
    email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
    address: z.string().min(10, "กรุณากรอกที่อยู่ให้ครบถ้วน").optional().or(z.literal("")),
    district: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string()
        .regex(/^[0-9]{5}$/, "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก")
        .optional()
        .or(z.literal("")),
    notes: z.string().max(500, "หมายเหตุยาวเกินไป").optional(),
});

// Claims form schema
export const claimsFormSchema = z.object({
    name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
    phone: z.string()
        .min(9, "เบอร์โทรไม่ถูกต้อง")
        .max(15, "เบอร์โทรไม่ถูกต้อง"),
    email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
    orderNumber: z.string().optional(),
    claimType: z.enum(["claim", "return", "exchange"]),
    reason: z.string().min(1, "กรุณาเลือกเหตุผล"),
    description: z.string()
        .min(10, "กรุณาอธิบายปัญหาอย่างน้อย 10 ตัวอักษร")
        .max(1000, "รายละเอียดยาวเกินไป"),
});

// Campaign form schema
export const campaignFormSchema = z.object({
    name: z.string().min(3, "ชื่อแคมเปญต้องมีอย่างน้อย 3 ตัวอักษร"),
    description: z.string().max(500, "คำอธิบายยาวเกินไป").optional(),
    campaignType: z.enum(["birthday", "re_engagement", "point_expiration", "promotion", "custom"]),
    messageTemplate: z.string()
        .min(10, "ข้อความต้องมีอย่างน้อย 10 ตัวอักษร")
        .max(1000, "ข้อความยาวเกินไป"),
    sendChannel: z.enum(["line", "sms", "email"]).default("line"),
});

// Product form schema
export const productFormSchema = z.object({
    name: z.string().min(3, "ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร"),
    description: z.string().max(2000, "คำอธิบายยาวเกินไป").optional(),
    brand: z.string().optional(),
    category: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
    base_price: z.coerce.number()
        .positive("ราคาต้องมากกว่า 0")
        .max(9999999, "ราคาสูงเกินไป"),
    sku: z.string().min(3, "SKU ต้องมีอย่างน้อย 3 ตัวอักษร"),
});

// Coupon form schema
export const couponFormSchema = z.object({
    code: z.string()
        .min(3, "รหัสคูปองต้องมีอย่างน้อย 3 ตัวอักษร")
        .max(20, "รหัสคูปองยาวเกินไป")
        .regex(/^[A-Z0-9]+$/, "รหัสคูปองต้องเป็นตัวพิมพ์ใหญ่และตัวเลขเท่านั้น"),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.coerce.number()
        .positive("มูลค่าต้องมากกว่า 0"),
    minPurchase: z.coerce.number().nonnegative("ยอดขั้นต่ำต้องไม่ติดลบ").default(0),
    maxUses: z.coerce.number().int().positive("จำนวนครั้งต้องมากกว่า 0").optional(),
});

// Export type helpers
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type ClaimsFormData = z.infer<typeof claimsFormSchema>;
export type CampaignFormData = z.infer<typeof campaignFormSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;
export type CouponFormData = z.infer<typeof couponFormSchema>;
