export default function DeliveryDetails() {
  return (
    <>
      <h2 className="text-lg mb-4">Delivery Details</h2>
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
    </>
  )
}