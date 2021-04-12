import React, { useState, useReducer } from 'react';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import useSWR from 'swr';
import firebase from 'firebase/app'

export default function ModalContent(props) {
    let item = props.item
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR("/api/categories/ListCategories", fetcher);
    if (error) return <div>Failed to load Modal</div>
    if (!data) return <div>Loading...</div>
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
            <div className="modal-content">
                <div className="modal-body">
                </div>
                <div>
                    <div className='p-1'>
                        <label className="p-2 font-bold">Item Name</label>
                        <input type="text" name="itemName" required value={props.parentState.itemName} onChange={(e) => {
                            props.dispatch({type: 'editItemName', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className="p-1">
                        <label className="p-2 font-bold">Item Barcode</label>
                        <input type="text" name="itemBarcode" required value={props.parentState.barcode} onChange={(e) => {
                            props.dispatch({type: 'editItemBarcode', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className='p-1'> 
                        <label className="p-2 font-bold">Stock Count</label>
                        <input type="number" min="0" name="count" required value={props.parentState.count} onChange={(e) => {
                            props.dispatch({type: 'editItemCount', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className='p-1'>
                        <label className="p-2 font-bold">Pack Size</label>
                        <input type="number" min="0" name="packSize" required value={props.parentState.packSize} onChange={(e) => {
                            props.dispatch({type: 'editItemPackSize', value: e.currentTarget.value})
                        }}/>
                    </div>                        
                    <div className='p-1'>
                        <ReactMultiSelectCheckboxes options={categoryOptions} placeholderButtonLabel="Select Categories" onChange={(selectedOptions)=>{
                            let categoryIds = selectedOptions.reduce((acc, curr)=> {
                                acc.push(curr.value)
                                return acc
                            }, [])
                            props.dispatch({type: 'editCategories', value: categoryIds})
                        }}/>
                    </div>
                    <div className='p-1'>
                        {/* {low stock threshold is not required} */}
                        <label className="p-2 font-bold">Low Stock Threshold</label> 
                        <input type="number" min="0" name="lowStock" value={props.parentState.lowStock} onChange={(e) => {
                            props.dispatch({type: 'editItemLowStock', value: e.currentTarget.value})
                        }}/>
                    </div>
                    <div className='p-3' >
                        <button className="bg-gray-300 p-2 rounded-md" type="submit" onClick={props.onSubmitHandler}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    )
  }