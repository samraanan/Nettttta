import { auth, db } from './firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const authService = {
    async login(email, password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
            throw new Error('משתמש לא נמצא במערכת');
        }
        return { uid: result.user.uid, ...userDoc.data() };
    },

    async register({ email, password, displayName, role, phone, schoolId, schoolName }) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
            uid: result.user.uid,
            email,
            displayName,
            role,
            phone: phone || null,
            schoolId: schoolId || null,
            schoolName: schoolName || null,
            active: true,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', result.user.uid), userData);
        return userData;
    },

    async logout() {
        await signOut(auth);
    },

    onAuthChange(callback) {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        callback({ uid: firebaseUser.uid, ...userDoc.data() });
                    } else {
                        callback(null);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    callback(null);
                }
            } else {
                callback(null);
            }
        });
    }
};
