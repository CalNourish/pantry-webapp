import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-500 text-sm pb-4">
      <div className="p-4 mx-auto">
        <ul className="flex items-center justify-center max-w-4xl p-4 mx-auto md:p-8">
          <li className="mx-1">
            <Link href="/"><a className="hover:underline">Privacy</a></Link>
          </li>
          <li className="mx-1">•</li>
          <li className="mx-1">Designed and built with ❤️ by CalNourish</li>
        </ul>
        <div className="relative h-8 p-4">
          <a aria-label="Powered by Vercel" href="https://vercel.com?utm_source=cal-nourish&utm_campaign=oss" title="Powered by Vercel">
            <Image src="/images/powered-by-vercel.svg" layout="fill" alt="Powered by Vercel" />
          </a>
        </div>
      </div>
    </footer>
  );
}