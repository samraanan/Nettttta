import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAmQy9dC8Eu41YrFeSIXfwZO6WLXgKZ0P8",
    authDomain: "it-management-e6c9a.firebaseapp.com",
    projectId: "it-management-e6c9a",
    storageBucket: "it-management-e6c9a.firebasestorage.app",
    messagingSenderId: "282159526297",
    appId: "1:282159526297:web:1f3358682fa9c071f8e308",
    measurementId: "G-60Q1N38VFB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, firebaseConfig };
