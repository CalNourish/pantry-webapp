import useSWR from 'swr';
import React, { useState } from 'react';
import Select from 'react-select'


/* category checkboxes, used in add/edit item modal */
class TakeInventory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          items: props.data,
          quantity:0,
          dispatch:props.dispatch,
          selectedItem:null,
          selectedItemQuantity:0,
          parentState:props.parentState,

        }
        this.options = Object.keys(this.state.items).map((key) => {
            return {value: this.state.items[key].barcode, label: this.state.items[key].itemName}
          });
  }

    

    selectItem(barcode) {
      this.props.barcodeLookup(barcode);
      this.props.parentState.count = 34
    }

    selectStyle = {
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

    
    render() {
    
        return (
            <div className="modal-wrapper p-5 h-full flex flex-col">
              <div className="modal-header text-3xl font-bold mb-5">
                Take Inventory
               </div>
        
              {/* Item Search Select */}
              <div className="mb-5">
                <Select options={this.options} id="search-select"
                  placeholder={<span className="text-sm text-gray-400">Search item name</span>}
                  styles={this.selectStyle}
                  onChange={(e) => this.selectItem(e.value)}
                  autoFocus/>
              </div>
        

              {/* Count */}
              <div className="mb-4">
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                Quantity in Stock
                            </label>
                            <div className="flex relative items-stretch">
                                <input type="number" id="count" autoComplete="off"
                                    placeholder="default: 0" value={this.state.parentState.count}
                                    onChange={(e) => {this.state.dispatch({type: 'editItemCount', value: e.currentTarget.value})}}/>
                                <select className="ml-5" id="packOption" defaultValue="packs">
                                    <option value="packs">Packs</option>
                                    <option value="individual">Individual Items</option>
                                </select>
                            </div>
              </div>
        
              {/* Submit Button */}
              <button className="btn btn-pantry-blue uppercase tracking-wide text-xs font-semibold" id="search-submit">
                Add Item <span className="font-normal hidden sm:inline-block">(Shift + Enter)</span>
              </button>
            </div>
          )
    }
}

/* Add/Edit item modal used on the authenticated version of the inventory page */
export default function TakeInventoryModal(props) {
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data,error } = useSWR("/api/inventory/GetAllItems", fetcher);
    if (error) return <div>Failed to load Modal</div>
    if (!data) return <div>Loading...</div>
    else {
        return <TakeInventory data={data} barcodeLookup = {props.barcodeLookup} parentState = {props.parentState} dispatch={props.dispatch} ></TakeInventory>;
      }
  }