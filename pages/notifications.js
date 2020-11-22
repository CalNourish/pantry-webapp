import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import NotificationCard from '../components/NotificationCard'
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json())


export default function Notifications() {
  const { data, error } = useSWR('/api/notifications', fetcher)

  const createNotification = (event) => {
    console.log(event)
    console.log(event.target)
    event.preventDefault();
  }

  if (error) return <div>Failed to load notifications</div>

  return (
    <Layout>
      <div className="flex">
        <div className="flex-none w-64">
          <Sidebar className="py-4">
            <h1 className="text-lg">Notifications</h1>
            <div className="text-gray-700">Send a notification to all users</div>
            <form  onSubmit={createNotification}>
              <div class="mt-8">
                <label for="title" class="block text-sm leading-5 font-medium text-gray-700">
                  Title
                </label>
                <p class="mb-1 text-sm text-gray-500">
                  Brief title to store for the message.
                </p>
                <div class="rounded-md shadow-sm">
                  <input id="title" class="form-input p-1 flex-1 block w-full rounded-md transition duration-150 ease-in-out sm:text-sm sm:leading-5" placeholder="Message title"/>
                </div>
              </div>
              <div class="mt-4">
                <label for="message" class="block text-sm leading-5 font-medium text-gray-700">
                  Message
                </label>
                <p class="mb-1 text-sm text-gray-500">
                  Message that users will receive.
                </p>
                <div class="rounded-md shadow-sm">
                  <textarea id="message" rows="3" class="form-textarea mt-1 p-1 block w-full rounded-md transition duration-150 ease-in-out sm:text-sm sm:leading-5" placeholder="Message details" />
                </div>
              </div>
              <button type="submit" className="mt-6 btn btn-pantry-green w-full">Send</button>
            </form>
          </Sidebar>
        </div>
        <div className="py-4 px-8 w-full">
          <h1 className="mb-4 text-lg">Notification History</h1>
          <div> 
          { data ? 
              Object.keys(data).map((key) => {
                return <NotificationCard key={key} title={data[key].title} message={data[key].text} timestamp={data[key].timestamp}/>
              }) 
              :
              <div>Loading notifications...</div>
          }
          </div>
        </div>
      </div>
    </Layout>
  )
}


// export async function getServerSideProps() {
//   // Fetch notification history
//   const notifications = await getNotifications()
//   return {
//     props: {
//       notifications
//     }
//   }
// }
