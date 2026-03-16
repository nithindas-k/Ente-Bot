const MESSAGES = {
    COMMON: {
        SUCCESS: 'Operation successful',
        ERROR: 'Something went wrong',
        VALIDATION_ERROR: 'Validation failed'
    },
    AUTH: {
        SUCCESS: 'Authentication successful',
        UNAUTHORIZED: 'Access denied. Invalid token.',
        LOGOUT: 'Logged out successfully'
    },
    CONTACT: {
        CREATED: 'Contact added to whitelist',
        UPDATED: 'Contact updated',
        DELETED: 'Contact removed',
        NOT_FOUND: 'Contact not found'
    },
    WHATSAPP: {
        CONNECTED: 'WhatsApp session connected',
        DISCONNECTED: 'WhatsApp session disconnected',
        QR_READY: 'QR Code is ready for scanning'
    }
} as const;

export default MESSAGES;
