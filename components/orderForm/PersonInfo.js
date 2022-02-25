export default function PersonInfo() {
  return (
    <>
      <h2 className="text-lg mb-4">Information</h2>
      <div className="form-group flex mb-2">
        <div className="mr-8">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" 
            for="first-name"
          >
            First Name
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="first-name" 
            type="text" 
            placeholder="Oski"
          />
        </div>
        <div>
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="last-name">
            Last Name
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="last-name" 
            type="text" 
            placeholder="The Bear"
          />
        </div>
      </div>
      <div className="form-group mb-2">
        <label 
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" 
          for="cal-id"
        >
          Cal ID
        </label>
        <input 
          type="number" 
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="12345678"
          id="cal-id"
          />
      </div>
      <div className="form-group mb-2">
        <label 
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="status"
        >
          Status
        </label>
        <div className="relative">
          <select
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="status"
          >
            <option value="" disabled selected>Select status</option>
            <option>Undergraduate Student</option>
            <option>Graduate Student</option>
            <option>Staff</option>
            <option>Visiting Scholar</option>
            <option>Postdoc</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
    </>
  )
}