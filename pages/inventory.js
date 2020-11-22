import React, { useMemo, useState, useEffect } from "react";
import Layout from '../components/Layout'
import Table from '../components/Table'
import firebase from '../firebase/clientApp'
// import useSWR from 'swr'
// import getInventory from './api/inventory'


//https://stackoverflow.com/questions/61925957/using-an-api-to-create-data-in-a-react-table
// https://reactjs.org/docs/hooks-effect.html

const ALL_ITEMS = []
const FULL_TABLE = []
let current_table = []
let current_items = []

export default function Inventory() {

  // define a state for whether i am getting data or not
  // define a state for the actual data
  // make the API call in useEffect()
  // set the states as necessary in the callbacks from the API call


  return (
    <>
      <Layout>
        <body>
          <div>
              <h2 className="text-2xl font-semibold leading-tight">Live Inventory</h2>
          </div> 
            <Table data={getAllItems} />      
        </body>
      </Layout>
    </>
  )
}



function getAllItems() {
  return [
    {itemName: '1'},
    {itemName: '2'}
  ]
}

async function getInventory() {
  const REF = firebase.database().ref('/inventory');
  REF.once("value", snapshot => {
      console.log(snapshot.val())
      return snapshot.val()
  });
  
}