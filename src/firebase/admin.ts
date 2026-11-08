
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';

let adminApp: App;

export function getFirebaseAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }
  
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // For local development or environments without the service account env var
    adminApp = initializeApp();
  }

  return adminApp;
}
