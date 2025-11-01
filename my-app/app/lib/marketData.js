// app/lib/marketData.js
// Lightweight server-side market data helper with a short in-memory cache.

const cache = new Map(); // symbol -> { price, ts }
const TTL = 15 * 1000; // 15 seconds

function now() {
  return Date.now();
}

async function fetchPriceFromAlphaVantage(symbol) {
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_KEY || process.env.NEXT_PUBLIC_ALPHAVANTAGE_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!apiKey) {
    console.warn('No AlphaVantage API key found in env');
    return null;
  }

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const quote = data['Global Quote'] || data['Realtime Currency Exchange Rate'] || null;
    if (!quote) return null;

    // AlphaVantage GLOBAL_QUOTE returns price in '05. price'
    const priceStr = quote['05. price'] || quote['05. Price'] || quote['price'] || null;
    if (!priceStr) return null;
    const price = Number(priceStr);
    if (isNaN(price)) return null;
    return price;
  } catch (err) {
    console.error('Error fetching price from AlphaVantage', err);
    return null;
  }
}

export async function getPrice(symbol) {
  if (!symbol) return null;
  const key = symbol.toUpperCase();
  const entry = cache.get(key);
  if (entry && now() - entry.ts < TTL) {
    return entry.price;
  }

  const price = await fetchPriceFromAlphaVantage(key);
  if (price != null) {
    cache.set(key, { price, ts: now() });
    return price;
  }

  return null;
}

// Optional helper to warm multiple prices at once
export async function getPrices(symbols = []) {
  const results = {};
  const promises = symbols.map(async (s) => {
    const p = await getPrice(s);
    results[s.toUpperCase()] = p;
  });
  await Promise.all(promises);
  return results;
}