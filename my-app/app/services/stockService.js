import config from '@/config/apiConfig';
import { priceCache, marketCache, searchCache } from '@/utils/cache';

/**
 * Centralized service for all stock market API calls
 * Implements caching, error handling, and rate limiting
 */
class StockService {
    constructor() {
        this.apiKey = config.alphaVantageKey;
        this.baseUrl = 'https://www.alphavantage.co/query';
    }

    /**
     * Fetch stock quote with caching
     */
    async getStockQuote(symbol) {
        const cacheKey = `quote_${symbol}`;
        const cached = priceCache.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check for API limit error
            if (data['Note'] || data['Information']) {
                console.warn('API limit reached:', data['Note'] || data['Information']);
                return null;
            }
            
            const quote = data['Global Quote'];
            if (quote) {
                // Cache for 30 seconds
                priceCache.set(cacheKey, quote, 30000);
            }
            
            return quote;
        } catch (error) {
            console.error('Error fetching stock quote:', error);
            return null;
        }
    }

    /**
     * Search stocks with debouncing handled by the component
     */
    async searchStocks(keywords) {
        if (!keywords || keywords.length < 2) {
            return [];
        }

        const cacheKey = `search_${keywords.toLowerCase()}`;
        const cached = searchCache.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const results = data.bestMatches || [];
            
            // Cache search results for 5 minutes
            searchCache.set(cacheKey, results, 300000);
            
            return results;
        } catch (error) {
            console.error('Error searching stocks:', error);
            return [];
        }
    }

    /**
     * Get company overview
     */
    async getCompanyOverview(symbol) {
        const cacheKey = `overview_${symbol}`;
        const cached = marketCache.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}?function=OVERVIEW&symbol=${symbol}&apikey=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.Symbol) {
                // Cache company overview for 1 hour
                marketCache.set(cacheKey, data, 3600000);
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching company overview:', error);
            return null;
        }
    }

    /**
     * Get time series data for charts
     */
    async getTimeSeries(symbol, outputsize = 'compact') {
        const cacheKey = `timeseries_${symbol}_${outputsize}`;
        const cached = marketCache.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}&outputsize=${outputsize}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const timeSeries = data['Time Series (Daily)'];
            
            if (timeSeries) {
                // Cache time series for 5 minutes
                marketCache.set(cacheKey, timeSeries, 300000);
            }
            
            return timeSeries;
        } catch (error) {
            console.error('Error fetching time series:', error);
            return null;
        }
    }

    /**
     * Batch fetch multiple quotes (optimized for watchlists)
     */
    async getBatchQuotes(symbols) {
        const results = {};
        const uncachedSymbols = [];
        
        // Check cache first
        symbols.forEach(symbol => {
            const cached = priceCache.get(`quote_${symbol}`);
            if (cached) {
                results[symbol] = cached;
            } else {
                uncachedSymbols.push(symbol);
            }
        });

        // Fetch uncached symbols
        const promises = uncachedSymbols.map(symbol => 
            this.getStockQuote(symbol).then(quote => ({
                symbol,
                quote
            }))
        );
        
        const fetchedData = await Promise.all(promises);
        
        fetchedData.forEach(({ symbol, quote }) => {
            if (quote) {
                results[symbol] = quote;
            }
        });
        
        return results;
    }

    /**
     * Get market indices (S&P 500, Dow Jones, NASDAQ, Russell 2000)
     */
    async getMarketIndices() {
        const indices = {
            'SPY': 'S&P 500',
            'DIA': 'Dow Jones',
            'QQQ': 'NASDAQ',
            'IWM': 'Russell 2000'
        };
        
        const quotes = await this.getBatchQuotes(Object.keys(indices));
        
        const marketData = Object.entries(indices).map(([symbol, name]) => {
            const quote = quotes[symbol];
            if (!quote) return null;
            
            const price = parseFloat(quote['05. price'] || 0);
            const change = parseFloat(quote['09. change'] || 0);
            const changePercent = quote['10. change percent'] || '0%';
            
            return {
                symbol,
                name,
                value: price.toFixed(2),
                change: change.toFixed(2),
                changePercent: changePercent.replace('%', ''),
                up: change >= 0
            };
        }).filter(Boolean);
        
        return marketData;
    }

    /**
     * Clear all caches
     */
    clearCache() {
        priceCache.clear();
        marketCache.clear();
        searchCache.clear();
    }
}

// Export singleton instance
const stockService = new StockService();
export default stockService;
