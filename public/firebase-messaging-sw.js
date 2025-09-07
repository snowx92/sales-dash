// Firebase Cloud Messaging Service Worker
// This file must be at the root (public/) to have scope '/' in Next.js

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId. Other config values are optional here unless needed.
firebase.initializeApp({
  apiKey: 'AIzaSyCphwdKuRamYalQHBG6BVqpc--H3IwRi_Y',
  authDomain: 'brands-61c3d.firebaseapp.com',
  projectId: 'brands-61c3d',
  storageBucket: 'brands-61c3d.appspot.com',
  messagingSenderId: '473830923339',
  appId: '1:473830923339:web:9853f3a734d88908b141ce'
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
