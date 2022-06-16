import Layout from '../components/Layout'
import Head from 'next/head'
import useSWR from 'swr'
import cookie from 'js-cookie';

import { useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import { server } from './_app.js'
import e from 'cors';

const fetcher = (url) => fetch(url).then((res) => res.json())

const token = cookie.get("firebaseToken")

export default function Admin() {
  const { user } = useUser();
  const [links, updateLinks] = useState({});

  let authToken = (user && user.authorized === "true") ? token : null;
  if (!authToken) {
    return (
      <Layout>
        <div className='p-4'>You are not authorized to view this page.</div>
      </Layout>
    )
  }

  if (authToken && !links.checkoutLog) {
    fetch(`${server}/api/admin/GetSheetLinks`, {
      method:'GET', headers: {'Content-Type': "application/json", 'Authorization': token}
    })
    .then((result) => {
      result.json().then((data) => {
        updateLinks(data);
      });
    });
  }

  return (
    <Layout>
      <div className='m-4'>
        <form>
          <div className='font-semibold text-xl mb-4'>Checkout Log Sheet Info</div>
          <div className='mb-2'>
            <div className='mx-2 w-1/6 inline-block'>Spreadsheet ID:</div>
            <input className="border rounded w-1/2 py-2 px-3 text-gray-600 leading-tight mr-4"
              id="checkoutLog" autoComplete="off" value={links.checkoutLog || ""}
              onChange={(e) => updateLinks({...links, checkoutLog: e.target.value})}/>
          </div>
          
          <div className='mb-4'>
            <div className='mx-2 w-1/6 inline-block'>Sheet Name:</div>
            <input className="border rounded w-1/4 py-2 px-3 text-gray-600 leading-tight mr-4"
              id="checkoutLogSheet" autoComplete="off" value={links.checkoutLogSheet || ""}
              onChange={(e) => updateLinks({...links, checkoutLogSheet: e.target.value})}/>
          </div>
          
          <button className='btn btn-outline' type='submit'
            onClick={(e) => {
              e.preventDefault();
              fetch(`${server}/api/admin/SetSheetLinks`, { method: 'POST',
                body: JSON.stringify({checkoutLog: links.checkoutLog, checkoutLogSheet: links.checkoutLogSheet}),
                headers: {'Content-Type': "application/json", 'Authorization': token}
              })
              .then((result) => {
                result.json().then((data) => {
                  console.log("saved! data:", data)
                });
              });
            }}
          >Update!</button>
        </form>
      </div>
      
    </Layout>
  )
}
