import { initializeApp } from "firebase/app";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import {
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";

import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "firebase/app-check";

const firebaseConfig = {

  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY,

  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID,

  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    import.meta.env
      .VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    import.meta.env.VITE_FIREBASE_APP_ID,
};

const app =
  initializeApp(
    firebaseConfig
  );

const isLocalhost =
  typeof window !==
    "undefined" &&
  (
    window.location
      .hostname ===
      "localhost" ||

    window.location
      .hostname ===
      "127.0.0.1"
  );

if (isLocalhost) {

  window.FIREBASE_APPCHECK_DEBUG_TOKEN =
    true;
}

initializeAppCheck(
  app,
  {
    provider:
      new ReCaptchaV3Provider(
        "6Ldv7popAAAAAOfhP6N_eF5v5z2Oas69D4U6_XYZ"
      ),

    isTokenAutoRefreshEnabled:
      true,
  }
);

const auth =
  getAuth(app);

const messaging =
  getMessaging(app);

export {
  auth,
  messaging,
  getToken,
  onMessage,
  RecaptchaVerifier,
  signInWithPhoneNumber,
};