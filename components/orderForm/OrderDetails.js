
import useSWR from 'swr'
import { useContext } from 'react';
import Layout from '../Layout';
import Sidebar from '../Sidebar';
import { DispatchCartContext, StateCartContext } from '../../context/cartContext'

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function OrderDetails() {
  const cartDispatch = useContext(DispatchCartContext)
  let { cart } = useContext(StateCartContext)
  let { data: items, error: itemError } = useSWR('/api/inventory/GetAllItems', fetcher)
  let { data: categories, error: categoryError } = useSWR('/api/categories/ListCategories', fetcher)
  
  if (itemError || categoryError) return <div>failed to load</div>
  if (!items || !categories) return <div>loading...</div>

  // Reassign because destructuring wasn't working when fetching the data...
  categories = categories.categories

  let itemsByCategory = { }
  Object.keys(categories).forEach((key, _value) => itemsByCategory[categories[key].id] = [])

  console.log("cart:", cart);

  // Generate order inputs
  Object.keys(items).forEach((key, _value) => {
    // if not max order size, set to infinity
    const maxQuantity = parseInt(items[key].maxOrderSize) || Number.POSITIVE_INFINITY
    let invalid_quantity = cart[key] && cart[key].quantity > maxQuantity
    let inputId = `item-${items[key].barcode}`
    let itemInput = (
      <div className={`itemrow-${items[key].barcode} py-4 flex items-center justify-between`} key={items[key].barcode}>
        <div className="text-left">{items[key].itemName}</div>
        <div>
          {/* number spinner [-| 1 |+] */}
          <div className="border border-solid border-gray-300 p-px w-32 h-8 flex flex-row float-left">
            {/* minus */}
            <button 
              className="font-light p-1 bg-gray-300 w-8 h-full text-xl leading-3 focus:outline-none" 
              onClick={() => {
                let newAmt = cart[key] && cart[key].quantity > 0 ? cart[key].quantity - 1 : 0;
                cartDispatch({ type: 'UPDATE_CART', payload: {item: items[key], quantity:newAmt}})
                }
              }
              tabIndex='-1'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            {/* quantity input */}
            <input 
              id={inputId}
              className="no-arrows-input appearance-none quantity-input w-6 flex-grow mx-1 text-center focus:outline-none" 
              autoComplete="off"
              type="number"
              min="0"
              step="1"
              value={cart[key] ? cart[key].quantity : ""}
              onChange={(e) => {
                cartDispatch({ type: 'UPDATE_CART', payload: {item: items[key], quantity: e.target.value } });
              }}
            />
            {/* plus */}
            <button 
              className="font-light p-1 bg-gray-300 w-8 h-full text-xl leading-3 focus:outline-none" 
              onClick={() => {
                let newAmt = cart[key] ? cart[key].quantity + 1 : 1;
                cartDispatch({ type: 'UPDATE_CART', payload: {item: items[key], quantity:newAmt}})
              }}
              tabIndex="-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {invalid_quantity ? <div className='text-red-600'>Quantity must be less than {maxQuantity}</div> : ""}
        </div>
      </div>
    )
    
    // Add item to category
    items[key].categoryName.forEach(name => itemsByCategory[name].push(itemInput))
  })

  return (
    <>
      <h2 className="text-lg mb-2 block tracking-wide text-gray-700 font-bold">Order Details</h2>
      <div className='flex'>
        <div className="relative mr-8 w-1/5">
          <div className="sticky top-0">
            <div className="pt-2">
              <h3 className="uppercase block font-bold tracking-wide text-gray-700 text-xs mb-4">Categories</h3>
              {
                Object.keys(categories).map((key, _value) => {
                  return (
                    <div id={categories[key].id} key={key} className="hover:text-gray-500 text-gray-700 text-sm cursor-pointer pb-2"
                      onClick={() => document.getElementById("anchor-"+key).scrollIntoView()}>
                      {categories[key].displayName}
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>

        {/* Names and links to categories */}
        <div className="relative form-group mr-8">
          {
            Object.keys(categories).map((key, _value) => {
              return (
                <div key={categories[key].displayName}>
                  {/* Anchor for scrolling to specific category. Can't scroll to h3 element because it's sticky, so not always located at top of section. */}
                  <a id={"anchor-"+key}></a>
                  <h3 className="uppercase sticky py-2 bg-white top-0 font-bold tracking-wide text-gray-700 text-xs mt-4" id={"category-"+key} key={key}>
                    {categories[key].displayName}
                  </h3>
                  <div className='divide-y'>
                    { 
                      itemsByCategory[categories[key].id].map(item => item)
                    }
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className="form-group flex-grow">
          <div className="sticky top-0"> {/* <- this is here to make the whole summary sticky */}
            <h3 className="uppercase pt-2 font-bold tracking-wide text-gray-700 text-xs mb-4">Order Summary</h3>
            {/* TODO: current ordering is by barcode, would it be easier for user if it was in order of addition? might need restructuring cart a bit... not worth? */}
            <table className="w-full">
              <thead className="border-b-2">
                <tr>
                  <th className="font-semibold text-left">Item Name</th>
                  <th className="font-semibold text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="">
              {
                Object.keys(cart).map((barcode) => {
                  return (
                    <tr className="mb-2 cursor-pointer"  key={barcode}
                      onClick={() => {
                        document.getElementsByClassName(`itemrow-${barcode}`)[0].scrollIntoView();
                        window.scrollBy(0, -35); // compensating for the sticky title covering the top of the page
                      }}
                    >
                      <td className="text-left">{cart[barcode].itemName}</td>
                      <td className="text-right">{cart[barcode].quantity}</td>
                    </tr>
                  )
                })
              }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}