import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { isAdminUser } from './adminService';
import { Item } from '../types';

const ITEMS_COLLECTION = 'items';

export const addItemToFirestore = async (item: Omit<Item, 'id'>): Promise<Item> => {
    try {
        const docRef = await addDoc(collection(db, ITEMS_COLLECTION), {
            ...item,
            createdAt: Timestamp.now(),
        });
        return {
            ...item,
            id: docRef.id,
        };
    } catch (error) {
        console.error("Error adding document: ", error);
        throw error;
    }
};

export const getItemsFromFirestore = async (): Promise<Item[]> => {
    try {
        const q = query(collection(db, ITEMS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        // Determine current user and admin status to control visibility for FOUND items
        const currentUser = auth.currentUser;
        const currentUid = currentUser ? currentUser.uid : null;
        const isAdmin = currentUid ? await isAdminUser(currentUid) : false;

        const items: Item[] = [];
        querySnapshot.docs.forEach(d => {
            const data = d.data() as any;
            const type = data.type;

            // Visibility rules enforced client-side as an additional safety layer:
            // - Admins always see items
            // - Non-FOUND items are visible
            // - Uploader (owner) can see their own FOUND items
            // - Items with matchConfidence > 0.1 are visible
            const matchConfidence = typeof data.matchConfidence === 'number' ? data.matchConfidence : parseFloat(data.matchConfidence || '0');

            const visible = isAdmin
                || type !== 'FOUND'
                || (currentUid && currentUid === data.userId)
                || (!isNaN(matchConfidence) && matchConfidence > 0.1);

            if (visible) {
                items.push({ id: d.id, ...(data as any) } as Item);
            }
        });

        return items;
    } catch (error) {
        console.error("Error getting documents: ", error);
        throw error;
    }
};

export const updateItemStatus = async (itemId: string, status: 'RESOLVED'): Promise<void> => {
    try {
        const itemRef = doc(db, ITEMS_COLLECTION, itemId);
        await updateDoc(itemRef, { status });
    } catch (error) {
        console.error("Error updating document: ", error);
        throw error;
    }
};

export const deleteItemFromFirestore = async (itemId: string): Promise<void> => {
    try {
        const itemRef = doc(db, ITEMS_COLLECTION, itemId);
        await deleteDoc(itemRef);
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw error;
    }
};
