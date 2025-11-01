import { NextResponse } from 'next/server';
import { getBridgePositions } from '@/lib/mt5Bridge';

export async function GET(req) {
  // Only enable in development to avoid exposing the bridge in production
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  try {
    const res = await getBridgePositions();
    return NextResponse.json(res);
  } catch (err) {
    console.error('Dev proxy MT5 positions error', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
