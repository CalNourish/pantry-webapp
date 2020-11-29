import Head from 'next/head'
import useSWR from 'swr'

import { useEffect } from 'react'
import { useUser } from '../context/userContext'
import Layout from '../components/Layout'

// fetcher for get requests
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Home() {
  // Our custom hook to get context values
  const { loadingUser, user } = useUser()
  const { data, error } = useSWR('/api/inventory/GetItem', fetcher)

  useEffect(() => {
    if (!loadingUser) {
      // You know that the user is loaded: either logged in or out!
      console.log(user)
    }
  }, [loadingUser, user])

  return (
    <>
    <Head>
      <title>Pantry</title>
      <link rel="icon" href="/favicon.ico" />
      {/* Link to fonts for now. May look at storing fonts locally or just usign system fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
    </Head>
    <Layout>
      <h1>Home</h1>
      <button onClick={() => {
        fetch('/api/inventory/UpdateItem', { method: 'POST', body: 
              JSON.stringify({"barcode" : "222220", "count": "113", "lowStock": "2"}),
              headers: {'Content-Type': "application/json"}})
      }}> button </button>
    </Layout>
  </>

  )
}
