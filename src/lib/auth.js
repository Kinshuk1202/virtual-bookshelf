import { ref } from 'vue'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

export const currentUser = ref(null)
// Flips true once Firebase has resolved whether a session is already persisted,
// so App.vue can avoid flashing the login screen on a page reload.
export const authReady = ref(false)

async function ensureProfileDoc(user) {
  const profileRef = doc(db, 'users', user.uid)
  const snap = await getDoc(profileRef)
  if (!snap.exists()) {
    await setDoc(profileRef, {
      displayName: user.displayName || '',
      email: user.email || '',
      createdAt: serverTimestamp(),
    })
  }
}

onAuthStateChanged(auth, async (user) => {
  currentUser.value = user
  if (user) {
    try {
      await ensureProfileDoc(user)
    } catch (e) {
      console.warn('Could not ensure profile doc', e)
    }
  }
  authReady.value = true
})

export async function signUp(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  const trimmedName = displayName.trim()
  if (trimmedName) {
    await updateProfile(cred.user, { displayName: trimmedName })
  }
  // Written last (and with merge) so it always reflects the name above, even if
  // the onAuthStateChanged listener above raced in and created a doc first.
  await setDoc(
    doc(db, 'users', cred.user.uid),
    { displayName: trimmedName, email: cred.user.email || '', createdAt: serverTimestamp() },
    { merge: true }
  )
}

export async function signIn(email, password) {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function signInWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider())
}

export async function signOutUser() {
  await signOut(auth)
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email)
}
