// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 👇 अपना Firebase वाला कोड यहाँ पेस्ट करें 👇
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "edumentor-auth.firebaseapp.com",
  projectId: "edumentor-auth",
  storageBucket: "edumentor-auth.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };