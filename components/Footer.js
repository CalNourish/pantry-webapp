import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-500 text-sm">
      <div className="p-4 mx-auto">
        <ul className="flex items-center justify-center max-w-4xl p-4 mx-auto md:p-8">
          <li className="mx-1">
            <Link href="/"><a className="hover:underline">Privacy</a></Link>
          </li>
          <li className="mx-1">•</li>
          <li className="mx-1">Designed and built with ❤️ by CalNourish</li>
        </ul>
      </div>
    </footer>
  );
}