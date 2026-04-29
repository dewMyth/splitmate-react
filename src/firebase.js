// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCojU-32Y5PK9jV20Oql8zEDij1bh_uOrc",
  authDomain: "splitmate-918f8.firebaseapp.com",
  projectId: "splitmate-918f8",
  storageBucket: "splitmate-918f8.firebasestorage.app",
  messagingSenderId: "807652004862",
  appId: "1:807652004862:web:9ebb22d2c79d4321daa6af",
  measurementId: "G-BY6WDZ9D64",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
