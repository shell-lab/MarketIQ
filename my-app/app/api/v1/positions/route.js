import admin from '@/lib/firebaseAdmin';
import { decrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });

    // verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token).catch(() => null);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const userId = decoded.uid;
    const appId = process.env.__APP_ID || 'default-app-id';

    const docRef = admin.firestore().doc(`artifacts/${appId}/users/${userId}/secure_config/broker_settings`);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      // return mock positions if secure config absent (safe fallback)
      return NextResponse.json([
        { id: 12345, symbol: "XAU/USD", side: "Buy", volume: 0.01, openPrice: 4113.88, sl: 4100.00, tp: 4124.00, pnl: -2.11 },
        { id: 12346, symbol: "EUR/USD", side: "Sell", volume: 0.10, openPrice: 1.1590, sl: 1.1650, tp: 1.1500, pnl: 5.40 }
      ]);
    }

    const { apiKeyEncrypted } = docSnap.data() || {};
    const brokerApiKey = apiKeyEncrypted ? decrypt(apiKeyEncrypted) : null;

    // If you have a real broker call, call it here with brokerApiKey.
    // For now return same mock data:
    return NextResponse.json([
      { id: 12345, symbol: "XAU/USD", side: "Buy", volume: 0.01, openPrice: 4113.88, sl: 4100.00, tp: 4124.00, pnl: -2.11 },
      { id: 12346, symbol: "EUR/USD", side: "Sell", volume: 0.10, openPrice: 1.1590, sl: 1.1650, tp: 1.1500, pnl: 5.40 }
    ]);
  } catch (error) {
    console.error('GET /api/v1/positions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}