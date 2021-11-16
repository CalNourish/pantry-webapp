import Layout from '../components/Layout'
import Head from 'next/head'
import useSWR from 'swr'

import { useEffect,useState } from 'react'
import { useUser } from '../context/userContext'
import cookie from 'js-cookie';

const fetcher = (url) => fetch(url).then((res) => res.json())

const token = cookie.get("firebaseToken")

export default function Hours() {

var dayToHours;
var dayObjects = [];
var data1 = [
    {
        day:"Sunday",
        hours:"8:00 AM - 4:00 PM"
    }
]


  const fetchHours = async () => {

    await fetch('/api/admin/getHours', { method: 'GET',
    headers: {'Content-Type': "application/json"}})
    .then(function(res) {
        res.json().then(json => { 
            dayToHours = json.message
            dayToHours = new Map(dayToHours)
            createDayObjects()
          });

    })
    .catch(function(error) {
    });

   

  }


  const createDayObjects = () => {
      const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]

      for (let day in days) {       
        const dayObject = new Object();
        dayObject.day = days[day]; 
        dayObject.hours = dayToHours.get(days[day]) 
        dayObjects.push(dayObject);
    }

  }

  useEffect(() => {

      fetchHours();
  }, []);


  const [inEditMode, setInEditMode] = useState({
      status: false,
      rowKey: null
  });

  const [hours, setHours] = useState(null);

  /**
   *
   * @param day - The day we are trying to edit
   * @param currentHours - The current hours
   */
  const onEdit = ({day, currentHours}) => {
      setInEditMode({
          status: true,
          rowKey: day
      })
      setHours(currentHours)
      
  }



  /**
   *
   * @param day -The day we are trying to change
   * @param newHours- The new hours of the day
   */
  const onSave = ({day, newHours}) => {
      
        fetch('/api/admin/updateHours', { method: 'POST', 
        body: JSON.stringify({
        "day": day,
        "hours": newHours,
        }),
        headers: {'Content-Type': "application/json", 'Authorization': token}})
        .then(response => response.json())
            .then(json => {
                // reset inEditMode and unit price state values
                onCancel();

                // fetch the updated data
                fetchHours();
                location.reload();
        })
      
  }

  const onCancel = () => {
      // reset the inEditMode state value
      setInEditMode({
          status: false,
          rowKey: null
      })
      // reset the hours
      setHours(null);
  }

  
  const {data,error} = useSWR('/api/admin/getHours',fetcher)
  if(error) {
    return (
        <>
        <Head>
          <title>Pantry</title>
          <link rel="icon" href="/favicon.ico" />
          {/* Link to fonts for now. May look at storing fonts locally or just usign system fonts */}
          <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
        </Head>
        <Layout>
            <th>Failed to get hours</th>
        </Layout>
      </>
    )
  }
  if(!data)  {
    return (
        <>
        <Head>
          <title>Pantry</title>
          <link rel="icon" href="/favicon.ico" />
          {/* Link to fonts for now. May look at storing fonts locally or just usign system fonts */}
          <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
        </Head>
        <Layout>
            <th>Fetching hours...</th>
        </Layout>
      </>
    )
  }
  else {
    dayToHours = data.message
    dayToHours = new Map(dayToHours)
    createDayObjects()
    return (
        <>
        <Head>
          <title>Pantry</title>
          <link rel="icon" href="/favicon.ico" />
          {/* Link to fonts for now. May look at storing fonts locally or just usign system fonts */}
          <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
        </Head>
        <Layout>
        <div className="container">
              <h1 class="text-3xl flex justify-center items-center">Pantry Hours</h1>
              <table class="text-xl flex justify-center items-center" cellpadding="10"cellspacing="10">
                  <thead>
                  <tr>
                      <th></th>
                      <th></th>
                      <th></th>
                  </tr>
                  </thead> 
                  <tbody>
                  {
                      dayObjects.map((item) => (
                          <tr key={item.day}>
                              <td>{item.day[0].toUpperCase() + item.day.substring(1)}</td>
                              <td>
                                  {
                                      inEditMode.status && inEditMode.rowKey === item.day ? (
                                          <input value={hours}
                                                 onChange={(event) => setHours(event.target.value)}
                                          />
                                      ) : (
                                          item.hours
                                      )
                                  }
                              </td>
                              <td>
                                  {
                                      inEditMode.status && inEditMode.rowKey === item.day ? (
                                          <React.Fragment>
                                              <button
                                                  class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 border border-blue-700 rounded"
                                                  onClick={() => onSave({day: item.day, newHours: hours})}
                                              >
                                                  Save
                                              </button>
    
                                              <button
                                                  class="bg-white-500 hover:bg-white-700 text-blue py-1 px-2 border border-blue-700 rounded"
                                                  style={{marginLeft: 8}}
                                                  onClick={() => onCancel()}
                                              >
                                                  Cancel
                                              </button>
                                          </React.Fragment>
                                      ) : (
                                        //   <button
                                        //       className={"btn-primary"}
                                        //       onClick={() => onEdit({day: item.day, currentHours: item.hours})}
                                        //   >
                                        //       Edit
                                        //   </button>
                                        <button className="font-bold text-xl pl-2" onClick={() => onEdit({day: item.day, currentHours: item.hours})}>
                                        <span>&#9999;</span>
                                         </button>
                                          
                                      )
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
  }







 


    


