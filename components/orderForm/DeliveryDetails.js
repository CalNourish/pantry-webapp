import { useContext } from 'react';
import { DispatchCartContext, StateCartContext } from '../../context/cartContext'
import useSWR from 'swr'
import Select from 'react-select'

// Form stage #2

const fetcher = (url) => fetch(url).then((res) => res.json());

const inputAppearance = "appearance-none block w-full bg-gray-100 text-gray-600 border border-gray-100 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-400"
const errorAppearance = " border-red-600 border-1 focus:border-red-500"

export default function DeliveryDetails(props) {
  const cartDispatch = useContext(DispatchCartContext)
  const { delivery } = useContext(StateCartContext)

  let deliveryTimeOptions = []

  let { data: deliveryTimes } = useSWR('/api/orders/GetDeliveryTimes', fetcher)

  if (deliveryTimes) {
    deliveryTimeOptions = Object.keys(deliveryTimes).map(
      (id) => { return { value: id, label: deliveryTimes[id].display, info: deliveryTimes[id]} }
    )
  }
  
  return (
    <>
      <h2 className="text-lg mb-4 block tracking-wide text-gray-600 font-bold">Delivery Details</h2>
      {/* Pickup Option */}
      <div className='mb-4'>
        <label htmlFor="pickup-option"
          className="block tracking-wide font-bold mb-2"
        >
          <input id="pickup-option" className="mr-2 leading-tight" type="checkbox"
            checked={delivery.pickup}
            onChange={(e) => cartDispatch({ type: 'UPDATE_DELIVERY', payload: {pickup: e.target.checked}})}
          />
          <span>I will be picking up in person at the Food Pantry.</span>
        </label>

        {delivery.pickup &&
          <>
            <div className='mb-2'>
              <label 
                className="block uppercase tracking-wide text-gray-600 text-xs font-bold mb-1" 
                htmlFor="pickup-times" data-required="F"
              >
                Pickup notes: time preference, or any other details
              </label>
              <p className="text-gray-500 text-xs italic">Pantry staff may contact you to confirm pickup time. Pickup is offered during pantry open hours.</p>
            </div>
            <textarea
              className="appearance-none block w-full bg-gray-100 text-gray-600 border border-gray-100 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-400" 
              id="pickup-times" 
              type="text" 
              placeholder="preferred pickup times, name of person picking up, etc."
              value={delivery.pickupNotes}
              onChange={(e) => cartDispatch({ type: 'UPDATE_DELIVERY', payload: {pickupNotes: e.target.value}})}
            />
          </>
        }
        </div>

      <div className={delivery.pickup && "hidden"}>
        {/* Street Address and Apartment Number */}
        <div className="form-group flex flex-col md:flex-row mb-2">
          <div className="mr-0 md:mr-8 flex-grow">
            <label 
              className="block uppercase tracking-wide text-gray-600 text-xs font-bold mb-2" 
              htmlFor="street-address" data-required="T"
            >
              Street Address
            </label>
            <input
              className={inputAppearance + ((props.showMissing && !delivery.streetAddress) ? errorAppearance : "")}
              id="street-address" 
              type="text" 
              placeholder="123 Oski Blvd"
              value={delivery.streetAddress}
              onChange={(e) => {
                cartDispatch({ type: 'UPDATE_DELIVERY', payload: {streetAddress: e.target.value} })
              }}
              disabled={delivery.pickup}
            />
          </div>
          <div>
            <label 
              className="block uppercase tracking-wide text-gray-600 text-xs font-bold mb-2"
              htmlFor="address-two" data-required="F"
            >
              Apt, ste, etc.
            </label>
            <input
              className={inputAppearance}
              id="address-two" 
              type="text" 
              placeholder="Apt. A"
              value={delivery.address2}
              onChange={(e) => {
                cartDispatch({ type: 'UPDATE_DELIVERY', payload: {address2: e.target.value} })
              }}
              disabled={delivery.pickup}
            />
          </div>
        </div>

        {/* City & Zip */}
        <div className="form-group flex flex-col md:flex-row mb-2">
          <div className="mr-0 md:mr-8 flex-grow">
            <label 
              className="block uppercase tracking-wide text-gray-600 text-xs font-bold mb-2" 
              htmlFor="city" data-required="T"
            >
              City
            </label>
            <input
              className={inputAppearance + ((props.showMissing && !delivery.city) ? errorAppearance : "")}
              id="city" 
              type="text" 
              placeholder="Berkeley"
              value={delivery.city}
              onChange={(e) => {
                cartDispatch({ type: 'UPDATE_DELIVERY', payload: {city: e.target.value} })
              }}
              disabled={delivery.pickup}
            />
          </div>
          <div>
            <label 
              className="block uppercase tracking-wide text-gray-600 text-xs font-bold mb-2"
              htmlFor="zip" data-required="T"
            >
              Zip Code
            </label>
            <input
              className={inputAppearance + ((props.showMissing && !delivery.zip) ? errorAppearance : "")}
              id="zip" 
              type="text" 
              placeholder="94701"
              value={delivery.zip}
              onChange={(e) => {
                cartDispatch({ type: 'UPDATE_DELIVERY', payload: {zip: e.target.value} })
              }}
              disabled={delivery.pickup}
            />
          </div>
        </div>

        {/* Phone # */}
        <div className="form-group mb-4">
          <div className="mb-2">
            <label 
              className="block uppercase tracking-wide text-gray-600 text-xs font-bold" 
              htmlFor="phone" data-required="T"
            >
              Phone
            </label>
          <p className="text-gray-500 text-xs italic">Used to call/text to confirm delivery</p>
          </div>
          <input 
            type="tel" 
            className={inputAppearance + ((props.showMissing && !delivery.phone) ? errorAppearance : "")}
            placeholder="510-555-5555"
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            id="phone"
            value={delivery.phone}
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_DELIVERY', payload: {phone: e.target.value} })
            }}
            disabled={delivery.pickup}
            />
        </div>

        {/* Delivery Time */}
        <div className="form-group mb-4">
          <div className="mb-2">
            <label 
              className="block uppercase tracking-wide text-gray-600 text-xs font-bold" 
              htmlFor="deliveryTimes" data-required="T"
            >
              What times will you be available to accept a delivery next week?
            </label>
          <p className="text-gray-500 text-xs italic">Please select all that work, we will send an email for a final confirmation.</p>
          </div>
          <Select options={deliveryTimeOptions} isMulti isClearable isSearchable value={delivery.deliveryTimes}
            onChange={(selections) => cartDispatch({ type: 'UPDATE_DELIVERY', payload: {deliveryTimes: selections} })}
            className={(props.showMissing && (delivery.deliveryTimes.length == 0)) ? "border rounded" + errorAppearance : "border border-transparent"}
            isDisabled={delivery.pickup}/>
        </div>
        
        {/* Delivery Notes */}
        <div className="form-group mb-4">
          <div className="mb-2">
            <label 
              className="block uppercase tracking-wide text-gray-600 text-xs font-bold" 
              htmlFor="delivery-notes" data-required="F"
            >
              Delivery notes: any other information we might need to know to do a no-contact drop off?
            </label>
            <p className="text-gray-500 text-xs italic">For example, if you live in an apartment building with a locked gate or if there is a convenient spot to leave your bag of groceries.</p>
          </div>
          <textarea
            className="appearance-none block w-full bg-gray-100 text-gray-600 border border-gray-100 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-400" 
            id="delivery-notes" 
            type="text" 
            placeholder="Leave at door"
            value={delivery.notes}
            onChange={(e) => cartDispatch({ type: 'UPDATE_DELIVERY', payload: {notes: e.target.value}})}
            disabled={delivery.pickup}
          />
        </div>
      </div>
    </>
  )
}