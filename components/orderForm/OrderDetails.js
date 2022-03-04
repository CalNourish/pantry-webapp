
import useSWR from 'swr'
import { useContext } from 'react';
import { DispatchCartContext, StateCartContext } from '../../context/cartContext'

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function OrderDetails() {
  const cartDispatch = useContext(DispatchCartContext)
  const cartState = useContext(StateCartContext)
  const { data, error } = useSWR('/api/inventory/GetAllItems', fetcher)
  
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>

  // Generate inputs
  const orderInputs = Object.keys(data).map((key, _value) => {
    return (
      <div key={key} className="mb-4">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for={key}>
            {data[key].itemName}
        </label>
        <input 
          id={key}
          type="number" 
          autoComplete="off"
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          onChange={(e) => {
            cartDispatch({ type: 'UPDATE_CART', payload: {item: data[key], quantity: e.target.value } });
            }
          }
          />
      </div>
    )
  })

  return (
    <>
      <h2 className="text-lg mb-4 block tracking-wide text-gray-700 font-bold">Order Details</h2>
      <button onClick={() => console.log(cartState)}> print context button </button>
      <div className="form-group mb-2">
        {orderInputs}
      </div>
    </>
  )
}