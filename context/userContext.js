import { useState, useEffect, createContext, useContext } from 'react'
import firebase from '../firebase/clientApp'

export const UserContext = createContext()

export default function UserContextComp({ children }) {
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true) // Helpful, to update the UI accordingly.

  useEffect(() => {
    // Listen authenticated user
    const unsubscriber = firebase.auth().onAuthStateChanged(async (user) => {
      try {
        if (user) {
          // User is signed in.
          const { uid, displayName, email, photoURL, authorized } = user

          // check against firebase and see if this is an admin authorized user
          var authorizeLogin = firebase
          .functions()
          .httpsCallable('authorizeLogin');

          let newAuth = (await authorizeLogin({}).then(function(result) {
            return result.data;
          })).authorized; 
          
          // convert this to a boolean value from a string value
          let status =  newAuth == "true" ? true : false;

          // update user data
          setUser({ uid, displayName, email, photoURL, authorized: status })
        } else {  
          console.log("No user");
          setUser(null) 
        }
      } catch (error) {
        console.log(error);
        // Most probably a connection error. Handle appropriately.
      } finally {
        setLoadingUser(false)
      }
    })

    // Unsubscribe auth listener on unmount
    return () => unsubscriber()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  )
}

// Custom hook that shorthands the context!
export const useUser = () => useContext(UserContext)
