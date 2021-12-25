import useSWR from 'swr';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import Table from '../components/Table'
import ModalContent from '../components/ModalContent'
import Modal from 'react-modal'
import React, { useState, useReducer } from 'react';
import cookie from 'js-cookie';

/* TODO:
  - display categories in add/update modals. might have to wait for categories to be finished.
  - live updates: change quantities when firebase updates */

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
          count: parseInt(action.value)
        }
      }            
      case 'editItemPackSize': {
        return {
          ...state,
          packSize: parseInt(action.value)
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
  const [barcodeError, setBarcodeError] = useState('');
  
  // Manage form State (look up useReducer tutorials if unfamiliar)
  const [ state, dispatch ] = useReducer(formReducer, emptyItem)

  if (error) return <div>Failed to load Inventory</div>
  if (!data) return <div>Loading...</div>

  // When a barcode is scanned in the edit-item-lookup modal, look up this barcode in Firebase.
  function handleLookupEdit(barcode) {
    // console.log("just looked up: ", barcode);
    fetch(`/api/inventory/GetItem/${barcode}`)
    .then((result) => {
        result.json().then((data) => {
          if (data.error) {
            /* reset everything except for the barcode */
            setBarcodeError("no existing item with this barcode");
            dispatch({type: "reset"})
            dispatch({type: "editItemBarcode", value: barcode})
            return;
          }
          setBarcodeError('');
          const payload = {
            itemName: data.itemName,
            count: data.count,
            packSize: data.packSize
            // todo: categories
          };
          
          console.log("payload:", payload);
          dispatch({type:'itemLookup', value: payload});
        })
    })
    return 
  }

  function handleLookupAdd(barcode) {
    // console.log("just looked up: ", barcode);
    fetch(`/api/inventory/GetItem/${barcode}`)
    .then((result) => {
        result.json().then((data) => {
          if (!data.error) {
            /* item already exists! */
            setBarcodeError("item already exists with this barcode");
            return;
          }
          setBarcodeError("");
        })
    })
  }

  // When an item is submitted from the add-item or edit-item form, write the updated item to firebase.
  function handleUpdateSubmit(e) {
    e.preventDefault();
    const barcode = state.barcode;                                                        // required
    const itemName = state.itemName;                                                      // required
    const packSize = state.packSize ? state.packSize : 1;                                 // defaults to 1
    const quantity = state.count * (e.target.packOption.value == "packs" ? packSize : 1)  // required

    /* todo: if field is empty, just don't update it at all? */

    const payload = JSON.stringify({
      "barcode": barcode,
      "itemName": itemName,
      "packSize": packSize,
      "count": quantity
    });
    fetch('/api/inventory/UpdateItem', { method: 'POST', 
      body: payload,
      headers: {'Content-Type': "application/json", 'Authorization': token}})
    .then((response) => response.json())
    .then(json => {
      console.log("updateItem status:", json);
      if (json.error) {

      } else {
        dispatch({type: 'reset'});
        // setShowEditItem(false);
      }
    })

    // TODO: would be nice to display a success message using toastr or something here (synchronously after firebase call)  
    return
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    // TODO: submit the payload to firebase using firebase API call
    const barcode = state.barcode;                                                        // required
    const itemName = state.itemName;                                                      // required
    const packSize = state.packSize ? state.packSize : 1;                                 // defaults to 1
    const quantity = state.count * (e.target.packOption.value == "packs" ? packSize : 1)  // required

    if (!(barcode && itemName && packSize && quantity)) {
      console.log("field(s) missing")
      return;
    }

    const payload = JSON.stringify({
      "barcode": barcode,
      "itemName": itemName,
      "packSize": packSize,
      "count": quantity,
      "categoryName": {'547G7Gnikt': '547G7Gnikt'}, // todo: fix categories
      /* created by? */
    });

    console.log("payload:", payload)
    fetch('/api/inventory/AddItem', { method: 'POST', 
      body: payload,
      headers: {'Content-Type': "application/json", 'Authorization': token}})
    .then((response) => response.json())
    .then(json => {
      console.log("addItem status:", json);
      if (json.error) {

      } else {
        dispatch({type: 'reset'});
        setShowEditItem(false);
      }
    })

    // TODO: would be nice to display a success message using toastr or something here (synchronously after firebase call)  
    dispatch({type: 'reset'})
    setShowEditItem(false)
    return
  }

  function closeAddItem() {
    setShowAddItem(false); 
    setBarcodeError("");
    dispatch({type:'reset'});
  }
  function closeUpdateItem() {
    setShowEditItem(false); 
    setBarcodeError("");
    dispatch({type:'reset'});
  }

  return (
    <>
      <Layout>
        {/* Add Item Modal */}
        <Modal id="add-item-modal" isOpen={showAddItem} onRequestClose={closeAddItem} ariaHideApp={false}>
          <ModalContent
              onSubmitHandler={handleAddSubmit} 
              formReducer={formReducer} 
              dispatch={dispatch}
              parentState={state}
              isAdd={true}
              barcodeLookup={handleLookupAdd}
              barcodeError={barcodeError}/>
          <button onClick={closeAddItem} type="close" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Close</button>
        </Modal>
        
        {/*  Edit Item Modal  */}
        <Modal id="edit-item-modal" isOpen={showEditItem} onRequestClose={closeUpdateItem} ariaHideApp={false}>
          <ModalContent
              onSubmitHandler={handleUpdateSubmit} 
              formReducer={formReducer}
              dispatch={dispatch}
              parentState={state}
              isAdd={false}
              barcodeLookup={handleLookupEdit}
              barcodeError={barcodeError}/>
          <button onClick={closeUpdateItem} type="close" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Close</button>
        </Modal>
        
        <div className="flex">
          <div className="w-64 bg-gray-200 items-center">
            <Sidebar className="py-4">
              <h1 className="text-3xl font-semibold mb-2">Inventory</h1>
              <div className="my-4">
                <button className="my-1 btn-pantry-blue w-56 rounded-md p-1" onClick={() => setShowAddItem(true)}>Add new item</button>
                <button className="my-1 btn-pantry-blue w-56 rounded-md p-1" onClick={() => setShowEditItem(true)}>Edit existing item</button>
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