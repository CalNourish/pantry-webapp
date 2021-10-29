import Layout from '../components/Layout'
import Head from 'next/head'
import useSWR from 'swr'

import { useEffect,useState } from 'react'
import { useUser } from '../context/userContext'
import cookie from 'js-cookie';

const fetcher = (url) => fetch(url).then((res) => res.json())



export default function Hours() {




  const fetchHours = () => {
    fetch('/api/admin/getHours', { method: 'GET',
    headers: {'Content-Type': "application/json"}})
    createDayObjects();

  }

  const createDayObjects = () => {
      const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
    
      
      for (let day in days) {       
        const dayObject = new Object();
        dayObject.day = days[day];
        //dayObject.hours = dayToHours.get(days[day])
        //data.push(dayObject);
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
      if(validateHours(newHours)) {
            fetch('/api/admin/updateHours', { method: 'POST', 
            body: JSON.stringify({
            "day": day,
            "hours": newHours,
            }),
        headers: {'Content-Type': "application/json", 'Authorization': token}})
      }
      else {
          console.log("validation failed")
      }
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

  
  
  
   
  return (
      <div className="container">
          <h1>Pantry Hours</h1>
          {/* <table>
              <thead>
              <tr>
                  <th>Day</th>
                  <th>Hours</th>
                  <th>Modify Hours</th>
              </tr>
              </thead>
              <tbody>
              {
                  data.map((day) => (
                      <tr key={day}>
                          <td>{day}</td>
                          <td>
                              {
                                  inEditMode.status && inEditMode.rowKey === day ? (
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
                                  inEditMode.status && inEditMode.rowKey === day ? (
                                      <React.Fragment>
                                          <button
                                              className={"btn-success"}
                                              onClick={() => onSave({day: day, newHours: hours})}
                                          >
                                              Save
                                          </button>

                                          <button
                                              className={"btn-secondary"}
                                              style={{marginLeft: 8}}
                                              onClick={() => onCancel()}
                                          >
                                              Cancel
                                          </button>
                                      </React.Fragment>
                                  ) : (
                                      <button
                                          className={"btn-primary"}
                                          onClick={() => onEdit({day: day, currentHours: hours})}
                                      >
                                          Edit
                                      </button>
                                  )
                              }
                          </td>
                      </tr>
                  ))
              }
              </tbody>
          </table> */}
      </div>
  );
}


