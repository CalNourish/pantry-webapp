import Image from 'next/image'
import { useRouter } from "next/router";
import { useUser } from '../context/userContext'
import { useState } from 'react'

const UNAUTH_ROUTES = [
  { title: "Home", route: "/" },
  { title: "Inventory", route: "/inventory" },
  { title: "Hours", route: "/hours" },
]

const UNAUTH_SIGNEDIN_ROUTES = [
  { title: "Home", route: "/" },
  { title: "Inventory", route: "/inventory" },
  { title: "Hours", route: "/hours" },
  { title: "Order", route: "/order"},
]

const AUTH_SIGNEDIN_ROUTES = [
  { title: "Home", route: "/" },
  { title: "Inventory", route: "/inventory" },
  { title: "Hours", route: "/hours" },
  { title: "Order", route: "/order"},
  { title: "Checkout", route: "/checkout"},
  { title: "Orders", route: "/orders"}

]


export default function Navbar() {
  const linkStyle = "block py-2 pr-3 pl-3 text-white rounded hover:bg-pantry-blue-400 " +
    "md:ml-4 md:px-3 md:py-2 md:text-sm md:font-medium md:hover:bg-pantry-blue-500"
  const activeLink = `${linkStyle} text-white`;
  const inactiveLink = `${linkStyle} text-gray-400 hover:text-white`;
  const router = useRouter();
  const { loadingUser, user } = useUser()
  
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [showTabs, setShowTabs] = useState(false)

  var routes = UNAUTH_ROUTES;
  var name = "";
  var userType = "";

  // if they're signed in 
  if (user) {
    name = user.displayName;
    routes = UNAUTH_SIGNEDIN_ROUTES
    // if they're an admin
    if (user.authorized === "true") {
      console.log("This is an authorized user");
      routes = AUTH_SIGNEDIN_ROUTES;
      userType = "Administrator";
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
      <a className="" href="/">
        <Image className="block h-10 w-auto" src="/images/pantry_logo.png" alt="Pantry logo" priority="true" height="32" width="32"/>
      </a>

      <div className='flex-grow mr-3 md:order-2 md:flex-grow-0'>
        {!user ? <a className="bg-gray-100 text-gray-700 rounded px-3 py-1 float-right" href="/signin">Sign In</a> :
          <div className="flex flex-col float-right">
            {/* circle with user initials */}
            <button className="focus:outline-none w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold truncate" onClick={toggleUserDropdown}>
              {name.split(" ").map((n)=>n[0]).join("")}
            </button>

            {/* User Info / Sign-Out Button */}
            <div className={(showUserInfo ? "" : "hidden ") + 
              "z-50 my-4 text-base list-none bg-white rounded divide-y divide-gray-200 shadow absolute mt-10 right-0 mr-5"} id="dropdown">
              <div className="py-3 px-4">
                <span className="block text-sm text-gray-900 font-medium">{name}</span>
                <span className="block text-sm text-gray-500 truncate font-normal">{userType}</span>
              </div>
              <ul className="py-1" aria-labelledby="dropdown">
              {userType === "Administrator" ? <li>
                <a href="/admin" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Admin Page</a>
              </li> : ""}
              <li>
                <a href="/signout" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</a>
              </li>
              </ul>
            </div>
          </div>
        }
      </div>

      {/* Tabs */}
      {/* drop-down show/hide menu buttons for small screens */}
      <button type="button" onClick={toggleShowTabs}
        className="inline-flex items-center p-1 text-sm text-gray-500 rounded-lg hover:bg-pantry-blue-400 focus:outline-none md:hidden" aria-controls="mobile-menu-2" aria-expanded="false">
        <svg className={(showTabs ? "hidden " : "") + "w-6 h-6"} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
        <svg className={(showTabs ? "" : "hidden ") + "w-6 h-6"} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
      
      {/* Tab links */}
      <div className={(showTabs ? "" : "hidden ") + "justify-between w-full md:flex md:w-auto md:order-1 md:flex-grow md:ml-10"}>
          <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
            {routes.map(navigationItem => (
              <li key={navigationItem.title}>
                <a className={navigationItem.route == router.pathname ? activeLink : inactiveLink} href={navigationItem.route}>
                  {navigationItem.title}
                </a>
              </li>
            ))}
          </ul>
      </div>
    </nav>
  )
};