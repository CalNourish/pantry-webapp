export default function DeliveryDetails() {
  return (
    <>
      <h2 className="text-lg mb-4 block tracking-wide text-gray-700 font-bold">Delivery Details</h2>
      <div className="form-group flex mb-2">
        <div className="mr-8 w-2/3">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" 
            for="street-address"
          >
            Street Address
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="street-address" 
            type="text" 
            placeholder="123 Oski Blvd"
          />
        </div>
        <div>
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="address-two">
            Apartment, suite, etc.
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="address-two" 
            type="text" 
            placeholder="Apt. A"
          />
        </div>
      </div>
      <div className="form-group flex mb-2">
        <div className="mr-8 w-2/3">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" 
            for="city"
          >
            City
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="city" 
            type="text" 
            placeholder="Berkeley"
          />
        </div>
        <div>
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="zip">
            Zip Code
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="zip" 
            type="number" 
            placeholder="94701"
          />
        </div>
      </div>
      <div className="form-group mb-4">
        <label for="doordash-confirmation" className="block tracking-wide text-gray-700 text-xs font-bold">
          <input id="doordash-confirmation" className="mr-2 leading-tight" type="checkbox"/>
          <span class="text-sm">
            Deliver within CA
          </span>
        </label>
      </div>
      <div className="form-group mb-4">
        <div className="mb-2">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold" 
            for="phone"
          >
            Phone
          </label>
        <p class="text-gray-600 text-xs italic">Used to call/text to confirm delivery</p>
        </div>
        <input 
          type="tel" 
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="510-555-5555"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          id="phone"
          />
      </div>
      <div className="form-group mb-4">
        <div className="mb-2">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold" 
            for="deliver-notes"
          >
            Delivery notes: any other information we might need to know to do a no-contact drop off?
          </label>
        <p class="text-gray-600 text-xs italic">For example, if you live in an apartment building with a locked gate or if there is a convenient spot to leave your bag of groceries.</p>
        </div>
        <textarea
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
          id="delivery-notes" 
          type="text" 
          placeholder="Leave at door"
        />
      </div>
      <div className="form-group mb-4">
        <label for="doordash-confirmation" className="block tracking-wide text-gray-700 text-xs font-bold">
          <input id="doordash-confirmation" className="mr-2 leading-tight" type="checkbox"/>
          <span class="text-sm">
            Please confirm that we may share your information with DoorDash
          </span>
        </label>
        <p class="text-gray-600 text-xs italic">By clicking this, you are permitting us to share your information with DoorDash so that they can deliver to you. The information provided includes your name, address, phone number, and delivery notes.</p>
      </div>
    </>
  )
}