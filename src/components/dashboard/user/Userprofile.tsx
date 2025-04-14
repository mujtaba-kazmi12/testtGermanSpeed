"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getProfile, updateProfile, updatePassword } from "@/app/[locale]/Services/ProfileService"
import { countries } from "@/lib/countries"
import { Eye, EyeOff, User } from "lucide-react"

export default function EditProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState({ firstName: false, lastName: false, country: false })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("Fetching profile...")

      try {
        const response = await getProfile(setError)
        console.log("API Response:", response)

        // Check if response exists and has data
        if (response) {
          // Direct access to response data (not nested under data property)
          // This matches your API response structure
          setProfile({
            firstName: response.firstName || "",
            lastName: response.lastName || "",
            email: response.email || "",
            country: response.country || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          })

          console.log("Profile updated:", {
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email,
            country: response.country,
          })

          // Add this inside your useEffect after setting the profile
          console.log("Country from API:", response.country)
          console.log("Available countries:", countries)
        }
      } catch (error) {
        console.error("Profile fetch error:", error)
        toast.error("Error", {
          description: error instanceof Error ? error.message : "Failed to fetch profile",
          duration: 3000,
        })
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }))

    // Remove error indication on input for profile fields
    if (name === "firstName" || name === "lastName" || name === "country") {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Updating profile with data:", profile)

      // Profile Update Payload
      const profilePayload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        country: profile.country,
        currentPassword: "", // Empty string to satisfy TypeScript
        newPassword: "",
        confirmPassword: "",
      }

      // Password Update Payload (only if fields are filled)
      const isPasswordChange = profile.currentPassword && profile.newPassword && profile.confirmPassword

      // Hit profile update endpoint
      const profileResponse = await updateProfile(profilePayload, setError)
      console.log("Profile Update API Response:", profileResponse)

      let successMessage = ""
      let hasProfileUpdate = false
      let hasPasswordUpdate = false

      // Check if the response contains a success message
      if (
        profileResponse &&
        (profileResponse.status === 200 ||
          profileResponse.message?.includes("success") ||
          (profileResponse.data && profileResponse.data.message?.includes("success")))
      ) {
        setIsEditing(false)
        successMessage = "Profile updated successfully"
        hasProfileUpdate = true
      } else {
        const errorMessage =
          profileResponse?.data?.message || profileResponse?.message || "An unexpected error occurred"
        setError(errorMessage)
        toast.error("Error", {
          description: errorMessage,
          duration: 3000,
        })
        setLoading(false)
        return
      }

      // If password fields are filled, hit password update endpoint
      if (isPasswordChange) {
        if (profile.newPassword !== profile.confirmPassword) {
          const passwordMismatchError = "New password and confirm password do not match."
          toast.error("Error", {
            description: passwordMismatchError,
            duration: 3000,
          })
          setLoading(false)
          return
        }

        const passwordResponse = await updatePassword(profile.currentPassword, profile.newPassword)
        console.log("Password Update API Response:", passwordResponse)

        if (passwordResponse?.error) {
          setError(passwordResponse.error)
          toast.error("Error", {
            description: passwordResponse.error,
            duration: 3000,
          })
        } else {
          hasPasswordUpdate = true
          // Only change the message if both were updated
          if (hasProfileUpdate) {
            successMessage = "Profile and password updated successfully"
          } else {
            successMessage = "Password updated successfully"
          }
        }
      }

      // Show a single success toast with the appropriate message
      if (hasProfileUpdate || hasPasswordUpdate) {
        toast.success("Success", {
          description: successMessage,
          duration: 3000,
        })
        console.log(successMessage)
      }
    } catch (error: any) {
      console.error("Update error:", error)
      const errorMessage = error?.response?.data?.message || "An unexpected error occurred"
      setError(errorMessage)
      toast.error("Error", {
        description: errorMessage,
        duration: 3000,
      })
    }

    setLoading(false)
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    if (field === "current") {
      setShowCurrentPassword(!showCurrentPassword)
    } else if (field === "new") {
      setShowNewPassword(!showNewPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
  }

  return (
    <div className="w-full my-6 mx-auto bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
      {/* Header with full width inside parent */}
      <div className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6">
        <h2 className="text-white text-xl font-semibold">
          My Profile
        </h2>
        <p className="text-white/80 text-sm mt-1">
          Manage your account information and settings
        </p>
      </div>
      <div className="p-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 mb-8">
          <div className="flex space-x-4 items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
              {profile.firstName && profile.firstName[0] ? (
                <span className="text-2xl font-bold">{profile.firstName[0]?.toUpperCase()}</span>
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-slate-500">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-2 rounded-md transition-all ${isEditing ? "bg-slate-100 text-slate-800 hover:bg-slate-200" : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"}`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          <div>
            <h3 className="font-bold text-lg text-slate-800 mb-4 pb-2 border-b border-slate-200">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-3 border rounded-md ${errors.firstName ? "border-red-500" : "border-slate-200"} ${isEditing ? "bg-white focus:ring-2 focus:ring-violet-400 focus:border-transparent" : "bg-slate-50"} transition-all`}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-3 border rounded-md ${errors.lastName ? "border-red-500" : "border-slate-200"} ${isEditing ? "bg-white focus:ring-2 focus:ring-violet-400 focus:border-transparent" : "bg-slate-50"} transition-all`}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled={true}
                  className="w-full p-3 border border-slate-200 rounded-md bg-slate-50 text-slate-500"
                />
                <p className="text-xs text-slate-500 mt-1">Email address cannot be changed</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-3 border rounded-md ${errors.country ? "border-red-500" : "border-slate-200"} ${isEditing ? "bg-white focus:ring-2 focus:ring-violet-400 focus:border-transparent" : "bg-slate-50"} transition-all`}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.value} value={country.label}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isEditing && (
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-4 pb-2 border-b border-slate-200">Change Password</h3>
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={profile.currentPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-slate-200 rounded-md pr-10 bg-white focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-violet-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <label className="text-sm font-medium text-slate-700 mb-1 block">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={profile.newPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-slate-200 rounded-md pr-10 bg-white focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-violet-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={profile.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-slate-200 rounded-md pr-10 bg-white focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-violet-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-md hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

