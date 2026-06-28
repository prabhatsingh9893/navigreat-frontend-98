// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const firebaseConfig = {
  apiKey: "AIzaSyDeptcTFcA7-3l8mRmgWKdcAtme_t-YIHo",
  authDomain: isLocalhost ? "edumentor-auth-37712.firebaseapp.com" : window.location.hostname,
  projectId: "edumentor-auth-37712",
  storageBucket: "edumentor-auth-37712.firebasestorage.app",
  messagingSenderId: "414293925328",
  appId: "1:414293925328:web:4a503e0e68eec34d93add5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const messaging = getMessaging(app);

export { auth, provider, messaging, app };