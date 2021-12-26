export default function Sidebar({children, className}) {
    return (
      <div className={"px-4 bg-gray-200 flex flex-col min-h-screen h-full w-full"}>
        <div className={`sticky top-0 ${className}`}>
          {children}
        </div>
      </div>
    )
  }
