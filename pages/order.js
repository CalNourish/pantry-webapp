import Layout from '../components/Layout';
import PersonInfo from '../components/orderForm/PersonInfo';
import DeliveryDetails from '../components/orderForm/DeliveryDetails'
import OrderDetails from '../components/orderForm/OrderDetails'
import { useState, useContext } from 'react';
import ReviewOrder from '../components/orderForm/ReviewOrder';
import { StateCartContext, DispatchCartContext } from '../context/cartContext';

export default function Order() {
  let { cart } = useContext(StateCartContext)
  let { delivery } = useContext(StateCartContext)

  const cartDispatch = useContext(DispatchCartContext)
  const [formStep, setFormStep] = useState(0);

  // Set bounds in case of weird behaviors.
  if (formStep < 0) {
    setFormStep(0)
  } else if (formStep > 3) {
    setFormStep(3)
  }

  let topBar = <div className='mb-4 flex flex-row'>
    <button onClick={() => setFormStep(formStep - 1)} className={"btn btn-outline" + (formStep == 0 ? " invisible" : "")}>Back</button>
    <h1 className="text-2xl text-center font-bold flex-grow">Food Resource Delivery Request</h1>
    <button onClick={() => setFormStep(formStep + 1)} className={"btn btn-pantry-blue py-2 px-4" + (formStep >= 2 ? " invisible" : "")}>Next</button>
  </div>

  if ([2,3].includes(formStep)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 mt-8 mb-16">
          {topBar}
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

  let deliveryEligibility = <div className='py-8 px-16 xl:w-1/2 max-w-2xl rounded'>
    <h2 className="text-lg mb-4 block tracking-wide font-bold">Info About the Delivery Program</h2>
    <div className="mb-4">
      The food pantry offers deliveries through a partnership with DoorDash.
      something something something...
    </div>
    <div className="mb-4">
      To be eligible for delivery, you must:
      <ul className='list-disc pl-4 space-y-2'>
        <li>Live within a 15 mile radius of our pantry (located in UC Berkeley campus).</li>
        <li>Be experiencing difficulty visiting the pantry to pick up</li>
      </ul>
    </div>
    <div>
      <label htmlFor="doordash-confirmation" className="block tracking-wide font-bold">
        <input id="doordash-confirmation" className="mr-2 leading-tight" type="checkbox"
          checked={delivery.eligibilityConf}
          onChange={(e) => cartDispatch({ type: 'UPDATE_DELIVERY', payload: {eligibilityConf: e.target.checked}})}
        />
        <span className="text-base">
          I confirm that I meet the above criteria, and I allow the food pantry to share my information with DoorDash.
        </span>
      </label>
      <p className="text-gray-600 text-xs italic">
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
          { formStep < 2 && deliveryEligibility }
          <div className="py-8 px-16 w-7/8 sm:w-5/6 xl:w-1/2 max-w-2xl shadow rounded">
            <div id="form-header">
            </div>
            <div className="mb-8">
              { formStep == 0 &&
                <PersonInfo />
              }
              { formStep == 1 &&
                <DeliveryDetails />
              } 
            </div>
            <div className="flex justify-between" id="form-footer">
              <div>
                { formStep > 0 &&
                  <button  onClick={() => setFormStep(formStep - 1)} className="btn btn-outline py-2 px-4">
                  Back
                  </button>
                }
              </div>
              <div>
                { formStep < 2 &&
                  <button onClick={() => setFormStep(formStep + 1)} className="btn btn-pantry-blue py-2 px-4">
                    Next
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}