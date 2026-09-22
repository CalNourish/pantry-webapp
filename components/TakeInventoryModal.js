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
      numCases: 0,
      numPacks: "",
      individual: "",
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
      numPacks: "",
      individual: "",
      newQuantity: 0
    });
    this.props.parentState.barcode = null;
  }

  selectItem(barcode) {
    this.setState({
      numPacks: "",
      individual: "",
      newQuantity: 0,
    })
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

        {this.props.status.loading && <div className="bg-yellow-200 border border-yellow-400 text-yellow-700 px-4 py-2 rounded relative mb-3"> Updating ...</div>}
        {this.props.status.error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-3">
          Error: <span className="font-mono font-bold">{this.props.status.error}</span></div>}

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

        {/* Number of packs and updated count */}
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
                  value={this.state.numPacks}
                  autoComplete="off"
                  className={
                    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                  }
                  onChange={(e) => {

                    const numPacks = Number(e.target.value) > 0 ? Number(e.target.value) : 0;
                    const individual = Number(this.state.individual) > 0 ? Number(this.state.individual) : 0;
                    const current = Number(this.props.parentState.count) > 0 ? Number(this.props.parentState.count) : 0;
                    const packSize = Number(this.props.parentState.packSize) > 0 ? Number(this.props.parentState.packSize) : 1;
                    this.setState({
                      numPacks: e.target.value,
                      newQuantity: current + (numPacks * packSize) + individual,
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
            <div className="ml-3">
              <label className="block text-gray-600 text-sm font-bold mb-2">
                Individual Quantity
              </label>
              <div className="flex relative items-stretch">
                <input
                  type="number"
                  id="individual-count"
                  autoComplete="off"
                  value={this.state.individual}
                  className={
                    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                  }
                  onChange={(e) => {
                    const numPacks = Number(this.state.numPacks) > 0 ? Number(this.state.numPacks) : 0;
                    const individual = Number(e.target.value) > 0 ? Number(e.target.value) : 0;
                    const current = Number(this.props.parentState.count) > 0 ? Number(this.props.parentState.count) : 0;
                    const packSize = Number(this.props.parentState.packSize) > 0 ? Number(this.props.parentState.packSize) : 1;

                    this.setState({
                      individual: e.target.value,
                      newQuantity: current + (numPacks * packSize) + individual,
                    });
                  }}
                />
              </div>
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
            <div className="flex justify-center">
            </div>
          </div>
        </div>

        {/* Update Quantity Button */}
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
        status={props.status}
        errors={props.errors}
        dispatch={props.dispatch}
        isAdd={props.isAdd}
      ></TakeInventory>
    );
  }
}
