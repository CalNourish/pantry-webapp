import Layout from '../components/Layout'
import Head from 'next/head'
import useSWR from 'swr'
import cookie from 'js-cookie';

import { useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import { server } from './_app.js'

const fetcher = (url) => fetch(url).then((res) => res.json())

const token = cookie.get("firebaseToken")

export default function Admin() {
  const [formStatus, setFormStatus] = useState({checkoutLog: null});

  const fetcher = (url) => fetch(url, {
        method:'GET', headers: {'Content-Type': "application/json", 'Authorization': token}
      }).then((res) => res.json());
  const { data, error } = useSWR(`${server}/api/admin/GetSheetLinks`, fetcher);

  if (!data) return <div>Loading...</div>
  if (error || data.error) {
    return (
      <Layout>
        <div className='m-4'>{error || data.error}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='m-4'>
        <form>
          <div className='font-semibold text-xl mb-4'>Checkout Log Sheet Info</div>
          <div className='mb-2'>
            <div className='mx-2 w-1/6 inline-block'>Spreadsheet ID:</div>
            <input className="border rounded w-1/2 py-2 px-3 text-gray-600 leading-tight mr-4"
              id="checkoutLog" autoComplete="off" value={data.checkoutLog || ""}
              onChange={(e) => updateLinks({...data, checkoutLog: e.target.value})}/>
          </div>
          <div className='mb-4'>
            <div className='mx-2 w-1/6 inline-block'>Sheet Name:</div>
            <input className="border rounded w-1/4 py-2 px-3 text-gray-600 leading-tight mr-4"
              id="checkoutLogSheet" autoComplete="off" value={data.checkoutLogSheet || ""}
              onChange={(e) => updateLinks({...data, checkoutLogSheet: e.target.value})}/>
          </div>
          <button className='btn btn-outline' type='submit'
            onClick={(e) => {
              e.preventDefault();
              console.log('clicked')
              fetch(`${server}/api/admin/SetSheetLinks`, { method: 'POST',
                body: JSON.stringify({checkoutLog: data.checkoutLog, checkoutLogSheet: data.checkoutLogSheet}),
                headers: {'Content-Type': "application/json", 'Authorization': token}
              })
              .then((result) => {
                result.json().then(() => {
                  setFormStatus({...formStatus, checkoutLog: true})
                })
                .catch((err) => {
                  console.log("error submitting form:", err)
                  setFormStatus({...formStatus, checkoutLog: false})
                })
              });
            }}>
            Update!
          </button>
          {formStatus.checkoutLog && <div className='mx-4 my-auto text-2xl font-bold text-green-600 inline-block'>✓</div>}
        </form>
      </div>
    </Layout>
  )
}
