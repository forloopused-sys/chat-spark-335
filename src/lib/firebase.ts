import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB7a3GqbnrWHrgPutzYAUjxjNCO2PxSZCQ",
  authDomain: "chat-now-38351.firebaseapp.com",
  databaseURL: "https://chat-now-38351-default-rtdb.firebaseio.com",
  projectId: "chat-now-38351",
  storageBucket: "chat-now-38351.firebasestorage.app",
  messagingSenderId: "118798216952",
  appId: "1:118798216952:web:963df83030abdffe24550d",
  measurementId: "G-17LPMXF1H6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
