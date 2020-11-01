import Link from 'next/link'
import { useRouter } from "next/router";


const ROUTES = [
  { title: "Home", route: "/" },
  { title: "Inventory", route: "/inventory" },
  { title: "Hours", route: "/hours" },
  { title: "Donate", route: "/donate" }
]

export default function Navbar() {
  const linkStyle = "ml-4 px-3 py-2 rounded-md text-sm font-medium leading-5 transition duration-150 ease-in-out"
  const activeLink = `${linkStyle} text-pantry-blue-500 bg-gray-200`
  const inactiveLink = `${linkStyle} text-white hover:text-pantry-blue-500 hover:bg-gray-200 focus:outline-none focus:text-pantry-blue-500 focus:bg-gray-200`
  const router = useRouter();

  return (
    <nav className="bg-pantry-blue-500 text-white p-4 flex">
      <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
        <div className="flex-shrink-0">
          <img className="block h-8 w-auto" src="/images/pantry_logo.png" alt="Pantry logo" />
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