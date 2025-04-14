"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { Upload, Link2, FileText, ArrowRight, ArrowLeft, Check, MessageSquare, UserRound, Menu } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { toast } from "sonner"
import type { CheckOutApiResponse } from "@/types/checkout"
import {
  handleClientOrderRequest,
  handleFileUpload,
  fetchPaymentServices,
  checkPaymentStatus,
} from "@/app/[locale]/Services/ClientContentService"
import { handleOrderRequest } from "@/app/[locale]/Services/checkout"
import {
  getUserInfo,
  updateUserInfo,
  fetchCountryCodes,
  fetchCountriesAndCities,
} from "@/app/[locale]/Services/OrderPlace"
import { getCartApi } from "@/app/[locale]/Services/CartService"
import { useCart } from "@/context/CartContext"
import { Footer } from "@/components/marketplace/footer"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

function CheckoutContent() {
  const t = useTranslations("checkout")
  const tNav = useTranslations("navigation")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast: uiToast } = useToast()
  const [contentOption, setContentOption] = useState<string>("client")
  const [wordCount, setWordCount] = useState<string>("650")
  const [fileOption, setFileOption] = useState<string>("file")
  const [checkoutStep, setCheckoutStep] = useState<number>(1)
  const { deleteCart } = useCart()
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    postalCode: "",
  })
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNo, setPhoneNo] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [backupEmail, setBackupEmail] = useState("")
  const [keyword, setKeyword] = useState("")
  const [topic, setTopic] = useState("")
  const [postLink, setPostLink] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>("")
  const [fileType, setFileType] = useState("url")
  const [wordLimit, setWordLimit] = useState<string>("650")
  const [currency, setCurrency] = useState("")
  const [network, setNetwork] = useState("")
  const [totalAmount, setTotalAmount] = useState(49.99)
  const [payerAmount, setPayerAmount] = useState<number>(0)
  const [payerCurrency, setPayerCurrency] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showQrPopup, setShowQrPopup] = useState<boolean>(false)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isPollingLoading, setIsPollingLoading] = useState(false)
  const [editMode, setEditMode] = useState<boolean>(true)
  const [userInfoLoaded, setUserInfoLoaded] = useState(false)
  const [countries, setCountries] = useState<any[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [countryCodes, setCountryCodes] = useState<any[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [isLoadingCountryCodes, setIsLoadingCountryCodes] = useState(false)
  const [errorPopup, setErrorPopup] = useState(false)
  const [successPopup, setSuccessPopup] = useState(false)
  const [checkoutCartItems, setCheckoutCartItems] = useState<any[]>([])
  const [userFirstName, setUserFirstName] = useState<string>("")

  const getWordLimitPrice = () => {
    if (contentOption !== "publisher") return 0
    if (wordCount === "650") return 15
    if (wordCount === "750") return 20
    if (wordCount === "850") return 25
    return 0
  }

  const getCartItemsFromIds = async (productIds: string[]) => {
    if (!productIds || productIds.length === 0) return []

    const userId = Cookies.get("userId")
    if (!userId) return []

    try {
      const response = await getCartApi(userId, setError)
      if (!response || !response.data) return []

      const carts = Array.isArray(response.data) ? response.data : []
      const userCart = carts.find((cart: any) => String(cart.user?.id) === String(userId))

      if (!userCart || !userCart.products) return []

      return userCart.products.filter((product: any) => productIds.includes(product.id))
    } catch (error) {
      console.error("Error fetching cart items:", error)
      return []
    }
  }

  useEffect(() => {
    const urlTotal = searchParams.get("total")
    const urlCartItems = searchParams.get("cartItems")

    if (urlTotal) {
      setTotalAmount(Number.parseFloat(urlTotal))
    }

    if (urlCartItems) {
      try {
        const productIds = JSON.parse(urlCartItems)
        console.log("Product IDs from URL:", productIds)

        getCartItemsFromIds(productIds).then((items) => {
          setCheckoutCartItems(items)
          console.log("Checkout cart items:", items)
        })
      } catch (error) {
        console.error("Error parsing cart items from URL:", error)
      }
    }
  }, [searchParams])

  const getCookie = (name: string): string => {
    const cookieValue = Cookies.get(name)
    return cookieValue ? cookieValue : "[]"
  }

  const handleError = (messageKey: string, options?: any) => {
    const translatedMessage = t(messageKey, options)
    setError(translatedMessage)
    toast.error("Error", {
      description: translatedMessage,
    })
  }

  // Reconstructed calculateCartTotal function
  const calculateCartTotal = () => {
    const itemsTotal = checkoutCartItems.reduce((sum, item) => sum + Number(item.adjustedPrice || 0), 0)
    const wordLimitPrice = getWordLimitPrice()
    return itemsTotal + wordLimitPrice
  }

  // Reconstructed fetchUserInfo function
  const fetchUserInfo = async () => {
    setLoading(true)
    try {
      const response = await getUserInfo((msg) => handleError("toast.errorLoadUserInfo"))
      if (response?.data) {
        const user = response.data
        setFirstName(user.firstName || "")
        setLastName(user.lastName || "")
        setEmail(user.email || "")
        setPersonalInfo({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phoneNo || "",
          country: user.country || "",
          city: user.city || "",
          postalCode: user.postalCode || "",
        })

        // Specifically check for phoneNo field in the API response
        if (user.phoneNo) {
          console.log("Phone number from API:", user.phoneNo)

          // Extract only the local phone number, removing all country code prefixes
          // Handle multiple formats: "+92 929-073-3780", "+1 (555) 123-4567", etc.

          // First, identify if there's a country code (starts with + followed by digits)
          if (user.phoneNo.includes("+")) {
            // Find the position of the first non-digit character after the + and digits
            const countryCodeMatch = user.phoneNo.match(/^\+(\d+)/)

            if (countryCodeMatch) {
              const countryCodeDigits = countryCodeMatch[1]
              // Store the country code with + prefix
              setCountryCode(`+${countryCodeDigits}`)

              // Remove country code and any leading spaces/characters
              let localNumber = user.phoneNo.substring(countryCodeMatch[0].length)

              // Clean up: remove any initial spaces, parentheses, or non-essential characters
              localNumber = localNumber.replace(/^\s*[()\s-]*/, "").trim()

              // Set the cleaned local number
              setPhoneNo(localNumber)
              console.log("Parsed phone: Country code:", `+${countryCodeDigits}`, "Local number:", localNumber)
            } else {
              // If format not recognized, just set the full number as phoneNo
              setPhoneNo(user.phoneNo)
            }
          } else {
            // No plus sign found, set the full number as phoneNo
            setPhoneNo(user.phoneNo)
          }
        }

        setPostalCode(user.postalCode || "")
        setCountry(user.country || "")
        // Set city after a delay (optional, adjust if needed)
        setTimeout(() => {
          if (user.city) {
            setCity(user.city)
            updateField("city", user.city)
          }
        }, 300)
        setUserInfoLoaded(true)
      } else {
        handleError("toast.errorLoadUserInfo")
      }
    } catch (error) {
      handleError("toast.errorLoadUserInfo")
    } finally {
      setLoading(false)
    }
  }
  // Reconstructed handleUpdateUserInfo function
  const handleUpdateUserInfo = async () => {
    const authToken = Cookies.get("token")
    if (!authToken) {
      handleError("toast.errorAuthTokenMissing")
      return
    }
    if (country && !city) {
      handleError("toast.errorCitySelectRequired")
      return
    }
    if (!postalCode) {
      handleError("toast.errorPostalCodeRequired")
      return
    }

    setLoading(true)
    try {
      // Format phone number with proper spacing between country code and local number
      const formattedPhoneNumber = countryCode && phoneNo ? `${countryCode} ${phoneNo}`.trim() : phoneNo

      const userData = {
        firstName,
        lastName,
        email,
        country,
        city,
        postalCode,
        phoneNo: formattedPhoneNumber,
      }

      const response = await updateUserInfo((msg) => handleError("toast.errorUpdateProfile"), authToken, userData)

      if (response?.data?.message) {
        setEditMode(false)
        toast.success(t("toast.successProfileUpdateTitle"), {
          description: t("toast.successProfileUpdateDesc"),
        })
      } else {
        handleError("toast.errorUpdateProfile")
      }
    } catch (error) {
      handleError("toast.errorUpdateProfile")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    const getServices = async () => {
      const response = await fetchPaymentServices((msg) => handleError("toast.errorFetchServices"))
      if (response && response.data) {
        console.log("Payment services:", response.data)
        setOptions(response.data)
      }
    }

    getServices()
  }, [])

  useEffect(() => {
    const getCountriesAndCities = async () => {
      setIsLoadingCountries(true)
      const response = await fetchCountriesAndCities((msg) => handleError("toast.errorFetchCountries"))
      setIsLoadingCountries(false)

      if (response?.data?.data) {
        setCountries(response.data.data)
      }
    }

    getCountriesAndCities()
  }, [])

  useEffect(() => {
    const getCountryCodes = async () => {
      setIsLoadingCountryCodes(true)
      const response = await fetchCountryCodes((msg) => handleError("toast.errorFetchCountryCodes"))
      setIsLoadingCountryCodes(false)

      if (response?.data?.data) {
        setCountryCodes(response.data.data)
      }
    }

    getCountryCodes()
  }, [])

  // Initialize the user selection flag
  useEffect(() => {
    // Clear the flag when the component mounts, unless we're seeing a phone number already
    if (!phoneNo) {
      localStorage.removeItem("userSelectedCountryCode")
    }
  }, [phoneNo])

  useEffect(() => {
    if (country) {
      console.log("Country selected:", country)
      // Convert country code to lowercase for case-insensitive comparison
      const selectedCountry = countries.find((c) => c.country.toLowerCase() === country.toLowerCase())

      if (selectedCountry) {
        console.log("Found country data:", selectedCountry)
        console.log("Cities for selected country:", selectedCountry.cities)

        setCities(selectedCountry.cities || [])

        if (editMode && !city && selectedCountry.cities && selectedCountry.cities.length > 0) {
          setCity(selectedCountry.cities[0])
          updateField("city", selectedCountry.cities[0])
        }
      } else {
        console.log("Country not found in data:", country)
        // Try to find a country that contains this country code
        const countryMatch = countries.find(
          (c) =>
            c.country.toLowerCase().includes(country.toLowerCase()) ||
            country.toLowerCase().includes(c.country.toLowerCase()),
        )

        if (countryMatch) {
          console.log("Found similar country:", countryMatch.country)
          setCountry(countryMatch.country)
          setCities(countryMatch.cities || [])
        } else {
          setCities([])
        }
      }
    } else {
      setCities([])
    }
  }, [country, countries, editMode])

  useEffect(() => {
    if (country && countryCodes.length > 0) {
      // Only set the country code automatically if it's not already set by the user
      // and if user hasn't manually selected a country code
      const userSelectedCode = localStorage.getItem("userSelectedCountryCode") === "true"
      if (!countryCode && !userSelectedCode) {
        const selectedCountryCode = countryCodes.find((cc) => cc.name === country)
        if (selectedCountryCode) {
          setCountryCode(selectedCountryCode.dial_code)
          console.log("Updated country code to:", selectedCountryCode.dial_code)
        }
      }
    }
  }, [country, countryCodes, countryCode])

  useEffect(() => {
    if (!showQrPopup) return
    const uuid = localStorage.getItem("uuid")
    const orderId = localStorage.getItem("orderId")
    if (!uuid || !orderId) return
    setIsInitialLoading(true)
    const fetchPaymentStatus = async () => {
      try {
        const response = await checkPaymentStatus(uuid, orderId, (msg) => handleError("toast.errorCheckPayment"))
        if (response?.data?.is_paid) {
          toast.success(t("toast.successPaymentTitle"), { description: t("toast.successPaymentDesc") })
          setIsInitialLoading(false)
          setIsPollingLoading(false)
          setShowQrPopup(false)
          clearInterval(interval)
          localStorage.removeItem("cart")
          router.push(`/thankyou?orderNumber=${orderId}`)
        } else {
          setIsPollingLoading(true)
        }
      } catch (err) {
        handleError("toast.errorCheckPayment")
        setIsInitialLoading(false)
        setIsPollingLoading(false)
      }
    }
    const interval = setInterval(fetchPaymentStatus, 3000)
    setTimeout(() => setIsInitialLoading(false), 2000)
    return () => {
      clearInterval(interval)
    }
  }, [showQrPopup, router, t])

  useEffect(() => {
    if (checkoutStep === 2 && !userInfoLoaded) {
      fetchUserInfo()
      setEditMode(true)
    }
  }, [checkoutStep, userInfoLoaded])

  useEffect(() => {
    // Get first name from cookies if available
    const cookieFirstName = Cookies.get("firstName")
    console.log("Cookie first name:", cookieFirstName)
    if (cookieFirstName) {
      setUserFirstName(cookieFirstName)
    }
    console.log("Cookie first name:", setUserFirstName)
  }, [])

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  const updateField = (field: string, value: string) => {
    setPersonalInfo({
      ...personalInfo,
      [field]: value,
    })

    switch (field) {
      case "firstName":
        setFirstName(value)
        break
      case "lastName":
        setLastName(value)
        break
      case "email":
        setEmail(value)
        break
      case "phone":
        setPhoneNo(value)
        break
      case "country":
        setCountry(value)
        break
      case "city":
        setCity(value)
        break
      case "postalCode":
        setPostalCode(value)
        break
    }
  }

  const validateStep1 = () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    const isValidUrl = (url: string) => {
      try {
        new URL(url)
        return true
      } catch (_) {
        return false
      }
    }

    if (contentOption === "client") {
      if (!keyword.trim()) {
        toast.error("Note is required.")
        return false
      }

      if (fileType === "url") {
        if (!fileUrl.trim()) {
          toast.error("File URL is required.")
          return false
        }

        if (!isValidUrl(fileUrl)) {
          toast.error("Please enter a valid URL (e.g., https://example.com)")
          return false
        }
      }

      if (fileType === "upload" && !file) {
        toast.error("File is required.")
        return false
      }

      if (!backupEmail.trim()) {
        toast.error("Backup email is required.")
        return false
      }

      if (!isValidEmail(backupEmail)) {
        toast.error("Please enter a valid backup email.")
        return false
      }
    } else {
      if (!topic.trim()) {
        toast.error("Topic is required.")
        return false
      }

      if (!postLink.trim()) {
        toast.error("Anchor link is required.")
        return false
      }

      if (!keyword.trim()) {
        toast.error("Keyword is required.")
        return false
      }

      if (!backupEmail.trim()) {
        toast.error("Backup email is required.")
        return false
      }

      if (!isValidEmail(backupEmail)) {
        toast.error("Please enter a valid backup email.")
        return false
      }

      if (!wordCount) {
        toast.error("Word count is required.")
        return false
      }
    }

    return true
  }
  const validateRequiredFields = () => {
    if (!firstName) return handleError("toast.errorFirstNameRequired"), false
    if (!lastName) return handleError("toast.errorLastNameRequired"), false
    if (!email) return handleError("toast.errorEmailRequired"), false
    if (!phoneNo) return handleError("toast.errorPhoneRequired"), false

    // Phone number validation (999-999-9999 format)
    const phoneDigits = phoneNo.replace(/\D/g, "") // Remove non-digit characters
    if (phoneDigits.length !== 10) {
      return handleError("toast.errorPhoneInvalidLength"), false // Show error if not 10 digits
    }

    if (!countryCode) return handleError("toast.errorCountryCodeRequired"), false
    if (!country) return handleError("toast.errorCountryRequired"), false
    if (!city) return handleError("toast.errorCityRequired"), false
    if (!postalCode) return handleError("toast.errorPostalCodeRequired"), false
    if (!currency) return handleError("toast.errorCurrencyRequired"), false
    if (!network) return handleError("toast.errorNetworkRequired"), false

    setError("")
    return true
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setFileError(t("step1.clientForm.fileSizeError"))
      setFile(null)
      handleError("toast.errorFileUploadFailed")
    } else {
      setFileError("")
      setFile(selectedFile)
    }
  }

  const handleClientPurchase = async () => {
    await handleUpdateUserInfo()
    if (!validateRequiredFields()) return
    setLoading(true)
    const authToken = Cookies.get("token")
    if (!authToken) {
      handleError("toast.errorAuthTokenMissing")
      setLoading(false)
      return
    }
    try {
      let uploadedFileUrl = ""
      if (fileType === "upload" && file) {
        const uploadResponse = await handleFileUpload(
          (msg) => handleError("toast.errorFileUploadFailed"),
          authToken.toString(),
          file,
        )
        if (uploadResponse?.data?.fileUrl) {
          uploadedFileUrl = uploadResponse.data.fileUrl
        } else {
          handleError("toast.errorFileUploadFailed")
          setLoading(false)
          return
        }
      } else if (fileType === "url" && fileUrl) {
        uploadedFileUrl = fileUrl
      } else {
        handleError("toast.errorFileOrUrlRequired")
        setLoading(false)
        return
      }
      const formattedPhoneNumber = countryCode && phoneNo ? `${countryCode} ${phoneNo}` : phoneNo
      const cartItems = checkoutCartItems.length > 0 ? checkoutCartItems : JSON.parse(getCookie("cart_id") || "[]")
      if (cartItems.length === 0) {
        handleError("toast.errorNoProducts")
        setLoading(false)
        return
      }
      const requestData = {
        email: email || backupEmail,
        backupEmail: backupEmail,
        notes: keyword,
        firstName,
        lastName,
        postalCode,
        city,
        country,
        anchorLink: postLink,
        phoneNo: formattedPhoneNumber,
        file: uploadedFileUrl,
        network: network,
        to_currency: currency,
        products: cartItems.map((product: any) => ({
          productId: product.id || product._id || "",
        })),
      }
      console.log("📦 Final requestData:", JSON.stringify(requestData, null, 2))
      const response = await handleClientOrderRequest(
        (msg) => handleError("toast.errorProcessOrder"),
        authToken.toString(),
        requestData,
      )
      if (response?.data?.message === "Invalid or expired token") {
        toast.error(t("toast.errorLoginFirstTitle"), { description: t("toast.errorLoginFirstDesc") })
        setTimeout(() => router.push(`/sign-in`), 2000)
      } else if (response?.status === 201) {
        setSuccessPopup(true)
        setBackupEmail("")
        setFileUrl("")
        setFileType("url")
        setFile(null)
        setTotalAmount(0)

        setFirstName("")
        setLastName("")
        setCountry("")
        setCity("")
        setPostalCode("")
        setPhoneNo("")
        setEmail("")
        setPostLink("")
        setKeyword("")
        setWordLimit("")
        setNetwork("")
        setCurrency("")
        setCheckoutCartItems([])
        const paymentTransaction = response?.data?.data
        if (paymentTransaction) {
          console.log("✅ Payment Transaction Data:", paymentTransaction)

          if (paymentTransaction.uuid) {
            localStorage.setItem("uuid", paymentTransaction.uuid)
          }

          if (paymentTransaction.orderNumber) {
            localStorage.setItem("orderId", paymentTransaction.orderNumber.toString())
            console.log("✅ Order ID stored:", paymentTransaction.orderNumber)
          } else {
            console.error("⛔ No order number found in paymentTransaction!")
          }

          if (paymentTransaction.address_qr_code) {
            console.log("✅ QR Code Received:", paymentTransaction.address_qr_code)

            if (paymentTransaction.address_qr_code.startsWith("data:image/png;base64,")) {
              setQrCode(paymentTransaction.address_qr_code)
              setPayerAmount(Number.parseFloat(paymentTransaction.payer_amount.toString()) || 0)
              console.log("📢 Updated Total Amount State:", totalAmount)
              setPayerCurrency(paymentTransaction?.payer_currency || "N/A")
              setNetwork(paymentTransaction.network || "")
              setWalletAddress(paymentTransaction.address || "")
              setShowQrPopup(true)
              await deleteCart()
            } else {
              console.error("⛔ Invalid QR Code format")
            }
          } else {
            console.error("⛔ No QR Code found in paymentTransaction!")
            setErrorPopup(true)
          }
        } else {
          console.error("⛔ No paymentTransaction found!")
          setErrorPopup(true)
        }

        toast.success(t("toast.successOrderSubmitTitle"), { description: t("toast.successOrderSubmitDesc") })

        if (checkoutCartItems.length > 0) {
          console.log("🔍 Purchase Complete - Checkout Cart Items:", checkoutCartItems)
        }
      }
    } catch (error) {
      handleError("toast.errorProcessOrder")
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToPurchase = () => {
    // Scroll to top
    window.scrollTo(0, 0)

    if (!validateStep1()) return

    if (contentOption === "client") {
      setBackupEmail(backupEmail || "")
      setKeyword(keyword || "")
      setFileUrl(fileUrl || "")
    } else {
      setBackupEmail(backupEmail || "")
      setPostLink(postLink || "")
      setKeyword(keyword || "")
      setTopic(topic || "")
      setWordLimit(wordCount)
    }

    // Push to dataLayer for checkout event
    if (typeof window !== 'undefined' && window.dataLayer && checkoutCartItems.length > 0) {
      // Map cart items to GA4 ecommerce format
      const mappedItems = checkoutCartItems.map(item => ({
        item_id: item.id,
        item_name: item.siteName || item.title || "Untitled Product",
        item_category: Array.isArray(item.category) ? item.category.join(", ") : (item.category || "Uncategorized"),
        price: typeof item.price === 'string' ? parseFloat(item.price) : (typeof item.adjustedPrice === 'string' ? parseFloat(item.adjustedPrice) : item.price || 0),
        currency: item.currency || "EUR",
        quantity: 1,
        language: item.language || "",
        domain_authority: item.domainAuthority || item.da || 0,
        domain_rating: item.domainRatings || item.dr || 0,
        monthly_traffic: item.monthlyTraffic || 0
      }));

      // Calculate total value
      const totalValue = mappedItems.reduce((sum, item) => sum + (item.price || 0), 0);

      // Push begin_checkout event to dataLayer
      window.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          currency: "EUR",
          value: totalValue,
          items: mappedItems
        }
      });
      console.log("🔍 Begin checkout event tracked in dataLayer:", mappedItems);
    }

    setCheckoutStep(2)
    toast.success(t("toast.successProceedTitle"), { description: t("toast.successProceedDesc") })
  }

  const handleBackToContent = () => {
    setCheckoutStep(1)
    setEditMode(false)
  }

  const handlePublisherPurchase = async () => {
    await handleUpdateUserInfo()
    if (!validateRequiredFields()) return
    const authToken = Cookies.get("token")
    if (!authToken) {
      handleError("toast.errorAuthTokenMissing")
      return
    }
    setLoading(true)
    try {
      const wordLimitAsNumber = wordLimit ? wordLimit.toString() : "650"
      const formattedPhoneNumber = countryCode && phoneNo ? `${countryCode} ${phoneNo}` : phoneNo
      const cartItems = checkoutCartItems.length > 0 ? checkoutCartItems : JSON.parse(getCookie("cart_id") || "[]")
      if (cartItems.length === 0) {
        handleError("toast.errorNoProducts")
        setLoading(false)
        return
      }
      const requestData = {
        firstName,
        lastName,
        country,
        city,
        postalCode,
        phoneNo: formattedPhoneNumber,
        email: email || backupEmail,
        anchorLink: postLink,
        anchor: keyword,
        wordLimit: wordLimitAsNumber,
        network: network,
        to_currency: currency,
        products: cartItems.map((product: any) => ({
          productId: product.id || product._id || "",
        })),
      }
      const response = await handleOrderRequest(
        (msg) => handleError("toast.errorProcessOrder"),
        authToken.toString(),
        requestData,
      )
      const responseData: CheckOutApiResponse = response?.data as CheckOutApiResponse
      if (response?.data?.message === "Invalid or expired token") {
        toast.error(t("toast.errorLoginFirstTitle"), { description: t("toast.errorLoginFirstDesc") })
        setTimeout(() => router.push(`/sign-in`), 2000)
        return
      }
      if (response?.status === 201) {
        setBackupEmail("")
        setFileUrl("")
        setFileType("url")
        setFile(null)
        setTotalAmount(0)

        setFirstName("")
        setLastName("")
        setCountry("")
        setCity("")
        setPostalCode("")
        setPhoneNo("")
        setEmail("")
        setPostLink("")
        setKeyword("")
        setWordLimit("")
        setNetwork("")
        setCurrency("")
        setCheckoutCartItems([])
        const paymentTransaction = response?.data?.data
        if (!paymentTransaction) {
          handleError("toast.errorProcessOrder")
          return
        }
        console.log("✅ Payment Transaction Data:", paymentTransaction)
        if (paymentTransaction.uuid) {
          localStorage.setItem("uuid", paymentTransaction.uuid)
        }
        if (paymentTransaction.orderNumber) {
          localStorage.setItem("orderId", paymentTransaction.orderNumber.toString())
          console.log("✅ Order ID stored:", paymentTransaction.orderNumber)
        } else {
          console.error("⛔ No order number found in paymentTransaction!")
        }
        if (paymentTransaction.address_qr_code) {
          console.log("✅ QR Code Received:", paymentTransaction.address_qr_code)
          if (paymentTransaction.address_qr_code.startsWith("data:image/png;base64,")) {
            setQrCode(paymentTransaction.address_qr_code)
            setPayerAmount(Number.parseFloat(paymentTransaction.payer_amount.toString()) || 0)
            setPayerCurrency(paymentTransaction?.payer_currency || "N/A")
            setNetwork(paymentTransaction.network || "")
            setWalletAddress(paymentTransaction.address || "")
            setShowQrPopup(true)
            await deleteCart()
          } else {
            console.error("⛔ Invalid QR Code format")
            handleError("toast.errorQRCodeFormat")
          }
        } else {
          console.error("⛔ No QR Code found in paymentTransaction!")
          handleError("toast.errorQRCodeNotFound")
        }
        toast.success(t("toast.successOrderSubmitTitle"), { description: t("toast.successOrderSubmitDesc") })
      }
    } catch (err) {
      handleError("toast.errorProcessOrder")
    } finally {
      setLoading(false)
    }
  }

  const handleCompletePurchase = () => {
    if (contentOption === "client") {
      handleClientPurchase()
    } else {
      handlePublisherPurchase()
    }
  }

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: "#f8f0ff" }}>
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {t("mainTitle1")}
            </span>
            <span> {t("mainTitle2")} </span>
          </h1>
        </div>
        {checkoutStep === 1 ? (
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>{t("step1.contentOptions.title")}</CardTitle>
                    <CardDescription>{t("step1.contentOptions.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      defaultValue="client"
                      onValueChange={(value) => setContentOption(value)}
                      className="space-y-4"
                    >
                      <div className="flex items-start space-x-3 space-y-0">
                        <RadioGroupItem
                          value="client"
                          id="client"
                          className="relative w-5 h-5 border-2 border-gray-400 rounded-full checked:border-transparent checked:bg-gradient-to-r from-violet-600 to-fuchsia-600"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="client" className="font-medium">
                            {t("step1.contentOptions.clientLabel").replace("client", userFirstName || "client")}
                          </Label>
                          <p className="text-sm text-muted-foreground">{t("step1.contentOptions.clientDesc")}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 space-y-0">
                        <RadioGroupItem
                          value="publisher"
                          id="publisher"
                          className="relative w-5 h-5 border-2 border-gray-400 rounded-full checked:border-transparent checked:bg-gradient-to-r from-violet-600 to-fuchsia-600"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="publisher" className="font-medium">
                            {t("step1.contentOptions.publisherLabel")}
                          </Label>
                          <p className="text-sm text-muted-foreground">{t("step1.contentOptions.publisherDesc")}</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {contentOption === "client" ? (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>{t("step1.clientForm.title")}</CardTitle>
                      <CardDescription>{t("step1.clientForm.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="client-note">{t("step1.clientForm.noteLabel")}</Label>
                        <Textarea
                          id="client-note"
                          placeholder={t("step1.clientForm.notePlaceholder")}
                          className="min-h-[120px] border-2"
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("step1.clientForm.provideOptionLabel")}</Label>
                        <RadioGroup
                          defaultValue="file"
                          className="space-y-3"
                          onValueChange={(value) => setFileType(value)}
                          value={fileType}
                        >
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="upload" id="file-option" className="border-primary text-primary" />
                            <Label htmlFor="file-option" className="font-normal">
                              {t("step1.clientForm.optionUpload")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="url" id="url-option" className="border-primary text-primary" />
                            <Label htmlFor="url-option" className="font-normal">
                              {t("step1.clientForm.optionUrl")}
                            </Label>
                          </div>
                        </RadioGroup>
                        {fileType === "upload" ? (
                          <div className="mt-4 rounded-md border-2 border-dashed p-6 text-center">
                            <Upload className="mx-auto h-8 w-8 text-primary" />
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2"
                                onClick={() => document.getElementById("file-upload")?.click()}
                              >
                                {t("step1.clientForm.chooseFile")}
                              </Button>
                              <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">{t("step1.clientForm.fileHelp")}</p>
                            {file && (
                              <p className="mt-2 text-sm text-primary">
                                {t("step1.clientForm.fileSelected", { fileName: file.name })}
                              </p>
                            )}
                            {fileError && <p className="mt-2 text-sm text-red-500">{fileError}</p>}
                          </div>
                        ) : (
                          <div className="mt-4 space-y-2">
                            <Label htmlFor="client-url">{t("step1.clientForm.urlLabel")}</Label>
                            <Input
                              id="client-url"
                              type="url"
                              required
                              placeholder={t("step1.clientForm.urlPlaceholder")}
                              className="border-2"
                              value={fileUrl}
                              onChange={(e) => setFileUrl(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client-email">{t("step1.backupEmailLabel")}</Label>
                        <p className="text-sm text-gray-600">
                          A confirmation email will be sent to the address you provide below.
                        </p>
                        <Input
                          id="client-email"
                          type="email"
                          placeholder={t("step1.backupEmailPlaceholder")}
                          className="border-2"
                          value={backupEmail}
                          onChange={(e) => setBackupEmail(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>{t("step1.publisherForm.title")}</CardTitle>
                      <CardDescription>{t("step1.publisherForm.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="publisher-note">{t("step1.publisherForm.noteLabel")}</Label>
                        <Textarea
                          id="publisher-note"
                          placeholder={t("step1.publisherForm.notePlaceholder")}
                          className="min-h-[120px] border-2"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="anchor-link">{t("step1.publisherForm.anchorLinkLabel")}</Label>
                        <div className="flex items-center space-x-2">
                          <Link2 className="h-4 w-4 text-primary" />
                          <Input
                            id="anchor-link"
                            placeholder={t("step1.publisherForm.anchorLinkPlaceholder")}
                            className="border-2"
                            value={postLink}
                            onChange={(e) => setPostLink(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="keyword">{t("step1.publisherForm.keywordLabel")}</Label>
                        <Input
                          id="keyword"
                          placeholder={t("step1.publisherForm.keywordPlaceholder")}
                          className="border-2"
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="publisher-email">{t("step1.backupEmailLabel")}</Label>
                        <Input
                          id="publisher-email"
                          type="email"
                          placeholder={t("step1.backupEmailPlaceholder")}
                          className="border-2"
                          value={backupEmail}
                          onChange={(e) => setBackupEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("step1.publisherForm.wordCountLabel")}</Label>
                        <RadioGroup
                          defaultValue="650"
                          onValueChange={(value) => setWordCount(value)}
                          className="space-y-3"
                          value={wordCount}
                        >
                          <div className="flex items-center justify-between rounded-md border-2 p-4">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="650" id="words-650" className="border-primary text-primary" />
                              <Label htmlFor="words-650" className="font-normal">
                                {t("step1.publisherForm.words650")}
                              </Label>
                            </div>
                            <span className="text-sm font-medium">{t("step1.publisherForm.price650")}</span>
                          </div>
                          <div className="flex items-center justify-between rounded-md border-2 p-4">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="750" id="words-750" className="border-primary text-primary" />
                              <Label htmlFor="words-750" className="font-normal">
                                {t("step1.publisherForm.words750")}
                              </Label>
                            </div>
                            <span className="text-sm font-medium">{t("step1.publisherForm.price750")}</span>
                          </div>
                          <div className="flex items-center justify-between rounded-md border-2 p-4">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="850" id="words-850" className="border-primary text-primary" />
                              <Label htmlFor="words-850" className="font-normal">
                                {t("step1.publisherForm.words850")}
                              </Label>
                            </div>
                            <span className="text-sm font-medium">{t("step1.publisherForm.price850")}</span>
                          </div>
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="sticky top-20">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>{t("summary.title")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{t("summary.itemsLabel")}</p>
                      {checkoutCartItems.length > 0 ? (
                        checkoutCartItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.siteName || t("summary.productFallback")}</span>
                            <span>€{Number(item.adjustedPrice || 0).toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">{t("summary.noItems")}</p>
                      )}
                    </div>
                    {contentOption === "publisher" && (
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span>{t("summary.wordCountLabel", { count: wordCount })}</span>
                        </span>
                        <span>€{wordCount === "650" ? "15" : wordCount === "750" ? "20" : "25"}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>{t("summary.totalLabel")}</span>
                      <span className="text-primary font-bold">€{calculateCartTotal().toFixed(2)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      size="lg"
                      onClick={handleProceedToPurchase}
                    >
                      {t("summary.proceedButton")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{t("step2.personalInfo.title")}</CardTitle>
                    <CardDescription>{t("step2.personalInfo.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">{t("step2.personalInfo.firstNameLabel")}</Label>
                        <Input
                          id="first-name"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value)
                            updateField("firstName", e.target.value)
                          }}
                          className="border-2 h-12"
                          disabled={false}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">{t("step2.personalInfo.lastNameLabel")}</Label>
                        <Input
                          id="last-name"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value)
                            updateField("lastName", e.target.value)
                          }}
                          className="border-2 h-12"
                          disabled={false}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="country">{t("step2.personalInfo.countryLabel")}</Label>
                        <div className="relative h-12">
                          <select
                            id="country"
                            className="w-full h-full px-3 border-2 rounded bg-white text-base font-normal focus:outline-gray-400 appearance-none"
                            value={country}
                            onChange={(e) => {
                              const selectedCountry = e.target.value
                              setCountry(selectedCountry)
                              updateField("country", selectedCountry)

                              if (editMode) {
                                setCity("")
                                updateField("city", "")
                              }
                            }}
                            disabled={false}
                          >
                            <option value="">{t("step2.personalInfo.countryPlaceholder")}</option>
                            {countries.map((countryItem, index) => (
                              <option key={index} value={countryItem.country}>
                                {countryItem.country}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">{t("step2.personalInfo.cityLabel")}</Label>
                        <div className="relative h-12">
                          <select
                            id="city"
                            className="w-full h-full px-3 border-2 rounded bg-white text-base font-normal focus:outline-gray-400 appearance-none"
                            value={city}
                            onChange={(e) => {
                              const selectedCity = e.target.value
                              setCity(selectedCity)
                              updateField("city", selectedCity)
                            }}
                            disabled={!country}
                          >
                            <option value="">{t("step2.personalInfo.cityPlaceholder")}</option>
                            {cities.length > 0 ? (
                              cities.map((cityName, index) => (
                                <option key={index} value={cityName}>
                                  {cityName}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                {t("step2.personalInfo.noCities")}
                              </option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("step2.personalInfo.phoneLabel")}</Label>
                      <div className="flex">
                        <div className="relative flex items-center bg-[#D9D9D9] border rounded-l px-2 w-1/3 h-12">
                          {countryCode && countryCodes.length > 0 && (
                            <img
                              src={`https://flagcdn.com/w40/${countryCodes.find((c) => c.dial_code === countryCode)?.code.toLowerCase()}.png`}
                              alt="Flag"
                              className="w-6 h-4 mr-2"
                            />
                          )}
                          <select
                            className="bg-transparent text-base font-normal focus:outline-gray-400 appearance-none w-full h-full"
                            value={countryCode}
                            onChange={(e) => {
                              setCountryCode(e.target.value)
                              // Store that user has manually selected a country code
                              localStorage.setItem("userSelectedCountryCode", "true")
                            }}
                            disabled={false}
                          >
                            <option value="">{t("step2.personalInfo.phoneCodePlaceholder")}</option>
                            {countryCodes.map((code, index) => (
                              <option key={index} value={code.dial_code}>
                                {code.code} ({code.dial_code})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="relative w-2/3">
                          <Input
                            id="phone"
                            type="tel"
                            value={phoneNo}
                            onChange={(e) => {
                              // Format the phone number as user types (999-999-9999)
                              const input = e.target.value.replace(/\D/g, "") // Remove non-digits
                              let formattedValue = ""
                              if (input.length > 0) {
                                // First group: 3 digits
                                formattedValue = input.slice(0, 3)

                                // Second group: 3 digits
                                if (input.length > 3) {
                                  formattedValue += "-" + input.slice(3, 6)
                                }

                                // Third group: 4 digits
                                if (input.length > 6) {
                                  formattedValue += "-" + input.slice(6, 10)
                                }
                              }
                              // First group: 3 digits
                              formattedValue = input.slice(0, 3)

                              // Second group: 3 digits
                              if (input.length > 3) {
                                formattedValue += "-" + input.slice(3, 6)
                              }

                              // Third group: 4 digits
                              if (input.length > 6) {
                                formattedValue += "-" + input.slice(6, 10)
                              }
                              setPhoneNo(formattedValue)
                              updateField("phone", formattedValue)
                            }}
                            placeholder="999-999-9999"
                            maxLength={12} // 10 digits + 2 hyphens
                            className="flex h-12 w-full rounded-l-none  bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 border-2 "
                            disabled={false}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("step2.personalInfo.emailLabel")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          updateField("email", e.target.value)
                        }}
                        className="border-2 h-12"
                        disabled={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal-code">{t("step2.personalInfo.postalCodeLabel")}</Label>
                      <Input
                        id="postal-code"
                        value={postalCode}
                        onChange={(e) => {
                          setPostalCode(e.target.value)
                          updateField("postalCode", e.target.value)
                        }}
                        className="border-2 h-12"
                        disabled={false}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>{t("step2.payment.title")}</CardTitle>
                    <CardDescription>{t("step2.payment.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="currency">{t("step2.payment.currencyLabel")}</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="border-2 w-full">
                          <SelectValue placeholder={t("step2.payment.currencyPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(new Set((options || []).map((item) => item.currency).filter(Boolean))).map(
                            (cur, index) => (
                              <SelectItem key={index} value={cur as string}>
                                {cur as string}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="network">{t("step2.payment.networkLabel")}</Label>
                      <Select value={network} onValueChange={setNetwork} disabled={!currency}>
                        <SelectTrigger className="border-2 w-full">
                          <SelectValue placeholder={t("step2.payment.networkPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {options
                            .filter((item) => item.currency === currency)
                            .map((item, index) => (
                              <SelectItem key={index} value={item.network}>
                                {item.network}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="sticky top-20">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>{t("summary.title")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{t("summary.itemsLabel")}</p>
                      {checkoutCartItems.length > 0 ? (
                        checkoutCartItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.siteName || t("summary.productFallback")}</span>
                            <span>€{Number(item.adjustedPrice || 0).toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">{t("summary.noItems")}</p>
                      )}
                    </div>
                    {contentOption === "publisher" && (
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span>{t("summary.wordCountLabel", { count: wordCount })}</span>
                        </span>
                        <span>€{wordCount === "650" ? "15" : wordCount === "750" ? "20" : "25"}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>{t("summary.totalLabel")}</span>
                      <span className="text-primary font-bold">€{calculateCartTotal().toFixed(2)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <Button variant="outline" className="w-full border-2" onClick={handleBackToContent}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t("step2.backButton")}
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      size="lg"
                      onClick={handleCompletePurchase}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-white rounded-full"></span>
                          {t("step2.processingButton")}
                        </span>
                      ) : (
                        <>
                          {t("step2.completeButton")}
                          <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        )}

        {showQrPopup && qrCode && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-40 backdrop-blur-md z-50">
            <div className="bg-white p-6 rounded-xl w-[90%] max-w-[600px] shadow-lg relative animate-fadeIn">
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-[35px]"
                onClick={() => setShowQrPopup(false)}
              >
                &times;
              </button>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex flex-col items-center">
                  <p className="text-gray-600 font-medium mb-2">{t("qrPopup.scanText")}</p>
                  <img
                    src={qrCode || "/placeholder.svg"}
                    alt="Scan QR Code"
                    className="w-40 h-40 border p-2 rounded-lg shadow-md"
                  />
                </div>
                <div className="flex-1 text-left space-y-3 text-gray-700">
                  <p>
                    <span className="font-semibold">{t("step2.payment.networkLabel")}:</span> {network || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">{t("qrPopup.totalAmountLabel")}</span>{" "}
                    <span className="text-green-600">
                      {payerAmount || "0"} {payerCurrency || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">{t("qrPopup.payerCurrencyLabel")}</span> {payerCurrency || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">{t("qrPopup.walletAddressLabel")}</span>
                    <span className="break-all">{walletAddress || "N/A"}</span>
                    <button
                      className="ml-2 px-2 py-1 text-sm text-blue-600 border border-blue-400 rounded hover:bg-blue-100"
                      onClick={() => navigator.clipboard.writeText(walletAddress)}
                    >
                      {t("qrPopup.copyButton")}
                    </button>
                  </p>
                </div>
              </div>
              {isInitialLoading && (
                <div className="flex flex-col items-center justify-center mt-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-violet-600"></div>
                  <p className="text-gray-600 mt-2">{t("qrPopup.processingText")}</p>
                </div>
              )}
              {isPollingLoading && (
                <div className="flex flex-col items-center justify-center mt-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-fuchsia-600"></div>
                  <p className="text-fuchsia-600 font-medium">{t("qrPopup.waitingText")}</p>
                  <p className="text-gray-500 mt-1">{t("qrPopup.waitingNote")}</p>
                </div>
              )}
              <button
                className="mt-4 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-md hover:shadow-lg text-white px-2 py-3 rounded-lg text-lg font-semibold"
                onClick={() => setShowQrPopup(false)}
              >
                {t("qrPopup.closeButton")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckoutHeader() {
  const router = useRouter()
  const t = useTranslations("Header")
  const tNav = useTranslations("navigation")
  const currentLocale = useLocale()
  const [token, setToken] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const cookieToken = Cookies.get("token")
    const role = Cookies.get("role")
    if (cookieToken) {
      setToken(cookieToken)
      setUserRole(role || null)
    }
  }, [])
  
  const isRegularUser = userRole === "user"

  const handleNavigation = (sectionId: string) => {
    router.push(`/${currentLocale}${sectionId}`)
  }

  const handleLogoClick = () => {
    router.push(`/${currentLocale}/`)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
            <div className="size-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center glow">
              <MessageSquare className="size-4 text-white" />
            </div>
            <span className="font-bold text-xl">GermanGuestPost</span>
          </div>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-violet-600 transition-colors"
            onClick={() => handleNavigation("home")}
          >
            {tNav("home")}
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium hover:text-violet-600 transition-colors"
            onClick={() => handleNavigation("contact")}
          >
            {tNav("contact")}
          </Link>
          <Link
            href="/about-us"
            className="text-sm font-medium hover:text-violet-600 transition-colors"
            onClick={() => handleNavigation("about")}
          >
            {tNav("about")}
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium hover:text-violet-600 transition-colors"
            onClick={() => handleNavigation("pricing")}
          >
            {tNav("pricing")}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {token && isRegularUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 hover:bg-violet-100 shadow-md bg-white"
                  aria-label={t("userAriaLabel")}
                >
                  <UserRound className="h-5 w-5 text-violet-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white text-gray-800 shadow-lg rounded-lg p-2 w-48">
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/user/orders")
                  }}
                  className="hover:bg-gray-200 p-2 rounded-lg"
                >
                  {tNav("dashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    Cookies.remove("token")
                    Cookies.remove("role")
                    setToken(null)
                    setUserRole(null)
                    router.push("/")
                  }}
                  className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                >
                  {tNav("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : token && !isRegularUser ? (
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
              onClick={() => {
                Cookies.remove("token")
                Cookies.remove("role")
                setToken(null)
                setUserRole(null)
                router.push("/")
              }}
            >
              {tNav("logout")}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="hidden md:block"
                onClick={() => {
                  router.push("/sign-in")
                }}
              >
                {tNav("login")}
              </Button>
              <Button
                className="hidden md:inline-flex bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-200"
                onClick={() => {
                  router.push("/sign-up")
                }}
              >
                {tNav("register")}
              </Button>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden p-2 rounded-lg shadow-md">
                <Menu className="h-6 w-6 text-gray-700" />
                <span className="sr-only">{t("toggleMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6 md:p-8">
              <div className="flex flex-col gap-6 mt-6">
                {[
                  { href: "/", label: "Home", id: "home-mobile" },
                  { href: "/contact", label: "Contact", id: "contact-mobile" },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="text-lg font-medium text-gray-800 hover:text-violet-600 transition-all duration-200"
                    onClick={() => handleNavigation(item.id)}
                  >
                    {item.label}
                  </Link>
                ))}
                {token && isRegularUser && (
                  <Link
                    href="/user/dashboard"
                    className="text-lg font-medium text-gray-800 hover:text-violet-600 transition-all duration-200"
                  >
                    {tNav("dashboard")}
                  </Link>
                )}
                {token ? (
                  <Button
                    variant="outline"
                    className="border-gray-300 text-red-600 hover:border-red-600 hover:bg-red-50 transition-all duration-200 mt-4"
                    onClick={() => {
                      Cookies.remove("token")
                      Cookies.remove("role")
                      setToken(null)
                      setUserRole(null)
                      router.push("/")
                    }}
                  >
                    {tNav("logout")}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3 mt-6">
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-800 hover:border-violet-600 hover:text-violet-600 transition-all duration-200"
                      onClick={() => {
                        router.push("/sign-in")
                      }}
                    >
                      {tNav("login")}
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg hover:opacity-90 transition-all duration-200"
                      onClick={() => {
                        router.push("/sign-up")
                      }}
                    >
                      {tNav("register")}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default function CheckoutPage() {
  const t = useTranslations("checkout")
  return (
    <>
      <CheckoutHeader />
      <div className="min-h-screen" style={{ backgroundColor: "#f8f0ff" }}>
        <Suspense fallback={<div className="container mx-auto py-8">{t("loadingFallback")}</div>}>
          <CheckoutContent />
        </Suspense>
      </div>
      <Footer />
    </>
  )
}
