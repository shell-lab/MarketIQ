import { NextResponse } from 'next/server';
import { getBridgeHistory } from '@/lib/mt5Bridge';

export async function GET(req) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const days = url.searchParams.get('days') || '7';
    const res = await getBridgeHistory(days);
    return NextResponse.json(res);
  } catch (err) {
    console.error('Dev proxy MT5 history error', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
