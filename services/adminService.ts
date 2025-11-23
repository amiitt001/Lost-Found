import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Simple admin check: presence of a document at `admins/{uid}` indicates admin privileges.
 * You can replace this with custom claims or another mechanism as needed.
 */
export async function isAdminUser(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const ref = doc(db, 'admins', uid);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (err) {
    console.error('Failed to check admin status', err);
    return false;
  }
}
