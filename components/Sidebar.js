export default function Sidebar({children, className}) {
    return (
      <div className={`p-4 bg-gray-100 sm:min-h-screen h-full w-full ${className}`}>
        <div className={"sticky top-0"}>
          {children}
        </div>
      </div>
    )
  }
