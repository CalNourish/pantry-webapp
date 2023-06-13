import firebase from 'firebase/compat/app'
import 'firebase/compat/storage' // If you need it
import 'firebase/compat/database' // We need it
import 'firebase/compat/analytics' // If you need it
import 'firebase/compat/functions'

const clientCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check that `window` is in scope for the analtics module!
if (typeof window !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(clientCredentials)
  // To enable analytics. https://firebase.google.com/docs/analytics/get-started
  if ('measurementId' in clientCredentials) firebase.analytics()
} else if (!firebase.apps.length) {
  // Not using analytics
  firebase.initializeApp(clientCredentials)
}

export default firebase
