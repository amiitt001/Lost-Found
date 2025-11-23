import { getMessaging, getToken, deleteToken, onMessage } from 'firebase/messaging';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const VAPID_KEY = (import.meta as any).env?.VITE_FCM_VAPID_KEY || '';

export async function registerFcmTokenForUser(uid: string) {
  if (!uid) return null;
  try {
    const messaging = getMessaging();
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) return null;
    // Save token to users/{uid}.fcmToken (overwrite existing)
    await setDoc(doc(db, 'users', uid), { fcmToken: token }, { merge: true });
    return token;
  } catch (err) {
    console.error('Failed to register FCM token', err);
    return null;
  }
}

export async function removeFcmTokenForUser(uid: string) {
  if (!uid) return;
  try {
    const messaging = getMessaging();
    const token = await getToken(messaging, { vapidKey: VAPID_KEY }).catch(() => null);
    if (token) await deleteToken(messaging).catch(() => null);
    // Remove token from users/{uid}
    await setDoc(doc(db, 'users', uid), { fcmToken: null }, { merge: true });
  } catch (err) {
    console.error('Failed to remove FCM token', err);
  }
}

// Optional: listen to foreground messages
export function onForegroundMessage(callback: (payload: any) => void) {
  try {
    const messaging = getMessaging();
    return onMessage(messaging, callback as any);
  } catch (err) {
    console.warn('onForegroundMessage not available', err);
    return () => {};
  }
}
