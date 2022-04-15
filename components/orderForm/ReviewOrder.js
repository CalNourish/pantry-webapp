import { useContext } from 'react';
import { StateCartContext } from '../../context/cartContext'
import cookie from 'js-cookie';

export default function ReviewOrder({updatePersonalInfo, updateDeliveryDetails, updateOrderDetails}) {
  const { cart, personal, delivery } = useContext(StateCartContext)

  const submitCart = (cart, personal, delivery) => {
    const items = {}
    for (const barcode in cart) {
      items[barcode] = cart[barcode].quantity
    }

    const deliveryOptions = delivery.deliveryTimes?.map((element) => element.label).join(", ")

    const orderBody = {
      firstName: personal.first,
      lastName: personal.last,
      address: delivery.streetAddress,
      address2: delivery.address2,
      city: delivery.city,
      zip: delivery.zip,
      frequency: "one-time", // todo: add selection?
      dependents: personal.dependents || 0,
      dietaryRestrictions: personal.dietaryRestrictions,
      additionalRequests: personal.additionalRequests,
      calID: personal.calID,
      items: items,
      deliveryDate: "some day",
      deliveryWindow: deliveryOptions, // todo: multiple options?

      email: personal.email,
      phone: delivery.phone,
      dropoffInstructions: delivery.notes
    }

    const token = cookie.get("firebaseToken")

    console.log("order body:", orderBody)
    fetch('/api/orders/AddOrder',
      { method: 'POST',
        body: JSON.stringify(orderBody),
        headers: {'Content-Type': "application/json", 'Authorization': token}
      }
    ).then(resp => resp.json())
    .then((json) => {
      console.log("status:", json.error)
    })
  }

  return (
    <>
      <h2 className="h-10 text-lg mb-2 block tracking-wide text-gray-700 font-bold">Review Order</h2>
      <div className="flex">
        <div className="mr-16 flex-grow">
          <div className='border-b-2 pb-4'>
            <div className='flex mb-1'>
              <h3 className='font-bold mr-2'>Personal Info</h3>
              {updatePersonalInfo}
            </div>
            <div className='text-gray-700'>
              <div>{ personal.first } {personal.last}</div>
              <div>{ personal.email }</div>
              <div>{ personal.calID }</div>
              <div>{ personal.status }</div>
            </div>
          </div>
          <div className='mt-4 border-b-2'>
            <div className='flex mb-1'>
              <h3 className='font-bold mr-2'>Delivery Details</h3>
              {updateDeliveryDetails}
            </div>
            <div className='mb-4 text-gray-700'>
              <div className='mb-2'>
                <div>{ delivery.streetAddress }{delivery.address2 && delivery.address2.length > 0 ? `, ${delivery.address2}` : ''}</div>
                <div>{ delivery.city }{ delivery.city && delivery.city.length > 0 ? ", CA" : "" } { delivery.zip}</div>
              </div>
              <div className='mb-2'>
                <div>{delivery.phone}</div>
              </div>
            </div>
          </div>
          <div className='mt-4'>
            <h3 className='font-bold mr-2 mb-1'>Notes</h3>
            <div>
              <span className='font-semibold tracking-wide text-gray-700'>Delivery Instructions: </span>
              {delivery.notes}
            </div>
            <div className='mt-1'>
              <span className='font-semibold tracking-wide text-gray-700'>Dietary Restrictions: </span>
              {personal.dietaryRestrictions}
            </div>
          </div>
        </div>
        <div className='mr-16 flex-grow'>
          <div className='flex'>
            <h3 className='font-bold mr-2'>Items</h3>
            {updateOrderDetails}
          </div>
          <table className="mb-12 w-full">
            <tbody>
            {
              Object.keys(cart).map((barcode) => {
                return (
                  <tr className="mb-2" key={barcode}>
                    <td 
                      className="text-left pr-4"
                    >
                      {cart[barcode].itemName}
                    </td>
                    <td 
                      className="text-right pl-4"
                    >
                      {cart[barcode].quantity}
                    </td>
                  </tr>
                )
              })
            }
            </tbody>
          </table>
        </div>
      </div>
      <button 
        className="btn btn-pantry-blue font-bold px-4 w-full mt-10"
        onClick={() => submitCart(cart, personal, delivery)}
        >
        Place Order
      </button>
    </>
  )
}
