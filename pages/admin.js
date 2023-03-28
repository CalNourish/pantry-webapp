import Layout from '../components/Layout'
import useSWR from 'swr'

import { useState } from 'react'
import { useUser } from '../context/userContext'
import { server } from './_app.js'

import { daysInOrder } from './hours';
import firebase from '../firebase/clientApp';

function AddAdmin(props) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitStatusMsg, setSubmitStatusMsg] = useState("");
  const [statusTimer, setStatusTimer] = useState(null);

  let showSuccess = (t = 5000) => {
    /* show error banner with error text for 5 seconds, or custom time */
    setSubmitStatus("success");
    clearTimeout(statusTimer);
    let timer = setTimeout(() => {
      setSubmitStatus(null);
    }, t)
    setStatusTimer(timer);
  }

  // Handles pushing to firebase
  const submitForm = (event) => {
    event.preventDefault();
    setSubmitStatus("loading")

    fetch(`${server}/api/admin/AddAdmin`, { method: 'POST',
      body: JSON.stringify({name: userName, email: userEmail}),
      headers: {'Content-Type': "application/json", 'Authorization': props.authToken}
    })
    .then((result) => {
      result.json().then((res) => {
        if (result.ok) {
          showSuccess();
          setUserName("")
          setUserEmail("")
        } else {
          setSubmitStatus("error");
          setSubmitStatusMsg(res.error);
          return;
        }
      })
      .catch((err) => {
        console.log("error parsing AddAdmin JSON response:", err)
        setSubmitStatus("error")
        setSubmitStatusMsg(String(err))
      })
    }).catch((err) => {
      console.log("error calling AddAdmin API:", err)
      setSubmitStatus("error")
      setSubmitStatusMsg(String(err))
    });
  }

  return (
    <div className='m-9'>
      <div className='font-semibold text-3xl mb-4'>Add Admin Users</div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <form className='p-4 border border-gray-400 bg-gray-50' onSubmit={submitForm}>
          <table className='w-full my-2 table-auto'>
            <tbody>
              <tr className='mb-2'>
                <td className='pr-4 whitespace-nowrap w-1' htmlFor="adminName">Admin Name:</td>
                <td>
                  <input className="border rounded w-full py-2 px-3 text-gray-600 leading-tight mr-4" type="text" id="adminName"
                    autoComplete="off" value={userName} onChange={(e) => {setUserName(e.target.value); setSubmitStatus(null);}} />
                </td>
              </tr>
              <tr>
                <td className='pr-4 whitespace-nowrap w-1' htmlFor="adminEmail">Email:</td>
                <td>
                  <input className="border rounded w-full py-2 px-3 text-gray-600 leading-tight mr-4" type="text" id="adminEmail"
                    autoComplete="off" value={userEmail} onChange={(e) => {setUserEmail(e.target.value); setSubmitStatus(null);}}/>
                </td>
              </tr>
            </tbody>
          </table>

          <input className='btn btn-outline uppercase tracking-wide text-xs font-semibold' type='submit'/>

          {(submitStatus === "success") && <div className='mx-4 my-auto text-xl font-bold text-green-600 inline-block'>✓</div>}
          {(submitStatus === "loading") && <div className='mx-4 inline-block italic text-gray-400'>loading...</div>}
          {(submitStatus === "error") && <div className='mx-4 my-auto text-xl font-semibold text-red-600 inline-block'>
            {submitStatusMsg || "X"}</div>}
        </form>
      </div>
    </div>
  )
}

