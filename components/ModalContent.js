import React from 'react';
import useSWR from 'swr';
import firebase from 'firebase/app';
import Select from 'react-select';
import {useReducer} from 'react';


async function doAutofill(field, lookupFunc) {
    var barcode = field.target.value;
    console.log("looking up: ", barcode);
    lookupFunc(barcode);
}

export default function ModalContent(props) {
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
        <div className="modal-wrapper">
            <div className="model-header text-3xl font-bold">
                {props.isAdd ? "Add Item" : "Edit Item"}
            </div>
            <div className="modal-content">
                <div className="modal-body">
                    <form id="modal-form" className="bg-white rounded px-8 pt-6 pb-8 mb-4" onSubmit={props.onSubmitHandler}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Item Barcode
                            </label>
                            <input type="text" id="barcode" autoComplete="off"
                                className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" + (props.barcodeError ? " border-red-500" : "")}
                                placeholder="scan or type item barcode" onBlur={props.barcodeLookup ? (e) => doAutofill(e, props.barcodeLookup) : null}
                                value={props.parentState.barcode} onChange={(e) => {props.dispatch({type: 'editItemBarcode', value: e.currentTarget.value})}}/>
                            {props.barcodeError && <div className="mt-2 text-sm text-red-600">{props.barcodeError}</div>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Item Name
                            </label>
                            <input type="text" id="itemName" autoComplete="off"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="item name" value={props.parentState.itemName} 
                                onChange={(e) => {props.dispatch({type: 'editItemName', value: e.currentTarget.value})}} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Quantity in Stock
                            </label>
                            <div className="flex relative items-stretch">
                                <input type="number" id="count" autoComplete="off"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="number of units" value={props.parentState.count}
                                    onChange={(e) => {props.dispatch({type: 'editItemCount', value: e.currentTarget.value})}}/>
                                <select className="ml-5" id="packOption" defaultValue="individual">
                                    <option value="individual">Individual Items</option>
                                    <option value="packs">Packs</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Quantity per Pack
                            </label>
                            <input type="number" id="packSize" autoComplete="off"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="number of items per package" value={props.parentState.packSize} 
                                onChange={(e) => {props.dispatch({type: 'editItemPackSize', value: e.currentTarget.value})}} />
                        </div>
                        <button type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Submit</button>
                            {/* todo: disable when failed */}
                    </form>
                </div>
            </div>
        </div>
    )
  }