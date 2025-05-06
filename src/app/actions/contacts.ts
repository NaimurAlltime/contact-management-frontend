"use server"

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function getContacts() {
  try {
    const sessionCookie = (await cookies()).get("session")
    if (!sessionCookie?.value) {
      return []
    }

    const session = JSON.parse(sessionCookie.value)

    const response = await fetch(`${API_URL}/contacts`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!response.ok) {
      throw new Error("Failed to fetch contacts")
    }

    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return []
  }
}
