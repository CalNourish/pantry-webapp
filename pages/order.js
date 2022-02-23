import useSWR from 'swr'
import { useContext } from 'react';
import Layout from '../components/Layout';
import { DispatchCartContext } from '../context/cartContext'

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Order() {
  
  const cartDispatch = useContext(DispatchCartContext)
  const { data, error } = useSWR('/api/inventory/GetAllItems', fetcher)
  
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  // Generate inputs
  const orderInputs = Object.keys(data).map((key, _value) => {
    return (
      <div key={key} className="mb-4">
        <label className="block text-gray-700 text-sm mb-2">
            {data[key].itemName}
        </label>
        <input 
          type="number" 
          autoComplete="off"
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onChange={(e) => {
            cartDispatch({ type: 'UPDATE_CART', payload: {item: data[key], quantity: e.target.value } });
            }
          }
          />
      </div>
    )
})
  return (
    <Layout>
      <h1 className="text-xl">Order</h1>
      <form className="bg-white rounded mb-4">
        {orderInputs}
      </form>
    </Layout>
  )
}