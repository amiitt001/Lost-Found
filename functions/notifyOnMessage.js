// Firebase Cloud Function template: deploy this with Firebase Functions to trigger on new messages.
// This file is a starting point — you'll need to run `npm install firebase-admin firebase-functions nodemailer` in the functions folder
// and configure FCM server keys and an SMTP provider as environment variables in your Firebase project.

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Example: notify participants via FCM when a new message is created
exports.notifyOnMessage = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const conversationId = context.params.conversationId;

    // Load conversation to get participants
    const convRef = admin.firestore().doc(`conversations/${conversationId}`);
    const convSnap = await convRef.get();
    if (!convSnap.exists) return null;
    const conv = convSnap.data();
    const participants = conv?.participants || [];

    // Remove the sender from recipients
    const recipients = participants.filter(uid => uid !== message.senderId);
    if (recipients.length === 0) return null;

    // Fetch tokens for recipients from users collection (you must store tokens when clients register)
    const tokens = [];
    for (const uid of recipients) {
      const userDoc = await admin.firestore().doc(`users/${uid}`).get();
      const token = userDoc.exists ? userDoc.data()?.fcmToken : null;
      if (token) tokens.push(token);
    }

    if (tokens.length > 0) {
      // Try to fetch item title for a better notification string
      let itemTitle = conv?.itemId || 'an item';
      try {
        if (conv?.itemId) {
          const itemDoc = await admin.firestore().doc(`items/${conv.itemId}`).get();
          if (itemDoc.exists) itemTitle = itemDoc.data()?.title || itemTitle;
        }
      } catch (e) {
        // ignore
      }

      const sender = message.senderName || 'Someone';
      const payload = {
        notification: {
          title: `${sender} sent a message about ${itemTitle}`,
          body: message.text?.slice(0, 120) || 'You have a new message',
        },
        data: {
          conversationId,
        }
      };

      // Use sendMulticast for multiple tokens
      try {
        const multicast = { tokens, ...payload };
        const response = await admin.messaging().sendMulticast({
          tokens,
          notification: payload.notification,
          data: payload.data
        });
        // Log failures and consider cleaning invalid tokens
        if (response.failureCount > 0) {
          const errors = response.responses
            .map((r, i) => ({ success: r.success, error: r.error, token: tokens[i] }))
            .filter(r => !r.success);
          console.warn('Some tokens failed:', errors);
        }
      } catch (err) {
        console.error('FCM send error', err);
      }
    }

    // Optionally send email notifications using nodemailer
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({/* SMTP config from env */});
    // Fetch recipient emails and send mails

    return null;
  });
