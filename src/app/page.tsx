"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      })
    }
  }, [])

  const handleFirstContact = () => {
    if (user) {
      router.push("/contacts")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl"
      >
        <h1
          ref={titleRef}
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          Connect with Your Network
        </h1>
        <p className="text-lg mb-8 text-muted-foreground">
          Manage your contacts, make calls, and send messages - all in one place.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="lg"
            onClick={handleFirstContact}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full"
          >
            First Contact
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
