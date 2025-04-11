import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database"; // Import the necessary methods for Realtime Database
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCplN2pB4VsOHhxQfXB7aQnKo0YilDmlpY",
  authDomain: "embedded-81f6c.firebaseapp.com",
  databaseURL: "https://embedded-81f6c-default-rtdb.asia-southeast1.firebasedatabase.app", // Correct Realtime Database URL
  projectId: "embedded-81f6c",
  storageBucket: "embedded-81f6c.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Initialize the Realtime Database
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
