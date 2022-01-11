import React from 'react';
import useSWR from 'swr';
import firebase from 'firebase/app';
import Select from 'react-select';
import {useReducer} from 'react';

/* category checkboxes, used in add/edit item modal */
class CheckboxGrid extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.categories;
        this.dispatch = props.dispatch;
    }

    markCategory(idx) {
        let toggleCategory = this.options[idx];
        let itemCategories = this.props.parentState.categoryName;
        console.log("toggle", toggleCategory.displayName);
        if (toggleCategory.id in itemCategories) {
            delete this.props.parentState.categoryName[toggleCategory.id];
        } else {
            itemCategories[toggleCategory.id] = toggleCategory.id;
        }
        this.dispatch({type: "editCategories", value: this.props.parentState.categoryName})
        console.log("new checked object:", this.props.parentState.categoryName)
    }

    render() {
        let opt = this.options;
        let categories = this.props.parentState.categoryName;
        console.log("categories:", categories);

        return (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Categories
                </label>
                <div className={"grid grid-cols-4 gap-4 p-2" + (this.props.error ? " rounded-md border border-red-500" : "")}>
                    { Object.keys(opt).map((idx) => {
                        return (
                            <div className="" onClick={() => {this.markCategory(idx)}}>
                                <input type="checkbox" key={`category-${idx}`} className="w-4 h-4 mr-3" checked={categories && opt[idx].id in categories}/>
                                <label>{opt[idx].displayName}</label>
                            </div>
                        )
                    }) }
                </div>
                {this.props.error && <div className="mt-2 text-sm text-red-600">{this.props.error}</div>}
            </div>
        )
    }
}

/* Add/Edit item modal used on the authenticated version of the inventory page */
export default function InventoryModal(props) {
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR("/api/categories/ListCategories", fetcher);
    if (error) return <div>Failed to load Modal</div>
    if (!data) return <div>Loading...</div>

    // A reducer to get the categories from firebase in a format that is react-select friendly.
    const categoryOptions = data.categories;

    return (
        <div className="modal-wrapper m-5">
            <div className="modal-header text-3xl font-bold">
                {props.isAdd ? "Add Item" : "Edit Item"}
            </div>
            <div className="modal-content pt-6">
                {props.status.loading && <div className="bg-yellow-200 border border-yellow-400 text-yellow-700 px-4 py-2 rounded relative mb-3">submitting...</div>}
                {props.status.error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-3">
                    Error: <span className="font-mono font-bold">{props.status.error}</span></div>}                
                <div className="modal-body">
                    <form id="modal-form" className="bg-white rounded mb-4" onSubmit={(e) => props.onSubmitHandler(e)}>
                        {/* Item Barcode */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Item Barcode
                            </label>
                            <input type="text" id="barcode" autoComplete="off"
                                className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" + (props.errors.barcode && " border-2 border-red-500")}
                                placeholder="scan or type item barcode" onBlur={props.barcodeLookup ? (e) => props.barcodeLookup(e.target.value) : null}
                                value={props.parentState.barcode} onChange={(e) => {props.dispatch({type: 'editItemBarcode', value: e.currentTarget.value})}}/>
                            {props.errors.barcode && <div className="mt-2 text-sm text-red-600">{props.errors.barcode}</div>}
                        </div>

                        {/* Item Name */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Item Name
                            </label>
                            <input type="text" id="itemName" autoComplete="off"
                                className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" + (props.errors.itemName && " border-red-500")}
                                placeholder="item name" value={props.parentState.itemName} 
                                onChange={(e) => {props.dispatch({type: 'editItemName', value: e.currentTarget.value})}} />
                            {props.errors.itemName && <div className="mt-2 text-sm text-red-600">{props.errors.itemName}</div>}
                        </div>

                        {/* Count */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Quantity in Stock
                            </label>
                            <div className="flex relative items-stretch">
                                <input type="number" id="count" autoComplete="off"
                                    className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" + (props.errors.count && " border-red-500")}
                                    placeholder="default: 0" value={props.parentState.count}
                                    onChange={(e) => {props.dispatch({type: 'editItemCount', value: e.currentTarget.value})}}/>
                                <select className="ml-5" id="packOption" defaultValue="individual">
                                    <option value="individual">Individual Items</option>
                                    <option value="packs">Packs</option>
                                </select>
                            </div>
                            {props.errors.count && <div className="mt-2 text-sm text-red-600">{props.errors.count}</div>}
                        </div>

                        {/* PackSize, Lowstock */}
                        <div className="mb-4">
                            <div className="flex relative items-stretch">
                                <div className="mr-3">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Quantity per Pack
                                    </label>
                                    <input type="number" id="packSize" autoComplete="off"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="default: 1" value={props.parentState.packSize} 
                                        onChange={(e) => {props.dispatch({type: 'editItemPackSize', value: e.currentTarget.value})}} />
                                </div>
                                <div className="ml-3">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Low Stock Threshold
                                    </label>
                                    <input type="number" id="lowStock" autoComplete="off"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="default: 10" value={props.parentState.lowStock} 
                                        onChange={(e) => {props.dispatch({type: 'editItemLowStock', value: e.currentTarget.value})}} />
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <CheckboxGrid categories={categoryOptions} parentState={props.parentState} dispatch={props.dispatch} error={props.errors.categoryName} />

                        <button type="submit" className="btn-pantry-blue py-2 px-4 mr-3 rounded-md">Submit</button>
                        <button onClick={props.onCloseHandler} type="close" className="btn-outline py-2 px-4 rounded-md">Close</button>
                    </form>
                </div>
            </div>
            </div>
    )
  }