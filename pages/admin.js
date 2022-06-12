import Layout from '../components/Layout'
import Head from 'next/head'
import useSWR from 'swr'

import { useEffect, useState } from 'react'
import { useUser } from '../context/userContext'
import cookie from 'js-cookie';

const fetcher = (url) => fetch(url).then((res) => res.json())

const token = cookie.get("firebaseToken")

export default function Admin() {
  const { user } = useUser();
  let authToken = (user && user.authorized === "true") ? token : null;
  if (!authToken) {
    return (
      <Layout>
        <div className='p-4'>You are not authorized to view this page.</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='p-4'>nothing here yet</div>
    </Layout>
  )
}
