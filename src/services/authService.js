import { auth, db, firebaseConfig } from './firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    getAuth
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const authService = {
    async login(email, password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
            throw new Error('משתמש לא נמצא במערכת (נא לפנות למנהל המערכת הראשי)');
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

    async adminCreateUser({ email, password, displayName, role, phone, schoolId, schoolName }) {
        const appName = `SecondaryApp_${Date.now()}`;
        const secondaryApp = initializeApp(firebaseConfig, appName);
        const secondaryAuth = getAuth(secondaryApp);

        try {
            const result = await createUserWithEmailAndPassword(secondaryAuth, email, password);
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

            // Write to Firestore using the primary app (manager's auth context)
            await setDoc(doc(db, 'users', result.user.uid), userData);

            // Sign out the secondary app just in case
            await signOut(secondaryAuth);

            return userData;
        } finally {
            await deleteApp(secondaryApp);
        }
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
