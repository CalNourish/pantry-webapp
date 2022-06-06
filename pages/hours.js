import Layout from '../components/Layout'
import Head from 'next/head'
import useSWR from 'swr'

import { useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import cookie from 'js-cookie';

const fetcher = (url) => fetch(url).then((res) => res.json())

const token = cookie.get("firebaseToken")

export default function Hours() {

  // var dayToHours;
  // var dayObjects = [];

  // /**
  //  * Fetch the current hours of the pantry and convert them to a map with
  //  * the format being day:hours
  //  */
  // const fetchHours = async () => {

  //   await fetch('/api/admin/getHours', {
  //     method: 'GET',
  //     headers: { 'Content-Type': "application/json" }
  //   })
  //   .then(function (res) {
  //     res.json().then(json => {
  //       dayToHours = json.message
  //       dayToHours = new Map(dayToHours)
  //       createDayObjects()
  //     });
  //   })
  //   .catch(function (error) {
  //     console.log("error:", error)
  //   });
  // }

  // /**
  //  * Convert the map into objects with day and hour properties
  //  */
  // const createDayObjects = () => {
  //   const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

  //   for (let day in days) {
  //     const dayObject = new Object();
  //     dayObject.day = days[day];
  //     dayObject.hours = dayToHours.get(days[day])
  //     dayObjects.push(dayObject);
  //   }
  // }

  // useEffect(() => {
  //   fetchHours();
  // }, []);

  const { data, error } = useSWR('/api/admin/getHours', fetcher)

  /* Display error message */
  if (error) {
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
  }

  /* Display loading message */
  if (!data) {
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

  /* otherwise display table of hours */
  const daysInOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  return (
    <>
      <Head>
        <title>Pantry</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
      </Head>
      <Layout>
        <h1 className="text-3xl flex justify-center items-center">Pantry Hours</h1>
        <table className="text-xl flex justify-center items-center" cellpadding="10" cellspacing="10">
          <thead>
            <tr>
              <th></th>
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
                    {data[dayKey]}
                  </td>

                </tr>
              ))
            }

          </tbody>
        </table>
      </Layout>
    </>
  )
}