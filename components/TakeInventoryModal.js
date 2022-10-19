import useSWR from "swr";
import React, { useState } from "react";
import Select from "react-select";

/* category checkboxes, used in add/edit item modal */
class TakeInventory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      oldCount: props.parentState.count,
      items: props.data,
      dispatch: props.dispatch,
      numCases: 0,
      newQuantity: 0,
    };
    this.options = Object.keys(this.state.items).map((key) => {
      return {
        value: this.state.items[key].barcode,
        label: this.state.items[key].itemName,
      };
    });
  }

  updateQuantity(e) {
    this.props.parentState.count = this.state.newQuantity;
    this.props.onSubmitHandler(e);
    this.setState({
      numPacks: 0,
      newQuantity:0,
    });
    this.props.parentState.barcode = null;
    document.getElementById('count').value= ""
  }

  selectItem(barcode) {
    this.props.parentState.barcode = barcode
    this.props.barcodeLookup(barcode);
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
      color: "#4a5568",
    }),
  };

  render() {
    return (
      <div className="modal-wrapper p-5 h-full flex flex-col">
        <div id="modalExit" className="text-4xl absolute top-0 right-0 cursor-pointer hover:text-gray-500" onClick={this.props.onCloseHandler}>&times; &nbsp;</div>
        <div className="modal-header text-3xl font-bold">
                {this.props.isAdd ? "Add Inventory" : "Take Inventory"}
        </div>

        {/* Item Search Select */}
        <div className="mb-5">
          <Select
            options={this.options}
            id="search-select"
            placeholder={
              <span className="text-sm text-gray-400">Search item name</span>
            }
            styles={this.selectStyle}
            onChange={(e) => this.selectItem(e.value)}
            autoFocus
          />
        </div>

        {/* Current Count */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-bold mb-2">
            Current Quantity in Stock
          </label>
          <div className="flex relative items-stretch">
            <label className="block text-gray-600 text-sm font-bold mb-2">
              {this.props.parentState.count}
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex relative space-x-10 items-stretch">
           <div className="ml-3">
              <label className="block text-gray-600 text-sm font-bold mb-2">
                Number of Packs
              </label>
              <div className="flex relative items-stretch">
                <input
                  type="number"
                  id="count"
                  autoComplete="off"
                  className={
                    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                  }
                  onChange={(e) => {
                    this.state.numPacks = e.currentTarget.value;
                    this.setState({
                      numPacks: e.currentTarget.value,
                      newQuantity:
                      this.props.isAdd ? this.props.parentState.count + this.state.numPacks * this.props.parentState.packSize : this.state.numPacks * this.props.parentState.packSize,
                    });
                  }}
                />
              </div>
            </div>
            <div className="mr-3">
              <label id="packOption" value="packs" className="block text-gray-600 text-sm font-bold mb-2">
                Quantity per Pack
              </label>
              <label className="block text-gray-600 text-sm font-bold mb-2">
                  {this.props.parentState.packSize}
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm font-bold mb-2">
                New Quantity
              </label>
              <div className="flex relative items-stretch">
                <label className="block text-gray-600 text-sm font-bold mb-2">
                  {this.state.newQuantity}
                </label>
              </div>
            </div>
            <div class="flex justify-center">
          </div>
          </div>
        </div>

        {/* Update Quantity */}
        <button
          className="btn btn-pantry-blue uppercase tracking-wide text-xs font-semibold"
          id="update-quantity"
          onClick={(e) => (this.updateQuantity(e))}
        >
          Update Quantity
        </button>
      </div>
    );
  }
}

/* Add/Edit item modal used on the authenticated version of the inventory page */
export default function TakeInventoryModal(props) {
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, error } = useSWR("/api/inventory/GetAllItems", fetcher);
  if (error) return <div>Failed to load Modal</div>;
  if (!data) return <div>Loading...</div>;
  else {
    return (
      <TakeInventory
        data={data}
        onSubmitHandler={props.onSubmitHandler}
        onCloseHandler={props.onCloseHandler}
        barcodeLookup={props.barcodeLookup}
        parentState={props.parentState}
        dispatch={props.dispatch}
        isAdd={props.isAdd}
      ></TakeInventory>
    );
  }
}
