
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

// Safety check to detect if user has provided real credentials
export const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" && 
  firebaseConfig.projectId !== "YOUR_FIREBASE_PROJECT_ID";

let firebaseApp;
let firestore;
let firebaseAuth;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestore = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
  } catch (error) {
    console.warn("BODYOS: Firebase initialization failed despite config presence.", error);
  }
}

export const app = firebaseApp;
export const db = firestore;
export const auth = firebaseAuth;