function SheetLinks(props) {
  const [submitStatus, setSubmitStatus] = useState({});
  const [statusTimer, setStatusTimer] = useState(null);
  const [formData, setFormData] = useState({});

  const fetcher = (url) => fetch(url, {
    method:'GET', headers: {'Content-Type': "application/json", 'Authorization': props.authToken}
  }).then((res) => res.json());

  const { data, error } = useSWR(`${server}/api/admin/GetSheetLinks`, fetcher);

  if (error) {
    console.log("Error fetching google sheet links:", error)
    return (
      <div className='m-8'>
        <div className='font-semibold text-3xl mb-4'>Google Sheets Links</div>
        <div className='m-4'>Error! See console log for details.</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className='m-8'>
        <div className='font-semibold text-3xl mb-4'>Google Sheets Links</div>
        <div className='m-4'>Loading...</div>
      </div>
    )
  }

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
              headers: {'Content-Type': "application/json", 'Authorization': props.authToken}
            })
            .then((result) => {
              result.json().then((res) => {
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
  const [submitStatus, setSubmitStatus] = useState("");

  const fetcher = (url) => fetch(url).then((res) => res.json())
  let { data, error } = useSWR('/api/orders/GetDeliveryTimes', fetcher)

  if (error) {
    console.log("Error fetching delivery times:", error)
    return (
      <div className='m-8'>
        <div className='font-semibold text-3xl mb-4'>Delivery Time Windows</div>
        <div className='m-4'>Error! See console log for details.</div>
      </div>
    )
  }
  if (!data) {
    return (
      <div className='m-8'>
        <div className='font-semibold text-3xl mb-4'>Delivery Time Windows</div>
        <div className='m-4'>Loading...</div>
      </div>
    )
  }

  if (Object.keys(formData).length == 0 && Object.keys(data).length > 0) {
    // TODO: might need to change this?
    setFormData(data)
  }

  /* do this once, after formData is set */
  const ref = firebase.database().ref('/deliveryTimes')
  if (Object.keys(formData).length > 0) {
    ref.on('child_added', snapshot => {
      let data = snapshot.val()
      if (!formData[data.tag]) {
        setFormData({
          ...formData, [data.tag]: data
        });
      }
    });
  }

  let deleteTime = (tag) => {
    let {[tag]: _, ...newData} = formData; // remove tag for newData
    fetch(`${server}/api/admin/DeleteDeliveryTime`, { method: 'POST',
      body: JSON.stringify({"tag": tag}),
      headers: {'Content-Type': "application/json", 'Authorization': props.authToken}
    })
    .then((result) => {
      result.json()
      .then((res) => {
        setSubmitStatus(res.error)
      })
      setFormData(newData)
    })
  }

  let submitForm = (e) => {
    e.preventDefault();

    const date = e.target.date.value;
    const start = e.target.start_hour.value;
    const start_AM_PM = e.target.start_AM_PM.value;
    const end = e.target.end_hour.value;
    const end_AM_PM = e.target.end_AM_PM.value;

    const data = {
      dayOfWeek: date,
      start: start,
      start_AMPM: start_AM_PM,
      end: end,
      end_AMPM: end_AM_PM
    }

    fetch(`${server}/api/admin/AddDeliveryTime`, { method: 'POST',
      body: JSON.stringify(data),
      headers: {'Content-Type': "application/json", 'Authorization': props.authToken}
    })
    .then((result) => {
      result.json()
      .then((res) => {
        if (result.ok) {
          document.getElementById("deliveryTimeForm").reset()
        } else {
          console.log("Error adding time window:", res.error)
        }
        setSubmitStatus(res.error)
      })
    })
  }

  return (
    <div className='m-8'>
      <div className='font-semibold text-3xl mb-4'>Delivery Time Windows</div>
      { submitStatus &&
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
          {submitStatus}</div>
      }

      <div className='space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:space-x-8'>
        {/* Existing times */}
        <div className='border border-gray-400 p-4'>
          {
            Object.keys(formData).length == 0 ?
            <span className='text-gray-500 italic'>No options</span> :
            <table className='mb-4'>
              <tbody>
                {Object.keys(formData).map((key) => <tr key={key}>
                  <td className='pr-10'>{formData[key].display}</td>
                  <td><img className="w-4 h-4 items-center hover:cursor-pointer" src="/images/trash-can.svg" onClick={() => deleteTime(key)}></img></td>
                </tr>)}
              </tbody>
            </table>
          }
        </div>

        {/* New times */}
        <div className='border border-gray-400 bg-gray-50 p-4'>
          <div className='font-semibold text-xl mb-2'>Add a new time window:</div>
          <form id="deliveryTimeForm" onSubmit={(e) => submitForm(e)}>
            <div className='mb-2'>
              <span className='font-semibold mr-2'>Date:</span>
              <select id="date">
                {daysInOrder.map((day) => <option key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>)}
              </select>
            </div>

            <div className='mb-2'>
              <span className='font-semibold mr-2'>Start time:</span>
              <input id="start_hour" className='w-10 mr-2 border-b appearance-none focus:outline-none' autoComplete='off'></input>
              <select id="start_AM_PM">
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
            
            <div className='mb-2'>
              <span className='font-semibold mr-2'>End time:</span>
              <input id="end_hour" className='w-10 mr-2 border-b appearance-none focus:outline-none' autoComplete='off'></input>
              <select id="end_AM_PM">
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>

            <button type='submit' className='btn btn-outline p-2'>Add!</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const { user } = useUser();
  let authToken = (user && user.authorized) ? user.authToken : null;

  if (!authToken) {
    return (
      <Layout>
        <h1 className='text-xl m-6'>Sorry, you are not authorized to view this page.</h1>
      </Layout>
    )
  }

  return (
    <Layout>
      <SheetLinks authToken={authToken}/>
      <AddAdmin authToken={authToken}/>
      <DeliveryTimes authToken={authToken}/>
    </Layout>
  )
}

