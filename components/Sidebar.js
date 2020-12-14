export default function Sidebar({children, className}) {
    return (
      <div className={`${className} px-4 bg-gray-200 flex flex-col min-h-screen w-full`}>
        <div>
          {children}
        </div>
      </div>
    )
  }
