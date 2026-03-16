const APP_CONSTANTS = {
    ANTI_SPAM: {
        DAILY_LIMIT: 150,
        RATE_LIMIT_SEC: 5,
        DELAY: {
            MIN: 1000, // ms
            MAX: 4000  // ms
        }
    },
    SESSION: {
        HEALTH_CHECK_INTERVAL: 30 * 60 * 1000 // 30 minutes
    }
} as const;

export default APP_CONSTANTS;
