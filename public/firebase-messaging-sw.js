// navigreat-frontend/public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyDeptcTFcA7-3l8mRmgWKdcAtme_t-YIHo",
  authDomain: "edumentor-auth-37712.firebaseapp.com",
  projectId: "edumentor-auth-37712",
  storageBucket: "edumentor-auth-37712.firebasestorage.app",
  messagingSenderId: "414293925328",
  appId: "1:414293925328:web:4a503e0e68eec34d93add5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title || 'New Message';
  const notificationOptions = {
    body: payload.notification.body || 'You have received a new message.',
    icon: '/logo.png', // Add custom icon path if needed
    badge: '/badge.png', // Custom badge path if needed
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
