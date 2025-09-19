/**
 * Input validation and sanitization utilities
 */

// Maximum lengths for different inputs
export const VALIDATION_LIMITS = {
    TODO_TEXT_MAX: 200,
    TODO_TEXT_MIN: 1,
    TODO_DESCRIPTION_MAX: 500,
    TODO_DESCRIPTION_MIN: 0,
} as const;

// Regular expressions for validation
const PATTERNS = {
    // Allow letters, numbers, spaces, and common punctuation
    SAFE_TEXT: /^[a-zA-Z0-9\s\-_.,!?()[\]{}:;"'@#$%&*+=<>\/\\|~`^]*$/,
    // Detect potential XSS patterns
    XSS_PATTERNS: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript\s*:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ],
} as const;

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    sanitizedValue?: any;
}

/**
 * Sanitize text input by removing potentially dangerous content
 */
export function sanitizeText(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }

    // Remove null bytes and control characters except newlines and tabs
    let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Remove potential XSS patterns
    PATTERNS.XSS_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
    });

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
}

/**
 * Validate todo text input
 */
export function validateTodoText(input: string): ValidationResult {
    if (typeof input !== 'string') {
        return {
            isValid: false,
            error: 'Input must be a string',
        };
    }

    const sanitized = sanitizeText(input);

    // Check if empty after sanitization
    if (sanitized.length === 0) {
        return {
            isValid: false,
            error: 'Task description cannot be empty',
        };
    }

    // Check minimum length
    if (sanitized.length < VALIDATION_LIMITS.TODO_TEXT_MIN) {
        return {
            isValid: false,
            error: `Task description must be at least ${VALIDATION_LIMITS.TODO_TEXT_MIN} character long`,
        };
    }

    // Check maximum length
    if (sanitized.length > VALIDATION_LIMITS.TODO_TEXT_MAX) {
        return {
            isValid: false,
            error: `Task description must be ${VALIDATION_LIMITS.TODO_TEXT_MAX} characters or less`,
        };
    }

    // Check for safe characters only
    if (!PATTERNS.SAFE_TEXT.test(sanitized)) {
        return {
            isValid: false,
            error: 'Task description contains invalid characters',
        };
    }

    // Check if the sanitized version is significantly different from original
    const originalTrimmed = input.trim();
    if (originalTrimmed.length > 0 && sanitized !== originalTrimmed) {
        // If sanitization removed content, it might have been malicious
        return {
            isValid: false,
            error: 'Task description contains potentially unsafe content',
        };
    }

    return {
        isValid: true,
        sanitizedValue: sanitized,
    };
}

/**
 * Validate todo description input (optional field)
 */
export function validateTodoDescription(input?: string): ValidationResult {
    // Description is optional, so undefined or empty string is valid
    if (!input || input.trim().length === 0) {
        return {
            isValid: true,
            sanitizedValue: undefined,
        };
    }

    if (typeof input !== 'string') {
        return {
            isValid: false,
            error: 'Description must be a string',
        };
    }

    const sanitized = sanitizeText(input);

    // Check maximum length
    if (sanitized.length > VALIDATION_LIMITS.TODO_DESCRIPTION_MAX) {
        return {
            isValid: false,
            error: `Description must be ${VALIDATION_LIMITS.TODO_DESCRIPTION_MAX} characters or less`,
        };
    }

    // Check for safe characters only
    if (!PATTERNS.SAFE_TEXT.test(sanitized)) {
        return {
            isValid: false,
            error: 'Description contains invalid characters',
        };
    }

    // Check if the sanitized version is significantly different from original
    const originalTrimmed = input.trim();
    if (originalTrimmed.length > 0 && sanitized !== originalTrimmed) {
        return {
            isValid: false,
            error: 'Description contains potentially unsafe content',
        };
    }

    return {
        isValid: true,
        sanitizedValue: sanitized.length > 0 ? sanitized : undefined,
    };
}

/**
 * Validate todo ID format
 */
