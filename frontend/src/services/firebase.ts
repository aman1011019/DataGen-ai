import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCBDQSUSxOUDZNElLYrJ_DOz6pDCUdBhNE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "datagen-da10d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "datagen-da10d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "datagen-da10d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "429654978388",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:429654978388:web:9206195d3dba34d5dfa2c1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-T2FVTVB0XV",
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Analytics support check
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Internal default API key for Gemini AI (not exposed to users)
export const FIREBASE_GEMINI_API_KEY = firebaseConfig.apiKey;
