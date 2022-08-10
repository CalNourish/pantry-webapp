export default function Sidebar({children, className}) {
    return (
      <div className={"px-4 bg-gray-100 sm:min-h-screen h-full w-full"}>
        <div className={`sm:sticky sm:top-0 ${className}`}>
          {children}
        </div>
      </div>
    )
  }
