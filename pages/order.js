import Layout from '../components/Layout';
import PersonInfo from '../components/orderForm/PersonInfo';
import DeliveryDetails from '../components/orderForm/DeliveryDetails'
import OrderDetails from '../components/orderForm/OrderDetails'
import { useState, useContext } from 'react';
import ReviewOrder from '../components/orderForm/ReviewOrder';
import { StateCartContext } from '../context/cartContext';

export default function Order() {
  let { cart } = useContext(StateCartContext)
  const [formStep, setFormStep] = useState(2);

  if ([2,3].includes(formStep)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 mt-8 mb-16">
          <div className="mb-4">
            <button onClick={() => setFormStep(formStep - 1)} className="hover:text-blue-500 text-blue-700">
              Back
            </button>
          </div>
          {
            formStep == 2 ? 
              <OrderDetails> 
                <button 
                className=
                  {"w-full text-white font-bold py-2 px-4 rounded border border-transparent bg-blue-500 " + (Object.keys(cart).length > 0 ?  "bg-blue-500 hover:bg-blue-700" : "cursor-not-allowed opacity-50")}
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
                    change
                  </button>
                }
                updateDeliveryDetails={
                  <button 
                    className='text-sm hover:text-blue-500 text-blue-700'
                    onClick={() => {setFormStep(1)}}
                  >
                    change
                  </button>
                }
                updateOrderDetails={
                  <button 
                  className='text-sm hover:text-blue-500 text-blue-700'
                  onClick={() => {setFormStep(2)}}
                >
                  change
                </button>
                }
              />
          }       
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="sm:container mx-auto mt-8 mb-16">
        <h1 className="text-2xl text-center font-bold">Food Resource Delivery Request</h1>
        <div className="flex justify-center m-8">
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
                  <button  onClick={() => setFormStep(formStep - 1)} className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                  Back
                  </button>
                }
              </div>
              <div>
                { formStep < 2 &&
                  <button onClick={() => setFormStep(formStep + 1)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded border border-transparent">
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