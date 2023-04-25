import Layout from "../components/Layout";
import { useUser } from "../context/userContext";
import { server } from './_app.js'

import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { markdownStyle } from "../utils/markdownStyle";

export default function Home() {
  // Our custom hook to get context values
  const { user } = useUser();

  let authToken = (user && user.authorized) ? user.authToken : null;

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
              headers: {'Content-Type': "application/json", 'Authorization': authToken}
            }).then((res) => {
              if (!res.ok) {
                res.json().then(err => console.log("SetHomeInfo error: " + err.error))
              }
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
  );
}
