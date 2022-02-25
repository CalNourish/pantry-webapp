import Layout from '../components/Layout';
import PersonInfo from '../components/orderForm/PersonInfo';
import DeliveryDetails from '../components/orderForm/DeliveryDetails'
import OrderDetails from '../components/orderForm/OrderDetails'
import { useState } from 'react';

export default function Order() {
  const [formStep, setFormStep] = useState(0);
  return (
    <Layout>
      <div className="sm:container mx-auto my-4">
        <h1 className="text-xl text-center">Food Resource Delivery Request</h1>
        <div className="flex justify-center m-8">
          <div className="py-8 px-16 shadow rounded">
            <div id="form-header">
            </div>
            <div className="mb-4">
              { formStep == 0 &&
                <PersonInfo />
              }
              { formStep == 1 &&
                <DeliveryDetails />
              } 
              { formStep == 2 &&
                <OrderDetails />
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