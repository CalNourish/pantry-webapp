import useSWR from 'swr';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import Table from '../components/Table'
import ModalContent from '../components/ModalContent'
import Modal from 'react-modal'
import React, { useState, useReducer } from 'react';
import { ToastMessage } from "react-toastr";
import toastr from 'toastr'

export default function Inventory() {
  // get categories and make a table to look up name from id
  const emptyItem =  {
        itemName: "",
        barcode: "",
        count: "",
        packSize: "",
        categories: "",
        lowStock: "",
  }

  function formReducer(state, action) {
    switch (action.type) { // actions have a type by convention, value to hold 
        case "reset":
            return emptyItem
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
        case 'itemLookup': {
          return {
            ...state,
            ...action.value
          }
        }   
        default:
            break;
      }
    return state
  }
 
  const fetcher = (url) => fetch(url).then((res) => res.json())
  const { data, error } = useSWR("/api/inventory", fetcher);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showEditItemLookup, setShowEditItemLookup] = useState(false);
  const [barcode, setBarcode] = useState(emptyItem); //  refers to the barcode just scanned    
  const [ state, dispatch ] = useReducer(formReducer, emptyItem)

  if (error) return <div>Failed to load Inventory</div>
  if (!data) return <div>Loading...</div>

  function handleItemLookupSubmit() {
    console.log("just looked up: ", barcode);
    // todo: look barcode up in firebase and set state 
    const itemPayload = { // placeholder
      itemName: "1",
      barcode: "2",
      count: "3",
      packSize: "4",
      categories: ["8sJAdmGbnB", "8WeYr8bkRO"],
      lowStock: "5",
    }
    dispatch({type: 'itemLookup', value: itemPayload})
    return 
  }

  function handleItemSubmit() {
    // submit to firebase
    console.log("make firebase call")
    console.log("this is what would be in it: ", state)

    // after firebase call .then
    // would be nice to show a success message here    
    dispatch({type: 'reset'})
    setShowEditItem(false)
    return
  }

  return (
    <>
      <Layout>
        {/* Add Item */}
        <Modal id="add-item-modal" isOpen={showAddItem} onRequestClose={() => setShowAddItem(false)} 
            style={{
              overlay: {
                backgroundColor: "rgba(128,0,128,0.3)",
              },
              content: {
                borderRadius: '20px',
                border: 'none',
                width: '66%',
                height: '66%',
                margin: "0 auto"
              }
            }}>
          <div className="modal-header bg-blue-800">
            <p className="text-white">Add Item</p>
          </div>
          <ModalContent 
            onSubmitHandler={handleItemSubmit} 
            formReducer={formReducer} 
            dispatch={dispatch}
            parentState={state}/>
          <button onClick={() => setShowAddItem(false)}>Close</button>
        </Modal>

        {/*  Edit Item Lookup  */}
        <Modal id="edit-item-lookup-modal" isOpen={showEditItemLookup} onRequestClose={() => setShowEditItemLookup(false)} 
            style={{
              overlay: {
                backgroundColor: "rgba(0,128,0,0.3)",
              },
              content: {
                borderRadius: '20px',
                border: 'none',
                width: '66%',
                height: '66%',
                margin: "0 auto"
              }
            }}>
          <div className="modal-header bg-blue-800">
            <p className="text-white">Scan Barcode</p>
          </div>
          <div className='p-1'>
            <label>Barcode</label>
              <input type="text" name="itemName" required onChange={(e)=> {setBarcode(e.currentTarget.value)}}/>
            </div>

          <button className="bg-gray-300 p-2 rounded-md" onClick={() => {
            setShowEditItemLookup(false)
            setShowEditItem(true)
            handleItemLookupSubmit()

          }}>Next</button>

        </Modal>

        {/* Edit Item */}
        <Modal id="edit-item-modal" isOpen={showEditItem} onRequestClose={() => setShowEditItem(false)} 
            style={{
              overlay: {
                backgroundColor: "rgba(0,128,0,0.3)",
              },
              content: {
                borderRadius: '20px',
                border: 'none',
                width: '66%',
                height: '66%',
                margin: "0 auto"
              }
            }}>
          <div className="modal-header bg-blue-800">
            <p className="text-white">Edit Item</p>
          </div>
          <ModalContent 
            onSubmitHandler={handleItemSubmit} 
            formReducer={formReducer} 
            dispatch={dispatch}
            parentState={state}/>  
          <button onClick={() => setShowEditItem(false)}>Close</button>
        </Modal>
        
        <div className="flex">
          <div className="flex-none w-64">
            <Sidebar className="py-4">
              <h1>Inventory</h1>
              <div className="my-4">
                <button className="my-1 btn-pantry-blue w-56 rounded-md" onClick={() => setShowAddItem(true)}>Add new item</button>
                <button className="my-1 btn-pantry-blue w-56 rounded-md" onClick={() => setShowEditItemLookup(true)}>Edit existing item</button>
              </div>
            </Sidebar>
          </div>
          <div className="py-4 px-8">
            <Table className="table-auto my-1" data={data}></Table>
          </div>
        </div>
      </Layout>
    </>
  )
}