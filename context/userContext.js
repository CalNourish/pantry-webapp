import { useState, useEffect, createContext, useContext } from 'react'
import firebase from '../firebase/clientApp'
import 'firebase/auth'
import cookie from 'js-cookie';

export const UserContext = createContext()
const tokenName = 'firebaseToken';

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  // Google identity prvider.
  const googleLogin = async () => {
    var provider = new firebase.auth.GoogleAuthProvider();

    await firebase.auth().signInWithPopup(provider).then(function(result) {
        // go back home
        window.location.href = '/';
      }).catch(function(error) {
        var errorMessage = error.message;
        // ...
        console.log("=====Not successful at authenticating", errorMessage);
      });
  };

  const logout = async () => {
    var provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signOut()
    .then(() => {
      // go back home
      window.location.href = '/';
    })
    .catch(function(error){
      console.log("Unable to sign out");
    })
  }

  // Checks that user state has changed and then creates or destroys cookie with Firebase token.
  // note that the user here is different from the user retrieved from useState, this one is from Google
  // the useState user is updated with setUser
  const onAuthStateChange = () => {
    return firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // check against firebase and see if this is an admin authorized user
        var authorizeLogin = firebase
        .functions()
        .httpsCallable('authorizeLogin');

        let authorized = (await authorizeLogin({})
          .catch(error => {
            console.log(error)
            return {"authorized": "false"}
          })
          .then(result => {
            return result.data;
        })).authorized; 

        setUser({"displayName": user.displayName, "photoURL": user.photoURL, "authorized": authorized});
        
        if (authorized === "true") {
          const token = await user.getIdToken();
          console.log("Giving them a token");
          cookie.set(tokenName, token, { expires: 14, sameSite: 'strict', secure: true });
        }
      } else {
        console.log("Not giving them a token");
        cookie.remove(tokenName);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange();
    return () => {
      unsubscribe();
    };
  }, []);

  return <UserContext.Provider value={{ user, setUser, googleLogin, logout }}>{children}</UserContext.Provider>;
};

export default UserProvider;
export const useUser = () => useContext(UserContext)