import useSWR from 'swr';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import Table from '../components/Table'
import ModalContent from '../components/ModalContent'
import Modal from 'react-modal'
import React, { useState } from 'react';
import { ToastMessage } from "react-toastr";
import toastr from 'toastr'




export default function Inventory() {

  const emptyItem =  {
    item: {
        itemName: "",
        barcode: "",
        count: "",
        packSize: "",
        categories: "",
        lowStock: "",
    }
  }
  const fetcher = (url) => fetch(url).then((res) => res.json())
  const { data, error } = useSWR("/api/inventory", fetcher);

  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEditItemLookup, setShowEditItemLookup] = useState(false);
  const [itemLookup, setItemLookup] = useState(emptyItem);

  if (error) return <div>Failed to load Inventory</div>
  if (!data) return <div>Loading...</div>

  function handleItemLookupSubmit(barcode) {
    // todo: look barcode up in the database
    // clear barcode from form
    const itemPayload = {
      itemName: "1",
      barcode: "2",
      count: "3",
      packSize: "4",
      categories: "",
      lowStock: "5",
    }
    setItemLookup(itemPayload) 
    console.log("itemLookup: ", itemLookup)
    return 
  }

  function handleItemSubmit(itemPayload) {
    // submit to firebase
    console.log("make firebase call")
    console.log("this is what would be in it: ", itemPayload)

    // .then
    setItemLookup(emptyItem)
    toastr.info('Page Loaded!');
    console.log("make  call")

    // setShowSuccess(true)
    
    return
  }

  function handleAddAnother() {
    // need to clear the form >:(
    setShowSuccess(false)
    setShowAddItem(true)
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
          <ModalContent item={itemLookup} onSubmitHandler={handleItemSubmit}/>
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
              <input type="text" name="itemName" required/>
            </div>

          <button className="bg-gray-300 p-2 rounded-md" onClick={() => {
            setShowEditItemLookup(false)
            setShowEditItem(true)
            handleItemLookupSubmit() // todo get barcode value

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
          <ModalContent item={itemLookup} onSubmitHandler={handleItemSubmit}/>  {/* need to pass a handler (defined here) to modal content so that it can modify inventory state */}
          <button onClick={() => setShowEditItem(false)}>Close</button>
        </Modal>

        {/* Success */}
        <Modal id="success-modal" isOpen={showSuccess} onRequestClose={() => setShowSuccess(false)} 
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
          <div>
            Success!
          </div>
          <button onClick={() => setShowSuccess(false)}>Close</button>
          <button onClick={() => handleAddAnother()}>Add Another</button>

        </Modal>
        
        <div className="flex">
          <div className="flex-none w-64">
            <Sidebar className="py-4">
              <h1>Inventory</h1>
              <div className="my-4">
                <button className="my-1 btn-pantry-blue w-56 " onClick={() => setShowAddItem(true)}>Add new item</button>
                <button className="my-1 btn-pantry-blue  w-56" onClick={() => setShowEditItemLookup(true)}>Edit existing item</button>
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