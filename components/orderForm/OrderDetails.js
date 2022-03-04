
import useSWR from 'swr'
import { useContext } from 'react';
import { DispatchCartContext } from '../../context/cartContext'

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function OrderDetails() {
  const cartDispatch = useContext(DispatchCartContext)
  let { data: items, error: itemError } = useSWR('/api/inventory/GetAllItems', fetcher)
  let { data: categories, error: categoryError } = useSWR('/api/categories/ListCategories', fetcher)
  
  if (itemError || categoryError) return <div>failed to load</div>
  if (!items || !categories) return <div>loading...</div>

  // Reassign because destructuring wasn't working when fetching the data...
  categories = categories.categories

  let itemsByCategory = { }
  Object.keys(categories).forEach((key, _value) => itemsByCategory[categories[key].id] = [])
  console.log(itemsByCategory)
  // Generate order inputs
  Object.keys(items).forEach((key, _value) => {
      let itemInput = (
        <div id={items[key].barcode} key={key} className="mb-4">
          <label className="text-gray-700 text-xs font-bold mb-2" for={key}>
              {items[key].itemName}
          </label>
          <input 
            id={key}
            type="number" 
            autoComplete="off"
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            onChange={(e) => {
              cartDispatch({ type: 'UPDATE_CART', payload: {item: items[key], quantity: e.target.value } });
              }
            }
            />
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
                    <div id={categories[key].id} key={key} className="hover:text-gray-500 text-gray-700 text-sm cursor-pointer pb-2">{categories[key].displayName}</div>
                  )
                })
              }
            </div>
          </div>
        </div>
        <div className="relative form-group mr-8">
          {
            Object.keys(categories).map((key, _value) => {
              return (
                <div>
                  <h3 className="uppercase sticky py-2 bg-white top-0 font-bold tracking-wide text-gray-700 text-xs mb-4">{categories[key].displayName}</h3>
                  <div>
                    { 
                      itemsByCategory[categories[key].id].map(item => item)
                    }
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className="form-group pt-2">
          <h3 className="uppercase sticky top-0 pt-2 font-bold tracking-wide text-gray-700 text-xs mb-4">Order</h3>
        </div>
      </div>
    </>
  )
}