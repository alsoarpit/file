import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDYMVhKN_y2DAO2milyeIP5RmKJD69t-MU",
  authDomain: "test-project-d90d4.firebaseapp.com",
  projectId: "test-project-d90d4",
  storageBucket: "test-project-d90d4.firebasestorage.app",
  messagingSenderId: "70012482418",
  appId: "1:70012482418:web:116c8f838946ac4688a3eb",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export const loginWithGoogle = () => signInWithPopup(auth, provider)
export const logout = () => signOut(auth)
