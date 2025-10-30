import admin from '@/lib/firebaseAdmin';
import { decrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });

    const decoded = await admin.auth().verifyIdToken(token).catch(() => null);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const userId = decoded.uid;
    const body = await req.json();

    // Fetch encrypted broker key from Firestore and decrypt
    const appId = process.env.__APP_ID || 'default-app-id';
    const docRef = admin.firestore().doc(`artifacts/${appId}/users/${userId}/secure_config/broker_settings`);
    const docSnap = await docRef.get();

    // If no broker key, return mock success (or return 404)
    if (!docSnap.exists) {
      // Mock response
      return NextResponse.json({ status: "filled", orderId: `mock_${Date.now()}`, avgPrice: 4115.0 });
    }

    const { apiKeyEncrypted } = docSnap.data() || {};
    const brokerApiKey = apiKeyEncrypted ? decrypt(apiKeyEncrypted) : null;

    // TODO: call real broker API using brokerApiKey
    return NextResponse.json({ status: "filled", orderId: `mock_${Date.now()}`, avgPrice: 4115.0 });
  } catch (error) {
    console.error('POST /api/v1/order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}