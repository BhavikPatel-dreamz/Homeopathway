import Image from 'next/image'
import Link from 'next/link'


export default function Logo() {
  return (
    <div>
            <Link href="/" className="w-[60px] md:w-[90px] lg:w-[100px] block">
                <Image height={100} width={90} className="w-full h-full object-contain"  src="/header-logo.svg" alt="" />
            </Link>
          </div>
  )
}
