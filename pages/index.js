import Head from "next/head";
import Layout from "../components/Layout";
import { useUser } from "../context/userContext";
import { server } from './_app.js'

import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import cookie from "js-cookie";

const markdownStyle = {
  h1: ({node, ...props}) => <h1 className='text-4xl mb-4 block tracking-wide font-bold' {...props}/>,
  h2: ({node, ...props}) => <h2 className='text-3xl mb-4 block tracking-wide font-bold' {...props}/>,
  h3: ({node, ...props}) => <h3 className='text-2xl mb-4 block tracking-wide font-bold' {...props}/>,
  h4: ({node, ...props}) => <h4 className='text-xl mb-2 font-bold' {...props}/>,
  h5: ({node, ...props}) => <h5 className='text-lg mb-2 font-bold' {...props}/>,
  h6: ({node, ...props}) => <h6 className='text-md mb-2 font-bold' {...props}></h6>,
  p: ({node, ...props}) => <p className='py-2' {...props}/>,
  ul: ({node, ...props}) => <ul className='list-disc pl-4 space-y-2 font-normal mb-4' {...props} ordered="false"></ul>,
  ol: ({node, ...props}) => <ol className='list-decimal pl-4 space-y-2 font-normal mb-4' {...props} ordered="true"></ol>,
  a: ({node, ...props}) => <a className='text-blue-700 hover:text-blue-500' {...props}></a>,
  blockquote: ({node, ...props}) => <blockquote className='px-4 border-l-4' {...props}></blockquote>
}

export default function Home() {
  // Our custom hook to get context values
  const { user, setUser, googleLogin } = useUser();
  const token = cookie.get("firebaseToken");

  console.log("User:", user);
  let authToken = (user && user.authorized === "true") ? token : null;

  const [info, setInfo] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [showPreviewInfo, setShowPreview] = useState(false);

  let getInfo = () => {
    fetch(`${server}/api/admin/GetHomeInfo`)
    .then((result) => {
      result.json().then((data) => {
        setInfo(data.markdown);
      });
    });
  }
  if (info === false) {
    getInfo();
  }

  return (
    <>
      <Head>
        <title>Pantry</title>
        <link rel="icon" href="/favicon.ico" />
        {/* Link to fonts for now. May look at storing fonts locally or just usign system fonts */}
        {/* <link
          href="https://fonts.googleapis.com/css2?family=Roboto&family=Rubik:wght@400;700&display=swap"
          rel="stylesheet"
        ></link> */}
      </Head>
      <Layout>
        <div className="m-8">
          {/* Editing the information */}
          {!isEditingInfo && authToken && <button className='text-blue-700 hover:text-blue-500'
            onClick={() => setIsEditingInfo(true)}>
            edit
          </button>}

          {/* cancel edit */}
          {isEditingInfo && <button className='text-blue-700 hover:text-blue-500'
            onClick={() => {
              setIsEditingInfo(false);
              getInfo();
            }}>
            cancel
          </button>}

          {/* save edit */}
          {isEditingInfo && <button className='ml-5 text-blue-700 hover:text-blue-500'
            onClick={() => {
              setIsEditingInfo(false);
              fetch('/api/admin/SetHomeInfo', { method: 'POST',
                body: JSON.stringify({markdown: info}),
                headers: {'Content-Type': "application/json", 'Authorization': token}
              }).then((res) => {
                console.log(res)
              })
            }}>
            save
          </button>}

          {/* show/hide preview */}
          {isEditingInfo && <button className='ml-5 text-blue-700 hover:text-blue-500'
            onClick={() => {
              setShowPreview(!showPreviewInfo);
            }}>
            {showPreviewInfo ? "hide" : "show"} preview
          </button>}

          {/* Edit message box */}
          {isEditingInfo &&
            <textarea className="form-control w-full h-64 block px-3 py-1 text-base font-normal text-gray-600 bg-white
              border border-solid border-gray-200 rounded mb-4
            focus:text-gray-600 focus:bg-white focus:border-blue-600 focus:outline-none" value={info}
              onChange={(e) => {
                setInfo(e.target.value);
              }}>
            </textarea>}

          {(!isEditingInfo || showPreviewInfo) && info && <ReactMarkdown className="mb-4" components={markdownStyle} children={info}></ReactMarkdown>}
        </div>
      </Layout>
    </>
  );
}
