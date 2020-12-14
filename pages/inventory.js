import useSWR from 'swr';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import Table from '../components/Table'
import ModalContent from '../components/ModalContent'
import Modal from 'react-modal'
import React, { useState } from 'react';


const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Inventory() {
  const { data, error } = useSWR("/api/inventory", fetcher);

  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);

  if (error) return <div>Failed to load Inventory</div>
  if (!data) return <div>Loading...</div>
  return (
    <>
      <Layout>
        <Modal id="add-item-modal" isOpen={showAddItem} onRequestClose={() => setShowAddItem(false)} 
            style={{
              overlay: {
                backgroundColor: "rgba(128,0,0,0.3)",
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
          <ModalContent/>
          <button onClick={() => setShowAddItem(false)}>Close</button>
        </Modal>
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
          <ModalContent/>
          <button onClick={() => setShowEditItem(false)}>Close</button>
        </Modal>
        <div className="flex">
          <div className="flex-none w-64">
            <Sidebar className="py-4">
              <h1>Inventory</h1>
              <div className="my-4">
                <button className="my-1 btn-pantry-blue w-56 " onClick={() => setShowAddItem(true)}>Add new item</button>
                <button className="my-1 btn-pantry-blue  w-56" onClick={() => setShowEditItem(true)}>Edit existing item</button>
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