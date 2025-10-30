import { NextResponse } from 'next/server';

// Simple in-memory cache to reduce external API calls during development
const cache = new Map(); // key: symbol, value: { ts, data }
const TTL = 15 * 1000; // 15 seconds

export async function POST(req) {
  try {
    const { symbols } = await req.json();
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({}, { status: 200 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || process.env.ALPHA_VANTAGE_KEY || process.env.NEXT_PUBLIC_ALPHAVANTAGE_KEY;

    // Helper to fetch a single symbol, with cache
    const fetchSymbol = async (symbol) => {
      const now = Date.now();
      const cached = cache.get(symbol);
      if (cached && (now - cached.ts) < TTL) {
        return cached.data;
      }

      // Use AlphaVantage GLOBAL_QUOTE as before
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        const quote = json['Global Quote'] || {};
        const price = quote['05. price'] ? parseFloat(quote['05. price']).toFixed(2) : null;
        const change = quote['09. change'] ? parseFloat(quote['09. change']).toFixed(2) : null;
        const changePercent = quote['10. change percent'] ? quote['10. change percent'].replace('%','') : null;
        const name = quote['02. name'] || symbol;
        const up = change !== null ? Number(change) >= 0 : null;

        const data = {
          symbol,
          price: price || '0.00',
          change: change || '0.00',
          changePercent: changePercent || '0.00',
          name,
          up,
        };

        cache.set(symbol, { ts: now, data });
        return data;
      } catch (err) {
        console.error('Error fetching symbol', symbol, err);
        return null;
      }
    };

    // Fetch all symbols in parallel (server side centralized)
    const results = await Promise.all(symbols.map(s => fetchSymbol(s)));
    const map = {};
    results.forEach(r => { if (r) map[r.symbol] = r; });

    return NextResponse.json(map);
  } catch (error) {
    console.error('Error in /api/watchlist/prices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
