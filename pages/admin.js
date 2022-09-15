import Layout from '../components/Layout'
import Head from 'next/head'
import useSWR from 'swr'
import cookie from 'js-cookie';

import { useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import { server } from './_app.js'

import { daysInOrder } from './hours';

const token = cookie.get("firebaseToken")

function SheetLinks(props) {
  const [submitStatus, setSubmitStatus] = useState({});
  const [statusTimer, setStatusTimer] = useState(null);
  const [formData, setFormData] = useState({});

  const fetcher = (url) => fetch(url, {
    method:'GET', headers: {'Content-Type': "application/json", 'Authorization': token}
  }).then((res) => res.json());

  const { data, error } = useSWR(`${server}/api/admin/GetSheetLinks`, fetcher);

  if (error) {
    return (
      <div className='m-4'>Error! See console log for details.</div>
    )
  }
  if (!data) return <div>Loading...</div>

  // initialize form info if empty
  if (Object.keys(formData).length == 0) {
    setFormData(data)
  }

  let showSuccess = (tag, t = 5000) => {
    /* show error banner with error text for 5 seconds, or custom time */
    setSubmitStatus({[tag]: "success"})
    clearTimeout(statusTimer);
    let timer = setTimeout(() => {
      setSubmitStatus({})
    }, t)
    setStatusTimer(timer);
  }

  let generateForm = (tag) => {
    let tagData = formData[tag]; // should be another map...
    if (!tagData) {
      return (
        <div key={`missing-sheet-${tag}`} className='p-4 border border-red-400 bg-red-50'>
          <div className='font-semibold text-xl text-red-600'>[{tag}] - missing data</div>
        </div>
      )
    }

    let setTagData = (newTagData) => {
      setFormData({...formData, [tag]: {...tagData, ...newTagData}})
    }

    return (
      <form key={`sheet-info-${tag}`} id={`sheet-info-${tag}`} className='p-4 border border-gray-400 bg-gray-50'>
        <div className='font-semibold text-xl'>{tagData.displayName || tag}
          {tagData.displayName ? "" : <span className='font-normal text-gray-500 text-sm'></span>}
        </div>
        <table className='w-full my-2 table-auto'>
          <tbody>
            <tr className='mb-2'>
              <td className='pr-4 whitespace-nowrap w-1'>Spreadsheet ID:</td>
              <td>
                <input className="border rounded w-full py-2 px-3 text-gray-600 leading-tight mr-4"
                id={`${tag}-spreadsheetId`} autoComplete="off" value={tagData.spreadsheetId || ""}
                onChange={(e) => {
                  setTagData({spreadsheetId: e.target.value})
                  setSubmitStatus({...submitStatus, [tag]: null})
                }}/>
              </td>
            </tr>
            <tr>
              <td className='pr-4 whitespace-nowrap w-1'>Sheet Name:</td>
              <td>
                <input className="border rounded w-full py-2 px-3 text-gray-600 leading-tight mr-4"
                id={`${tag}-sheetName`} autoComplete="off" value={tagData.sheetName || ""}
                onChange={(e) => {
                  setTagData({sheetName: e.target.value})
                  setSubmitStatus({...submitStatus, [tag]: null})
                }}/>
              </td>
            </tr>
          </tbody>
        </table>
        <button className='btn btn-outline uppercase tracking-wide text-xs font-semibold' type='submit' disabled={submitStatus[tag] === "loading"}
          onClick={(e) => {
            e.preventDefault();
            setSubmitStatus({[tag]: "loading"})

            fetch(`${server}/api/admin/SetSheetInfo`, { method: 'POST',
              body: JSON.stringify({[tag]: tagData}),
              headers: {'Content-Type': "application/json", 'Authorization': token}
            })
            .then((result) => {
              console.log("result:", result)
              result.json().then((res) => {
                console.log("res data:", res)
                if (result.ok) {
                  showSuccess(tag);
                } else {
                  // error response from API
                  setSubmitStatus({[tag]: "error", [tag+"-msg"]: res.error})
                  return;
                }
              })
              .catch((err) => {
                console.log("error parsing JSON response:", err)
                setSubmitStatus({[tag]: "error", [tag+"-msg"]: err})
              })
            }).catch((err) => {
              console.log("error calling SetSheetInfo API:", err)
              setSubmitStatus({[tag]: "error", [tag+"-msg"]: err})
            });
          }}>
          update
        </button>

        {(submitStatus[tag] === "success") && <div className='mx-4 my-auto text-xl font-bold text-green-600 inline-block'>✓</div>}
        {(submitStatus[tag] === "loading") && <div className='mx-4 inline-block italic text-gray-400'>loading...</div>}
        {(submitStatus[tag] === "error") && <div className='mx-4 my-auto text-xl font-semibold text-red-600 inline-block'>
          {submitStatus[tag+"-msg"] || "X"}</div>}
      </form>
    )
  }

  return (
    <div className='m-8'>
      <div className='font-semibold text-3xl mb-4'>Google Sheets Links</div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {Object.keys(formData).map((tag) => generateForm(tag))}
      </div>
    </div>
  )
}

function DeliveryTimes(props) {
  const [formData, setFormData] = useState({});

  const fetcher = (url) => fetch(url).then((res) => res.json())
  let { data, error } = useSWR('/api/orders/GetDeliveryTimes', fetcher)

  if (error) {
    return (
      <div className='m-4'>Error! See console log for details.</div>
    )
  }
  if (!data) return <div>Loading...</div>

  if (Object.keys(formData).length == 0) { // TODO: might need to change this
    setFormData(data)
  }

  let deleteTime = (tag) => {
    // TODO: call delete API
    console.log('deleting tag:', tag)
    let {[tag]: _, ...newData} = formData;
    setFormData(newData)
  }

  let submitForm = (e) => {
    e.preventDefault();

    const date = e.target.date.value;
    const start = e.target.start_hour.value;
    const start_AM_PM = e.target.start_AM_PM.value;
    const end = e.target.end_hour.value;
    const end_AM_PM = e.target.end_AM_PM.value;

    const tag = date.toLowerCase().substring(0,3) + start + "-" + end + end_AM_PM;
    const displayName = `${date} ${start}-${end} ${end_AM_PM}`
    const data = {
      dayOfWeek: date,
      display: displayName,
      startTime: start + " " + start_AM_PM,
      endTime: end + " " + end_AM_PM
    }

    // TODO: call add API
    setFormData({...formData, [tag]: data})
  }

  return (
    <div className='m-8'>
      <div className='font-semibold text-3xl mb-4'>Delivery Time Windows</div>
      {/* Existing times */}
      <table className='mb-4'>
        <tbody>
          {Object.keys(formData).map((key) => <tr key={key}>
            <td className='pr-10'>{formData[key].display}</td>
            <td><img className="w-4 h-4 items-center hover:cursor-pointer" src="/images/trash-can.svg" onClick={() => deleteTime(key)}></img></td>
          </tr>)}
        </tbody>
      </table>

      {/* New times */}
      <div className='border border-gray-400 bg-gray-50 p-4 w-fit'>
        <div className='font-semibold text-xl mb-2'>Add a new time window:</div>
        <form onSubmit={(e) => submitForm(e)}>
          <div className='mb-2'>
            <span className='font-semibold mr-2'>Date:</span>
            <select id="date">
              {daysInOrder.map((day) => <option key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>)}
            </select>
          </div>

          <div className='mb-2'>
            <span className='font-semibold mr-2'>Start time:</span>
            <input id="start_hour" className='w-10 mr-2 border-b appearance-none focus:outline-none'></input>
            <select id="start_AM_PM">
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
          
          <div className='mb-2'>
            <span className='font-semibold mr-2'>End time:</span>
            <input id="end_hour" className='w-10 mr-2 border-b appearance-none focus:outline-none'></input>
            <select id="end_AM_PM">
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>

          <button type='submit' className='btn btn-outline p-2'>Add!</button>
        </form>
      </div>
    </div>
  )
}

export default function Admin() {
  const { user } = useUser();
  let authToken = (user && user.authorized === "true") ? token : null;

  if (!authToken) {
    return <>
      <Head>
        <title>Pantry</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
          <h1 className='text-xl m-6'>Sorry, you are not authorized to view this page.</h1>
      </Layout>
    </>
  }

  return (
    <Layout>
      <SheetLinks/>
      <DeliveryTimes/>
    </Layout>
  )
}
