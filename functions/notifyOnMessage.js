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

    // Fetch tokens for recipients from users collection (support multiple tokens per user)
    const tokens = [];
    const tokenToUid = {};
    for (const uid of recipients) {
      const userDoc = await admin.firestore().doc(`users/${uid}`).get();
      if (!userDoc.exists) continue;
      const data = userDoc.data() || {};
      // Support both legacy `fcmToken` string and new `fcmTokens` array
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        for (const t of data.fcmTokens) {
          if (t) {
            tokens.push(t);
            tokenToUid[t] = uid;
          }
        }
      } else if (data.fcmToken) {
        tokens.push(data.fcmToken);
        tokenToUid[data.fcmToken] = uid;
      }
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

        // Cleanup invalid tokens: remove from the user's fcmTokens array when necessary
        if (response.failureCount > 0) {
          const toRemove = [];
          response.responses.forEach((res, i) => {
            if (!res.success) {
              const token = tokens[i];
              const err = res.error;
              console.warn('Token failed:', token, err && err.message);
              // Known permanent errors include 'registration-token-not-registered'
              const permanent = err && err.code && (err.code.includes('registration-token-not-registered') || err.code.includes('invalid-argument') || err.code.includes('messaging/invalid-registration-token'));
              if (permanent) toRemove.push(token);
            }
          });

          // Remove invalid tokens from respective user documents
          for (const token of toRemove) {
            const uid = tokenToUid[token];
            if (!uid) continue;
            try {
              await admin.firestore().doc(`users/${uid}`).update({
                fcmTokens: admin.firestore.FieldValue.arrayRemove(token)
              });
              console.log(`Removed invalid token for user ${uid}`);
            } catch (e) {
              console.warn('Failed to remove token from user doc', uid, e);
            }
          }
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
