import { useState } from 'react';
import { server } from "../pages/_app.js"

export default function TableRow({barcode, itemName, itemCount, itemCategories, itemLowStock, showBarcodes, categoryData, authToken}) {
    const categoryReducer = (acc, obj) => {
        acc[obj.id] = obj.displayName
        return acc
    }
    let categoryLookup = []
    if (categoryData) {
        categoryLookup = categoryData.categories.reduce(categoryReducer, [])
    }

    function categoryDisplay(itemCategories) {
        const toDisplay = []
        for (const key in itemCategories) {
            toDisplay.push(
                <span className="relative inline-block p-1 px-3 py-1 font-semibold text-gray-900 leading-tight">
                    <span aria-hidden
                        className="absolute inset-0 bg-gray-400 opacity-50 rounded-full mx-1"></span>
                    <span className="relative">{categoryLookup[itemCategories[key]]}</span>
                </span>
            )
          }
        return toDisplay
    }

    const [editing, setEditing] = useState(null);
    const [count, setCount] = useState(itemCount);
    const [name, setName] = useState(itemName);

    /* state is only set when initialized - need to update when we reorder/filter rows */
    if (itemCount != count) setCount(itemCount);
    else if (itemName != name) setName(itemName);

    function finishEditing(newValue) {
      console.log(`setting ${editing} to ${newValue}`)

      if (editing == "count") setCount(newValue);
      else setName(newValue);

      fetch(`${server}/api/inventory/UpdateItem`, { method: 'POST',
        body: JSON.stringify({"barcode": barcode, [editing]: newValue}),
        headers: {'Content-Type': "application/json", 'Authorization': authToken}})

      setEditing(null);
    }

    // choose a "default" low stock threshold if not set 
    itemLowStock = parseInt(itemLowStock);
    itemLowStock = (itemLowStock && itemLowStock >= 0) ? itemLowStock : 10;

    let editCountInput = (
      <input type="text" autoComplete="off" defaultValue={count} onKeyDown={(e) => {
          if (e.key=="Enter") finishEditing(e.target.value);
          if (e.key=="Escape") setEditing(null);
        }}
        className="shadow appearance-none border rounded w-10 py-2 px-3 text-gray-700 leading-tight" autoFocus
        onBlur={() => setEditing(null)}
      ></input>
    )

    let editNameInput = (
      <input type="text" autoComplete="off" defaultValue={name} onKeyDown={(e) => {
          if (e.key=="Enter") finishEditing(e.target.value);
          if (e.key=="Escape") setEditing(null);
        }}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight" autoFocus
        onBlur={() => setEditing(null)}
      ></input>
    )

    return (
        <tr id={barcode}>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <div className="flex items-center" onDoubleClick={() => authToken ? setEditing("itemName") : null}>
                <div className="ml-3">
                    <p className="text-gray-900 whitespace-no-wrap">
                        {editing=="itemName" ? editNameInput : name}
                    </p>
                </div>
            </div>
            {showBarcodes ? <div id={`barcode-${barcode}`} className="ml-3 text-gray-500">{barcode}</div> : ""}
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">{categoryDisplay(itemCategories)}</p>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm" onDoubleClick={() => authToken ? setEditing("count") : null}>
            <p className="text-gray-900 whitespace-no-wrap font-bold">
                {editing=="count" ? editCountInput : count}
            </p>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            {(count > itemLowStock) && <span
                className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                <span aria-hidden
                    className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                <span className="relative overflow-hidden whitespace-no-wrap">In Stock</span>
            </span>}
            {(itemLowStock >= count) && (count > 0) && <span
                className="relative inline-block px-3 py-1 font-semibold text-yellow-900 leading-tight">
                <span aria-hidden
                    className="absolute inset-0 bg-yellow-200 opacity-50 rounded-full"></span>
                <span className="relative overflow-hidden whitespace-no-wrap">Low Stock</span>
            </span>}
            {(count <= 0) && <span
                className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                <span aria-hidden
                    className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                <span className="relative overflow-hidden whitespace-no-wrap">Out of Stock</span>
            </span>}
        </td>
    </tr>
    )
    }