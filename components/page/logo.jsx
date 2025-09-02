import Link from "next/link";

export default function Logo() {
    return (
        <Link href="/" className="select-none">
            <div>
                <h1 className="text-2xl font-bold">Hear<span className="opacity-50">ly</span></h1>
            </div>
        </Link>
    )
}