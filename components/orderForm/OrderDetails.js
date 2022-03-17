
import useSWR from 'swr'
import { useContext } from 'react';
import { DispatchCartContext, StateCartContext } from '../../context/cartContext'

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function OrderDetails() {
  const cartDispatch = useContext(DispatchCartContext)
  const { cart } = useContext(StateCartContext)
  const { data, error } = useSWR('/api/inventory/GetAllItems', fetcher)
  
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>

  // Generate inputs
  const orderInputs = Object.keys(data).map((key, _value) => {
    const maxQuantity = data[key].maxOrderSize ? data[key].maxOrderSize : 100;
    var invalid_quantity = cart[key] && cart[key].quantity > maxQuantity;

    return (
      <div key={key} className="mb-4">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for={key}>
            {data[key].itemName}
        </label>
        <input 
          id={key}
          type="number" 
          autoComplete="off"
          className={"appearance-none block w-full bg-gray-200 text-gray-700 border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        + (invalid_quantity ? " border-red-600 focus:border-red-600 border-2" : " border")}
          value={cart[key] ? cart[key].quantity : ""}
          onChange={(e) => {
            cartDispatch({ type: 'UPDATE_CART', payload: {item: data[key], quantity: e.target.value } });
            }
          }
          />
          {invalid_quantity ? <div className='text-red-600'>Quantity must be less than {maxQuantity}</div> : ""}
      </div>
    )
  })

  return (
    <>
      <h2 className="text-lg mb-4 block tracking-wide text-gray-700 font-bold">Order Details</h2>
      <div className="form-group mb-2">
        {orderInputs}
      </div>
    </>
  )
}