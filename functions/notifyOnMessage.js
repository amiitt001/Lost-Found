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

    // Example payload; you'll need to map uid -> device token stored in your users collection
    const tokens = [];

    // Fetch tokens from users collection (you must store tokens when clients register)
    for (const uid of recipients) {
      const userDoc = await admin.firestore().doc(`users/${uid}`).get();
      const token = userDoc.exists ? userDoc.data()?.fcmToken : null;
      if (token) tokens.push(token);
    }

    if (tokens.length > 0) {
      const payload = {
        notification: {
          title: `New message about ${conv?.itemId || 'an item'}`,
          body: message.text?.slice(0, 120) || 'You have a new message',
        },
        data: {
          conversationId,
        }
      };
      try {
        await admin.messaging().sendToDevice(tokens, payload);
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
