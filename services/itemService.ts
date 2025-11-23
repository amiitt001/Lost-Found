import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
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

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamp to string or Date if needed, 
            // but our Item type uses string for date usually. 
            // Let's ensure it matches the Item interface.
            return {
                id: doc.id,
                ...data,
            } as Item;
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
        throw error;
    }
};
