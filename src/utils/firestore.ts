// src/utils/firestore.ts
import { auth, db } from "./firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';

// interface data
export interface Mainan {
    id?: string;
    nama: string;
    description: string;
    status: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// operasi CRUD
export const firestoreService = {
    // get collection ref
    getMainanRef() {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('User not authenticated');
        return collection(db, 'andys', uid, 'mainans');
    },

		// create
    async addMainan(mainan: Omit<Mainan, 'id'>) {
        try {
            const mainanRef = this.getMainanRef();
            const docRef = await addDoc(mainanRef, {
                ...mainan,
                status: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error Tambah Mainan:', error);
            throw error;
        }
    },

		// read
    async getMainans(): Promise<Mainan[]> {
        try {
            const mainanRef = this.getMainanRef();
            const q = query(mainanRef, orderBy('updatedAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            } as Mainan));
        } catch (error) {
            console.error('Error Get Mainan:', error);
            throw error;
        }
    },

		// update
    async updateMainan(id: string, mainan: Partial<Mainan>) {
        try {
            const mainanRef = this.getMainanRef();
            const docRef = doc(mainanRef, id);
            await updateDoc(docRef, {
                ...mainan,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error Update Mainan:', error);
            throw error;
        }
    },

		// delete
    async deleteMainan(id: string) {
        try {
            const mainanRef = this.getMainanRef();
            const docRef = doc(mainanRef, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error Delete mainan:', error);
            throw error;
        }
    },

		// update status
    async updateStatus(id: string, status: boolean) {
        try {
            const mainanRef = this.getMainanRef();
            const docRef = doc(mainanRef, id);
            await updateDoc(docRef, { status: status, updatedAt: Timestamp.now() });
        } catch (error) {
            console.error('Error Update Status:', error);
            throw error;
        }
    }

}