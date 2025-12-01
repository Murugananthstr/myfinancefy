import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAslhQzd6sQaWkMtMOzy0FLpqCRuUC1Eww",
  authDomain: "myfinancefy.firebaseapp.com",
  projectId: "myfinancefy",
  storageBucket: "myfinancefy.firebasestorage.app",
  messagingSenderId: "914225680916",
  appId: "1:914225680916:web:5aa555727e258f777c8d01"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('Firebase initialized successfully');
console.log('Firestore instance:', db);
console.log('Auth instance:', auth);

export default app;
