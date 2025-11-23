Notifications and Admin Moderation

This file documents how to enable notifications and moderation for the messaging system.

1) Cloud Function template
- See `functions/notifyOnMessage.js` in the repository. It is a Firebase Cloud Function template that triggers on new message documents under `conversations/{conversationId}/messages/{messageId}` and demonstrates sending FCM notifications.

To deploy:
- Install dependencies in the `functions/` folder:

  cd functions
  npm init -y
  npm install firebase-admin firebase-functions

- (Optional) install `nodemailer` for email:

  npm install nodemailer

- Configure function environment variables (FCM/SMTP) using Firebase CLI or console.
- Deploy with:

  firebase deploy --only functions:notifyOnMessage

Notes:
- The template expects client FCM tokens to be stored in `users/{uid}.fcmToken`.
- Vercel serverless functions can't be triggered by Firestore events; use Firebase Functions for Firestore triggers.

2) Admin moderation
- `components/AdminModeration.tsx` provides a simple UI to review messages with `flagged == true` across all conversations using a collectionGroup listener.
- Users can flag messages from the chat UI (ChatModal). Flagging sets `flagged: true`, `flagReason`, and `flaggedAt` on the message document.

Security
- Update `firestore.rules` to restrict moderation and deletion operations to admin users only. Options:
  - Maintain an `admins` collection with allowed admin uids and check membership in rules.
  - Use Firebase custom claims (set `admin: true`) and check `request.auth.token.admin == true`.

If you want, I can:
- Add UI wiring (Navbar link or a protected admin route) to surface `AdminModeration` only to admins.
- Update `firestore.rules` with an example admin-check using an `admins` collection.
- Add client code to register and store FCM tokens in the `users/{uid}` document when users grant notification permission.
  - Add client code to register and store FCM tokens in the `users/{uid}` document when users grant notification permission.

Client integration summary
- I added `services/notificationService.ts` which:
  - Requests Notification permission from the browser.
  - Uses `firebase/messaging` to obtain an FCM registration token (requires `VITE_FCM_VAPID_KEY` env var for the web VAPID key).
  - Stores the token in `users/{uid}.fcmToken`.
  - Removes the token on sign-out.

Files added/modified
- `services/notificationService.ts` — client helper to register/remove tokens and listen for foreground messages.
- `public/firebase-messaging-sw.js` — service-worker template for background notifications (must be customized with your Firebase config or replaced during deployment).
- `App.tsx` — calls the register/remove functions on sign-in/sign-out (best-effort).

Quick setup checklist
1. Add `VITE_FCM_VAPID_KEY` to your `.env.local` (the web push VAPID key from Firebase Cloud Messaging). Do not commit this file.
2. Place a working `firebase-messaging-sw.js` at the site root (the `public/` file will be copied there during the Vite build). Update its `firebaseConfig` values.
3. Deploy `functions/notifyOnMessage.js` if you want server-side push delivery.
4. Ensure your `users/{uid}` documents are writable by authenticated users (or the client code stores the token via the server) and readable by the functions that send notifications.

If you'd like, I can now:
- Update `firestore.rules` with an example that allows users to write their own `users/{uid}.fcmToken` but restricts moderation to `admins/{uid}`.
- Add a small UI toggle for users to opt-in/out of push notifications and to show current token status.
