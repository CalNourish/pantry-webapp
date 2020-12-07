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

  const [show, setShow] = useState(false);

  const closeModalHandler = () => setShow(false)
  const openModalHandler = () => setShow(true)

  const handleAddItem = () => {
    alert("adding item")
  }

  const handleEditItem = () => {
    alert("editing item")
  }
  if (error) return <div>Failed to load notifications</div>
  if (!data) return <div>Loading...</div>
  return (
    <>
      <Layout>
        {/* <Modal show={show} closeModalHandler={closeModalHandler}></Modal> */}
        <Modal isOpen={show} onRequestClose={closeModalHandler}>
          <ModalContent/>
          <button onClick={closeModalHandler}>Close</button>
        </Modal>
        <div className="flex">
          <div className="flex-none w-64">
            <Sidebar className="py-4">
              <h1>Inventory</h1>
              <div className="my-4">
                <button className="my-1 btn btn-pantry-blue w-56" onClick={openModalHandler}>Add new item</button>
                <button className="my-1 btn btn-outline w-56" onClick={handleEditItem}>Edit existing item</button>
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