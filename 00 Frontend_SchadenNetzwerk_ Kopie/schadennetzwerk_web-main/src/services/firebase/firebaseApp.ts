import { initializeApp } from "firebase/app";

import { FIREBASE_API } from "src/config-global";

// Initialize Firebase
const firebaseApp = initializeApp(FIREBASE_API);
export default firebaseApp;
