import Head from 'next/head'
import useSWR from 'swr'

import { useEffect } from 'react'
import { useUser } from '../context/userContext'
import Layout from '../components/Layout'

import cookie from 'js-cookie';

// fetcher for get requests
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Home() {
  // Our custom hook to get context values
  const { user, setUser, googleLogin } = useUser()
  const token = cookie.get("firebaseToken")
  console.log("User:", user);
  return (
    <>
    <Head>
      <title>Pantry</title>
      <link rel="icon" href="/favicon.ico" />
      {/* Link to fonts for now. May look at storing fonts locally or just usign system fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap" rel="stylesheet"></link>
    </Head>
    <Layout>
      <h1>Home</h1>
      <table>

      <tr><td>
        <button onClick={() => {
          fetch('/api/inventory/UpdateItem', { method: 'POST', body: 
                JSON.stringify({"barcode" : "222220", "count": "111", "lowStock": "2"}),
                headers: {'Content-Type': "application/json", 'Authorization': token}})
        }}> UpdateItem Button </button>
      </td></tr>

      <tr><td>
        <button onClick={() => {
          fetch('/api/inventory/GetItem/2222200000', { method: 'GET',
                headers: {'Content-Type': "application/json"}})
        }}> GetItem Button </button>
      </td></tr>

      <tr><td>
        <button onClick={() => {
          fetch('/api/inventory/GetAllItems', { method: 'GET',
                headers: {'Content-Type': "application/json"}})
        }}> GetAllItems Button </button>
      </td></tr>

      <tr><td>
        <button onClick={() => {
          fetch('/api/inventory/DeleteItem', { method: 'POST', 
                body: JSON.stringify({"barcode": "2222200000"}),
                headers: {'Content-Type': "application/json", 'Authorization': token}})
        }}> DeleteItem 2222200000 Button </button>
      </td></tr>

      <tr><td>
        <button onClick={() => {
          fetch('/api/inventory/AddItem', { method: 'POST', 
                body: JSON.stringify({
                  "barcode": "2222200000",
                  "itemName": "API Testing Item",
                  "packSize": "31",
                  "lowStock": "2",
                  "categoryName": {"PIXafWlKvP": "PIXafWlKvP", "kVsxgN0G1L": "kVsxgN0G1L"},
                  "count": "400"
                }),
                headers: {'Content-Type': "application/json", 'Authorization': token}})
        }}> AddItem 2222200000 Button </button>
      </td></tr>

      <tr><td>
        <button onClick={() => {
          fetch('/api/categories/AddCategory', { method: 'POST', 
                body: JSON.stringify({
                  "displayName": "NewCat",
                  "iconName": "oski",
                }),
                headers: {'Content-Type': "application/json", 'Authorization': token}})
        }}> Create New Category Button </button>
      </td></tr>

      <tr><td>
        <button onClick={() => {
          fetch('/api/categories/UpdateCategory', { method: 'POST', 
                body: JSON.stringify({
                  "displayName": "NewCat",
                  "iconName": "OSKI",
                }),
                headers: {'Content-Type': "application/json", 'Authorization': token}})
        }}> Update NewCat Category Button </button>
      </td></tr>

      <tr><td>
        <button onClick={() => {
          fetch('/api/categories/ListCategories', { method: 'GET',
                headers: {'Content-Type': "application/json"}})
        }}> ListCategories Button </button>
      </td></tr>
    </table>
    </Layout>
  </>

  )
}
