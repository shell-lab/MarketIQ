import admin from '../../../lib/firebaseAdmin'; // Adjust path if needed
import { decrypt } from '../../../lib/crypto'; // Adjust path if needed
import axios from 'axios'; // For making HTTP requests to the broker

const db = admin.firestore();
const auth = admin.auth();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 1. Authenticate the user from the token
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        
        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        // 2. Get the trade request from our frontend
        const tradeOrder = req.body;
        console.log(`Processing order for user ${userId}:`, tradeOrder);

        // 3. Fetch the user's ENCRYPTED API key from Firestore
        const docRef = db.doc(`artifacts/${appId}/users/${userId}/secure_config/broker_settings`);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Broker API key not found for user.' });
        }

        const { apiKeyEncrypted, apiSecretEncrypted } = docSnap.data();

        // 4. Decrypt the key
        const brokerApiKey = decrypt(apiKeyEncrypted);
        // const brokerApiSecret = decrypt(apiSecretEncrypted); // If needed

        // 5. Call the REAL BROKER'S API
        // This is a MOCKUP. You must replace this with your broker's actual API.
        const brokerApiUrl = 'https://api.your-broker.com/v1/orders/market';
        const headers = {
            'Authorization': `Bearer ${brokerApiKey}`,
            'Content-Type': 'application/json'
        };

        const brokerPayload = {
            symbol: tradeOrder.symbol,
            type: "MARKET",
            side: tradeOrder.side,
            volume: tradeOrder.volume,
            // ... add SL, TP, etc., as required by your broker's API spec
        };

        console.log("Forwarding to broker:", brokerApiUrl, brokerPayload);

        // const brokerResponse = await axios.post(brokerApiUrl, brokerPayload, { headers });
        
        // --- MOCK RESPONSE (Remove in production) ---
        // Simulate a successful trade
        const mockBrokerResponse = {
            data: {
                status: "filled",
                orderId: `mock_${Date.now()}`,
                avgPrice: 4115.00
            }
        };
        console.log("Mock broker response:", mockBrokerResponse.data);
        // --- End Mock Response ---

        // 6. Send the broker's response back to our frontend
        // res.status(200).json(brokerResponse.data); // Real response
        res.status(200).json(mockBrokerResponse.data); // Mock response

    } catch (error) {
        console.error('API Route Error:', error);
        if (error.response) { // Handle errors from the broker API
            return res.status(error.response.status).json({ error: error.response.data.error });
        }
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ error: 'Auth token expired. Please re-authenticate.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
