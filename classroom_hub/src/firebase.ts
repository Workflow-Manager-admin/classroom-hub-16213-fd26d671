import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// PUBLIC_INTERFACE
/**
 * Initializes and returns the Firebase app instance.
 * Uses process.env for configuration, supporting both local and production setups securely.
 */
function getFirebaseConfig() {
  if (!process.env.REACT_APP_FIREBASE_API_KEY ||
      !process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
      !process.env.REACT_APP_FIREBASE_PROJECT_ID ||
      !process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
      !process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
      !process.env.REACT_APP_FIREBASE_APP_ID) {
    throw new Error(
      "Missing Firebase configuration in environment variables. Please set REACT_APP_FIREBASE_* vars in your .env file."
    );
  }
  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };
}

// PUBLIC_INTERFACE
/**
 * Exported initialized Firebase app instance (singleton).
 */
export const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(getFirebaseConfig()) : getApp();

// PUBLIC_INTERFACE
/**
 * Exported Firebase Auth instance, ready for use in components/hooks.
 */
export const auth: Auth = getAuth(firebaseApp);
