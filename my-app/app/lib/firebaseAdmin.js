import admin from 'firebase-admin';

// This is your SERVICE ACCOUNT KEY.
// DO NOT hardcode it. Store it in environment variables.
// Example: process.env.FIREBASE_SERVICE_ACCOUNT
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // Add your databaseURL if needed, e.g.:
            // databaseURL: "https://<PROJECT_ID>.firebaseio.com"
        });
    } catch (e) {
        console.error('Firebase admin initialization error', e);
    }
}

export default admin;
