import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpasI_y-aIGFldPiv2DwJit0S7XhG5jkk",
  authDomain: "projectx-58a7e.firebaseapp.com",
  projectId: "projectx-58a7e",
  storageBucket: "projectx-58a7e.firebasestorage.app",
  messagingSenderId: "352189023227",
  appId: "1:352189023227:web:7f93f838432329b42e815e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
