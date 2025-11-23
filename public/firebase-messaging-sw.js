/* Firebase Messaging Service Worker
 * Place this file at `public/firebase-messaging-sw.js` so Vite copies it to the root during dev/build.
 * Customize as needed. This handler shows how to display notifications for background messages.
 */
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// Replace with your Firebase config values or set them dynamically during deploy.
const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'New message';
  const notificationOptions = {
    body: payload.notification?.body || '',
    data: payload.data || {}
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
