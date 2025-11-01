import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import connectMongoDB from '@/lib/mongodb';
import DemoTrade from '@/models/demoTrade';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectMongoDB();
    const userEmail = session.user.email;
    const trades = await DemoTrade.find({ userId: userEmail }).sort({ createdAt: -1 }).limit(200);
    return NextResponse.json(trades);
  } catch (err) {
    console.error('Error fetching demo trade history', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
