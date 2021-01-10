import React, { useState, useReducer } from 'react';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';


function formReducer(state, action) {
    switch (action.type) { // actions have a type by convention, value to hold 
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

const initialState = {
    itemName: "",
    barcode: "",
    count: "",
    packSize: "",
    categories: "",
    lowStock: "",
}

const categoryOptions = [
    { label: 'Grains', value: 1},
    { label: 'Protein', value: 2},
    { label: 'Snacks', value: 3},
    { label: 'Frozen', value: 4},

]


export default function ModalContent() {
    const [ state, dispatch ] = useReducer(formReducer, initialState)

    function handleSubmit() {
        console.log(state)
    }

    return (
        <div className="modal-wrapper">
            <div className="modal-content">
                <div className="modal-body">
                </div>
                <div>
                    <div className='p-1'>
                        <label className="p-2 font-bold">Item Name</label>
                        <input type="text" name="itemName" required onBlur={(e) => {
                            dispatch({type: 'editItemName', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className="p-1">
                        <label className="p-2 font-bold">Item Barcode</label>
                        <input type="text" name="itemBarcode" required onBlur={(e) => {
                            dispatch({type: 'editItemBarcode', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className='p-1'> 
                        <label className="p-2 font-bold">Stock Count</label>
                        <input type="number" min="0" name="count" required onBlur={(e) => {
                            dispatch({type: 'editItemCount', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className='p-1'>
                        <label className="p-2 font-bold">Pack Size</label>
                        <input type="number" min="0" name="packSize" required onBlur={(e) => {
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
                        <input type="number" min="0" name="lowStock" onBlur={(e) => {
                            dispatch({type: 'editItemLowStock', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className='p-3' >
                        <button className="bg-gray-300 p-2 rounded-md" type="submit" onClick={handleSubmit}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    )
  }