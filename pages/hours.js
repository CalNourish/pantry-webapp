import Layout from '../components/Layout'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import cookie from 'js-cookie';


import { useUser } from '../context/userContext'
import { server } from './_app.js'

// const fetcher = (url) => fetch(url).then((res) => res.json())

const token = cookie.get("firebaseToken")
const daysInOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

export default function Hours() {

  const [editing, setEditing] = useState(false);
  const [data, setData] = useState(undefined);
  const { user } = useUser();

  // let { data, error } = useSWR('/api/admin/getHours', fetcher)
  let getHours = () => {
    fetch(`${server}/api/admin/getHours`)
    .then((result) => {
      result.json()
      .then((data) => {
        setData(data);
      });
    })
    .catch(err => {
      /* Display error message */
      console.log("getHours error:", err)
      return (
        <>
          <Head>
            <title>Pantry</title>
            <link rel="icon" href="/favicon.ico" />
            <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
          </Head>
          <Layout>
            <div className='p-5'>Failed to get hours</div>
          </Layout>
        </>
      )
    });
  }

  /* Display loading message */
  if (!data) {
    getHours();

    return (
      <>
        <Head>
          <title>Pantry</title>
          <link rel="icon" href="/favicon.ico" />
          <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
        </Head>
        <Layout>
          <div className='p-5'>Fetching hours...</div>
        </Layout>
      </>
    )
  }

  let authToken = (user && user.authorized === "true") ? token : null;

  let saveHours = (day, event) => {
    event.preventDefault();
    let hourString = event.target[`hours-${day}`].value

    fetch('/api/admin/updateHours', {
      method: 'POST',
      body: JSON.stringify({
          "day": day,
          "hours": hourString,
      }),
      headers: { 'Content-Type': "application/json", 'Authorization': token }
    })
    .then(response => {
      if (response.ok) return response.json()
      throw response.status
    })
    .then(json => {
      setEditing(false)
      setData({...data, [day]: hourString}); // update the data object
    })
    .catch(errcode => {
      console.log("Error updating hours: error code", errcode)
    })
  }

  /* otherwise display table of hours */
  return (
    <>
      <Head>
        <title>Pantry</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
      </Head>
      <Layout>
        <div className='flex flex-col items-center m-4'>
          <h1 className="text-3xl flex text-center tracking-wide font-semibold">Pantry Hours</h1>
          <table className="text-xl" cellPadding="10" cellSpacing="10">
            <thead>
              <tr>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                daysInOrder.map((dayKey) => (
                  <tr key={dayKey}>
                    <td>{dayKey[0].toUpperCase() + dayKey.substring(1)}</td>
                    <td>
                      {(authToken && (editing==dayKey)) ? 
                        <form onSubmit={(event) => saveHours(dayKey, event)}>
                          <input className='border rounded border-gray-600 bg-gray-300 pl-2 w-auto mr-4' defaultValue={data[dayKey]} id={`hours-${dayKey}`}/>
                          <button type="submit" className='text-sm text-blue-600 hover:text-blue-400 focus:outline-none'>save</button>
                          <button onClick={() => setEditing(false)} className='ml-4 text-sm text-blue-600 hover:text-blue-400 focus:outline-none'>cancel</button>
                        </form>
                        :
                        <>
                          <span className='mr-4 border border-transparent' onDoubleClick={() => setEditing(dayKey)}>{data[dayKey]}</span>
                          {authToken && <button className='text-sm text-blue-600 hover:text-blue-400 focus:outline-none' onClick={() => setEditing(dayKey)}>edit</button>}
                        </>
                      }
                    </td>
                  </tr>
                ))
              }

            </tbody>
          </table>
        </div>
      </Layout>
    </>
  )
}