import { NextResponse } from 'next/server';
import fs from 'fs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import connectMongoDB from '@/lib/mongodb';
import DemoPortfolio from '@/models/demoPortfolio';
import DemoTrade from '@/models/demoTrade';
import User from '@/models/user';
import { getPrice } from '@/lib/marketData';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
  console.log('[demo-trade] body:', body);
  try { fs.appendFileSync('./demo_trade_debug.log', `[body] ${JSON.stringify(body)}\n`); } catch(e){}
    const { symbol, side, quantity, stopLoss, takeProfit } = body;
    if (!symbol || !side || !quantity) {
      return NextResponse.json({ error: 'symbol, side and quantity are required' }, { status: 400 });
    }

    await connectMongoDB();
    console.log('[demo-trade] connected to MongoDB');
    try { fs.appendFileSync('./demo_trade_debug.log', `[mongodb] connected\n`); } catch(e){}
    const userEmail = session.user?.email || session.user?.id || session.user?.name || null;
    if (!userEmail) {
      console.warn('[demo-trade] session missing user identifier', session?.user);
      try { fs.appendFileSync('./demo_trade_debug.log', `[session] missing user identifier ${JSON.stringify(session)}\n`); } catch(e){}
      return NextResponse.json({ error: 'Unauthorized - no user identifier in session' }, { status: 401 });
    }

    let portfolio = await DemoPortfolio.findOne({ userId: userEmail });
  console.log('[demo-trade] existing portfolio:', portfolio);
  try { fs.appendFileSync('./demo_trade_debug.log', `[portfolio] ${JSON.stringify(portfolio)}\n`); } catch(e){}
    if (!portfolio) {
      portfolio = new DemoPortfolio({ userId: userEmail, cash: 100000, holdings: {} });
  console.log('[demo-trade] created new portfolio');
  try { fs.appendFileSync('./demo_trade_debug.log', `[portfolio] created new\n`); } catch(e){}
    }

    const price = await getPrice(symbol);
  console.log('[demo-trade] price for', symbol, price);
  try { fs.appendFileSync('./demo_trade_debug.log', `[price] ${symbol} = ${price}\n`); } catch(e){}
    if (!price || isNaN(price)) {
      return NextResponse.json({ error: 'Unable to fetch price for symbol' }, { status: 500 });
    }

    const qty = Number(quantity);
    if (qty <= 0) return NextResponse.json({ error: 'Quantity must be > 0' }, { status: 400 });

    if (side === 'buy') {
      const cost = price * qty;
      if (portfolio.cash < cost) {
        return NextResponse.json({ error: 'Insufficient cash balance' }, { status: 400 });
      }
      portfolio.cash = Number((portfolio.cash - cost).toFixed(2));
      portfolio.holdings = portfolio.holdings || {};
      portfolio.holdings[symbol] = (portfolio.holdings[symbol] || 0) + qty;
    } else if (side === 'sell') {
      portfolio.holdings = portfolio.holdings || {};
      const currentQty = portfolio.holdings[symbol] || 0;
      if (currentQty < qty) {
        return NextResponse.json({ error: 'Insufficient holdings' }, { status: 400 });
      }
      const proceeds = price * qty;
      portfolio.cash = Number((portfolio.cash + proceeds).toFixed(2));
      const remaining = currentQty - qty;
      if (remaining <= 0) {
        delete portfolio.holdings[symbol];
      } else {
        portfolio.holdings[symbol] = remaining;
      }
    } else {
      return NextResponse.json({ error: 'Invalid side' }, { status: 400 });
    }

    await portfolio.save();
  console.log('[demo-trade] saved portfolio');
  try { fs.appendFileSync('./demo_trade_debug.log', `[saved] portfolio\n`); } catch(e){}

    const trade = new DemoTrade({
      userId: userEmail,
      symbol,
      side,
      quantity: qty,
      price,
      stopLoss: stopLoss || null,
      takeProfit: takeProfit || null,
    });

    await trade.save();
  console.log('[demo-trade] saved trade');
  try { fs.appendFileSync('./demo_trade_debug.log', `[saved] trade\n`); } catch(e){}

    return NextResponse.json({ trade, portfolio }, { status: 201 });
  } catch (err) {
    console.error('Error executing demo trade', err);
    // Return error details in development to help debugging
    return NextResponse.json({ error: err.message || 'Internal Server Error', stack: err.stack }, { status: 500 });
  }
}
