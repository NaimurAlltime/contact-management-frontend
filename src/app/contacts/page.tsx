"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { getContacts } from "@/app/actions/contacts"

interface Contact {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  whatsappNumber: string
  profileImage?: string
  availableFrom: string // "10:00"
  availableTo: string // "17:00"
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
        return
      }

      fetchContacts()
    }
  }, [user, authLoading, router])

  const fetchContacts = async () => {
    try {
      const data = await getContacts()
      setContacts(data)
    } catch (error) {
      console.error("Failed to fetch contacts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isAvailable = (from: string, to: string) => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = hours * 60 + minutes

    const [fromHours, fromMinutes] = from.split(":").map(Number)
    const [toHours, toMinutes] = to.split(":").map(Number)

    const fromTime = fromHours * 60 + fromMinutes
    const toTime = toHours * 60 + toMinutes

    return currentTime >= fromTime && currentTime <= toTime
  }

  const handleCall = (phoneNumber: string, available: boolean) => {
    if (available) {
      window.location.href = `tel:${phoneNumber}`
    }
  }

  const handleWhatsApp = (whatsappNumber: string, available: boolean) => {
    if (available) {
      // Remove any non-numeric characters
      const formattedNumber = whatsappNumber.replace(/\D/g, "")
      window.open(`https://wa.me/${formattedNumber}`, "_blank")
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        Contact List
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {contacts.map((contact, index) => {
            const available = isAvailable(contact.availableFrom, contact.availableTo)

            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                          <AvatarImage
                            src={contact.profileImage || "/placeholder.svg?height=64&width=64"}
                            alt={contact.fullName}
                          />
                          <AvatarFallback>{contact.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{contact.fullName}</h3>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                          <p className="text-sm">{contact.phoneNumber}</p>
                          <div className="flex items-center mt-1">
                            <div
                              className={`h-2 w-2 rounded-full mr-2 ${available ? "bg-green-500" : "bg-red-500"}`}
                            ></div>
                            <span className="text-xs text-muted-foreground">
                              {available ? "Available now" : "Unavailable"}
                              <span className="ml-1">
                                ({contact.availableFrom} - {contact.availableTo})
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex border-t">
                      <Button
                        variant="ghost"
                        className={`flex-1 rounded-none py-6 ${!available ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handleCall(contact.phoneNumber, available)}
                        disabled={!available}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Call Now
                      </Button>

                      <div className="w-px bg-border"></div>

                      <Button
                        variant="ghost"
                        className={`flex-1 rounded-none py-6 ${!available ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handleWhatsApp(contact.whatsappNumber, available)}
                        disabled={!available}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No contacts available.</p>
        </div>
      )}
    </div>
  )
}
