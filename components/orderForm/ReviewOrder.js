import { useContext } from 'react';
import { StateCartContext } from '../../context/cartContext'

export default function ReviewOrder({updatePersonalInfo, updateDeliveryDetails, updateOrderDetails}) {
  const { cart, personal, delivery } = useContext(StateCartContext)
  return (
    <>
      <h2 className="h-10 text-lg mb-2 block tracking-wide text-gray-700 font-bold">Review Order</h2>
      <div className="flex">
        <div className="flex-grow mr-16">
          <div className='border-b-2 pb-4'>
            <div className='flex'>
              <h3 className='font-bold mr-2'>Personal Info</h3>
              {updatePersonalInfo}
            </div>
            <div className='mb-4 text-gray-700'>
              <div>{ personal.first } {personal.last}</div>
              <div>{ personal.email }</div>
              <div>{ personal.calID }</div>
              <div>{ personal.status }</div>
            </div>
          </div>
          <div className='mt-8'>
            <div className='flex'>
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
              <div className='mb-2'>
                <div>{delivery.notes}</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className='flex'>
            <h3 className='font-bold mr-2'>Items</h3>
            {updateOrderDetails}
          </div>
          <table className="mb-12">
            <tbody>
            {
              Object.keys(cart).map((barcode) => {
                return (
                  <tr className="mb-2">
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
          <button 
            className="w-full text-white font-bold py-2 px-4 rounded border border-transparent bg-blue-500 hover:bg-blue-700"
            >
            Place Order
            </button>
        </div>
      </div>
    </>
  )
}

