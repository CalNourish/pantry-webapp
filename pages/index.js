import Head from "next/head";
import useSWR from "swr";

import { useEffect } from "react";
import { useUser } from "../context/userContext";
import Layout from "../components/Layout";

import cookie from "js-cookie";

// fetcher for get requests
const fetcher = (url) => fetch(url).then((res) => res.json());

function fixCounts() {
  const token = cookie.get("firebaseToken");
  fetch("/api/inventory/GetAllItems", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      for (var bcode in data) {
        fetch("/api/inventory/UpdateItem", {
          method: "POST",
          body: JSON.stringify({ barcode: bcode, count: data[bcode]["count"] }),
          headers: { "Content-Type": "application/json", Authorization: token },
        });
      }
    });
}

export default function Home() {
  // Our custom hook to get context values
  const { user, setUser, googleLogin } = useUser();
  const token = cookie.get("firebaseToken");
  console.log("User:", user);
  return (
    <>
      <Head>
        <title>Pantry</title>
        <link rel="icon" href="/favicon.ico" />
        {/* Link to fonts for now. May look at storing fonts locally or just usign system fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap"
          rel="stylesheet"
        ></link>
      </Head>
      <Layout></Layout>
    </>
  );
}
