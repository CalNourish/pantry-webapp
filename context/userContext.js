import { useState, useEffect, createContext, useContext } from 'react'
import firebase from '../firebase/clientApp'
import 'firebase/auth'

export const UserContext = createContext()

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
      console.log("Unable to sign out:", error);
    })
  }

  let authorizeLogin = (userEmail) => {
    return new Promise((resolve) => {
      firebase.database().ref('authorizedUser').once('value')
      .then((data) => {
        var authorizedUsersFromDb = data.val();
        return resolve(Object.values(authorizedUsersFromDb).includes(userEmail))
      })
      .catch(function(error) {
        console.log("Login Error:", error)
        return resolve(false);
      })
    })
  }

  // Checks that user state has changed and then creates or destroys cookie with Firebase token.
  // note that the user here is different from the user retrieved from useState, this one is from Google
  // the useState user is updated with setUser
  const onAuthStateChange = () => {
    return firebase.auth().onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        authorizeLogin(userAuth.email).then((isAuthorized) => {
          setUser({});
          if (isAuthorized) {
            userAuth.getIdToken().then((tok) => {
              setUser({
                "displayName": userAuth.displayName,
                "photoURL": userAuth.photoURL,
                "authorized": isAuthorized,
                "googleUser": userAuth,
                "authToken": tok
              });
            });
          } else {
            setUser({
              "displayName": userAuth.displayName,
              "photoURL": userAuth.photoURL,
              "authorized": false,
              "googleUser": userAuth
            });
          }
        })
      } else {
        console.log("No user found.");
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