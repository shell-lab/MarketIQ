import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import connectMongoDB from '@/lib/mongodb';
import DemoTrade from '@/models/demoTrade';
import { placeOrderOnBridge } from '@/lib/mt5Bridge';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { symbol, side, volume, lots, stopLoss, takeProfit, idempotencyKey } = body;

    if (!symbol || !side) {
      return NextResponse.json({ error: 'symbol and side required' }, { status: 400 });
    }

    // Basic volume fallback
    const orderPayload = {
      symbol,
      side,
      volume: volume || lots || 0.01,
      stopLoss: stopLoss || null,
      takeProfit: takeProfit || null
    };

    // Optionally check idempotency (skip duplicate execution)
    await connectMongoDB();
    if (idempotencyKey) {
      const existing = await DemoTrade.findOne({ "meta.idempotencyKey": idempotencyKey, userId: session.user.email });
      if (existing) {
        return NextResponse.json({ message: 'Duplicate', trade: existing }, { status: 200 });
      }
    }

    const res = await placeOrderOnBridge(orderPayload);

    // persist in demo trade collection for audit (reuse DemoTrade schema)
    const tradeDoc = new DemoTrade({
      userId: session.user.email,
      symbol: symbol,
      side: side,
      quantity: orderPayload.volume,
      price: res?.order_result?.price || res?.order_result?.order_price || null,
      stopLoss: orderPayload.stopLoss,
      takeProfit: orderPayload.takeProfit,
      timestamp: new Date(),
      meta: { bridgeResponse: res, idempotencyKey }
    });

    await tradeDoc.save();

    return NextResponse.json({ ok: true, result: res, trade: tradeDoc }, { status: 201 });
  } catch (err) {
    console.error('MT5 order error', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
