const APP_CONSTANTS = {
    ANTI_SPAM: {
        DAILY_LIMIT: 150,
        RATE_LIMIT_SEC: 5,
        DELAY: {
            MIN: 1000, 
            MAX: 4000  
        }
    },
    SESSION: {
        HEALTH_CHECK_INTERVAL: 30 * 60 * 1000 
    }
} as const;

export default APP_CONSTANTS;
