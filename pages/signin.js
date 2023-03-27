import { useUser } from '../context/userContext'
import Layout from '../components/Layout'

import { signIn, signOut, useSession } from "next-auth/react"

export default function SignIn() {

    // const { user, setUser, googleLogin } = useUser();
    if(typeof window !=="undefined") {
        signIn()
    }

    return <Layout pageName="Sign In"></Layout>
}

