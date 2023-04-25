import React, { useState } from 'react';
import useSWR from 'swr';
import { server } from "../pages/_app.js"
import firebase from '../firebase/clientApp';
import {getDatabase, ref, child, get, set, push, update, onValue, remove} from "firebase/database";
import Select from 'react-select';
import Script from 'next/script.js';



const database = getDatabase();

const dbRef = ref(getDatabase())

let optionMap;




/* category checkboxes, used in add/edit item modal */
class EditBarcodeDropdown extends React.Component {
    constructor(props) {
        super(props);
        //this.options = props.categories;
        this.dispatch = props.dispatch;
        this.state = {
            //oldCount: props.parentState.count,
            items: props.data,
            numCases: 0,
            newQuantity: 0,
          };
        this.options = Object.keys(this.state.items).map((key) => {
            return {
              value: this.state.items[key].barcode,
              label: this.state.items[key].itemName,
            };
        });
        console.log("map: ", optionMap)
        
    }
    



    render() {
        let opt = this.options;
        let categories = this.props.parentState.categoryName;

        return (
            <div className="mb-4">
                <label className="block text-gray-600 text-sm font-bold mb-2">
                    Categories
                </label>
                <div className={"grid grid-cols-5 gap-4 p-2" + (this.props.error ? " rounded-md border border-red-500" : "")}>
                    { Object.keys(opt).map((idx) => {
                        return (
                            <div className="" onClick={() => {this.markCategory(idx)}} key={`category-${idx}`}>
                                <input type="checkbox" onChange={() => {/* handled by parent div */}} className="w-4 h-4 mr-3" checked={categories && opt[idx].id in categories}/>
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
export default function EditBarcodeModal(props) {

    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR(`${server}/api/inventory/GetAllItems`, fetcher);
    if (error) return <div>Failed to load Modal</div>
    if (!data) return <div>Loading...</div>
    console.log(data);
    var optionsTemp = Object.keys(data).map((key) => {
        return {
          value: data[key].barcode,
          label: data[key].itemName,
        };
      });
    console.log(optionsTemp)

    document.onkeydown = (e) => {
        /* don't submit modal immediately after scanning barcode */
        if (document.activeElement.id == 'barcode' && e.key == "Enter") {
            e.preventDefault()
            document.getElementById("itemName").focus()
        }
    }
    function fillBarcode(itemMap){
        var barcode = itemMap.value;
        document.getElementById("barcode").value = barcode;

    }
    function submitBarcode(){
        console.log("Editing Barcode!")
        const currBarcode = document.getElementById('barcode').value;
        const newBarcode = document.getElementById('newBarcode').value;
        console.log(currBarcode);
        console.log(newBarcode);
        const db = getDatabase();
        const inventoryRef = child(dbRef, 'inventory');
        const code = child(inventoryRef, currBarcode)
        
        get(code).then((snapshot) => {
        if (snapshot.exists()){
            const snap = snapshot.val()
            //update(code,{'barcode' : newBarcode});
            console.log("Updated Barcode!");
            set(ref(db, 'inventory/' + newBarcode),
                {
                    "barcode": newBarcode,
                    "categoryName": snap['categoryName'],
                    "count": snap['count'],
                    "defaultCart": true,
                    "displayPublic": true,
                    "itemName": snap['itemName'],
                    "lowStock": snap['lowStock'],
                    "packSize": snap['packSize']
            });
            set(ref(db, 'inventory/' + currBarcode), null)
            //clear form
            document.getElementById('modal-form11').reset();
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
      console.error(error);
    });
    }


      
    return (
        <div className="modal-wrapper p-3">
            <div id="modalExit" className="text-4xl absolute top-0 right-0 cursor-pointer hover:text-gray-500" onClick={props.onCloseHandler}>&times; &nbsp;</div>
            <div className="modal-header text-3xl font-bold">
                {props.isAdd ? "Add Item" : "Edit Item"}
            </div>
            <div className="modal-content pt-3">
                {props.status.loading && <div className="bg-yellow-200 border border-yellow-400 text-yellow-700 px-4 py-2 rounded relative mb-3">submitting...</div>}
                {props.status.error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-3">
                    Error: <span className="font-mono font-bold">{props.status.error}</span></div>}                
                <div className="modal-body">
                    <form id="modal-form11" className="bg-white rounded mb-4" onSubmit={(e) => props.onSubmitHandler(e)}>
                        <div className='mb-4'>
                            <label className='mr-2' htmlFor="display-public">Display in public inventory:</label>
                            <input type="checkbox" checked={props.parentState.displayPublic} id="display-public" className='w-4 h-4 align-middle'
                                onChange={(e) => {
                                    props.dispatch({type: 'editItemDisplayPublic', value: e.currentTarget.checked})
                                }}>
                            </input>
                        </div>

                        {/* Item Search Select */}
                        <div className="mb-5">
                        <Select
                            options=  {optionsTemp}
                            id="search-select"
                            placeholder={
                            <span className="text-sm text-gray-400">Search item name</span>
                            }
                            
                            onChange={(e) => fillBarcode(e)}
                            autoFocus
                        />
                        </div>
                        {/* Item Barcode */}
                        <div className="mb-4">
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                Item Barcode
                            </label>
                            <input type="text" id="barcode" autoComplete="off" autoFocus
                                className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline" + (props.errors.barcode && " border-2 border-red-500")}
                                placeholder="scan or type item barcode" onBlur={props.barcodeLookup ? (e) => props.barcodeLookup(e.target.value) : null}
                                value={props.parentState.barcode} onChange={(e) => {
                                    props.dispatch({type: 'editItemBarcode', value: e.currentTarget.value})
                                }}/>
                            {props.errors.barcode && <div className="mt-2 text-sm text-red-600">{props.errors.barcode}</div>}
                        </div>

                        
                        {/* New Barcode */}
                        <div className="mb-4">
                            <label className="block text-gray-600 text-sm font-bold mb-2">
                                New Barcode
                            </label>
                            <input type="text" id="newBarcode" autoComplete="off" autoFocus
                                className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline" + (props.errors.barcode && " border-2 border-red-500")}
                                placeholder="scan or type item barcode"/>
                            {props.errors.barcode && <div className="mt-2 text-sm text-red-600">{props.errors.barcode}</div>}
                        </div>
                        <button onClick={submitBarcode} type="submit" className="btn-pantry-blue py-2 px-4 mr-3 rounded-md">Submit</button>
                        <button onClick={props.onCloseHandler} type="close" className="btn-outline py-2 px-4 rounded-md">Close</button>
                    </form>
                </div>
            </div>
        </div>
    )
  }