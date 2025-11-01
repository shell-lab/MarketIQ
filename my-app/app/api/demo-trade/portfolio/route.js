import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import connectMongoDB from '@/lib/mongodb';
import DemoPortfolio from '@/models/demoPortfolio';
import User from '@/models/user';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectMongoDB();
    const userEmail = session.user.email;

    let portfolio = await DemoPortfolio.findOne({ userId: userEmail });
    if (!portfolio) {
      portfolio = new DemoPortfolio({ userId: userEmail, cash: 100000, holdings: {} });
      await portfolio.save();
    }

    return NextResponse.json(portfolio);
  } catch (err) {
    console.error('Error fetching demo portfolio', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
