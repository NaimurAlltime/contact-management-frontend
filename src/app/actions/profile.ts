"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface ProfileData {
  fullName: string
  email: string
  phoneNumber: string
  whatsappNumber: string
  availableFrom: string
  availableTo: string
}

export async function updateProfile(data: ProfileData) {
  try {
    const sessionCookie = cookies().get("session")
    if (!sessionCookie?.value) {
      return { success: false, error: "Not authenticated" }
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.id

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to update profile" }
    }

    // Update the session cookie with new user data
    const updatedSession = {
      ...session,
      fullName: result.data.fullName,
      email: result.data.email,
    }

    cookies().set("session", JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    revalidatePath("/profile")
    revalidatePath("/contacts")

    return { success: true, data: result.data }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateProfileImage(formData: FormData) {
  try {
    const sessionCookie = cookies().get("session")
    if (!sessionCookie?.value) {
      return { success: false, error: "Not authenticated" }
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.id

    const response = await fetch(`${API_URL}/users/${userId}/profile-image`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to update profile image" }
    }

    // Update the session cookie with new profile image
    const updatedSession = {
      ...session,
      profileImage: result.data.profileImage,
    }

    cookies().set("session", JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    revalidatePath("/profile")
    revalidatePath("/contacts")

    return { success: true, data: result.data }
  } catch (error) {
    console.error("Error updating profile image:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
