import { useEffect } from 'react'
import Script from 'next/script';
import { useRouter } from "next/router";
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import Layout from '../components/Layout'
import { auth } from '../firebase/clientApp'

export default function SignIn() {
    const router = useRouter()

    const handleCredentialResponse = (response) => {
      // Build Firebase credential with the Google ID token.
      const idToken = response.credential;
      const credential = GoogleAuthProvider.credential(idToken);
    
      // Sign in with credential from the Google user.
      signInWithCredential(auth, credential)
        .then((result) => {
          console.log(result)
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

    /** TODO: Follow instructions to get Google API client ID 
     * and configure OAuth consent screen for ProdCalNourish 
     * (https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
     */
    useEffect(() => {
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" }  // customization attributes
      );
      google.accounts.id.prompt(); // also display the One Tap dialog
    }, []);

    return (
        <Layout pageName="Sign In">
          <div id="buttonDiv"></div> 
          <Script src="https://accounts.google.com/gsi/client" strategy='beforeInteractive' />
        </Layout>
    )
}

