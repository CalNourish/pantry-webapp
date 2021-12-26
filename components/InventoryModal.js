import React from 'react';
import useSWR from 'swr';
import firebase from 'firebase/app';
import Select from 'react-select';
import {useReducer} from 'react';

export default function InventoryModal(props) {
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR("/api/categories/ListCategories", fetcher);
    if (error) return <div>Failed to load Modal</div>
    if (!data) return <div>Loading...</div>

    // A reducer to get the categories from firebase in a format that is react-select friendly.
    const categoryReducer = (acc, obj) => {
        acc = [
            ...acc,
            {
                label: obj.displayName,
                value: obj.id
            }
        ]
        return acc
    }
    const categoryOptions = data.categories.reduce(categoryReducer, [])

    return (
        <div className="modal-wrapper m-5">
            <div className="modal-header text-3xl font-bold">
                {props.isAdd ? "Add Item" : "Edit Item"}
            </div>
            <div className="modal-content pt-6">
                {props.status.error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">{props.status.error}</div>}                
                <div className="modal-body">
                    <form id="modal-form" className="bg-white rounded mb-4" onSubmit={props.onSubmitHandler}>
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
                    </form>
                </div>
            </div>
            <button className="btn-pantry-blue py-2 px-4 mr-3 rounded-md" onClick={props.onSubmitHandler}>Submit</button>
            <button onClick={props.onCloseHandler} type="close" className="bg-gray-500 hover:bg-gray-400 text-white py-2 px-4 rounded-md">Close</button>
        </div>
    )
  }