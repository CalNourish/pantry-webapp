/*
// Admin version of the firebase SDK
*/

import * as admin from 'firebase-admin'

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // https://stackoverflow.com/a/41044630/1332513 
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
} catch (error) {
    // this is the case where we're hot reloading and we've already initialized the app
    // let other errors through
    if (!/already exists/u.test(error.message)) {
        // eslint-disable-next-line no-console
        console.error("Firebase admin initialization error", error.stack);
    }
}

export default admin