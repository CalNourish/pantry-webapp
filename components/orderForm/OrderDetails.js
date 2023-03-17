import useSWR from 'swr'
import { useContext, useState } from 'react';
import { DispatchCartContext, StateCartContext } from '../../context/cartContext'
import ReactMarkdown from 'react-markdown';
import { smallMarkdownStyle } from '../../utils/markdownStyle'

// Form stage #3

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function OrderDetails({children}) {
  const cartDispatch = useContext(DispatchCartContext)
  let { cart, personal } = useContext(StateCartContext)
  const [searchFilter, setSearchFilter] = useState("");
  const [hideOOS, setHideOOS] = useState(true); // whether to hide out-of-stock items
  let { data: items, error: itemError } = useSWR('/api/inventory/GetAllItems', fetcher)
  let { data: categories, error: categoryError } = useSWR('/api/categories/ListCategories', fetcher)
  let { data: inventoryInfo, error: infoError } = useSWR('/api/admin/GetCheckoutInfo', fetcher)
  
  if (itemError || categoryError) return <div>failed to load</div>
  if (!items || !categories) return <div>loading...</div>

  if (inventoryInfo && inventoryInfo.markdown) {
    inventoryInfo = inventoryInfo.markdown.split(/(?=####)/g)

    inventoryInfo = inventoryInfo.filter(x => x !== "")
  }
  
  // Reassign because destructuring wasn't working when fetching the data...
  categories = categories.categories

  let itemsByCategory = { }
  Object.keys(categories).forEach((key, _value) => itemsByCategory[categories[key].id] = [])

  // Generate order inputs
  let itemFilter = !!searchFilter ? searchFilter.toLowerCase() : null
  Object.keys(items).forEach((key, _value) => {
    let name = !!items[key].itemName ? items[key].itemName.toLowerCase() : null
    if (!!itemFilter && !!name && !name.includes(itemFilter)) {
      // Skip to next item if not part of filter
      return
    }

    if (!items[key].displayPublic) {
      // Skip item if not displayPublic
      return
    }

    // if not max order size, set to infinity
    let maxQuantity = parseInt(items[key].maxOrderSize) || parseInt(items[key].count)
    maxQuantity = Math.max(maxQuantity, 0)
    let inputId = `item-${items[key].barcode}`
    let itemInput = (
      <div className={`itemrow-${items[key].barcode} py-4 ${maxQuantity <= 0 && hideOOS ? 'hidden' : ''}`} key={items[key].barcode}>
        <div className='flex items-center justify-between'>
          <div className="text-left mr-4">{items[key].itemName}</div>
          <div>
            {/* number spinner [-| 1 |+] */}
            <div className="border border-solid border-gray-200 p-px w-32 h-8 flex flex-row float-left">
              {/* minus */}
              <button 
                className="font-light p-1 bg-gray-200 w-8 h-full text-xl leading-3 focus:outline-none" 
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
                  let newQuantity = e.target.value;
                  if (newQuantity > maxQuantity) {
                    newQuantity = maxQuantity
                  }
                  cartDispatch({ type: 'UPDATE_CART', payload: {item: items[key], quantity: newQuantity } });
                }}
              />
              {/* plus */}
              <button 
                className="font-light p-1 bg-gray-200 w-8 h-full text-xl leading-3 focus:outline-none" 
                onClick={() => {
                  let newQuantity = cart[key] ? cart[key].quantity + 1 : 1;
                  if (newQuantity > maxQuantity) {
                    newQuantity = maxQuantity
                  }
                  cartDispatch({ type: 'UPDATE_CART', payload: {item: items[key], quantity: newQuantity}})
                }}
                tabIndex="-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {maxQuantity <= 0 && <div className='text-red-600 w-full text-right'>Out of stock</div>}
      </div>
    )
    
    // Add item to category
    items[key].categoryName.forEach(name => itemsByCategory[name].push(itemInput))
  })

  return (
    <>
      <h2 className="h-10 text-lg mb-2 block tracking-wide text-gray-600 font-bold">Order Details</h2>
      <div className="flex flex-row mb-3 space-x-5"> 
        {inventoryInfo?.map(infoStr => <ReactMarkdown className="mb-4 text-zinc-900 flex-grow border p-2 border-black rounded" components={smallMarkdownStyle} children={infoStr}></ReactMarkdown>)}
      </div>
      {/* Notes */}
      <div className='flex flex-row mb-3'>
        {/* Dietary Restrictions */}
        <div className='flex-grow mr-5'>
          <label className="block uppercase tracking-wide text-gray-600 text-xs font-bold mb-1" htmlFor="dietary-restrictions">Dietary Restrictions</label>
          <textarea
            className="appearance-none block w-full bg-gray-50 text-gray-600 border border-gray-50 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-400" 
            id="dietary-restrictions" 
            type="text" 
            placeholder="e.g. allergies, vegetarian, gluten-free, other..."
            value={personal.dietaryRestrictions}
            onChange={(e) => cartDispatch({ type: 'UPDATE_PERSONAL', payload: {dietaryRestrictions: e.target.value}})}
          />
        </div>

        {/* Other Requests */}
        <div className='flex-grow ml-5'>
          <label className="block uppercase tracking-wide text-gray-600 text-xs font-bold mb-1" htmlFor="additional-requests">Other Requests</label>
          <textarea
            className="appearance-none block w-full bg-gray-50 text-gray-600 border border-gray-50 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-400" 
            id="additional-requests" 
            type="text" 
            placeholder="Request other items not listed below (e.g. masks, hygiene products).
Or leave other notes for pantry staff."
            value={personal.additionalRequests}
            onChange={(e) => cartDispatch({ type: 'UPDATE_PERSONAL', payload: {additionalRequests: e.target.value}})}
          />
        </div>
      </div>

      <div className='flex'>
        {/* Category navigation */}
        <div className="relative mr-8 w-1/5">
        <label htmlFor="toggle-oos" className='text-sm text-gray-600'>
          <input id="toggle-oos" type="checkbox" value={hideOOS} onChange={() => setHideOOS(!hideOOS)}
            className="mr-2"/>
          <span>show out of stock</span>
        </label>
          <div className="sticky top-0">
            <div className="pt-2">
              <h3 className="uppercase block font-bold tracking-wide text-gray-600 text-xs mb-4">Categories</h3>
              {
                Object.keys(categories).map((key, _value) => {
                  return (
                    <div id={categories[key].id} key={key} className="hover:text-gray-400 text-gray-600 text-sm cursor-pointer pb-2"
                      onClick={() => {
                        document.getElementById("anchor-"+key).scrollIntoView();
                        window.scrollBy(0, -60);
                      }}>
                      {categories[key].displayName}
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>

        <div className='mr-8 flex-grow'>
          {/* Items search bar */}
          <div className='sticky py-4 z-10 bg-white top-0 flex'>
            <div className="block w-full">
                <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-gray-400">
                        <path
                            d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z">
                        </path>
                    </svg>
                </span>
                <input 
                  placeholder="Search for item" 
                  className={"appearance-none rounded border border-gray-300 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-300 text-gray-600 focus:bg-white focus:placeholder-gray-500 focus:text-gray-600 focus:outline-none " + (searchFilter ? "pr-8" : "")}
                  onChange={(e) => {setSearchFilter(e.target.value)}} 
                  value={searchFilter}
                />
                <div 
                  className={searchFilter ?  "absolute flex items-center inset-y-0 right-0 h-full cursor-pointer text-gray-500 hover:text-gray-400" : "hidden" }
                  onClick={() => {setSearchFilter("");}}
                >
                    <div className='px-4'>{ searchFilter ? "clear" : ""}</div>
                </div>
            </div>
          </div>

          {/* Item Selection */}
          <div className="relative flex-grow form-group">
            {
              Object.keys(categories).map((key, _value) => {
                return (
                  <div key={categories[key].displayName}>
                    {/* Anchor for scrolling to specific category. Can't scroll to h3 element because it's sticky, so not always located at top of section. */}
                    <a id={"anchor-"+key}></a>
                    <h3  style={{top: '70px'}} className="uppercase sticky py-2 bg-white top-0 m-{110px} font-bold tracking-wide text-gray-600 text-xs mt-4" id={"category-"+key}>
                      {categories[key].displayName}
                    </h3>
                    <div className='divide-y'>
                      { 
                      itemsByCategory[categories[key].id].length > 0 ? itemsByCategory[categories[key].id].map(item => item) : <div className='text-gray-400'>No items</div>
                      }
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>

        {/* Cart: items ordered */}
        <div className="form-group w-2/3 sm:w-1/3">
          <div className="sticky top-0"> {/* <- this is here to make the whole summary sticky */}
            <h3 className="h-10 uppercase pt-2 font-bold tracking-wide text-gray-600 text-xs mb-4">Cart</h3>
            {/* TODO: current ordering is by barcode, would it be easier for user if it was in order of addition? might need restructuring cart a bit... not worth? */}
            <table className="w-full mb-12">
              <thead className="border-b-2">
                <tr>
                  <th className="font-semibold text-left px-4">Item</th>
                  <th className="font-semibold text-right px-4">Quantity</th>
                  <th className="font-semibold text-right">
                    <div className='invisible px-4'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
              {
                Object.keys(cart).map((barcode) => {
                  return (
                    <tr className="mb-2 cursor-pointer" key={barcode}>
                      <td 
                        onClick={() => {
                          document.getElementsByClassName(`itemrow-${barcode}`)[0].scrollIntoView();
                          window.scrollBy(0, -60); // compensating for sticky title and search bar covering the top of the page
                        }}
                        className="text-left px-4"
                      >
                        {cart[barcode].itemName}
                      </td>
                      <td 
                        onClick={() => {
                          document.getElementsByClassName(`itemrow-${barcode}`)[0].scrollIntoView();
                          window.scrollBy(0, -60); // compensating for sticky title and search bar covering the top of the page
                        }}
                        className="text-right px-4"
                      >
                        {cart[barcode].quantity}
                      </td>
                      <td 
                        onClick={() => {
                          cartDispatch({ type: 'REMOVE_ITEM', payload: {item: items[barcode]}})
                        }}
                        className="text-center px-4 py-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                      </td>
                    </tr>
                  )
                })
              }
              </tbody>
            </table>
            <div>
              { children }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}