// app/api/demo-trade/trade/route.js
import { getPrice } from '@/lib/marketData';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { user_id, symbol, side, qty } = await req.json();
  const price = await getPrice(symbol);

  // Fetch user portfolio, check cash/holdings, update as needed
  // Save trade to demo_trades table

  return NextResponse.json({ success: true, price });
}