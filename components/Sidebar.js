export default function Sidebar({children, className}) {
  return (
    <div className={`${className} px-4 bg-gray-200 flex flex-col h-screen w-full sticky top-0`}>
      <div>
        {children}
      </div>
    </div>
  )
}