import { useState, useEffect, createContext, useContext } from 'react'
import firebase from '../firebase/clientApp'
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loadingUser, setLoading] = useState(true)
  const router = useRouter()

  const logout = async () => {
    const auth = getAuth()
    await auth.signOut()
      .then(() => {
        // go back home
        router.reload()
      })
      .catch((error) => {
        console.log("Unable to sign out:", error);
      })
  }

  let authorizeLogin = (userEmail) => {
    return new Promise((resolve) => {
      firebase.database().ref('authorizedUser').once('value')
        .then((data) => {
          var authorizedUsersFromDb = data.val();
          return resolve(
            Object.values(authorizedUsersFromDb).includes(userEmail)
          )
        })
        .catch(function(error) {
          console.log("Login Error:", error)
          return resolve(false);
        })
    })
  }

  // updates user state variable when authorization state changes (on sign-in, sign-out, and token timeout)
  const onIdTokenChange = () => {
    setLoading(true);
    const auth = getAuth()
    return auth.onIdTokenChanged(async (userAuth) => {
      if (userAuth) {
        authorizeLogin(userAuth.email)
          .then((isAuthorized) => {
            setUser({});
            if (isAuthorized) {
              userAuth.getIdToken().then((tok) => {
                setUser({
                  "displayName": userAuth.displayName,
                  "authorized": isAuthorized,
                  "googleUser": userAuth,
                  "authToken": tok
                });
                setLoading(false);
              });
              } else {
                setUser({
                  "displayName": userAuth.displayName,
                  "photoURL": userAuth.photoURL,
                  "authorized": false,
                  "googleUser": userAuth
                });
              setLoading(false);
            }
        })
      } else {
        console.log("No user found.");
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = onIdTokenChange();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
      user,
      setUser,
      logout,
      loadingUser
      }}>
      {children}
    </UserContext.Provider>
  )
};

export const UserContext = createContext()
export const useUser = () => useContext(UserContext)
export default UserProvider