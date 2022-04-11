import { useContext } from 'react';
import { StateCartContext } from '../../context/cartContext'

export default function ReviewOrder({updatePersonalInfo, updateDeliveryDetails, updateOrderDetails}) {
  const { cart, personal, delivery } = useContext(StateCartContext)

  const submitCart = (cart, personal, delivery) => {
    const fullAddress = `${delivery.streetAddress}${delivery.address2 ? `, ${delivery.address2}` : ""}, ${delivery.city}, CA ${delivery.zip}`
    const items = {}
    for (const barcode in cart) {
      items[barcode] = cart[barcode].quantity
    }

    const deliveryOptions = delivery.deliveryTimes?.map((element) => element.label).join(", ")

    const orderBody = {
      firstName: personal.first,
      lastName: personal.last,
      address: fullAddress,
      frequency: "one-time", // todo: add selection?
      dependents: personal.dependents,
      dietaryRestrictions: "", // todo: not in form ATM
      additionalRequests: personal.requests,
      calID: personal.calID,
      items: items,
      deliveryDate: "",
      deliveryWindow: deliveryOptions, // todo: multiple options?

      // BELOW: not included in API rn?
      email: personal.email,
      phone: personal.phone
      // todo: missing deliveryNotes?
    }

    console.log("order body:", orderBody)
    // fetch('/api/orders/AddOrder',
    //         { method: 'POST',
    //           body: JSON.stringify(orderBody),
    //           headers: {'Content-Type': "application/json", 'Authorization': token}
    //         }
    //       )
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
              <span className='font-semibold tracking-wide text-gray-700'>Special Requests: </span>
              {personal.requests}
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

