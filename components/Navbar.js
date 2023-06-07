import { useRouter } from "next/router";
import { useUser } from '../context/userContext'
import { useState } from 'react'
import { server } from '../pages/_app.js'

const DISABLE_PUBLIC_INVENTORY = true;

let UNAUTH_ROUTES = [
  { title: "Home", route: "/" },
  { title: "Hours", route: "/hours" },
  { title: "Inventory", route: "/inventory" },
]

let UNAUTH_SIGNEDIN_ROUTES = [
  { title: "Home", route: "/" },
  { title: "Hours", route: "/hours" },
  { title: "Inventory", route: "/inventory" },
  { title: "Order", route: "/order"},
]

// Hide "inventory" route if public inventory is disabled
if (DISABLE_PUBLIC_INVENTORY) {
  UNAUTH_ROUTES.splice(2)
  UNAUTH_SIGNEDIN_ROUTES.splice(3)
}

const AUTH_SIGNEDIN_ROUTES = [
  { title: "Home", route: "/" },
  { title: "Inventory", route: "/inventory" },
  { title: "Hours", route: "/hours" },
  { title: "Order", route: "/order"},
  { title: "Check in", route: "/checkin"},
  //{ title: "Grad Check in", route: "/checkinGrad"},
  { title: "Checkout", route: "/checkout"},
  { title: "Bag Packing", route: "/bagPacking"}
]

export default function Navbar() {
  const linkStyle = "w-full relative inline-block py-2 pr-3 pl-3 text-white rounded hover:bg-pantry-blue-400 " +
    "xl:ml-4 xl:px-3 xl:py-2 xl:text-sm xl:font-medium xl:hover:bg-pantry-blue-500"
  const activeLink = `${linkStyle} text-white`;
  const inactiveLink = `${linkStyle} text-gray-300 hover:text-white`;
  const router = useRouter();
  const { user, loadingUser, logout } = useUser()
  
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [showTabs, setShowTabs] = useState(false)
  const [numNewOrders, setNumOrders] = useState(false)

  var routes = UNAUTH_ROUTES;
  var name = "";
  var userType = "";

  // if they're signed in 
  if (user) {
    name = user.displayName;
    routes = UNAUTH_SIGNEDIN_ROUTES
    // if they're an admin
    if (user.authorized) {
      routes = AUTH_SIGNEDIN_ROUTES;
      userType = "Administrator";

      // update numNewOrders
      if (numNewOrders === false) {
        fetch(`${server}/api/orders/GetOrdersByStatus?status=open`, { method: 'GET',
          headers: {'Content-Type': "application/json", 'Authorization': user.authToken}
        })
        .then(resp => resp.json())
        .then(newOrders => {
          if (newOrders && !newOrders.error)
            setNumOrders(newOrders ? Object.keys(newOrders).length : 0)
        })
        .catch(err => {
          console.log("Error getting number of new orders:", err)
        })
      }
    }
  }

  function toggleUserDropdown() {
    setShowUserInfo(!showUserInfo)
  }

  function toggleShowTabs() {
    setShowTabs(!showTabs)
  }

  return (
    <nav className="bg-pantry-blue-500 text-white p-4 flex flex-wrap justify-between items-center overflow-visible flex-shrink-0">
      {/* Pantry Logo */}
      <a className="h-10" href="/">
        <img className="block h-full w-auto" src="/images/pantry_logo.png" alt="Pantry logo" priority="true" height="32" width="32"/>
      </a>

      {/* User Info */}
      <div className='flex-grow mr-3 xl:order-2 xl:flex-grow-0'>
        {!user ?
          !loadingUser && <a className="bg-gray-50 text-gray-600 rounded px-3 py-1 float-right" href="/signin">Sign In</a>
          :
          <div className="flex flex-col float-right">
            {/* circle with user initials */}
            <button className="focus:outline-none w-8 h-8 rounded-full bg-gray-50 text-gray-600 font-semibold truncate" onClick={toggleUserDropdown}>
              {name.split(" ").map((n)=>n[0]).join("")}
            </button>

            {/* User Info / Sign-Out Button */}
            <div className={(showUserInfo ? "" : "hidden ") + 
              "z-50 my-4 text-base list-none bg-white rounded divide-y divide-gray-100 shadow absolute mt-10 right-0 mr-5"} id="dropdown">
              <div className="py-3 px-4">
                <span className="block text-sm text-gray-900 font-medium">{name}</span>
                <span className="block text-sm text-gray-400 truncate font-normal">{userType}</span>
              </div>
              <ul className="py-1" aria-labelledby="dropdown">
              {userType === "Administrator" ? <li>
                <a href="/admin" className="block py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 dark:text-gray-100 dark:hover:text-white">Admin Page</a>
              </li> : ""}
              <li>
                <button onClick={logout} className="block py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 dark:text-gray-100 dark:hover:text-white">Sign out</button>
              </li>
              </ul>
            </div>
          </div>
        }
      </div>

      {/* Tabs */}
      {/* drop-down show/hide menu buttons for small screens */}
      <button type="button" onClick={toggleShowTabs}
        className="inline-flex items-center p-1 text-sm text-gray-400 rounded-lg hover:bg-pantry-blue-400 focus:outline-none xl:hidden" aria-controls="mobile-menu-2" aria-expanded="false">
        <svg className={(showTabs ? "hidden " : "") + "w-6 h-6"} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
        <svg className={(showTabs ? "" : "hidden ") + "w-6 h-6"} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
      
      {/* Tab links */}
      <div className={(showTabs ? "" : "hidden ") + "justify-between w-full xl:flex xl:w-auto xl:order-1 xl:flex-grow xl:ml-10"}>
          <ul className="flex flex-col w-full mt-4 xl:flex-row xl:space-x-8 xl:mt-0 xl:text-sm xl:font-medium">
            {routes.map(navigationItem => (
              <li key={navigationItem.title}>
                <a className={navigationItem.route == router.pathname ? activeLink : inactiveLink} href={navigationItem.route}>
                  {navigationItem.title}
                  {
                    navigationItem.title == "Bag Packing" && numNewOrders && numNewOrders > 0 &&
                    <span className="ml-4 my-auto items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full xl:ml-0 xl:py-1 xl:absolute xl:top-0 xl:right-0 xl:inline-flex xl:transform xl:translate-x-1/2 xl:-translate-y-1/2">
                      {numNewOrders + " New"}
                    </span>
                  }
                </a>
              </li>
            ))}
          </ul>
      </div>
    </nav>
  )
};