import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYKfOkC6B1Mex85T96_7hty_CIyNUS1D4",
  authDomain: "voting-app-sr-design.firebaseapp.com",
  projectId: "voting-app-sr-design",
  storageBucket: "voting-app-sr-design.appspot.com",
  messagingSenderId: "372353974197",
  appId: "1:372353974197:web:8ae494da939d6a9a74a3fc",
  measurementId: "G-270L356TVG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
export { database, app, analytics };
