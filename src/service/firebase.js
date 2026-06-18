import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Activate App Check Debug mode globally on localhost architectures
const isLocalhost = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

if (isLocalhost) {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// Dynamically use standard v3 Provider or pass a debug auto-token fallback
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Ldv7popAAAAAOfhP6N_eF5v5z2Oas69D4U6_XYZ'), // Put your real Google v3 key here if available
  isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };