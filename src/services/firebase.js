import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDSw9tXX12Z44wTJX7K1Lk5Am5W_JPCYIw",
    authDomain: "netaaaa.firebaseapp.com",
    projectId: "netaaaa",
    storageBucket: "netaaaa.firebasestorage.app",
    messagingSenderId: "548464547784",
    appId: "1:548464547784:web:8c4b385c938bb6d93592fd",
    measurementId: "G-DRVF5C3BQ9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, firebaseConfig };
