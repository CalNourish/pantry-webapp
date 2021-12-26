import useSWR from 'swr';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import Table from '../components/Table'
import InventoryModal from '../components/InventoryModal'
import Modal from 'react-modal'
import React, { useState, useReducer } from 'react';
import cookie from 'js-cookie';

/* TODO:
  - display categories in add/update modals. might have to wait for categories API to be finished.
  - live updates: change quantities when firebase updates 
  - delete items from page too?
  - general success/error banner?
*/

export default function Inventory() {
  const token = cookie.get("firebaseToken")

  const emptyItem =  {
    itemName: "",
    barcode: "",
    count: "",
    packSize: "",
    categoryName: "",
    lowStock: "",
  };

  const emptyErrors = {
    barcode: "",
    itemName: "",
    count: "",
    packSize: "",
    lowStock: ""
  };

  const emptyStatus = {
    success: "",
    error: ""
  }

  // A reducer to manage the State of the add-item / edit-item forms. 
  function formReducer(state, action) {
    let packOpt = document.getElementById("packOption");
    switch (action.type) { 
      case "reset":
        if (packOpt) packOpt.value = 'individual'
        return emptyItem
      case 'editItemName': {
        setNameError("");
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
        setCountError("");
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
        if (packOpt) packOpt.value = 'individual'
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
  const [errors, setErrors] = useState(emptyErrors);
  const [status, setStatus] = useState(emptyStatus);

  const setBarcodeError = (errorMsg) => setErrors({...errors, barcode: errorMsg})
  const setNameError = (errorMsg) => setErrors({...errors, itemName: errorMsg})
  const setCountError = (errorMsg) => setErrors({...errors, count: errorMsg})

  const setStatusSuccess = (msg) => {
    setStatus({error: "", success: msg})
    setTimeout(() => setStatus({...status, success: ""}), 5000);
  }
  const setStatusError = (msg) => setStatus({error: msg, success: ""})

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
            packSize: data.packSize,
            lowStock: data.lowStock
            // todo: categories
          };
          // console.log("payload:", payload);
          dispatch({type:'itemLookup', value: payload});
        })
    })
    return 
  }

  function handleLookupAdd(barcode) {
    if (!barcode) {
      setBarcodeError("missing item barcode");
      return;
    }

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
  function handleUpdateSubmit() {
    const barcode = state.barcode;                                                                          // required
    const itemName = state.itemName;                                                                        // required
    const packSize = state.packSize ? state.packSize : 1;                                                   // defaults to 1
    const quantity = state.count * (document.getElementById("packOption").value == "packs" ? packSize : 1)  // required
    const lowStock = state.lowStock ? state.lowStock : -1;                                                  // defaults to -1

    /* todo: if field is empty, just don't include it in payload at all? */

    const payload = JSON.stringify({
      "barcode": barcode,
      "itemName": itemName,
      "packSize": packSize,
      "count": quantity,
      "lowStock": lowStock
    });
    fetch('/api/inventory/UpdateItem', { method: 'POST', 
      body: payload,
      headers: {'Content-Type': "application/json", 'Authorization': token}})
    .then((response) => response.json())
    .then(json => {
      if (json.error) {
        // console.log("update item failure:", json.error);
        setStatusError(`update item failure: ${json.error}`);
      } else {
        console.log("update success:", json.message);
        dispatch({type: 'reset'});
        closeUpdateItem();
        setStatusSuccess(`successfully updated: ${itemName} (${barcode})`);
      }
    })

    // TODO: would be nice to display a success message using toastr or something here (synchronously after firebase call)  
    return
  }

  function handleAddSubmit() {
    const barcode = state.barcode;                                                                          // required
    const itemName = state.itemName;                                                                        // required
    const packSize = state.packSize ? state.packSize : 1;                                                   // defaults to 1
    const count = state.count * (document.getElementById("packOption").value == "packs" ? packSize : 1)     // defaults to 0
    const lowStock = state.lowStock ? state.lowStock : -1;                                                  // defaults to -1

    if (!barcode || !itemName) {
      setErrors({
        ...errors,
        barcode: barcode ? errors.barcode : "missing item barcode",
        itemName: itemName ? "" : "missing item name",
      });
      return
    }

    const payload = JSON.stringify({
      "barcode": barcode,
      "itemName": itemName,
      "packSize": packSize,
      "count": count,
      "categoryName": {'547G7Gnikt': '547G7Gnikt'}, // todo: fix categories
      "lowStock": lowStock
      /* created by? */
    });

    console.log("payload:", payload)
    fetch('/api/inventory/AddItem', { method: 'POST', 
      body: payload,
      headers: {'Content-Type': "application/json", 'Authorization': token}})
    .then((response) => response.json())
    .then(json => {
      if (json.error) {
        setStatusError(`add item failure: ${json.error}`) 
      } else {
        // console.log(`successfully added item ${itemName} (${barcode})`)
        dispatch({type: 'reset'});
        setErrors(emptyErrors);
        closeAddItem();
        setStatusSuccess(`successfully added: ${itemName} (${barcode})`);
      }
    })
    return
  }

  function closeAddItem() {
    setShowAddItem(false); 
    setErrors(emptyErrors);
    dispatch({type:'reset'});
    setStatus({
      ...status, error: ""
    })
  }
  function closeUpdateItem() {
    setShowEditItem(false); 
    setErrors(emptyErrors);
    dispatch({type:'reset'});
    setStatus({
      ...status, error: ""
    })
  }

  return (
    <>
      <Layout>
        {/* Add Item Modal */}
        <Modal id="add-item-modal" isOpen={showAddItem} onRequestClose={closeAddItem}>
          <InventoryModal
              onSubmitHandler={handleAddSubmit} 
              onCloseHandler={closeAddItem}
              dispatch={dispatch}
              parentState={state}
              isAdd={true}
              barcodeLookup={handleLookupAdd}
              errors={errors}
              status={status}/>
        </Modal>
        
        {/*  Edit Item Modal  */}
        <Modal id="edit-item-modal" isOpen={showEditItem} onRequestClose={closeUpdateItem}>
          <InventoryModal
              onSubmitHandler={handleUpdateSubmit} 
              onCloseHandler={closeUpdateItem}
              dispatch={dispatch}
              parentState={state}
              isAdd={false}
              barcodeLookup={handleLookupEdit}
              errors={errors}
              status={status}/>
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
            {status.success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-3">{status.success}</div>}
            <Table className="table-auto my-1" data={data}></Table>
          </div>
        </div>
      </Layout>
    </>
  )
}