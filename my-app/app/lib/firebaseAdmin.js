import admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(
        typeof serviceAccount === 'string' 
          ? JSON.parse(serviceAccount)
          : serviceAccount
      ),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}

export default admin;
