const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : require('./firebase-service-account.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.warn('[Firebase] Warning: Failed to initialize Firebase Admin SDK. Push notifications will be disabled. Error:', error.message);
  }
}

module.exports = admin;
