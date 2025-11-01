import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { keywords } = await req.json();
    if (!keywords) return NextResponse.json({ matches: [] });

    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_KEY || process.env.NEXT_PUBLIC_ALPHAVANTAGE_KEY;
    if (!apiKey) return NextResponse.json({ matches: [] });

    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    const matches = (data.bestMatches || []).map((m) => ({
      symbol: m['1. symbol'],
      name: m['2. name'],
      type: m['3. type'],
      region: m['4. region'],
    }));

    return NextResponse.json({ matches });
  } catch (err) {
    console.error('Error searching symbols', err);
    return NextResponse.json({ matches: [] }, { status: 500 });
  }
}
