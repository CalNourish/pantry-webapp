import { useState, useEffect } from 'react'
import Script from 'next/script';
import { useRouter } from "next/router";
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import Layout from '../components/Layout'
import { auth } from '../firebase/clientApp'

export default function SignIn() {
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const { idToken } = router.query

    // If 'idToken' is found in the query, then initiate Google sign-in
    useEffect(() => {
      if (idToken) {
        setLoading(true)
        const credential = GoogleAuthProvider.credential(idToken);
        signInWithCredential(auth, credential)
          .then(() => {
            router.push('/')
          })
          .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The credential that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.log("Unsuccessful authentication", errorCode, errorMessage, email, credential);
          });
      }
    }, [idToken]);

    /** TODO: Follow instructions to get Google API client ID 
     * and configure OAuth consent screen for ProdCalNourish 
     * (https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
     */
    useEffect(() => {
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        context: 'signin',
        itp_support: true,
        ux_mode: 'redirect',
        login_uri: process.env.NEXT_PUBLIC_LOGIN_URI,
      });
      google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" }  // customization attributes
      );
      google.accounts.id.prompt(); // also display the One Tap dialog
    }, []);

    return (
        <Layout pageName="Sign In">
          <div className='w-full flex justify-center mt-10'>
            {loading ? 'Loading...' : <div id="buttonDiv"></div>}
          </div>
          <Script src="https://accounts.google.com/gsi/client" strategy='beforeInteractive' />
        </Layout>
    )
}
