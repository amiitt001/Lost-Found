import { db } from './firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, addDoc, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

/**
 * Conversation document structure:
 * conversations/{id} = { itemId, participants: [uid1, uid2], createdAt }
 * messages are stored under conversations/{id}/messages with { senderId, text, createdAt }
 */

export const getConversationDocRef = (conversationId: string) => doc(db, 'conversations', conversationId);

export async function findExistingConversation(itemId: string, userA: string, userB: string) {
  const q = query(collection(db, 'conversations'), where('itemId', '==', itemId));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const data = d.data();
    const parts: string[] = data.participants || [];
    if (parts.includes(userA) && parts.includes(userB)) return d.id;
  }
  return null;
}

export async function createConversation(itemId: string, participants: string[]) {
  const docRef = doc(collection(db, 'conversations'));
  const payload = { itemId, participants, createdAt: serverTimestamp() } as any;
  await setDoc(docRef, payload);
  return docRef.id;
}

export async function getOrCreateConversation(itemId: string, userA: string, userB: string) {
  const existing = await findExistingConversation(itemId, userA, userB);
  if (existing) return existing;
  return await createConversation(itemId, [userA, userB]);
}

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const msg = { senderId, text, createdAt: serverTimestamp() } as any;
  await addDoc(messagesRef, msg);
}

export function subscribeToMessages(conversationId: string, callback: (messages: any[]) => void) {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}
