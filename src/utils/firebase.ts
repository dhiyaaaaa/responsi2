// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCL-0USLfYDqGCv7Rvp-le7bOFDAMPduxU",
  authDomain: "vue-firebase-a8a92.firebaseapp.com",
  projectId: "vue-firebase-a8a92",
  storageBucket: "vue-firebase-a8a92.firebasestorage.app",
  messagingSenderId: "520873233436",
  appId: "1:520873233436:web:c084ecf43cc5fa236123d9",
  measurementId: "G-VM6BMLYNFR"
};

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();

const db = getFirestore(firebase);

export { auth, googleProvider, db };


