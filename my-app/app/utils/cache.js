/**
 * Simple in-memory cache with TTL support
 * Helps reduce API calls and improve performance
 */
class Cache {
    constructor() {
        this.store = new Map();
        this.timers = new Map();
    }

    /**
     * Set a value in cache with optional TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, value, ttl = 60000) {
        // Clear existing timer if any
        this.clearTimer(key);
        
        // Store the value with timestamp
        this.store.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });

        // Set auto-cleanup timer
        if (ttl > 0) {
            const timer = setTimeout(() => {
                this.delete(key);
            }, ttl);
            this.timers.set(key, timer);
        }
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {any} - Cached value or null if not found/expired
     */
    get(key) {
        const item = this.store.get(key);
        
        if (!item) {
            return null;
        }

        // Check if item has expired
        const now = Date.now();
        if (item.ttl > 0 && now - item.timestamp > item.ttl) {
            this.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Check if a key exists and is valid
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.clearTimer(key);
        this.store.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear() {
        // Clear all timers
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
        this.store.clear();
    }

    /**
     * Clear timer for a key
     * @param {string} key - Cache key
     */
    clearTimer(key) {
        const timer = this.timers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(key);
        }
    }

    /**
     * Get cache size
     * @returns {number}
     */
    size() {
        return this.store.size;
    }

    /**
     * Get all keys
     * @returns {Array<string>}
     */
    keys() {
        return Array.from(this.store.keys());
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];

        this.store.forEach((item, key) => {
            if (item.ttl > 0 && now - item.timestamp > item.ttl) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.delete(key));
    }
}

// Create singleton instance
const cache = new Cache();

// Optional: Set up periodic cleanup (every 5 minutes)
if (typeof window !== 'undefined') {
    setInterval(() => {
        cache.cleanup();
    }, 300000);
}

export default cache;

// Export specific cache instances for different data types
export const priceCache = new Cache();
export const marketCache = new Cache();
export const searchCache = new Cache();
