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
  const [submitStatus, setSubmitStatus] = useState({checkoutLog: null});
  const [formData, setFormData] = useState({});

  const fetcher = (url) => fetch(url, {
    method:'GET', headers: {'Content-Type': "application/json", 'Authorization': token}
  }).then((res) => res.json());

  const { data, error } = useSWR(`${server}/api/admin/GetSheetLinks`, fetcher);

  if (!data) return <div>Loading...</div>
  if (error || data.error) {
    console.log(error || data.error)
    return (
      <Layout>
        <div className='m-4'>Error! See console log for details.</div>
      </Layout>
    )
  }

  // initialize form info if empty
  if (Object.keys(formData).length == 0) {
    setFormData(data.checkoutLog)
  }

  let successTimer = null;
  let showSuccess = (t) => {
    /* show error banner with error text for 5 seconds, or custom time */
    setSubmitStatus({...submitStatus, checkoutLog: "success"})
    t = t ? t : 5000;
    clearTimeout(successTimer);
    successTimer = setTimeout(() => setSubmitStatus({...submitStatus, checkoutLog: null}), t);
  }

  return (
    <Layout>
      <div className='m-4'>
        <form>
          <div className='font-semibold text-xl mb-4'>Checkout Log Sheet Info</div>
          <div className='mb-2'>
            <div className='mx-2 w-1/6 inline-block'>Spreadsheet ID:</div>
            <input className="border rounded w-1/2 py-2 px-3 text-gray-600 leading-tight mr-4"
              id="checkoutLogId" autoComplete="off" value={formData?.spreadsheetId || ""}
              onChange={(e) => {
                setFormData({...formData, spreadsheetId: e.target.value})
                setSubmitStatus({...submitStatus, checkoutLog: null})
              }}/>
          </div>
          <div className='mb-4'>
            <div className='mx-2 w-1/6 inline-block'>Sheet Name:</div>
            <input className="border rounded w-1/4 py-2 px-3 text-gray-600 leading-tight mr-4"
              id="checkoutLogSheet" autoComplete="off" value={formData?.sheetName || ""}
              onChange={(e) => {
                setFormData({...formData, sheetName: e.target.value})
                setSubmitStatus({...submitStatus, checkoutLog: null})
              }}/>
          </div>
          <button className='btn btn-outline' type='submit' disabled={submitStatus.checkoutLog === "loading"}
            onClick={(e) => {
              e.preventDefault();
              setSubmitStatus({...submitStatus, checkoutLog: "loading"})
              fetch(`${server}/api/admin/SetSheetInfo`, { method: 'POST',
                body: JSON.stringify({checkoutLog: formData}),
                headers: {'Content-Type': "application/json", 'Authorization': token}
              })
              .then((result) => {
                result.json().then((res) => {
                  console.log(res)
                  showSuccess();
                })
                .catch((err) => {
                  console.log("error parsing JSON response:", err)
                  setSubmitStatus({...submitStatus, checkoutLog: "error"})
                })
              }).catch((err) => {
                console.log("error submitting form:", err)
                setSubmitStatus({...submitStatus, checkoutLog: "error"})
              });
            }}>
            Update!
          </button>
          {(submitStatus.checkoutLog === "success") && <div className='mx-4 my-auto text-xl font-bold text-green-600 inline-block'>✓</div>}
          {(submitStatus.checkoutLog === "loading") && <div className='mx-4 inline-block italic text-gray-400'>loading...</div>}
        </form>
      </div>
    </Layout>
  )
}
