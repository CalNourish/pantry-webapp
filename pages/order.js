import Layout from '../components/Layout';
import PersonInfo from '../components/orderForm/PersonInfo';
import DeliveryDetails from '../components/orderForm/DeliveryDetails'
import OrderDetails from '../components/orderForm/OrderDetails'
import ReviewOrder from '../components/orderForm/ReviewOrder';
import { useUser } from '../context/userContext'
import { StateCartContext, DispatchCartContext } from '../context/cartContext';
import { server } from './_app.js'

import { useState, useContext, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import cookie from 'js-cookie';

export const requiredField = <div className='inline text-red-600'> *</div>
export const optionalField = <div className='inline text-gray-500 normal-case tracking-normal font-semibold'>(optional)</div>

export default function Order() {
  let { cart, personal, delivery } = useContext(StateCartContext)

  const cartDispatch = useContext(DispatchCartContext)
  let [formStep, setFormStep] = useState(0);     // page number
  let [showMissing, setShowMissing] = useState(false);
  let [info, setInfo] = useState(false);
  let [isEditingInfo, setIsEditingInfo] = useState(false);
  let [showPreviewInfo, setShowPreview] = useState(false);

  // Set bounds in case of weird behaviors.
  if (formStep < 0) {
    setFormStep(0)
  } else if (formStep > 3) {
    setFormStep(3)
  }

  // prevent accidentally leaving if past the first page   
  useEffect(() => {
    if (formStep > 0) {
      window.onbeforeunload = () => {
        return "Leave page? Changes will not be saved.";
      };
    }
  }, []);

  // function for checking all fields are filled
  let checkNextable = () => {
    let required, page;
    if (formStep == 0) { // personal info
      required = ["first", "last", "calID", "email", "emailConf", "status"]
      page = personal;
      if (personal["email"] != personal["emailConf"]) return false;
    }
    else {
      required = ["streetAddress", "city", "zip", "phone", "deliveryTimes"]
      page = delivery;
    }

    for (let field of required) {
      if (!page[field] || page[field].length == 0) {
        return false;
      }
    }
    if (!personal.eligibilityConf) {
      return false;
    }
    return true;
  }

  // continue to next page if all required fields are filled.
  let handleNext = () => {
    if (checkNextable()) {
      setFormStep(formStep + 1);
      setShowMissing(false);
    } else {
      setShowMissing(true);
    }
  }

  /* title and navigation bar for orders */
  // TODO: add progress indicator?
  let topBar = <div className='mb-4 flex flex-row'>
    <button onClick={() => {setFormStep(formStep - 1); setShowMissing(false)}} className={"btn btn-outline" + (formStep == 0 ? " invisible" : "")}>Back</button>
    <h1 className="text-2xl text-center font-bold flex-grow">Food Resource Delivery Request</h1>
    <button className={"btn btn-pantry-blue py-2 px-4" + (formStep >= 2 ? " invisible" : "")} onClick={handleNext}>Next</button>
  </div>

  /* Cart and Review pages */
  if ([2,3].includes(formStep)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 mt-8 mb-16">
          {formStep == 2 && topBar}
          {
            formStep == 2 ? 
              <OrderDetails> 
                <button 
                className=
                  {"w-full text-white font-bold py-2 px-4 btn btn-pantry-blue " + (Object.keys(cart).length > 0 ?  "" : "cursor-not-allowed opacity-50")}
                  onClick={
                    () => {
                      if (Object.keys(cart).length > 0) {
                        setFormStep(formStep + 1)
                      }
                    }
                  }
                >
                Review Order
                </button>
              </OrderDetails>
                : 
              <ReviewOrder 
                updatePersonalInfo={
                  <button 
                    className='text-sm hover:text-blue-500 text-blue-700'
                    onClick={() => {setFormStep(0)}}
                  >
                    edit
                  </button>
                }
                updateDeliveryDetails={
                  <button 
                    className='text-sm hover:text-blue-500 text-blue-700'
                    onClick={() => {setFormStep(1)}}
                  >
                    edit
                  </button>
                }
                updateOrderDetails={
                  <button 
                  className='text-sm hover:text-blue-500 text-blue-700'
                  onClick={() => {setFormStep(2)}}
                >
                  edit
                </button>
                }
              />
          }       
        </div>
      </Layout>
    )
  }

  const token = cookie.get("firebaseToken")

  let getInfo = () => {
    fetch(`${server}/api/orders/GetEligibilityInfo`)
    .then((result) => {
      result.json().then((data) => {
        setInfo(data.markdown);
      })
    })
  }

  if (info === false) {
    getInfo();
  }

  const markdownStyle = {
    h1: ({node, ...props}) => <h1 className='text-4xl mb-4 block tracking-wide font-bold' {...props}/>,
    h2: ({node, ...props}) => <h2 className='text-3xl mb-4 block tracking-wide font-bold' {...props}/>,
    h3: ({node, ...props}) => <h3 className='text-2xl mb-4 block tracking-wide font-bold' {...props}/>,
    h4: ({node, ...props}) => <h4 className='text-xl mb-2 font-bold' {...props}/>,
    h5: ({node, ...props}) => <h5 className='text-lg mb-2 font-bold' {...props}/>,
    h6: ({node, ...props}) => <h6 className='text-md mb-2 font-bold' {...props}></h6>,
    p: ({node, ...props}) => <p className='mb-4' {...props}/>,
    ul: ({node, ...props}) => {return <ul className='list-disc pl-4 space-y-2 font-normal' {...props} ordered="false"></ul>}
  }

  const { loadingUser, user } = useUser();
  let authToken = (user && user.authorized === "true") ? token : null;

  let infoDiv = <div className='py-8 px-16 xl:w-1/2 max-w-2xl rounded'>
    {/* Editing the information */}
    {!isEditingInfo && authToken && <button className='text-blue-700 hover:text-blue-500'
      onClick={() => setIsEditingInfo(true)}>
      edit
    </button>}

    {/* cancel edit */}
    {isEditingInfo && <button className='text-blue-700 hover:text-blue-500'
      onClick={() => {
        setIsEditingInfo(false);
        getInfo(); // reset to original
      }}>
      cancel
    </button>}

    {/* save edit */}
    {isEditingInfo && <button className='ml-5 text-blue-700 hover:text-blue-500'
      onClick={() => {
        setIsEditingInfo(false);
        fetch('/api/orders/SetEligibilityInfo', { method: 'POST',
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

    {/* Information (rendered markdown) */}
    {(!isEditingInfo || showPreviewInfo) && info && <ReactMarkdown className="mb-4" components={markdownStyle} children={info}></ReactMarkdown>}

    {/* Confirmation to share info checkbox */}
    <div>
      <label htmlFor="eligiblility-confirmation" data-required="T"
        className={"block tracking-wide font-bold p-1" + ((showMissing && !personal.eligibilityConf) ? " border-red-600 border rounded" : " border border-transparent")}
      >
        <input id="eligiblility-confirmation" className="mr-2 leading-tight" type="checkbox"
          checked={personal.eligibilityConf}
          onChange={(e) => cartDispatch({ type: 'UPDATE_PERSONAL', payload: {eligibilityConf: e.target.checked}})}
        />
        <span className="text-base">
          I confirm that I meet these conditions, and I allow the food pantry to share my information with DoorDash.
        </span>
      </label>
      <p className="mt-2 text-gray-500 text-xs italic">
        By clicking this, you are permitting us to share your information with DoorDash so that they can deliver to you.
        The information provided includes your name, address, phone number, and delivery notes.
      </p>
    </div>
  </div>

  return (
    <Layout>
      <div className="sm:container mx-auto mt-8 mb-16 px-4">
        { topBar }
        <div className="flex justify-center m-8 flex-col lg:flex-row">
          { formStep < 2 && infoDiv }
          <div className="py-8 px-16 xl:w-1/2 max-w-2xl shadow rounded">
            <div id="form-header">
            </div>
            <div className="mb-8">
              { formStep == 0 &&
                <PersonInfo showMissing={showMissing} />
              }
              { formStep == 1 &&
                <DeliveryDetails showMissing={showMissing} />
              } 
            </div>
            <div className="flex justify-between" id="form-footer">
              <div>
                { formStep > 0 &&
                  <button  onClick={() => {setFormStep(formStep - 1); setShowMissing(false)}} className="btn btn-outline py-2 px-4">
                    Back
                  </button>
                }
              </div>
              {showMissing && !checkNextable() && <div className='flex-grow text-right mx-4 my-auto text-red-600 font-semibold'>Missing required fields!</div>}
              {showMissing && checkNextable() && <div className='flex-grow text-right mx-4 my-auto text-2xl font-extrabold text-green-600'>✓</div>}
              <div>
                { formStep < 2 &&
                  <button className="btn btn-pantry-blue py-2 px-4" onClick={handleNext}>Next</button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}