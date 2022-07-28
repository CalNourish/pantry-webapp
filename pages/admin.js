import Layout from '../components/Layout'
import Head from 'next/head'
import useSWR from 'swr'
import cookie from 'js-cookie';

import { useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import { server } from './_app.js'

const fetcher = (url) => fetch(url).then((res) => res.json())

const token = cookie.get("firebaseToken")
const tagsToTitles = {
  "checkoutLog": "Item Checkout Log",
  "pantryMaster": "Pantry Master Doc",
  "doordash": "DoorDash 211 Sheet",
  "bagPacking": "Bag Packing Sheet",
  "checkIn": "Check-In Log"
}

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
    setFormData(data)
  }

  let statusTimer = null;
  let showSuccess = (tag, t) => {
    /* show error banner with error text for 5 seconds, or custom time */
    setSubmitStatus({...submitStatus, [tag]: "success"})
    t = t ? t : 5000;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => setSubmitStatus({...submitStatus, checkoutLog: null}), t);
  }
  let showError = (tag, t) => {
    /* show error banner with error text for 5 seconds, or custom time */
    setSubmitStatus({...submitStatus, [tag]: "error"})
    t = t ? t : 5000;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => setSubmitStatus({...submitStatus, checkoutLog: null}), t);
  }

  let generateForm = (tag) => {
    let tagData = formData[tag]; // should be another map...
    let setTagData = (newTagData) => {
      setFormData({...formData, [tag]: {...tagData, ...newTagData}})
    }

    let title = tagsToTitles[tag]
    return (
      <form key={`sheet-info-${tag}`} id={`sheet-info-${tag}`} className='my-4 mx-2'>
        <div className='font-semibold text-xl'>{title}</div>
        <table className='w-1/2 my-2 table-auto'>
          <tbody>
            <tr className='mb-2'>
              <td className='mx-2'>Spreadsheet ID:</td>
              <td>
                <input className="border rounded w-full py-2 px-3 text-gray-600 leading-tight mr-4"
                id={`${tag}-spreadsheetId`} autoComplete="off" value={tagData?.spreadsheetId || ""}
                onChange={(e) => {
                  setTagData({spreadsheetId: e.target.value})
                  setSubmitStatus({...submitStatus, [tag]: null})
                }}/>
              </td>
            </tr>
            <tr>
              <td className='mx-2'>Sheet Name:</td>
              <td>
                <input className="border rounded w-full py-2 px-3 text-gray-600 leading-tight mr-4"
                id={`${tag}-sheetName`} autoComplete="off" value={tagData?.sheetName || ""}
                onChange={(e) => {
                  setTagData({sheetName: e.target.value})
                  setSubmitStatus({...submitStatus, [tag]: null})
                }}/>
              </td>
            </tr>
          </tbody>
        </table>
        <button className='btn btn-outline' type='submit' disabled={submitStatus[tag] === "loading"}
          onClick={(e) => {
            e.preventDefault();
            setSubmitStatus({...submitStatus, [tag]: "loading"})
            fetch(`${server}/api/admin/SetSheetInfo`, { method: 'POST',
              body: JSON.stringify({[tag]: tagData}),
              headers: {'Content-Type': "application/json", 'Authorization': token}
            })
            .then((result) => {
              if (res.ok) {
                showSuccess(tag);
              } else {
                showError(tag);
              }
              result.json().then((res) => {
                console.log(res)
              })
              .catch((err) => {
                console.log("error parsing JSON response:", err)
                setSubmitStatus({...submitStatus, [tag]: "error"})
              })
            }).catch((err) => {
              console.log("error submitting form:", err)
              setSubmitStatus({...submitStatus, [tag]: "error"})
            });
          }}>
          Update!
        </button>

        {(submitStatus[tag] === "success") && <div className='mx-4 my-auto text-xl font-bold text-green-600 inline-block'>✓</div>}
        {(submitStatus[tag] === "loading") && <div className='mx-4 inline-block italic text-gray-400'>loading...</div>}
        {(submitStatus[tag] === "error") && <div className='mx-4 my-auto text-xl font-semibold text-red-600 inline-block'>X</div>}
      </form>
    )
  } 

  return (
    <Layout>
      <div className='m-4'>
        <div className='font-semibold text-2xl mb-4'>Google Sheets Links</div>
        {Object.keys(tagsToTitles).map((tag) => generateForm(tag))}
      </div>
    </Layout>
  )
}
