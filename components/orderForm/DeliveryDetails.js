import { useContext } from 'react';
import { DispatchCartContext, StateCartContext } from '../../context/cartContext'
import useSWR from 'swr'
import Select from 'react-select'

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function DeliveryDetails() {
  const cartDispatch = useContext(DispatchCartContext)
  const { delivery } = useContext(StateCartContext)

  let deliveryTimeOptions = []

  let { data: deliveryTimes } = useSWR('/api/orders/GetDeliveryTimes', fetcher)

  if (deliveryTimes) {
    deliveryTimeOptions = Object.keys(deliveryTimes).map((id) => { return {value: id, label: deliveryTimes[id]} })
  }
  
  return (
    <>
      <h2 className="text-lg mb-4 block tracking-wide text-gray-700 font-bold">Delivery Details</h2>
      <div className="form-group flex flex-col md:flex-row mb-2">
        <div className="mr-0 md:mr-8 flex-grow">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" 
            htmlFor="street-address"
          >
            Street Address
          </label>
          <input
            className="appearance-none block w-full mb-2 md:mb-0 bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="street-address" 
            type="text" 
            placeholder="123 Oski Blvd"
            value={delivery.streetAddress}
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_DELIVERY', payload: {streetAddress: e.target.value} })
            }}
          />
        </div>
        <div>
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="address-two">
            Apt, ste, etc.
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="address-two" 
            type="text" 
            placeholder="Apt. A"
            value={delivery.address2}
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_DELIVERY', payload: {address2: e.target.value} })
            }}
          />
        </div>
      </div>
      <div className="form-group flex flex-col md:flex-row mb-2">
        <div className="mr-0 md:mr-8 flex-grow">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" 
            htmlFor="city"
          >
            City
          </label>
          <input
            className="appearance-none block w-full mb-2 md:mb-0 bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="city" 
            type="text" 
            placeholder="Berkeley"
            value={delivery.city}
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_DELIVERY', payload: {city: e.target.value} })
            }}
          />
        </div>
        <div>
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="zip">
            Zip Code
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="zip" 
            type="text" 
            placeholder="94701"
            value={delivery.zip}
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_DELIVERY', payload: {zip: e.target.value} })
            }}
          />
        </div>
      </div>
      <div className="form-group mb-4">
        <label htmlFor="in-CA-confirmation" className="block tracking-wide text-gray-700 text-xs font-bold">
          <p className="text-gray-600 text-xs italic tracking-normal font-normal mb-2">
            In order to make a delivery, you must live within a 15 mile radius of our pantry (which is located on UC Berkeley's campus).
          </p>
          <input id="in-CA-confirmation" className="mr-2 leading-tight" type="checkbox" 
            checked={delivery.withinCA}
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_DELIVERY', payload: {withinCA: e.target.checked} })
            }}
          />
          <span className="tracking-wide text-gray-700 text-sm font-bold">
            I confirm that I am within the 15 mile radius
          </span>
        </label>
      </div>
      <div className="form-group mb-4">
        <div className="mb-2">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold" 
            htmlFor="phone"
          >
            Phone
          </label>
        <p className="text-gray-600 text-xs italic">Used to call/text to confirm delivery</p>
        </div>
        <input 
          type="tel" 
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="510-555-5555"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          id="phone"
          value={delivery.phone}
          onChange={(e) => {
            cartDispatch({ type: 'UPDATE_DELIVERY', payload: {phone: e.target.value} })
          }}
          />
      </div>

      <div className="form-group mb-4">
        <div className="mb-2">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold" 
            htmlFor="deliveryTimes"
          >
            What times will you be available to accept a delivery this week?
          </label>
        <p className="text-gray-600 text-xs italic">Please select all that work, we will send an email for a final confirmation.</p>
        </div>
        <Select options={deliveryTimeOptions} isMulti isClearable isSearchable value={delivery.deliveryTimes}
          onChange={(selections) => cartDispatch({ type: 'UPDATE_DELIVERY', payload: {deliveryTimes: selections} })}/>
      </div>
      
      <div className="form-group mb-4">
        <div className="mb-2">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold" 
            htmlFor="delivery-notes"
          >
            Delivery notes: any other information we might need to know to do a no-contact drop off?
          </label>
        <p className="text-gray-600 text-xs italic">For example, if you live in an apartment building with a locked gate or if there is a convenient spot to leave your bag of groceries.</p>
        </div>
        <textarea
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
          id="delivery-notes" 
          type="text" 
          placeholder="Leave at door"
          value={delivery.notes}
          onChange={(e) => cartDispatch({ type: 'UPDATE_DELIVERY', payload: {notes: e.target.value}})}
        />
      </div>
      <div className="form-group mb-4">
        <label htmlFor="doordash-confirmation" className="block tracking-wide text-gray-700 text-xs font-bold">
          <input id="doordash-confirmation" className="mr-2 leading-tight" type="checkbox"
            checked={delivery.doordashConf}
            onChange={(e) => cartDispatch({ type: 'UPDATE_DELIVERY', payload: {doordashConf: e.target.checked}})}
          />
          <span className="text-sm">
            Please confirm that we may share your information with DoorDash
          </span>
        </label>
        <p className="text-gray-600 text-xs italic">By clicking this, you are permitting us to share your information with DoorDash so that they can deliver to you. The information provided includes your name, address, phone number, and delivery notes.</p>
      </div>
    </>
  )
}