import Layout from '../components/Layout'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import cookie from 'js-cookie';

import { useUser } from '../context/userContext'
import { server } from './_app.js'

const fetcher = (url) => fetch(url).then((res) => res.json())

const token = cookie.get("firebaseToken")

export default function Hours() {

  const [editing, setEditing] = useState(false);
  const [data, setData] = useState(undefined);
  const { user } = useUser();

  // let { data, error } = useSWR('/api/admin/getHours', fetcher)

  /* Display loading message */
  let authToken = (user && user.authorized === "true") ? token : null;
  if (!authToken) {
    return (
    <>
      <Head>
        <title>Pantry</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
          <h1 className='text-xl m-6'>Sorry, you are not authorized to view this page.</h1>
      </Layout>
    </>
    )
  }

  const handleScanSubmit = (e) => {
    e.preventDefault();
    console.log("Scanned ID:", e.target.calID.value)
    fetch('/api/admin/checkin', { method: 'POST',
      body: JSON.stringify({calID: e.target.calID.value}),
      headers: {'Content-Type': "application/json", 'Authorization': token}
    })
  }

  /* otherwise display table of hours */
  return (
    <>
      <Head>
        <title>Pantry</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className='m-6'>
          <h1 className='text-3xl font-medium mb-2'>Pantry Check-In</h1>
          <div className='flex flex-row space-x-8 my-8'>
            <form className='flex-grow' onSubmit={(e) => handleScanSubmit(e)}>
              <input className="border rounded w-full py-2 px-3 text-gray-600 leading-tight"
                placeholder="scan or type UC Berkeley ID"
                id="calID" autoComplete="off" autoFocus></input>
            </form>
            <div className='flex-grow'>The other side.</div>
          </div>
        </div>
      </Layout>
    </>
  )
}