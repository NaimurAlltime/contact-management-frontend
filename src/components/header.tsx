"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export default function Header() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/")
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-20 items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            ContactHub
          </Link>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/contacts">
                    <Button variant="ghost">Contacts</Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.profileImage || "/placeholder.svg?height=40&width=40"}
                            alt={user.fullName}
                          />
                          <AvatarFallback>{user.fullName?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">Sign Up</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </motion.nav>
      </div>
    </header>
  )
}
