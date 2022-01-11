import { useUser } from '../context/userContext'
import Head from 'next/head'
import Layout from '../components/Layout'

export default function SignIn() {

    const { user, setUser, googleLogin } = useUser();
    if(typeof window !=="undefined") {
        window.onload = googleLogin()
    }
    return (
        <>
            <Head>
                <title>Pantry</title>
                <link rel="icon" href="/favicon.ico" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
            </Head>
            <Layout>
            </Layout>
        </>
    )
}

