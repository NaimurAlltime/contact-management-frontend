"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function login(formData: FormData) {
  try {
    const email = formData.get("email")
    const password = formData.get("password")

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.message || "Invalid credentials" }
    }

    // Store user data and token in a cookie
    const { token, user } = result.data
    const session = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      token,
    }

    ;(await cookies()).set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    revalidatePath("/contacts")
    revalidatePath("/profile")

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function signup(formData: FormData) {
  try {
    // Convert FormData to a plain object
    const formDataObj = Object.fromEntries(formData.entries())

    // Remove the file from the object as it needs special handling
    const { profileImage, ...userData } = formDataObj

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.message || "Registration failed" }
    }

    // If there's a profile image, upload it separately
    if (profileImage && profileImage instanceof File && profileImage.size > 0) {
      const { token, user } = result.data
      const imageFormData = new FormData()
      imageFormData.append("profileImage", profileImage)

      await fetch(`${API_URL}/users/${user.id}/profile-image`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imageFormData,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function logout() {
  (await cookies()).delete("session")
  revalidatePath("/")
  redirect("/")
}

export async function getCurrentUser() {
  const sessionCookie = (await cookies()).get("session")

  if (!sessionCookie?.value) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value)
  } catch (error) {
    console.error("Failed to parse session:", error)
    return null
  }
}
