import { useContext } from 'react';
import { DispatchCartContext, StateCartContext } from '../../context/cartContext'

function isValidEmail(email) {
  return /^\w+([\.-]?\w+)*@berkeley.edu$/.test(email)
}

export default function PersonInfo() {
  const cartDispatch = useContext(DispatchCartContext)
  const { personal } = useContext(StateCartContext)

  return (
    <>
      <h2 className="text-lg mb-4 block tracking-wide text-gray-700 font-bold">Information</h2>
      <div className="form-group flex mb-2">
        <div className="flex-grow mr-8">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" 
            htmlFor="first-name"
          >
            First Name
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="first-name" 
            type="text" 
            placeholder="Oski"
            value={personal.first}
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_PERSONAL', payload: {first: e.target.value} })
            }}
          />
        </div>
        <div className="flex-grow">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="last-name">
            Last Name
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="last-name" 
            type="text" 
            placeholder="The Bear"
            value={personal.last}
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_PERSONAL', payload: {last: e.target.value} })
            }}
          />
        </div>
      </div>
      <div className="form-group mb-2">
        <label 
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" 
          htmlFor="cal-id"
        >
          Cal ID
        </label>
        <input 
          type="text" 
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="12345678"
          id="cal-id"
          value={personal.calID}
          onChange={(e) => {
            cartDispatch({ type: 'UPDATE_PERSONAL', payload: {calID: e.target.value} })
          }}
          />
      </div>
      <div className="form-group mb-2">
        <label 
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          htmlFor="email"
        >
          Email
        </label>
        <input 
          type="email" 
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="oski@berkely.edu"
          id="email"
          value={personal.email}
          onChange={(e) => {
            cartDispatch({ type: 'UPDATE_PERSONAL', payload: {email: e.target.value} })
          }}
          />
          {personal.email && !isValidEmail(personal.email) ? <div className='text-red-600'>Must be a valid @berkeley.edu email address</div> : ""}
      </div>
      <div className="form-group mb-2">
        <label 
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          htmlFor="confirm-email"
        >
          Confirm Email
        </label>
        <input 
          type="email" 
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="oski@berkely.edu"
          id="confirm-email"
          value={personal.emailConf}
          onChange={(e) => {
            cartDispatch({ type: 'UPDATE_PERSONAL', payload: {emailConf: e.target.value} })
          }}
          />
          {isValidEmail(personal.email) && personal.emailConf && personal.emailConf !== personal.email ? <div className='text-red-600'>Emails must match</div> : ""}
      </div>
      <div className="form-group mb-2">
        <label 
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          htmlFor="status"
        >
          Status
        </label>
        <div className="relative">
          <select
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="status"
            value={personal.status || ""}
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_PERSONAL', payload: {status: e.target.value} })
            }}
          >
            <option value="" disabled>Select status</option>
            <option>Undergraduate Student</option>
            <option>Graduate Student</option>
            <option>Staff</option>
            <option>Visiting Scholar</option>
            <option>Postdoc</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
      <div className="form-group mb-2">
        <div className="mb-2">
          <label 
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold"
            htmlFor="confirm-email"
          >
            Number of Dependents
          </label>
          <p class="text-gray-600 text-xs italic">
            Include anyone in your household who depends on you for at least half of their meals
          </p>
        </div>
        <input 
          type="number" 
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="0"
          id="dependents"
          value={personal.dependents}
          onChange={(e) => {
            cartDispatch({ type: 'UPDATE_PERSONAL', payload: {dependents: e.target.value} })
          }}
          />
      </div>
    </>
  )
}