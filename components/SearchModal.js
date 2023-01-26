import React, { useState } from 'react';
import Select from 'react-select'

/* Search modal used for looking up item by name on Checkout Page */
export default function SearchModal(props) {
  let items = props.items;
  const [quantity, setQuantity] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  let selectItem = (barcode) => {
    setSelectedItem(items[barcode]);
  }

  let submitItem = () => {
    if (selectedItem) {
      props.addItemFunc(selectedItem, quantity);
      props.onCloseHandler(selectedItem.barcode);
    }
  }

  // Need to hardcode style for react-select because tailwind classes aren't supported
  const selectStyle = {
    option: (provided) => ({
      ...provided,
    }),
    control: (provided) => ({
      ...provided,
      borderColor: "#cbd5e0 !important",
      boxShadow: "none",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#4a5568"
    })
  }

  const options = Object.keys(items).map((key) => {
    return {value: items[key].barcode, label: items[key].itemName}
  })

  return (
    <div className="modal-wrapper p-5 h-full flex flex-col">
      <div id="modalExit" className="text-4xl absolute top-0 right-0 cursor-pointer hover:text-gray-500" onClick={props.onCloseHandler}>&times; &nbsp;</div>

      <div className="modal-header text-3xl font-bold mb-5">
        Add Item By Name
      </div>

      {/* Item Search Select */}
      <div className="mb-5">
        <Select options={options} id="search-select"
          placeholder={<span className="text-sm text-gray-400">Search item name</span>}
          styles={selectStyle}
          onChange={(e) => selectItem(e.value)}
          autoFocus/>
      </div>

      {/* Quantity Input */}
      <div className="mb-5">
        <input className="appearance-none rounded border border-gray-300 block px-3 py-2 w-full text-sm placeholder-gray-400 text-gray-600 
                        focus:bg-white focus:placeholder-gray-500 focus:text-gray-600 focus:outline-none"
            id="search-quantity"
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Item quantity (default: 1)"
            value={quantity}
            autoComplete="off"/>
      </div>

      {/* Submit Button */}
      <button className="btn btn-pantry-blue uppercase tracking-wide text-xs font-semibold" onClick={submitItem} id="search-submit">
        Add Item <span className="font-normal hidden sm:inline-block">(Shift + Enter)</span>
      </button>
    </div>
  )
}