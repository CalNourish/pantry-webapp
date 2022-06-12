import { useContext } from 'react';
import { DispatchCartContext, StateCartContext } from '../../context/cartContext'
import useSWR from 'swr'
import Select from 'react-select'

const fetcher = (url) => fetch(url).then((res) => res.json());

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

  let inputAppearance = "appearance-none block w-full bg-gray-100 text-gray-600 border border-gray-100 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-400"
  let errorAppearance = " border-red-600 border-2 focus:border-red-500"
  
  return (
    <>
      <h2 className="text-lg mb-4 block tracking-wide text-gray-600 font-bold">Delivery Details</h2>
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
          />
        </div>
      </div>
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
          />
        </div>
      </div>
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
          />
      </div>

      <div className="form-group mb-4">
        <div className="mb-2">
          <label 
            className="block uppercase tracking-wide text-gray-600 text-xs font-bold" 
            htmlFor="deliveryTimes" data-required="T"
          >
            What times will you be available to accept a delivery this week?
          </label>
        <p className="text-gray-500 text-xs italic">Please select all that work, we will send an email for a final confirmation.</p>
        </div>
        <Select options={deliveryTimeOptions} isMulti isClearable isSearchable value={delivery.deliveryTimes}
          onChange={(selections) => cartDispatch({ type: 'UPDATE_DELIVERY', payload: {deliveryTimes: selections} })}
          className={(props.showMissing && (delivery.deliveryTimes.length == 0)) ? "border rounded" + errorAppearance : "border border-transparent" }/>
      </div>
      
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
        />
      </div>
    </>
  )
}