export function validateTodoId(id: string): ValidationResult {
    if (typeof id !== 'string') {
        return {
            isValid: false,
            error: 'ID must be a string',
        };
    }

    if (id.length === 0) {
        return {
            isValid: false,
            error: 'ID cannot be empty',
        };
    }

    // Allow various ID formats: UUID, timestamp, or simple alphanumeric
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const timestampPattern = /^\d{13,}$/; // 13+ digits for timestamp-based IDs
    const simpleIdPattern = /^[a-zA-Z0-9_-]+$/; // Simple alphanumeric IDs for testing

    if (!uuidPattern.test(id) && !timestampPattern.test(id) && !simpleIdPattern.test(id)) {
        return {
            isValid: false,
            error: 'Invalid ID format',
        };
    }

    return {
        isValid: true,
        sanitizedValue: id,
    };
}

/**
 * Rate limiting for actions (simple in-memory implementation)
 */
class RateLimiter {
    private attempts: Map<string, number[]> = new Map();
    private readonly maxAttempts: number;
    private readonly windowMs: number;

    constructor(maxAttempts: number = 10, windowMs: number = 60000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }

    isAllowed(key: string): boolean {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];

        // Remove old attempts outside the window
        const recentAttempts = attempts.filter(time => now - time < this.windowMs);

        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }

        // Add current attempt
        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);

        return true;
    }

    reset(key: string): void {
        this.attempts.delete(key);
    }
}

// Global rate limiter instance
export const todoActionLimiter = new RateLimiter(20, 60000); // 20 actions per minute

/**
 * Validate and sanitize todo data for storage
 */
export function validateTodoForStorage(todo: any): ValidationResult {
    if (!todo || typeof todo !== 'object') {
        return {
            isValid: false,
            error: 'Invalid todo object',
        };
    }

    // Validate required fields
    const idValidation = validateTodoId(todo.id);
    if (!idValidation.isValid) {
        return idValidation;
    }

    const textValidation = validateTodoText(todo.text);
    if (!textValidation.isValid) {
        return textValidation;
    }

    // Validate optional description field
    const descriptionValidation = validateTodoDescription(todo.description);
    if (!descriptionValidation.isValid) {
        return descriptionValidation;
    }

    // Validate completed field
    if (typeof todo.completed !== 'boolean') {
        return {
            isValid: false,
            error: 'Completed field must be a boolean',
        };
    }

    // Validate priority field
    const validPriorities = ['high', 'medium', 'low'];
    if (!validPriorities.includes(todo.priority)) {
        return {
            isValid: false,
            error: 'Invalid priority value',
        };
    }

    // Validate createdAt field
    const createdAt = new Date(todo.createdAt);
    if (isNaN(createdAt.getTime())) {
        return {
            isValid: false,
            error: 'Invalid createdAt date',
        };
    }

    // Validate updatedAt field
    const updatedAt = new Date(todo.updatedAt);
    if (isNaN(updatedAt.getTime())) {
        return {
            isValid: false,
            error: 'Invalid updatedAt date',
        };
    }

    // Check if dates are reasonable (not too far in the past or future)
    const now = Date.now();
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    const oneYearFromNow = now + (365 * 24 * 60 * 60 * 1000);

    if (createdAt.getTime() < oneYearAgo || createdAt.getTime() > oneYearFromNow) {
        return {
            isValid: false,
            error: 'Invalid creation date',
        };
    }

    if (updatedAt.getTime() < oneYearAgo || updatedAt.getTime() > oneYearFromNow) {
        return {
            isValid: false,
            error: 'Invalid update date',
        };
    }

    return {
        isValid: true,
        sanitizedValue: {
            id: idValidation.sanitizedValue,
            text: textValidation.sanitizedValue,
            description: descriptionValidation.sanitizedValue,
            completed: todo.completed,
            priority: todo.priority,
            createdAt: createdAt,
            updatedAt: updatedAt,
        },
    };
}
