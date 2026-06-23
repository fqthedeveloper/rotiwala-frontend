importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js"
);

firebase.initializeApp({

  apiKey:
    "AIzaSyCgl58euUy_5Lw4bnHSCbfgJFjyWqEH0NA",

  authDomain:
    "roti-wala-e5f0d.firebaseapp.com",

  projectId:
    "roti-wala-e5f0d",

  storageBucket:
    "roti-wala-e5f0d.firebasestorage.app",

  messagingSenderId:
    "1055576828309",

  appId:
    "1:1055576828309:web:bd980d9fb8fdf972ebee9c",
});

const messaging =
  firebase.messaging();

messaging.onBackgroundMessage(
  (payload) => {

    self.registration.showNotification(

      payload.notification.title,

      {
        body:
          payload.notification.body,

        icon:
          "/favicon.ico",
      }
    );
  }
);