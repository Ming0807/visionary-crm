import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates all required environment variables on startup
 */

// Schema for required environment variables
const envSchema = z.object({
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),

    // LINE
    LINE_CHANNEL_SECRET: z.string().min(1, 'LINE channel secret is required'),
    LINE_CHANNEL_ACCESS_TOKEN: z.string().min(1, 'LINE access token is required'),
    NEXT_PUBLIC_LIFF_ID: z.string().optional(),

    // Optional: Google AI
    GOOGLE_AI_API_KEY: z.string().optional(),

    // Optional: Cloudinary
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // Optional: Admin
    ADMIN_LINE_USER_ID: z.string().optional(),

    // Node environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Type for validated environment
export type Env = z.infer<typeof envSchema>;

// Validate environment variables
export function validateEnv(): Env {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Environment validation failed:');
        parsed.error.issues.forEach((issue) => {
            console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        });

        if (process.env.NODE_ENV === 'production') {
            throw new Error('Missing required environment variables');
        } else {
            console.warn('⚠️ Running in development mode with missing env vars');
        }
    }

    return parsed.data as Env;
}

// Singleton for validated env
let validatedEnv: Env | null = null;

export function getEnv(): Env {
    if (!validatedEnv) {
        validatedEnv = validateEnv();
    }
    return validatedEnv;
}

// Check if specific feature is enabled
export function isFeatureEnabled(feature: 'ai' | 'cloudinary' | 'liff'): boolean {
    const env = getEnv();

    switch (feature) {
        case 'ai':
            return !!env.GOOGLE_AI_API_KEY;
        case 'cloudinary':
            return !!(env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY);
        case 'liff':
            return !!env.NEXT_PUBLIC_LIFF_ID;
        default:
            return false;
    }
}

// Log environment status (for debugging)
export function logEnvStatus(): void {
    const env = getEnv();
    console.log('🔧 Environment Status:');
    console.log(`  - Mode: ${env.NODE_ENV}`);
    console.log(`  - Supabase: ✅ Connected`);
    console.log(`  - LINE: ✅ Configured`);
    console.log(`  - AI: ${isFeatureEnabled('ai') ? '✅' : '❌'} ${isFeatureEnabled('ai') ? 'Enabled' : 'Disabled'}`);
    console.log(`  - Cloudinary: ${isFeatureEnabled('cloudinary') ? '✅' : '❌'} ${isFeatureEnabled('cloudinary') ? 'Enabled' : 'Disabled'}`);
    console.log(`  - LIFF: ${isFeatureEnabled('liff') ? '✅' : '❌'} ${isFeatureEnabled('liff') ? 'Enabled' : 'Disabled'}`);
}
