import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCK-uKujPuYXL1hmV2r7nTHmYJfyWDresU",
  authDomain: "interviewprep-939b4.firebaseapp.com",
  projectId: "interviewprep-939b4",
  storageBucket: "interviewprep-939b4.firebasestorage.app",
  messagingSenderId: "422920351116",
  appId: "1:422920351116:web:2d85a05331e4fe50e13aa9",
  measurementId: "G-9S38TGKLP5"
};

console.log("Firebase Api key : ", process.env.FIREBASE_API_KEY)

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  // We're in the browser
  analytics = getAnalytics(app);
}

export { auth, analytics };