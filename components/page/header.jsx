"use client"
import { ModeToggle } from "../ModeToggle";
import Logo from "./logo";
import { Button } from "../ui/button";
import Search from "./search";
import { ChevronDown, ChevronLeft, Share2, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export default function Header() {
    const path = usePathname();
    const { data: session } = useSession();
    return (
        <header className="grid gap-2 pt-5 px-5 pb-5 md:px-20 lg:px-32">
            <div className="flex items-center sm:justify-between w-full gap-2">
                {path == "/" ? (
                    <div className="flex items-center gap-1">
                        <Logo />
                        <ModeToggle />
                    </div>
                ) : (
                    <div className="flex justify-between w-full items-center gap-1">
                        <Logo />
                        <Button className="rounded-full sm:hidden h-8 px-3" asChild><Link href="/" className="flex items-center gap-1"><ChevronLeft className="w-4 h-4" />Back</Link></Button>
                    </div>
                )}
                <div className="hidden sm:flex items-center gap-3 w-full max-w-md">
                    <Search />
                    {path != "/" && (
                        <Button className="h-10 px-3" asChild><Link href="/" className="flex items-center gap-1"><ChevronLeft className="w-4 h-4" />Back</Link></Button>
                    )}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/playlists">Playlists</Link>
                    </Button>
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 px-3">
                                    <User className="w-4 h-4 mr-2" /> Profile
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Signed in</DropdownMenuLabel>
                                <DropdownMenuItem className="opacity-80 whitespace-pre-wrap break-all select-text">
                                    {session.user?.email || "Unknown"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "https://hearly.onrender.com/" })}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/register">Register</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
