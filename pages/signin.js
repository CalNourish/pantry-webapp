import firebase from 'firebase/app'
import Layout from '../components/Layout'
import 'firebase/auth' // If you need it

export default function SignIn () {
    // Sign into Firebase using popup auth & Google as the identity provider.
    var provider = new firebase.auth.GoogleAuthProvider();
    //console.log("signing in")
    //firebase.auth().signInWithRedirect(provider)

    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // go back home
        window.location.href = '/';
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log("=====Not successful at authenticating", errorMessage);
      });
      

    return ( 
        <>
            <Layout>
            <h1>Sign in page</h1>
            </Layout>
        </>
    )
}