import { useEffect } from 'react'
import { useAuthState } from "react-firebase-hooks/auth";
import { useUser } from '../context/userContext'
import Layout from '../components/Layout'
import { useRouter } from "next/router";
import { auth, signInWithGoogle } from '../firebase/clientApp'
import firebase from 'firebase/compat/app'

export default function SignIn() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter()
    useEffect(() => {

    firebase.auth().getRedirectResult().then(function(result) {
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          document.getElementById('quickstart-oauthtoken').textContent = token;
        } else {
          document.getElementById('quickstart-oauthtoken').textContent = 'null';
        }
        // The signed-in user info.
        var user = result.user;
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        if (errorCode === 'auth/account-exists-with-different-credential') {
          alert('You have already signed up with a different auth provider for that email.');
          // If you are using multiple auth providers on your app you should handle linking
          // the user's accounts here.
        } else {
          console.error(error);
        }
      });
    }, [])

    // useEffect(() => {
    //     console.log(user, loading, error)
    //     if (loading) {
    //     // maybe trigger a loading screen
    //     return;
    //     }
    //     if (user) router.push("/");
    // }, [user, loading]);

    // const { user, setUser, googleLogin } = useUser();
    // if(typeof window !=="undefined") {
    //     window.onload = googleLogin()
    // }
    return (
        <Layout pageName="Sign In">
            <div className="quickstart-user-details-container">
            Firebase sign-in status: <span id="quickstart-sign-in-status">Unknown</span>
            <div>Firebase auth <code>currentUser</code> object value:</div>
            <pre><code id="quickstart-account-details">null</code></pre>
            <div>Google OAuth Access Token:</div>
            <pre><code id="quickstart-oauthtoken">null</code></pre>
          </div>
            <button onClick={signInWithGoogle}>Sign In With Google</button>
        </Layout>
    )
}

