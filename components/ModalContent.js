import React, { useState, useReducer } from 'react';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import useSWR from 'swr';
import firebase from 'firebase/app'

const initialState = {
    barcode: '',
    count: '',
    packSize: '',
    categories: '',
    lowStock: ''
}

function formReducer(state, action) {
    switch (action.type) { // actions have a type by convention, value to hold 
        case "reset":
            return initialState
        case 'editItemName': {
            return {
                ...state,
                itemName: action.value
            }
        } 
        case 'editItemBarcode': {
            return {
                ...state,
                barcode: action.value
            }
        }         
        case 'editItemCount': {
            return {
                ...state,
                count: action.value
            }
        }            
        case 'editItemPackSize': {
            return {
                ...state,
                packSize: action.value
            }
        }  
        case 'editCategories': {
            return {
                ...state,
                categories: action.value
            }
        }       
        case 'editItemLowStock': {
            return {
                ...state,
                lowStock: action.value
            }
        }    
        default:
            break;
    }
    return state
}


export default function ModalContent(props) {
    // firebase.auth().signInAnonymously()
    // console.log('signed in')
    let item = props.item
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR("/api/categories/ListCategories", fetcher);
    const [ state, dispatch ] = useReducer(formReducer, item)
    if (error) return <div>Failed to load Modal</div>
    if (!data) return <div>Loading...</div>
    const categoryReducer = (acc, obj) => {
        acc = [
            ...acc,
            {
                label: obj.displayName,
                value: obj.iconName
            }
        ]
        return acc
    }
    const categoryOptions = data.categories.reduce(categoryReducer, []) 
    
    function customOnSubmitHandler() {
        props.onSubmitHandler(state)
        dispatch({type: 'reset'})
        // console.log("state: ", state)
        // item = {
        //     item: {
        //         itemName: "",
        //         barcode: "",
        //         count: "",
        //         packSize: "",
        //         categories: "",
        //         lowStock: "",
        //     }
        // }
        // // set form state to blank
    }

    return (
        <div className="modal-wrapper">
            <div className="modal-content">
                <div className="modal-body">
                </div>
                <div>
                    <div className='p-1'>
                        <label className="p-2 font-bold">Item Name</label>
                        <input type="text" name="itemName" required defaultValue={item.itemName} onBlur={(e) => {
                            dispatch({type: 'editItemName', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className="p-1">
                        <label className="p-2 font-bold">Item Barcode</label>
                        <input type="text" name="itemBarcode" required defaultValue={item.barcode} onBlur={(e) => {
                            dispatch({type: 'editItemBarcode', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className='p-1'> 
                        <label className="p-2 font-bold">Stock Count</label>
                        <input type="number" min="0" name="count" required defaultValue={item.count} onBlur={(e) => {
                            dispatch({type: 'editItemCount', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className='p-1'>
                        <label className="p-2 font-bold">Pack Size</label>
                        <input type="number" min="0" name="packSize" required defaultValue={item.packSize} onBlur={(e) => {
                            dispatch({type: 'editItemPackSize', value: e.currentTarget.value})
                        }}/>
                    </div>                        
                    <div className='p-1'>
                        <ReactMultiSelectCheckboxes options={categoryOptions} placeholderButtonLabel="Select Categories" onChange={(selectedOptions)=>{
                            dispatch({type: 'editCategories', value: selectedOptions})

                        }}/>
                    </div>
                    <div className='p-1'>
                        {/* {not required} */}
                        <label className="p-2 font-bold">Low Stock Threshold</label> 
                        <input type="number" min="0" name="lowStock" defaultValue={item.lowStock} onBlur={(e) => {
                            dispatch({type: 'editItemLowStock', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className='p-3' >
                        <button className="bg-gray-300 p-2 rounded-md" type="submit" onClick={() => customOnSubmitHandler()}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    )
  }