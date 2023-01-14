import { useUser } from '../context/userContext'
import Layout from '../components/Layout'

export default function SignIn() {

    const { user, setUser, googleLogin } = useUser();
    if(typeof window !=="undefined") {
        window.onload = googleLogin()
    }
    return (
        <Layout pageName="Sign In">
        </Layout>
    )
}

