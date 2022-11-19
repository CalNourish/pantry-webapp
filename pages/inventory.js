import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import Table from '../components/Table'
import InventoryModal from '../components/InventoryModal'
import TakeInventoryModal from '../components/TakeInventoryModal'
import { useUser } from '../context/userContext'
import { server } from './_app.js'

import Modal from 'react-modal'
import React, { useState, useReducer } from 'react';
import cookie from 'js-cookie';
import firebase from '../firebase/clientApp';

/* For hiding inventory to the public */
const DISABLE_PUBLIC_INVENTORY = true;

export default function Inventory() {
  const token = cookie.get("firebaseToken")

  const emptyItem =  {
    itemName: "",
    barcode: "",
    count: "",
    packSize: "",
    categoryName: {},
    lowStock: "",
    displayPublic: true,
  };

  const emptyErrors = {
    barcode: "",
    itemName: "",
    count: "",
    packSize: "",
    lowStock: "",
    categoryName: ""
  };

  const emptyStatus = {
    loading: false,
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
      case 'editItemDisplayPublic': {
        return {
          ...state,
          displayPublic: action.value
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
        setCategoryError("");
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

  // Manage modal show/don't show State
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showTakeInventory, setShowTakeInventory] = useState(false);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [errors, setErrors] = useState(emptyErrors);
  const [status, setStatus] = useState(emptyStatus);
  const [dataState, changeData] = useState({});
  const [categoryState, setCategories] = useState({});

  const setBarcodeError = (errorMsg) => setErrors({...errors, barcode: errorMsg})
  const setNameError = (errorMsg) => setErrors({...errors, itemName: errorMsg})
  const setCountError = (errorMsg) => setErrors({...errors, count: errorMsg})
  const setCategoryError = (errorMsg) => setErrors({...errors, categoryName: errorMsg})

  var successTimeout;
  const setStatusLoading = () => {
    setStatus({error: "", success: "", loading: true})
  }
  const setStatusSuccess = (msg) => {
    setStatus({loading: false, error: "", success: msg});
    clearTimeout(successTimeout);             // clear old timeout before starting new one
    successTimeout = setTimeout(() => setStatus({...status, success: ""}), 5000);
  }
  const setStatusError = (msg) => setStatus({error: msg, success: "", loading: false})

  // Manage form State (look up useReducer tutorials if unfamiliar)
  const [ state, dispatch ] = useReducer(formReducer, emptyItem)

  if (DISABLE_PUBLIC_INVENTORY) {
    return (
      <Layout>
        <div className='m-4'>Inventory is currently not publically available.</div>
      </Layout>
    )
  }

  /* initialize dataState value */
  const ref = firebase.database().ref('/inventory')
  if (Object.keys(dataState).length == 0) {
    ref.once("value")
    .then(function(resp) {
      let res = resp.val();
      changeData(res);
    })
  }

  /* do this once, after dataState is set */
  if (Object.keys(dataState).length > 0) {
    ref.on("child_changed", snapshot => {
      let barcode = snapshot.val().barcode
      changeData({
        ...dataState,
        [barcode]: snapshot.val()
      });
    });
  }

  if (Object.keys(categoryState).length == 0) {
    fetch(`${server}/api/categories/ListCategories`)
    .then((result) => {
      result.json().then((data) => {
        setCategories(data);
      })
    })
  }

  // opens modal with barcode & fields already completed. used by shortcut edit button.
  function editItem(barcode) {
    setShowEditItem(true);
    dispatch({type: "editItemBarcode", value: barcode});
    handleBarcodeEdit(barcode);
  }

  function showHideItem(barcode, newDisplayPublic) {
    // toggle public visibility
    const payload = JSON.stringify({
      "barcode": barcode,
      "displayPublic": newDisplayPublic
    });

    fetch(`${server}/api/inventory/UpdateItem`, { method: 'POST',
      body: payload,
      headers: {'Content-Type': "application/json", 'Authorization': token}})
    .then((response) => response.json())
    .then(json => {
      if (json.error) {
        console.log(json.error);
      }
    })
  }

  function deleteItem(barcode) {
    if (confirm(`Deleting item with barcode ${barcode}. Are you sure?`)){
      fetch(`${server}/api/inventory/DeleteItem`, { method: 'POST',
        body: JSON.stringify({barcode: barcode}),
        headers: {'Content-Type': "application/json", 'Authorization': token}})
      .then(() => {
        // remove something from dataState
        let { [barcode]: deletedItem, ...newDataState } = dataState
        changeData(newDataState)
        setStatusSuccess(`successfully deleted: ${deletedItem.itemName} (${deletedItem.barcode})`)
      })
    }
  }

  // When a barcode is scanned in the edit-item-lookup modal, look up this barcode in Firebase.
  function handleBarcodeEdit(barcode) {
    if (barcode === "") {
      setBarcodeError('missing item barcode');
      return;
    }
    fetch(`${server}/api/inventory/GetItem/${barcode}`)
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error("Cannot find existing item with this barcode.")
    })
    .then((data) => {
      setBarcodeError('');
      let categories = {};
      for (let idx in data.categoryName) {
        let categoryId = data.categoryName[idx];
        categories[categoryId] = categoryId;
      }

      const payload = {
        itemName: data.itemName,
        count: data.count,
        packSize: data.packSize,
        lowStock: data.lowStock,
        categoryName: categories,
        displayPublic: data.displayPublic
      };
      dispatch({type:'itemLookup', value: payload});
    })
    .catch((err) => {
      /* reset everything except for the barcode */
      setBarcodeError("cannot find existing item with this barcode");
      dispatch({type: "reset"})
      dispatch({type: "editItemBarcode", value: barcode})
    })
  }

  // When a barcode is scanned in the add-item-lookup modal, look up this barcode in Firebase.
  function handleBarcodeAdd(barcode) {
    if (barcode === "") {
      setBarcodeError("missing item barcode");
      return;
    }

    if (Object.keys(dataState).includes(barcode)) {
      /* item already exists! */
      setBarcodeError("item already exists with this barcode");
    } else {
      setBarcodeError("");
    }
  }

  // When an item is submitted from the add-item or edit-item form, write the updated item to firebase.
  function handleUpdateSubmit(e) {
    e.preventDefault();
    setStatusLoading();

    const barcode = state.barcode;                                                                          // required
    const itemName = state.itemName;                                                                        // required
    const packSize = state.packSize ? state.packSize : 1;                                                   // defaults to 1
    const quantity = state.count * (document.getElementById("packOption").value == "packs" ? packSize : 1)  // required
    const lowStock = state.lowStock ? state.lowStock : -1;                                                  // defaults to -1
    const categories = Object.keys(state.categoryName).length ? state.categoryName : undefined;             // defaults to "no change"
    const displayPublic = Boolean(state.displayPublic)                                                      // defaults to true

    const payload = JSON.stringify({
      "barcode": barcode,
      "itemName": itemName,
      "packSize": packSize,
      "count": quantity,
      "lowStock": lowStock,
      "categoryName": categories,
      "displayPublic": displayPublic
    });
    
    fetch(`${server}/api/inventory/UpdateItem`, { method: 'POST',
      body: payload,
      headers: {'Content-Type': "application/json", 'Authorization': token}})
    .then((response) => response.json())
    .then(json => {
      if (json.error) {
        setStatusError(json.error);
      } else {
        dispatch({type: 'reset'});
        closeUpdateItem();
        setStatusSuccess(`successfully updated: ${itemName} (${barcode})`);
      }
    })
  }

  function displayUpdatedInventory() {
    const ref = firebase.database().ref('/inventory')
    ref.once("value")
    .then(function(resp) {
      let res = resp.val();
      changeData(res);
    })
  }

  function resetInventory() {
    if (window.confirm("Reset Inventory?")) {
    fetch(`${server}/api/inventory/ResetInventory`, { method: 'POST',
      headers: {'Content-Type': "application/json", 'Authorization': token}})
    .then((response) => response.json())
    .then(json => {
      if (json.error) {
        setStatusError(json.error);
      } else {
        displayUpdatedInventory();
        setStatusSuccess(`Sucessfully reset inventory`);
      }
    })
  }
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    setStatusLoading();

    const barcode = state.barcode;                                                                          // required
    const itemName = state.itemName;                                                                        // required
    const packSize = state.packSize ? state.packSize : 1;                                                   // defaults to 1
    const count = state.count * (document.getElementById("packOption").value == "packs" ? packSize : 1)     // defaults to 0
    const lowStock = state.lowStock ? state.lowStock : -1;                                                  // defaults to -1
    const displayPublic = Boolean(state.displayPublic);                                                     // defaults to true
    const categories = state.categoryName;                                                                  // required
    let catNum = Object.keys(categories).length;

    if (!barcode || !itemName || !catNum) {
      setErrors({
        ...errors,
        barcode: barcode ? errors.barcode : "missing item barcode",
        itemName: itemName ? "" : "missing item name",
        categoryName: catNum ? "" : "missing category name(s)"
      });
      setStatusError("missing field(s)")
      return
    }

    const payload = {
      "barcode": barcode,
      "itemName": itemName,
      "packSize": packSize,
      "count": count,
      "categoryName": categories,
      "lowStock": lowStock,
      "displayPublic": displayPublic
      /* created by? */
    };

    fetch(`${server}/api/inventory/AddItem`, { method: 'POST', 
      body: JSON.stringify(payload),
      headers: {'Content-Type': "application/json", 'Authorization': token}})
    .then((response) => {
      if (response.status == 500) {
        setStatusError("Internal server error (make sure you're logged in)");
      }
      response.json()
      .then(json => {
        if (json.error) {
          setStatusError(json.error) 
        } else {
          dispatch({type: 'reset'});
          setErrors(emptyErrors);
          closeAddItem();
          setStatusSuccess(`successfully added: ${itemName} (${barcode})`);
          
          // modify dataState to contain the new item
          changeData({
            ...dataState,
            [barcode]: payload
          })
        }
      })
    })
  }

  function closeTakeInventory() {
    setShowTakeInventory(false); 
    setErrors(emptyErrors);
    dispatch({type:'reset'});
    setStatus({
      ...status, loading: false, error: ""
    })
  }

  function closeAddInventory() {
    setShowAddInventory(false); 
    setErrors(emptyErrors);
    dispatch({type:'reset'});
    setStatus({
      ...status, loading: false, error: ""
    })
  }

  function closeAddItem() {
    setShowAddItem(false); 
    setErrors(emptyErrors);
    dispatch({type:'reset'});
    setStatus({
      ...status, loading: false, error: ""
    })
  }

  function closeUpdateItem() {
    setShowEditItem(false); 
    setErrors(emptyErrors);
    dispatch({type:'reset'});
    setStatus({
      ...status, loading: false, error: ""
    })
  }

  const { loadingUser, user } = useUser();
  let authToken = (user && user.authorized === "true") ? token : null;

  if (DISABLE_PUBLIC_INVENTORY && !authToken) {
    return (
      <Layout>
        <div className='m-4'>Inventory is currently not publically available.</div>
      </Layout>
    )
  }

  return (
    <>
      <Layout>
        {!authToken ? "" :
          <>
            {/* Add Item Modal */}
            <Modal id="add-item-modal" isOpen={showAddItem} onRequestClose={closeAddItem} ariaHideApp={false}>
              <InventoryModal
                  onSubmitHandler={handleAddSubmit} 
                  onCloseHandler={closeAddItem}
                  dispatch={dispatch}
                  parentState={state}
                  isAdd={true}
                  barcodeLookup={handleBarcodeAdd}
                  errors={errors}
                  status={status}/>
            </Modal>
            
            {/*  Edit Item Modal  */}
            <Modal id="edit-item-modal" isOpen={showEditItem} onRequestClose={closeUpdateItem} ariaHideApp={false}>
              <InventoryModal
                  onSubmitHandler={handleUpdateSubmit} 
                  onCloseHandler={closeUpdateItem}
                  dispatch={dispatch}
                  parentState={state}
                  isAdd={false}
                  barcodeLookup={handleBarcodeEdit}
                  errors={errors}
                  status={status}/>
            </Modal>

            {/* Take Inventory Modal  */}
            <Modal id="take-inventory-modal" isOpen={showTakeInventory} onRequestClose={closeTakeInventory} ariaHideApp={false}>
            <TakeInventoryModal
                onSubmitHandler={handleUpdateSubmit} 
                barcodeLookup={handleBarcodeEdit}
                onCloseHandler={closeTakeInventory}
                parentState={state}
                isAdd={false}
                dispatch={dispatch}
                errors={errors}
                status={status}
                />
            </Modal>

            {/* Add Inventory Modal  */}
            <Modal id="add-inventory-modal" isOpen={showAddInventory} onRequestClose={closeAddInventory} ariaHideApp={false}>
            <TakeInventoryModal
                onSubmitHandler={handleUpdateSubmit} 
                barcodeLookup={handleBarcodeEdit}
                onCloseHandler={closeAddInventory}
                parentState={state}
                isAdd={true}
                dispatch={dispatch}
                errors={errors}
                status={status}
                />
            </Modal>
          </>
        }
        
        <div className="flex">
          {!(user && user.authorized === "true") ? "" :
              <div className="w-64 items-center">
                <Sidebar className="py-4">
                  <h1 className="text-3xl font-semibold mb-2">Inventory</h1>
                  <div className="my-4">
                    <button className="my-1 btn-pantry-blue w-56 rounded-md p-1" onClick={() => setShowAddItem(true)}>Add new item</button>
                    <button className="my-1 btn-outline w-56 rounded-md p-1" onClick={() => setShowEditItem(true)}>Edit existing item</button>
                    <hr className="my-2 border-gray-400 border-1"/>
                    <button className="my-1 btn-pantry-blue w-56 rounded-md p-1" onClick={() => setShowTakeInventory(true)}>Take Inventory</button>
                    <button className="my-1 btn-outline w-56 rounded-md p-1" onClick={() => setShowAddInventory(true)}>Add Inventory</button>
                    <button className="my-1 btn-pantry-blue w-56 rounded-md p-1" onClick={() => resetInventory()}>Reset Inventory</button>
                  </div>
                  <p className="mb-5 text-sm italic text-gray-600">You can double-click on an item name or count to change the value quickly!</p>
                </Sidebar>
              </div>
          }
          <div className="py-4 px-8">
            {status.success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative mb-3">{status.success}</div>}
            {Object.keys(dataState).length > 0
              ? <Table className="table-auto my-1" data={dataState} categories={categoryState} authToken={authToken}
                       editItemFunc={editItem} deleteItemFunc={deleteItem} showHideItemFunc={showHideItem}></Table>
              : "Loading inventory..."}
          </div>
        </div>
      </Layout>
    </>
  )
}