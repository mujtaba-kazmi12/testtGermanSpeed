"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ChevronLeft, ChevronRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { countries, countryCodeMap } from "@/lib/countries"
import { currencies } from "@/lib/currencies"
import { Toast } from "@/components/toast/Toast"
import type { VerifyOTPRequestBody } from "@/types/SignUpType"

const API_BASE_URL = "https://newbackend.crective.com/v1"

const gradientTextClass = "bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600"

export default function SignUpForm() {
  const tRegister = useTranslations("auth.register")
  const tOtp = useTranslations("auth.otp")
  const tLogin = useTranslations("auth.login")
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("US")
  const [countryCode, setCountryCode] = useState("+1")

  const formSchema = z.object({
    role: z.enum(["publisher", "advertiser"], {
      required_error: tRegister("zodRoleRequired"),
    }),
    firstName: z.string().min(2, { message: tRegister("zodFirstNameMin") }),
    lastName: z.string().min(2, { message: tRegister("zodLastNameMin") }),
    email: z.string().email({ message: tLogin("zodEmail") }),
    password: z
      .string()
      .min(8, { message: tRegister("zodPasswordMin") })
      .regex(/[A-Z]/, {
        message: tRegister("zodPasswordUppercase"),
      })
      .regex(/[a-z]/, {
        message: tRegister("zodPasswordLowercase"),
      })
      .regex(/[0-9]/, { message: tRegister("zodPasswordNumber") })
      .regex(/[^A-Za-z0-9]/, {
        message: tRegister("zodPasswordSpecial"),
      }),
    businessName: z.string().min(2, { message: tRegister("zodBusinessNameMin") }),
    country: z.string({ required_error: tRegister("zodCountryRequired") }),
    phoneNumber: z.string().min(5, { message: tRegister("zodPhoneMin") }),
    currency: z.string({ required_error: tRegister("zodCurrencyRequired") }),
    numberOfSites: z.number().optional(),
    ownsSite: z.boolean().optional(),
    hasDoFollowLinks: z.boolean().optional(),
    sellingArticles: z.boolean().refine((val) => val === true, {
      message: tRegister("zodSellingArticlesRequired"),
    }),
    sellingArticlesURL: z
      .string()
      .url({ message: tRegister("zodSellingArticlesUrlInvalid") })
      .optional(),
    referedBy: z.string().optional(),
    monthlyBudget: z
      .number()
      .min(1, { message: tRegister("zodMonthlyBudgetMin") })
      .optional(),
  })

  // Updated OTP schema to use string instead of number
  const otpSchema = z.object({
    otpCode: z
      .string()
      .min(6, { message: tOtp("zodOtpMin") })
      .max(6, { message: tOtp("zodOtpMax") })
      .regex(/^\d+$/, { message: "OTP must contain only digits" }),
  })

  // Define types based on the schemas *immediately* after they are defined
  type FormValues = z.infer<typeof formSchema>
  type OtpFormValues = z.infer<typeof otpSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: undefined,
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      businessName: "",
      country: "",
      phoneNumber: "",
      currency: "",
      numberOfSites: 1,
      ownsSite: false,
      hasDoFollowLinks: false,
      sellingArticles: false,
      sellingArticlesURL: "",
      referedBy: "",
      monthlyBudget: 1000,
    },
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otpCode: "",
    },
  })

  const watchRole = form.watch("role")
  const watchSellingArticles = form.watch("sellingArticles")

  const totalSteps = watchRole === "publisher" ? 5 : 4

  const onSubmitAdvertiser = async (data: FormValues) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    
    console.log("Advertiser form submission started", { data })
    setUserEmail(data.email)

    try {
      const requestData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        businessName: data.businessName,
        country: data.country,
        currency: data.currency,
        phoneNumber: data.phoneNumber,
        monthlyBudget: data.monthlyBudget || 1000,
      }

      console.log("📤 Sending request to:", `${API_BASE_URL}/auth/register-user`)

      const response = await axios.post(`${API_BASE_URL}/auth/register-user`, requestData)

      console.log("✅ API Response:", response.data)

      if (response.status === 200) {
        Toast.showSuccess(tRegister("toastSuccessUser"))
        if (response.data?.data?.otp) {
          setReceivedOtp(response.data.data.otp.toString())
          console.log("OTP received:", response.data.data.otp)
        }
        setAccountCreated(true)
      }
    } catch (error: any) {
      console.error("❌ API Error:", error)

      if (axios.isAxiosError(error) && error.response?.status === 400) {
        Toast.showError(tRegister("toastErrorDuplicate"))
      } else {
        Toast.showError(
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : tRegister("toastErrorGeneric"),
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitPublisher = async (data: FormValues) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    
    console.log("Publisher form submission started", { data })
    setUserEmail(data.email)

    try {
      const requestData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        country: data.country,
        phoneNumber: data.phoneNumber,
        numberOfSites: data.numberOfSites || 1,
        ownsSite: data.ownsSite || false,
        hasDoFollowLinks: data.hasDoFollowLinks || false,
        sellingArticles: data.sellingArticles || false,
        businessName: data.businessName,
        currency: data.currency,
        referedBy: data.referedBy || "",
        sellingArticlesURL: data.sellingArticlesURL || "",
      }

      console.log("📤 Sending request to:", `${API_BASE_URL}/auth/register-publisher`)

      const response = await axios.post(`${API_BASE_URL}/auth/register-publisher`, requestData)

      console.log("✅ API Response:", response.data)

      if (response.status === 201) {
        Toast.showSuccess(tRegister("toastSuccessPublisher"))
        if (response.data?.data?.otp) {
          setReceivedOtp(response.data.data.otp.toString())
          console.log("OTP received:", response.data.data.otp)
        }
        setAccountCreated(true)
      }
    } catch (error: any) {
      console.error("❌ API Error:", error)

      if (axios.isAxiosError(error) && error.response?.status === 400) {
        Toast.showError(tRegister("toastErrorDuplicate"))
      } else {
        Toast.showError(
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : tRegister("toastErrorGeneric"),
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = []

    if (step === 1) {
      fieldsToValidate = ["role"]
    } else if (step === 2) {
      fieldsToValidate = ["firstName", "lastName", "email", "password"]
    } else if (step === 3) {
      fieldsToValidate = ["businessName", "country", "phoneNumber"]
    } else if (step === 4) {
      if (watchRole === "publisher") {
        fieldsToValidate = ["numberOfSites", "ownsSite", "hasDoFollowLinks", "sellingArticles"]
        if (watchSellingArticles) {
          fieldsToValidate.push("sellingArticlesURL")
        }
        fieldsToValidate.push("referedBy")
      } else if (watchRole === "advertiser") {
        fieldsToValidate = ["monthlyBudget", "currency"]
      }
    } else if (step === 5 && watchRole === "publisher") {
      fieldsToValidate = ["currency"]
    }

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const onVerifyOtp = async (values: OtpFormValues) => {
    setVerifyingOtp(true)
    
    try {
      const requestBody: VerifyOTPRequestBody = {
        email: userEmail,
        otp: values.otpCode,
      }

      console.log("Sending OTP verification request:", requestBody)

      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, requestBody)

      console.log("OTP verification response:", response)

      if (response.status === 201 || response.data.status === 201) {
        Toast.showSuccess(tOtp("toastSuccess"))

        setTimeout(() => {
          router.push("/sign-in")
        }, 1500)
      } else {
        Toast.showError(response.data.message || tOtp("toastErrorInvalid"))
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error)

      if (axios.isAxiosError(error)) {
        if (!error.response) {
          Toast.showError(tOtp("toastErrorNetwork"))
        } else {
          const statusCode = error.response.status
          const errorMessage = error.response.data?.message || tOtp("toastErrorGeneric")

          if (statusCode === 400 && errorMessage.includes("Invalid OTP")) {
            Toast.showError(tOtp("toastErrorInvalid"))
          } else {
            Toast.showError(errorMessage)
          }
        }
      } else {
        Toast.showError(tOtp("toastErrorGeneric"))
      }
    } finally {
      setVerifyingOtp(false)
    }
  }

  if (accountCreated) {
    return (
      <Card className="w-full mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className={`text-2xl font-bold text-center ${gradientTextClass}`}>{tOtp("title")}</CardTitle>
          <CardDescription className="text-center">{tOtp("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otpCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tOtp("label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder={tOtp("placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={verifyingOtp}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition duration-200"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tOtp("buttonVerifying")}
                  </>
                ) : (
                  tOtp("buttonVerify")
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <div className="text-sm text-muted-foreground">{tOtp("footerRedirect")}</div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className={`text-2xl font-bold text-center ${gradientTextClass}`}>{tRegister("title")}</CardTitle>
        <CardDescription className="text-center">{tRegister("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              console.log("🚀 Form submitted manually!", {
                currentStep: step,
                totalSteps,
                role: watchRole,
              })
              // We don't do anything here - we'll handle submission in the button click handler
            }}
            className="space-y-4"
          >
            {step === 1 && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className={`${gradientTextClass} font-semibold`}>{tRegister("roleLabel")}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value="publisher"
                              className="border-2 border-violet-600 text-white [&[data-state=checked]]:bg-gradient-to-r [&[data-state=checked]]:from-violet-600 [&[data-state=checked]]:to-fuchsia-600 [&[data-state=checked]]:border-0"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {tRegister("rolePublisherLabel")} - {tRegister("rolePublisherDescription")}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value="advertiser"
                              className="border-2 border-violet-600 text-white [&[data-state=checked]]:bg-gradient-to-r [&[data-state=checked]]:from-violet-600 [&[data-state=checked]]:to-fuchsia-600 [&[data-state=checked]]:border-0"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {tRegister("roleAdvertiserLabel")} - {tRegister("roleAdvertiserDescription")}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tRegister("firstNameLabel")}</FormLabel>
                        <FormControl>
                          <Input placeholder={tRegister("firstNamePlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tRegister("lastNameLabel")}</FormLabel>
                        <FormControl>
                          <Input placeholder={tRegister("lastNamePlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tRegister("email")}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={tRegister("emailPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tRegister("passwordLabel")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={tRegister("passwordPlaceholder")}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? tRegister("hidePassword") : tRegister("showPassword")}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 3 && (
              <>
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tRegister("businessNameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={tRegister("businessNamePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tRegister("countryLabel")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={tRegister("countryPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tRegister("phoneLabel")}</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Select
                            value={selectedCountry}
                            onValueChange={(value) => {
                              setSelectedCountry(value)
                              const newCode =
                                countryCodeMap[value as keyof typeof countryCodeMap]?.code || "+1"
                              setCountryCode(newCode)
                            }}
                          >
                            <SelectTrigger className="w-[140px] rounded-r-none border-r-0">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <span>
                                    {countryCodeMap[selectedCountry as keyof typeof countryCodeMap]?.short || "US"}
                                  </span>
                                  <span>
                                    {countryCodeMap[selectedCountry as keyof typeof countryCodeMap]?.code || "+1"}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(countryCodeMap).map(([key, { code, short, label }]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{short}</span>
                                    <span>{code}</span>
                                    <span className="text-gray-500">{label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            className="rounded-l-none"
                            placeholder="323-456-7896"
                            required
                            maxLength={12} // 10 digits + 2 hyphens
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "") // Remove non-digit characters
                              let formatted = ""

                              if (raw.length > 0) {
                                formatted = raw.slice(0, 3)
                              }
                              if (raw.length > 3) {
                                formatted += "-" + raw.slice(3, 6)
                              }
                              if (raw.length > 6) {
                                formatted += "-" + raw.slice(6, 10)
                              }

                              field.onChange(`${countryCode} ${formatted}`) // Add space between code and number
                            }}
                            value={field.value?.replace(`${countryCode} `, "") || ""} // Remove country code and space from input display
                          />

                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </>
            )}

            {step === 4 && watchRole === "publisher" && (
              <>
                <FormField
                  control={form.control}
                  name="numberOfSites"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tRegister("publisherSitesLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownsSite"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{tRegister("publisherOwnsSiteLabel")}</FormLabel>
                        <p className="text-sm text-muted-foreground">{tRegister("publisherOwnsSiteDescription")}</p>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasDoFollowLinks"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{tRegister("publisherDoFollowLabel")}</FormLabel>
                        <p className="text-sm text-muted-foreground">{tRegister("publisherDoFollowDescription")}</p>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellingArticles"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{tRegister("publisherSellsArticlesLabel")}</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {tRegister("publisherSellsArticlesDescription")}
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                {watchSellingArticles && (
                  <FormField
                    control={form.control}
                    name="sellingArticlesURL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tRegister("publisherArticlesUrlLabel")}</FormLabel>
                        <FormControl>
                          <Input required placeholder={tRegister("publisherArticlesUrlPlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="referedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tRegister("publisherReferralLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={tRegister("publisherReferralPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 4 && watchRole === "advertiser" && (
              <>
                <FormField
                  control={form.control}
                  name="monthlyBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tRegister("advertiserBudgetLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tRegister("currencyLabel")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={tRegister("currencyPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 5 && watchRole === "publisher" && (
              <>
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tRegister("currencyLabel")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={tRegister("currencyPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-between mt-6">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="border-violet-600 text-violet-600 hover:bg-violet-50"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {tRegister("backButton")}
                </Button>
              )}
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto w-24 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition duration-200"
                >
                  {tRegister("nextButton")}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button" // Changed from "submit" to "button"
                  onClick={() => {
                    if (step === totalSteps) {
                      if (watchRole === "advertiser") {
                        onSubmitAdvertiser(form.getValues())
                      } else if (watchRole === "publisher") {
                        onSubmitPublisher(form.getValues())
                      }
                    }
                  }}
                  disabled={isSubmitting}
                  className="ml-auto w-28 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {tRegister("loadingButton")}
                    </>
                  ) : (
                    <>
                      {tRegister("submit")}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t p-4">
        <div className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
          {tRegister("stepIndicator", { step: step, totalSteps: totalSteps })}
        </div>
        <div className="text-sm">
          {tRegister("have_account")}{" "}
          <Link href="/sign-in" className="font-medium text-violet-600 hover:text-fuchsia-600">
            {tRegister("login")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

