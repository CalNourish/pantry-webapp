import { useUser } from '../context/userContext'
import UserProvider from '../context/userContext'

import Layout from '../components/Layout'

export default function SignIn () {
    const { user, setUser, googleLogin } = useUser();
    console.log("USER: ", user);
    return ( 
        <>
            <UserProvider>
            <h1>Sign in page</h1>
            <button onClick={() => googleLogin()}> Sign in Button </button>
            </UserProvider>
        </>
    )
}