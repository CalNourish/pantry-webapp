import useSWR from 'swr';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import Table from '../components/Table'
import ModalContent from '../components/ModalContent'
import Modal from 'react-modal'
import React, { useState, useReducer } from 'react';
import cookie from 'js-cookie';

/* TODO:
  - display categories
  - UI for add/update item
  - add/update doesn't actually do anything?
  - live updates */

export default function Inventory() {
  const token = cookie.get("firebaseToken")

  const emptyItem =  {
        itemName: "",
        barcode: "",
        count: "",
        packSize: "",
        categoryName: "",
        lowStock: "",
  }

  // A reducer to manage the State of the add-item / edit-item forms. 
  function formReducer(state, action) {
    console.log(state, action);
    switch (action.type) { 
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
                categoryName: action.value
            }
        }       
        case 'editItemLowStock': {
            return {
                ...state,
                lowStock: action.value
            }
        } 
        case 'itemLookup': {
          console.log("newstate:", action.value)
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

  // Manage modal show/don't show State
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  // const [showEditItemLookup, setShowEditItemLookup] = useState(false);

  // Manage just-scanned barcode State
  const [barcode, setBarcode] = useState(emptyItem);
  
  // Manage form State (look up useReducer tutorials if unfamiliar)
  const [ state, dispatch ] = useReducer(formReducer, emptyItem)

  if (error) return <div>Failed to load Inventory</div>
  if (!data) return <div>Loading...</div>

  // When a barcode is scanned in the edit-item-lookup modal, look up this barcode in Firebase.
  function handleBarcodeLookup(barcode) {
    console.log("just looked up: ", barcode);
    // TODO: look barcode up in firebase and set state 
    const itemPayload = { // placeholder only. later this will come from firebase.
      itemName: "1",
      barcode: "2",
      count: "3",
      packSize: "4",
      categoryName: [
        {value: "8WeYr8bkRO", label: "Frozen Foods"}, 
        {value: "8sJAdmGbnB", label: "Hi"}
      ],
      lowStock: "5",
    }
    dispatch({type: 'itemLookup', value: itemPayload})
    return 
  }

  // When an item is submitted from the add-item or edit-item form, write the updated item to firebase.
  function handleItemSubmit(e) {
    e.preventDefault();
    // TODO: submit the payload to firebase using firebase API call
    const barcode = e.target.barcode.value
    const itemName = e.target.itemName.value
    const packSize = e.target.packSize.value
    const quantity = e.target.inStock.value * (e.target.packOption.value == "individual" ? 1 : packSize)

    const payload = JSON.stringify({
      "barcode": barcode,
      "itemName": itemName,
      "packSize": packSize,
      "count": quantity
    });
    fetch('/api/inventory/UpdateItem', { method: 'POST', 
      body: payload,
      headers: {'Content-Type': "application/json", 'Authorization': token}})

    // TODO: would be nice to display a success message using toastr or something here (synchronously after firebase call)  
    dispatch({type: 'reset'})
    // setShowEditItem(false)
    return
  }

  return (
    <>
      <Layout>
        {/* Add Item Modal */}
        <Modal id="add-item-modal" isOpen={showAddItem} onRequestClose={() => setShowAddItem(false)} ariaHideApp={false}>
          <ModalContent
              onSubmitHandler={handleItemSubmit} 
              formReducer={formReducer} 
              dispatch={dispatch}
              parentState={state}
              isAdd={true}/>
          <button onClick={() => setShowAddItem(false)} type="close" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Close</button>
        </Modal>
        
        {/*  Edit Item Modal  */}
        <Modal id="edit-item-modal" isOpen={showEditItem} onRequestClose={() => setShowEditItem(false)} ariaHideApp={false}>
          <ModalContent
              onSubmitHandler={handleItemSubmit} 
              formReducer={formReducer} 
              dispatch={dispatch}
              parentState={state}
              isAdd={false}
              barcodeLookup={handleBarcodeLookup}/>
          <button onClick={() => setShowEditItem(false)} type="close" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Close</button>
        </Modal>
        
        <div className="flex">
          <div className="flex-none w-64">
            <Sidebar className="py-4">
              <h1>Inventory</h1>
              <div className="my-4">
                <button className="my-1 btn-pantry-blue w-56 rounded-md" onClick={() => setShowAddItem(true)}>Add new item</button>
                <button className="my-1 btn-pantry-blue w-56 rounded-md" onClick={() => setShowEditItem(true)}>Edit existing item</button>
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