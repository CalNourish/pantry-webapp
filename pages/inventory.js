// inventory page

import useSWR from 'swr';
import Layout from '../components/Layout'
import Table from '../components/Table';


const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Inventory() {
  const { data, error } = useSWR("/api/inventory", fetcher);
  if (error) return <div>Failed to load notifications</div>
  if (!data) return <div>Loading...</div>

  return (
    <>
      <Layout>
        <div className="flex">
          <div className="flex-none w-64">
            {/* <Sidebar className="py-4">
              <h1>Inventory</h1>
              <div className="my-4">
                <button className="my-1 btn btn-pantry-blue w-56">Add new item</button>
                <button className="my-1 btn btn-outline w-56">Edit existing item</button>
              </div>
            </Sidebar> */}
          </div>
          <div className="py-4 px-8">
            <Table className="table-auto my-1" data={data}></Table>
          </div>
        </div>
      </Layout>
    </>
  )
}