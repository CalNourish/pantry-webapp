import useSWR from 'swr';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'

const fetcher = async (...args) => {
  const res = await fetch(...args);
  return res.json();
};

export default function Inventory() {
  const { data } = useSWR("/api/inventory", fetcher);
  return (
    <>
      <Layout>
        <div className="flex">
          <div className="flex-none w-64">
            <Sidebar className="py-4">
              <h1>Inventory</h1>
              <div className="my-4">
                <button className="my-1 btn btn-pantry-blue w-56">Add new item</button>
                <button className="my-1 btn btn-outline w-56">Edit existing item</button>
              </div>
            </Sidebar>
          </div>
          <div className="py-4 px-8">
            <table className="table-auto my-1">
              <thead>
                <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">Potatoes</td>
                  <td className="border px-4 py-2">30</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="border px-4 py-2">Tomatoes</td>
                  <td className="border px-4 py-2">21</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Other</td>
                  <td className="border px-4 py-2">12</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </>
  )
}