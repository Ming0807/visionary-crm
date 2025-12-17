import { NextResponse } from 'next/server';
import { z, ZodError, ZodIssue } from 'zod';

// Standard API error codes
export const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    CONFLICT: 'CONFLICT',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    RATE_LIMITED: 'RATE_LIMITED',
    BAD_REQUEST: 'BAD_REQUEST',
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

interface ApiErrorResponse {
    success: false;
    error: {
        code: ErrorCode;
        message: string;
        details?: unknown;
    };
}

interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
}

// ==========================================
// ERROR RESPONSE HELPERS
// ==========================================

export function errorResponse(
    message: string,
    code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
    status: number = 500,
    details?: unknown
): NextResponse<ApiErrorResponse> {
    const errorObj: ApiErrorResponse['error'] = {
        code,
        message,
    };
    if (details !== undefined) {
        errorObj.details = details;
    }
    return NextResponse.json(
        {
            success: false as const,
            error: errorObj,
        },
        { status }
    );
}

export function validationError(issues: ZodIssue[]): NextResponse<ApiErrorResponse> {
    return errorResponse(
        'Validation failed',
        ErrorCodes.VALIDATION_ERROR,
        400,
        issues.map((e: ZodIssue) => ({
            field: e.path.join('.'),
            message: e.message,
        }))
    );
}

export function notFoundError(resource: string = 'Resource'): NextResponse<ApiErrorResponse> {
    return errorResponse(`${resource} not found`, ErrorCodes.NOT_FOUND, 404);
}

export function unauthorizedError(message: string = 'Unauthorized'): NextResponse<ApiErrorResponse> {
    return errorResponse(message, ErrorCodes.UNAUTHORIZED, 401);
}

export function forbiddenError(message: string = 'Forbidden'): NextResponse<ApiErrorResponse> {
    return errorResponse(message, ErrorCodes.FORBIDDEN, 403);
}

export function conflictError(message: string): NextResponse<ApiErrorResponse> {
    return errorResponse(message, ErrorCodes.CONFLICT, 409);
}

export function badRequestError(message: string): NextResponse<ApiErrorResponse> {
    return errorResponse(message, ErrorCodes.BAD_REQUEST, 400);
}

export function rateLimitError(): NextResponse<ApiErrorResponse> {
    return errorResponse('Too many requests', ErrorCodes.RATE_LIMITED, 429);
}

// ==========================================
// SUCCESS RESPONSE HELPER
// ==========================================

export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json({ success: true, data }, { status });
}

// ==========================================
// ERROR HANDLER WRAPPER
// ==========================================

export function withErrorHandler<T extends (...args: unknown[]) => Promise<NextResponse>>(
    handler: T
): T {
    return (async (...args: Parameters<T>) => {
        try {
            return await handler(...args);
        } catch (error) {
            console.error('API Error:', error);

            if (error instanceof ZodError) {
                return validationError(error.issues);
            }

            if (error instanceof Error) {
                // Check for common database errors
                if (error.message.includes('duplicate key')) {
                    return conflictError('Resource already exists');
                }
                if (error.message.includes('foreign key')) {
                    return badRequestError('Invalid reference');
                }
            }

            return errorResponse(
                process.env.NODE_ENV === 'development'
                    ? (error as Error).message
                    : 'Internal server error',
                ErrorCodes.INTERNAL_ERROR,
                500
            );
        }
    }) as T;
}

// ==========================================
// RATE LIMITING (Simple in-memory)
// ==========================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetAt) {
        rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}

// Clean up old entries periodically
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of rateLimitStore.entries()) {
            if (now > value.resetAt) {
                rateLimitStore.delete(key);
            }
        }
    }, 60000);
}
