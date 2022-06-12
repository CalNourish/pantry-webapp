import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-400 text-sm pb-4 flex-shrink-0">
      <div className="p-4 mx-auto">
        <ul className="p-2 mx-auto max-w-4xl sm:flex sm:items-center sm:justify-center md:p-4">
          <li className="mx-1 flex justify-center items-center text-center">Designed and built with ❤️ by CalNourish</li>
          <li className="mx-1 flex justify-center items-center">•</li>
          <li className="mx-1 flex justify-center items-center">
            <Link href="/"><a className="hover:underline">Privacy</a></Link>
          </li>
        </ul>
        <div className="relative h-8 p-2">
          <a aria-label="Powered by Vercel" href="https://vercel.com?utm_source=cal-nourish&utm_campaign=oss" title="Powered by Vercel">
            <Image src="/images/powered-by-vercel.svg" layout="fill" alt="Powered by Vercel" />
          </a>
        </div>
      </div>
    </footer>
  );
}