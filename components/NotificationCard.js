export default function NotificationCard({key, title, message, timestamp}) {
  return (
    <div key={key} className="mb-8 p-2 shadow-md rounded-md w-full">
      <h1 className="font-bold">{title}</h1>
      <p className="mt-2 text-gray-700">{message}</p>
      <p className="mt-6 text-sm text-gray-500">{timestamp}</p>
    </div>
  )
} 