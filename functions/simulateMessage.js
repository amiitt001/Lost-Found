/**
 * Simple script to create a conversation, add test users with fcmTokens, and create a message to trigger the Cloud Function.
 * Use with the Firebase emulators or against a test project.
 *
 * Usage:
 *   node simulateMessage.js
 *
 * Before running with emulators set FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST as needed,
 * or run via `firebase emulators:start --only functions,firestore` and run this from the functions folder.
 */

const admin = require('firebase-admin');

// Initialize default app (emulator picks up env vars)
admin.initializeApp();

const db = admin.firestore();

async function run() {
  // Create two test users with tokens
  const userA = { uid: 'userA', fcmTokens: ['tokenA1', 'tokenA2'] };
  const userB = { uid: 'userB', fcmTokens: ['tokenB1'] };

  await db.doc(`users/${userA.uid}`).set({ fcmTokens: userA.fcmTokens, email: 'a@example.com' });
  await db.doc(`users/${userB.uid}`).set({ fcmTokens: userB.fcmTokens, email: 'b@example.com' });

  // Create example item
  const itemRef = db.collection('items').doc();
  await itemRef.set({ title: 'Blue Backpack', userId: userA.uid });

  // Create conversation for item between userA (owner) and userB
  const convRef = db.collection('conversations').doc();
  await convRef.set({ itemId: itemRef.id, participants: [userA.uid, userB.uid], createdAt: admin.firestore.FieldValue.serverTimestamp() });

  // Add a message from userB — this should trigger the notifyOnMessage function in emulator
  const msgRef = convRef.collection('messages').doc();
  await msgRef.set({ senderId: userB.uid, senderName: 'Bob', text: 'Hi, is this still available?', createdAt: admin.firestore.FieldValue.serverTimestamp() });

  console.log('Simulation data written. conversationId=', convRef.id, 'messageId=', msgRef.id);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
