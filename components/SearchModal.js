import React, { useState } from 'react';

/* Search modal used for looking up item by name on Checkout Page */
export default function SearchModal(props) {
  let items = props.items;
  const [searchFilter, setSearchFilter] = useState("");
  const [quantity, setQuantity] = useState("");
  
  let checkFilter = (itemData) => {
    let name = itemData.itemName.toLowerCase();
    let filterLower = searchFilter.toLowerCase().split(" ").filter(el => el);
    for (let idx in filterLower) {
      if (name.indexOf(filterLower[idx]) == -1) {
        if (itemData.itemName === "Orange Rice") console.log(name, filterLower[idx])
        return false;
      }
    }
    return true;
  }

  let submitItem = (itemInfo, quantity) => {
    props.addItemFunc(itemInfo, quantity);
    props.onCloseHandler(itemInfo.barcode);
  }

  return (
    <div className="modal-wrapper p-5 h-full flex flex-col">
      <div className="modal-header text-3xl font-bold mb-5">
        Add Item By Name
      </div>

      {/* Quantity Input */}
      <div className="mb-5">
        <input className="appearance-none rounded border border-gray-400 block px-3 py-2 w-full text-sm placeholder-gray-500 text-gray-700 
                        focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
            id="search-quantity"
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Item quantity (default: 1)"
            value={quantity}
            autocomplete="off"
            autoFocus/>
      </div>

      {/* Search Bar */}
      <div className="block relative">
        <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
          <img className="h-4 w-4" src="/images/magnifying-glass.svg"></img>
        </span>
        <input className="appearance-none rounded-t border border-gray-400 block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-500 text-gray-700 
                        focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
          id="search-input"
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search item name"
          value={searchFilter} 
          autocomplete="off"/>
      </div>

      {/* Item Select */}
      <div className="modal-content overflow-y-scroll border border-t-0 border-gray-400 rounded-b pt-1">
        {
          Object.keys(items).map((key) => {
            let itemInfo = items[key];
            if (checkFilter(itemInfo)) {
              return <button key={key} onClick={() => submitItem(itemInfo, quantity)} tabIndex="-1" id={key + "-search"}
                          className="search-option px-3 py-1 cursor-pointer block w-full text-left hover:bg-gray-300 focus:bg-gray-300 focus:outline-none">{itemInfo.itemName}</button>
            }
          }) 
        }
      </div>
    </div>
  )
}