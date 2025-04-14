"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff, CreditCard, User, Lock } from "lucide-react"
import axios from "axios"
import Cookies from "js-cookie"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Add request interceptor to add auth token to all requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Define profile data interface
interface ProfileData {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  phoneNo: string
  country: string
  currency: string
  ownsSite: boolean
  numberOfSites: number
  hasDoFollowLinks: boolean
  sellingArticles: boolean
  sellingArticlesUrl: string | null
  businessName: string
  businessType: string | null
  walletAddress: string
  walletBalance: number
  referralCode: string
  isaffiliateRequested: boolean
  isAffiliate: boolean
  isApproved: boolean
  approvedby: string | null
  otp: string | null
  otpExpiresAt: string | null
  isVerified: boolean
  monthlyBudget: string | null
  referedBy: string
  permissions: string | null
  comissions: string | null
  resetPasswordToken: string | null
  resetPasswordExpiresAt: string | null
}

// Define form schemas
const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
})

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

const walletFormSchema = z.object({
  walletAddress: z.string().min(1, { message: "Wallet address is required." }),
  currency: z.string().min(1, { message: "Currency is required." }),
})

export default function Profile() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  })

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Wallet form
  const walletForm = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      walletAddress: "",
      currency: "",
    },
  })

  // Fetch profile data
  useEffect(() => {
    async function fetchProfileData() {
      try {
        setIsLoading(true)
        const response = await api.get("/v1/auth/get-profile")
        setProfileData(response.data)

        // Update form default values
        profileForm.reset({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
        })

        walletForm.reset({
          walletAddress: response.data.walletAddress,
          currency: response.data.currency,
        })

        setError(null)
      } catch (err) {
        console.error("Error fetching profile data:", err)
        setError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  async function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    try {
      await api.put("/v1/auth/update-profile", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      })
      toast.success("Profile updated successfully")

      // Update local state
      if (profileData) {
        setProfileData({
          ...profileData,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        })
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      toast.error("Failed to update profile")
    }
  }

  async function onPasswordSubmit(data: z.infer<typeof passwordFormSchema>) {
    try {
      await api.put("/v1/auth/update-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success("Password updated successfully")
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      console.error("Error updating password:", err)
      toast.error("Failed to update password")
    }
  }

  async function onWalletSubmit(data: z.infer<typeof walletFormSchema>) {
    try {
      await api.put("/v1/auth/update-wallet", {
        walletAddress: data.walletAddress,
        currency: data.currency,
      })
      toast.success("Wallet information updated successfully")

      // Update local state
      if (profileData) {
        setProfileData({
          ...profileData,
          walletAddress: data.walletAddress,
          currency: data.currency,
        })
      }
    } catch (err) {
      console.error("Error updating wallet:", err)
      toast.error("Failed to update wallet information")
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Password</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Wallet</span>
            </TabsTrigger>
          </TabsList>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <TabsContent value="profile" className="lg:col-span-3">
              <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-primary">Edit Profile</CardTitle>
                  <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-5 w-20 mb-2" />
                      <Skeleton className="h-10 w-full mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-primary">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500">{error}</div>
            <Button className="mt-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md py-5" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Password</span>
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Wallet</span>
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <TabsContent value="profile" className="lg:col-span-3">
            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-primary">Edit Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} 
                             readOnly/>
                          </FormControl>
                          <FormDescription>This email will be used for account-related notifications.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md py-5"
                    >
                      Save Profile
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="lg:col-span-3">
            <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-primary">Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter your current password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">
                                  {showCurrentPassword ? "Hide password" : "Show password"}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>Password must be at least 8 characters long.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your new password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">
                                  {showConfirmPassword ? "Hide password" : "Show password"}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md py-5"
                    >
                      Update Password
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="lg:col-span-3">
            <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-primary">Wallet Details</CardTitle>
                <CardDescription>Manage your wallet information and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Balance</h3>
                  <p className="text-3xl font-bold">
                    {profileData?.walletBalance} {profileData?.currency}
                  </p>
                </div>
                <Form {...walletForm}>
                  <form onSubmit={walletForm.handleSubmit(onWalletSubmit)} className="space-y-6">
                    <FormField
                      control={walletForm.control}
                      name="walletAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wallet Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your wallet address" {...field} />
                          </FormControl>
                          <FormDescription>Your unique wallet identifier.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={walletForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* Only show the current currency from the API */}
                              <SelectItem value={profileData?.currency || ""}>{profileData?.currency || ""}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Your account currency.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md py-5"
                    >
                      Update Wallet
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

