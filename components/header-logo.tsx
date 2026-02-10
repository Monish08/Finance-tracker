import Link from "next/link"
import Image from "next/image"
export default function HeaderLogo() {
  return (
    <Link href={"/"}>
    <div className="items-center hidden lg:flex">
        <Image src={"/logo-favicon.svg"} alt="finance tracker logo" width={50} height={70} />
        <p className="font-semibold text-white text-2xl ml-2.5"> Finance Tracker
        </p>
    </div>
    </Link>
  )
}
