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
import { markdownStyle } from '../utils/markdownStyle';

export default function Order() {
  let { cart, personal, delivery } = useContext(StateCartContext);

  const cartDispatch = useContext(DispatchCartContext)
  let [formStep, setFormStep] = useState(0);     // page number
  let [showMissing, setShowMissing] = useState(false);
  let [openInfo, setOpenInfo] = useState(false);
  let [closedInfo, setClosedInfo] = useState(false);
  let [isEditingInfo, setIsEditingInfo] = useState(false);
  let [showPreviewInfo, setShowPreview] = useState(false);
  let [orderStatus, setOrderStatus] = useState(false);
  let [loading, setLoading] = useState(true);
  
  let getOrderStatus = () => {
    fetch(`${server}/api/admin/GetOrderStatus`)
    .then((result) => {
      result.json().then((data) => {
        setOrderStatus(data);
        setLoading(false);
      })
    })
  }

  useEffect(() => {
    getOrderStatus();
  }, [])

  // Enforce bounds between 0 and 4 (inclusive)
  if (formStep < 0) {
    setFormStep(0)
  } else if (formStep > 4) {
    setFormStep(4)
  }

  // prevent accidentally leaving if past the first page   
  if (formStep > 0) {
    window.onbeforeunload = () => {
      return "Leave page? Changes will not be saved.";
    };
  }

  // function for checking all fields are filled
  let checkNextable = () => {
    let required;
    if (formStep == 0) { // personal info
      required = ["first", "last", "calID", "email", "status"]
      for (let field of required) {
        if (!personal[field] || personal[field].length == 0) {
          return false;
        }
      }

      if (!personal.eligibilityConf) {
        return false;
      }
    }
    else {
      required = ["streetAddress", "city", "zip", "phone", "deliveryTimes"]
      if (!delivery.pickup) {
        for (let field of required) {
          if (!delivery[field] || delivery[field].length == 0) {
            return false;
          }
        }
      }
      if (!personal.eligibilityConf || (!delivery.pickup && !personal.doordashConf)) {
        // don't require doordash confirmation if pickup
        return false;
      }
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
  let topBar = 
  <div className='mb-4 flex flex-row items-center'>
      <button onClick={() => {setFormStep(formStep - 1); setShowMissing(false);}} className={"btn btn-outline" + ((formStep == 0 || formStep >= 4) ? " invisible" : "")}>Back</button>
      <h1 className="text-2xl text-center font-bold flex-grow">Food Resource Delivery Request</h1>
      <button className={"btn btn-pantry-blue py-2 px-4" + (formStep >= 2 ? " invisible" : "")} onClick={handleNext}>Next</button>
  </div>

 let progressBar =  
    <div className='mx-20 ml-28 mb-4 flex flex-row h-5 bg-gray-100 rounded-lg items-center'> 
       <div style={{ width: `${formStep * 25}%`}}
          className='pl-1 text-sm text-gray-700/50 text-center h-full rounded-lg bg-green-500'> {formStep * 25}%
        </div>
    </div> 

  /* Cart and Review pages */
  if (formStep >= 2) {
    return (
      <Layout pageName="Order">
        <div className="sm:container mx-auto mt-8 mb-16 px-4">
          { topBar }
          { formStep == 4 ? false : progressBar }
          <div className="m-8">
            { formStep == 2 ? 
            <OrderDetails> 
            <button 
            className=
              {"w-full text-white font-bold py-2 px-4 btn btn-pantry-blue " + (Object.keys(cart).length > 0 ?  "" : "cursor-not-allowed opacity-50")}
              onClick={
                () => {
                  if (Object.keys(cart).length > 0) {
                    setFormStep(formStep + 1);
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
          updateStepOrder={setFormStep}
        />
            }
          </div>     
        </div>
      </Layout>
    )
  }

  let getOpenInfo = () => {
    fetch(`${server}/api/orders/GetEligibilityInfo`)
    .then((result) => {
      result.json().then((data) => {
        setOpenInfo(data.markdown);
      })
    })
  }

  if (openInfo === false) {
    getOpenInfo();
  }

  const { user } = useUser();
  let authToken = (user && user.authorized) ? user.authToken : null;

  let openInfoDiv = <div className='py-8 px-16 xl:w-1/2 max-w-2xl rounded'>
    {/* Editing the information */}
    {!isEditingInfo && authToken && <button className='text-blue-700 hover:text-blue-500'
      onClick={() => setIsEditingInfo(true)}>
      edit
    </button>}

    {/* cancel edit */}
    {isEditingInfo && <button className='text-blue-700 hover:text-blue-500'
      onClick={() => {
        setIsEditingInfo(false);
        getOpenInfo(); // reset to original
      }}>
      cancel
    </button>}

    {/* save edit */}
    {isEditingInfo && <button className='ml-5 text-blue-700 hover:text-blue-500'
      onClick={() => {
        setIsEditingInfo(false);
        fetch('/api/orders/SetEligibilityInfo', { method: 'POST',
          body: JSON.stringify({markdown: openInfo}),
          headers: {'Content-Type': "application/json", 'Authorization': authToken}
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
      <textarea
        className="form-control w-full h-64 block px-3 py-1 text-base font-normal text-gray-600 bg-white
        border border-solid border-gray-200 rounded mb-4 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" 
        value={openInfo}
        onChange={(e) => {
          setOpenInfo(e.target.value);
        }}
      />
    }

    {/* Information Display or Preview (rendered markdown) */}
    {(!isEditingInfo || showPreviewInfo) && openInfo && <ReactMarkdown className="mb-4 text-zinc-900" components={markdownStyle} children={openInfo}></ReactMarkdown>}

    {/* Eligibility and info sharing confirmation checkboxes */}
    <div>
      <label htmlFor="eligiblility-confirmation" data-required="T"
        className={"block tracking-wide font-bold p-1.5 mb-2" + ((showMissing && !personal.eligibilityConf) ? " border-red-600 border rounded" : " border border-transparent")}
      >
        <input id="eligiblility-confirmation" className="mr-2 leading-tight" type="checkbox"
          checked={personal.eligibilityConf}
          onChange={(e) => cartDispatch({ type: 'UPDATE_PERSONAL', payload: {eligibilityConf: e.target.checked}})}
        />
        <span className="text-base">
        I confirm that I have been referred by the BNC Care Team.
        </span>
      </label>
      
      { formStep > 0 && !delivery.pickup &&
        <>
          <label htmlFor="doordash-confirmation" data-required={delivery.pickup ? "" : "T"}
            className={"block tracking-wide font-bold p-1.5" + ((showMissing && !personal.doordashConf) ? " border-red-600 border rounded" : " border border-transparent")}
          >
            <input id="doordash-confirmation" className="mr-2 leading-tight" type="checkbox"
              checked={personal.doordashConf}
              onChange={(e) => cartDispatch({ type: 'UPDATE_PERSONAL', payload: {doordashConf: e.target.checked}})}
            />
            <span className="text-base">
              I confirm that I allow the food pantry to share my information with DoorDash.
            </span>
          </label>
          <p className="mt-2 text-gray-500 text-xs italic">
            By clicking this, you are permitting us to share your information with DoorDash so that they can deliver to you.
            The information provided includes your name, address, phone number, and delivery notes.
          </p>
        </>
      }
    </div>
  </div>

  let getClosedInfo = () => {
    fetch(`${server}/api/orders/GetClosedOrderInfo`)
    .then((result) => {
      result.json().then((data) => {
        setClosedInfo(data.markdown);
      })
    })
  }

  if (closedInfo === false) {
    getClosedInfo();
  }

  let closedInfoDiv = <div className='rounded m-6'>
    {/* Editing the information */}
      {!isEditingInfo && authToken && <button className='text-blue-700 hover:text-blue-500'
      onClick={() => setIsEditingInfo(true)}>
      edit
    </button>}

    {/* cancel edit */}
    {isEditingInfo && <button className='text-blue-700 hover:text-blue-500'
      onClick={() => {
        setIsEditingInfo(false);
        getClosedInfo(); // reset to original
      }}>
      cancel
    </button>}

    {/* save edit */}
    {isEditingInfo && <button className='ml-5 text-blue-700 hover:text-blue-500'
      onClick={() => {
        setIsEditingInfo(false);
        fetch('/api/orders/SetClosedOrderInfo', { method: 'POST',
          body: JSON.stringify({markdown: closedInfo}),
          headers: {'Content-Type': "application/json", 'Authorization': authToken}
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
      <textarea
        className="form-control w-full h-64 block px-3 py-1 text-base font-normal text-gray-600 bg-white
        border border-solid border-gray-200 rounded mb-4 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" 
        value={closedInfo}
        onChange={(e) => {
          setClosedInfo(e.target.value);
        }}
      />
    }

    {/* Information Display or Preview (rendered markdown) */}
    {(!isEditingInfo || showPreviewInfo) && closedInfo && <ReactMarkdown className="mb-4 text-zinc-900 text-2xl" components={markdownStyle} children={closedInfo}></ReactMarkdown>}
  </div>

  {/* Loading */}
  if (loading) {
    return (
      <Layout pageName="Order">
        <div className="sm:container mx-auto mt-8 mb-16 px-4">
          <h1 className='text-xl m-6'>Loading...</h1>
        </div>
      </Layout>
    );
  }

  return (
    orderStatus ? (
      // orders enabled
      <Layout pageName="Order">
        <div className="sm:container mx-auto mt-8 mb-16 px-4">
          { topBar }
          { formStep == 4 ? false : progressBar }
          <div className="flex justify-center m-8 flex-col lg:flex-row">
            { openInfoDiv }
            <div className="py-8 px-16 xl:w-1/2 max-w-2xl shadow rounded">
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
                    <button  onClick={() => {setFormStep(formStep - 1); setShowMissing(false);}} className="btn btn-outline py-2 px-4">
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
    ) : (
      // orders disabled
      <Layout pageName="Order">
        { closedInfoDiv }
      </Layout>
    )
  )
}