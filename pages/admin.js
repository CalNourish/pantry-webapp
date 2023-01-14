import Layout from '../components/Layout'
import Head from 'next/head'
import useSWR from 'swr'
import cookie from 'js-cookie';
import firebase from 'firebase/compat/app'

import { useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import { server } from './_app.js'

const fetcher = (url) => fetch(url).then((res) => res.json())

const token = cookie.get("firebaseToken")

// Handles pushing to firebase
const validateAddAdmin = async (event) => {
  event.preventDefault()

  const adminName = document.querySelector('#adminName').value;  
  const email = document.querySelector('#adminEmail').value;

  if(adminName.length < 1 || email.length < 2){
    alert("Please enter a valid name and email");
    return;
  }

  let itemRef = firebase.database().ref('/authorizedUser/');
  itemRef.on('value', (snapshot) => {
  }, (errorObject) => {
    console.log('The read failed: ' + errorObject.name);
  });

  itemRef.update({
    [adminName] : email
  });
  console.log("Set User")
  document.getElementById('adminName').value = "";
  document.getElementById('adminEmail').value = "";
}

export default function Admin() {
  const [submitStatus, setSubmitStatus] = useState({});
  const [statusTimer, setStatusTimer] = useState(null);
  const [formData, setFormData] = useState({});

  const { user } = useUser();
  let authToken = (user && user.authorized === "true") ? token : null;

  const fetcher = (url) => fetch(url, {
    method:'GET', headers: {'Content-Type': "application/json", 'Authorization': token}
  }).then((res) => res.json());

  const { data, error } = useSWR(`${server}/api/admin/GetSheetLinks`, fetcher);

  if (!data) return <div>Loading...</div>
  if (error || data.error) {
    return (
      <Layout>
        <div className='m-4'>Error! See console log for details.</div>
      </Layout>
    )
  }

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
    <Layout>
      <div className='m-8'>
        <div className='font-semibold text-3xl mb-4'>Google Sheets Links</div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {Object.keys(formData).map((tag) => generateForm(tag))}
        </div>
      </div>
      <div className='m-9'>
      <div className='font-semibold text-3xl mb-4'>Add Admin Users</div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
      <form  className='p-4 border border-gray-400 bg-gray-50' onSubmit={validateAddAdmin}>
        <tr>
        <td className='pr-4 whitespace-nowrap w-1' for="adminName">Admin Name: </td> 
          <input type="text" name="adminName" id="adminName" className="border rounded w-full py-2 px-3 text-gray-600 leading-tight mr-4"/><br></br>
          </tr>
          <tr>
          <td className='pr-4 whitespace-nowrap w-1' for="email" >Email: </td>
          <input type="text" name="adminEmail" id="adminEmail" className="border rounded w-full py-2 px-3 text-gray-600 leading-tight mr-4"/><br></br>
          <br></br>
          <input className='btn btn-outline uppercase tracking-wide text-xs font-semibold' type='submit'/><br></br>
          </tr>
        </form>
    
        </div>
        
      </div>
    </Layout>
  )
}