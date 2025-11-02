// Centralized API configuration
const config = {
    // API Keys - Use environment variables
    alphaVantageKey: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 
                     process.env.ALPHA_VANTAGE_KEY || 
                     process.env.NEXT_PUBLIC_ALPHAVANTAGE_KEY || 
                     process.env.NEXT_PUBLIC_FINNHUB_API_KEY,
    
    finnhubKey: process.env.NEXT_PUBLIC_FINNHUB_API_KEY,
    
    // MongoDB
    mongodbUri: process.env.MONGODB_URI,
    
    // Firebase
    firebaseConfig: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    },
    
    // NextAuth
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    
    // MT5 Bridge
    mt5BridgeKey: process.env.MT5_BRIDGE_KEY || "change-me",
    
    // API Rate Limits (in milliseconds)
    rateLimits: {
        marketDataRefresh: 30000,  // 30 seconds
        watchlistRefresh: 15000,   // 15 seconds
        searchDebounce: 500        // 500ms
    },
    
    // Cache TTL (in milliseconds)
    cacheTTL: {
        stockPrice: 15000,         // 15 seconds
        marketOverview: 60000,     // 1 minute
        companyOverview: 300000    // 5 minutes
    }
};

// Validate critical configuration
export const validateConfig = () => {
    const errors = [];
    
    if (!config.mongodbUri) {
        errors.push("MONGODB_URI is not configured");
    }
    
    if (!config.alphaVantageKey) {
        errors.push("No API key found for stock data (Alpha Vantage or Finnhub)");
    }
    
    if (!config.nextAuthSecret) {
        errors.push("NEXTAUTH_SECRET is not configured");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

export default config;
