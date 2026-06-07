import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp as _serverTimestamp } from "firebase/firestore";


// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAq1kRq_U37hCA6Pdu9eDjKGiQNpFcLn7w",
  authDomain: "chatting-system-web-app.firebaseapp.com",
  projectId: "chatting-system-web-app",
  storageBucket: "chatting-system-web-app.firebasestorage.app",
  messagingSenderId: "889372640113",
  appId: "1:889372640113:web:72a9492a476a9bc57aecd0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);