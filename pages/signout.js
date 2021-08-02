import { useUser } from '../context/userContext'
import UserProvider from '../context/userContext'

import Layout from '../components/Layout'

export default function SignIn () {
    const { logout } = useUser();
    return ( 
        <>
            <UserProvider>
            <h1>Sign out page</h1>
            <button onClick={() => logout()}> Logout Button </button>
            </UserProvider>
        </>
    )
}