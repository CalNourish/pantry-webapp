import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import cookie from 'js-cookie';

import { useUser } from '../context/userContext'
import { server } from './_app.js'

export const daysInOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

const token = cookie.get("firebaseToken")

export default function Hours() {

  const [editing, setEditing] = useState(false);
  const [data, setData] = useState(undefined);
  const { user } = useUser();

  // let { data, error } = useSWR('/api/admin/GetHours', fetcher)
  let getHours = () => {
    fetch(`${server}/api/admin/GetHours`)
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
        <Layout pageName="Hours">
          <div className='p-5'>Failed to get hours</div>
        </Layout>
      )
    });
  }

  /* Display loading message */
  if (!data) {
    getHours();

    return (
      <Layout pageName="Hours">
        <div className='p-5'>Fetching hours...</div>
      </Layout>
    )
  }

  let authToken = (user && user.authorized === "true") ? token : null;

  let saveHours = (day, event) => {
    event.preventDefault();
    let hourString = event.target[`hours-${day}`].value

    fetch('/api/admin/UpdateHours', {
      method: 'POST',
      body: JSON.stringify({
          "day": day,
          "hours": hourString,
      }),
      headers: { 'Content-Type': "application/json", 'Authorization': token }
    })
    .then(response => {
      if (response.ok) {
        response.json().then(() => {
          setEditing(false)
          setData({...data, [day]: hourString}); // update the data object
        })
      } else {
        response.json().then((resp) => {
          console.log("Error updating hours: ", resp.error)
        })
      }
    })
    .catch(err => {
      console.log("Unknown error: ", err)
    })
  }

  /* otherwise display table of hours */
  return (
    <Layout pageName="Hours">
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
  )
}