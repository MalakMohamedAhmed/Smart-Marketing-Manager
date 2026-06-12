import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBDYMQfkYlzElmxR0LUlNL4nYscePwKNpU",
  authDomain: "smart-campaign-manager-f07bc.firebaseapp.com",
  projectId: "smart-campaign-manager-f07bc",
  storageBucket: "smart-campaign-manager-f07bc.firebasestorage.app",
  messagingSenderId: "514234482414",
  appId: "1:514234482414:web:0494829eea26c8aa16fdff",
  measurementId: "G-9QM1Z5GFG2"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app