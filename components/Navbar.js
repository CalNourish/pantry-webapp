import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from "next/router";


const ROUTES = [
  { title: "Home", route: "/" },
  { title: "Inventory", route: "/inventory" },
  { title: "Hours", route: "/hours" },
  { title: "Donate", route: "/donate" }
]

export default function Navbar() {
  const linkStyle = "ml-4 px-3 py-2 rounded-md text-sm font-medium leading-5 transition duration-150 ease-in-out"
  const activeLink = `${linkStyle} text-white bg-pantry-blue-900 focus:text-white focus:bg-pantry-blue-600`
  const inactiveLink = `${linkStyle} px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-pantry-blue-700 focus:outline-none focus:text-white focus:bg-pantry-blue-700`
  const router = useRouter();

  return (
    <nav className="bg-pantry-blue-500 text-white p-4 flex">
      <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
        <div className="flex-shrink-0">
          <Image className="block h-8 w-auto" src="/images/pantry_logo.png" alt="Pantry logo" priority="true" height="32" width="32"/>
        </div>
        <div className="">
          <div className="flex">
            {ROUTES.map(navigationItem => (
              <Link href={navigationItem.route}>
                <a href="#" className={ 
                  navigationItem.route == router.pathname ? activeLink : inactiveLink}
                >
                  {navigationItem.title}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
};