import { useContext } from 'react';
import { DispatchCartContext, StateCartContext } from '../../context/cartContext'

export default function PersonInfo() {
  const cartDispatch = useContext(DispatchCartContext)
  const { personal } = useContext(StateCartContext)

  return (
    <>
      <h2 className="text-lg mb-4 block tracking-wide text-gray-700 font-bold">Information</h2>
      <button onClick={() => console.log(personal)}> TODO: delete me </button>
      <div className="form-group flex mb-2">
        <div className="flex-grow mr-8">
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
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_PERSONAL', payload: {first: e.target.value} })
            }}
          />
        </div>
        <div className="flex-grow">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="last-name">
            Last Name
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="last-name" 
            type="text" 
            placeholder="The Bear"
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_PERSONAL', payload: {last: e.target.value} })
            }}
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
          type="text" 
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="12345678"
          id="cal-id"
          onChange={(e) => {
            cartDispatch({ type: 'UPDATE_PERSONAL', payload: {calID: e.target.value} })
          }}
          />
      </div>
      <div className="form-group mb-2">
        <label 
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="email"
        >
          Email
        </label>
        <input 
          type="email" 
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="oski@berkely.edu"
          id="email"
          onChange={(e) => {
            cartDispatch({ type: 'UPDATE_PERSONAL', payload: {email: e.target.value} })
          }}
          />
      </div>
      <div className="form-group mb-2">
        <label 
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="confirm-email"
        >
          Confirm Email
        </label>
        <input 
          type="email" 
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="oski@berkely.edu"
          id="confirm-email"
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
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_PERSONAL', payload: {status: e.target.value} })
            }}
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