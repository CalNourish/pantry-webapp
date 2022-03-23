import Layout from '../components/Layout'
import Head from 'next/head'
import useSWR from 'swr'

import { useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import cookie from 'js-cookie';

const fetcher = (url) => fetch(url).then((res) => res.json())

const token = cookie.get("firebaseToken")

export default function Hours() {

    var dayToHours;
    var dayObjects = [];

    /**
     * Fetch the current hours of the pantry and convert them to a map with
     * the format being day:hours
     */
    const fetchHours = async () => {

        await fetch('/api/admin/getHours', {
            method: 'GET',
            headers: { 'Content-Type': "application/json" }
        })
            .then(function (res) {
                res.json().then(json => {
                    dayToHours = json.message
                    dayToHours = new Map(dayToHours)
                    createDayObjects()
                });

            })
            .catch(function (error) {
            });



    }

    /**
     * Convert the map into objects with day and hour properties
     * 
     */
    const createDayObjects = () => {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

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


    


    const { data, error } = useSWR('/api/admin/getHours', fetcher)
    if (error) {
        return (
            <>
                <Head>
                    <title>Pantry</title>
                    <link rel="icon" href="/favicon.ico" />
                    <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
                </Head>
                <Layout>
                    <th>Failed to get hours</th>
                </Layout>
            </>
        )
    }
    if (!data) {
        return (
            <>
                <Head>
                    <title>Pantry</title>
                    <link rel="icon" href="/favicon.ico" />
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
                    <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
                </Head>
                <Layout>
                    <div className="container">
                        <h1 class="text-3xl flex justify-center items-center">Pantry Hours</h1>
                        <table class="text-xl flex justify-center items-center" cellpadding="10" cellspacing="10">
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
                                                {item.hours}
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













