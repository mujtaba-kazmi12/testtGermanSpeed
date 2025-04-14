"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Copy, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { createProduct, submitPostingLink } from "@/lib/publisher"
import { postCategories } from "@/lib/data/categories"
import type { CreateProductPayload, ProductFormData } from "@/types/publisher"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Toast } from "@/components/toast/Toast"

export default function CreateProduct() {
  const { toast } = useToast()
  const router = useRouter()
  const [siteTypes, setSiteTypes] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [openCategorySelector, setOpenCategorySelector] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [postedLink, setPostedLink] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [productId, setProductId] = useState<string>("")
  const [linkType, setLinkType] = useState("doFollow")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingLink, setIsSubmittingLink] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)

  const [formData, setFormData] = useState<ProductFormData>({
    siteName: "",
    websiteUrl: "",
    authorLink: "",
    language: "german",
    country: "germany",
    currency: "EUR",
    liveTime: "",
    niche: "General",
    turnAroundTime: "",
    maxLinkAllowed: "",
    wordLimit: "",
    linkInsertionPrice: "",
    newPostPrice: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleCategorySelect = (value: string) => {
    setSelectedCategories(
      selectedCategories.includes(value)
        ? selectedCategories.filter((item) => item !== value)
        : [...selectedCategories, value],
    )
  }

  const handleCopyToClipboard = async () => {
    try {
      // Use both clipboard methods for better compatibility
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Modern approach
        await navigator.clipboard.writeText(generatedLink);
      } else {
        // Fallback approach
        const textArea = document.createElement('textarea');
        textArea.value = generatedLink;
        
        // Make the textarea out of viewport
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        if (!successful) {
          throw new Error('Failed to copy text');
        }
        
        document.body.removeChild(textArea);
      }
      
      setIsCopied(true);
      
      // Reset the "Copied" state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy: ', error);
      Toast.showError("Could not copy to clipboard. Please copy manually.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (siteTypes.length === 0) {
        Toast.showError("Please select at least one site type")
        setIsSubmitting(false)
        return
      }

      const payload = {
        siteName: formData.siteName,
        websiteUrl: formData.websiteUrl,
        language: formData.language,
        country: formData.country,
        currency: formData.currency,
        liveTime: formData.liveTime,
        niche: formData.niche,
        turnAroundTime: formData.turnAroundTime,
        maxLinkAllowed: formData.maxLinkAllowed,
        Wordlimit: formData.wordLimit,
        category: selectedCategories,
        linkType: linkType,
        siteType: siteTypes.join(", "),
        sampleLink: formData.authorLink,
        ...(siteTypes.includes("linkInsertion") && {
          linkInsertionPrice: Number.parseInt(formData.linkInsertionPrice),
        }),
        ...(siteTypes.includes("newPost") && {
          newPostPrice: Number.parseInt(formData.newPostPrice),
        }),
      } as any;

      const result = await createProduct(payload)
      console.log("API response:", result)

      if (result && Array.isArray(result) && result.length > 0) {
        const productData = result[0]

        if (productData.postingLink) {
          setGeneratedLink(productData.postingLink)
        } else {
          Toast.showError("No posting link was returned from the server")
        }

        if (productData.id) {
          setProductId(productData.id)
        }
      } else {
        Toast.showError(result?.message || "Unexpected API response format. Please try again.")
        setIsSubmitting(false)
        return
      }

      // Reset form after successful submission
      setFormData({
        siteName: "",
        websiteUrl: "",
        language: "",
        country: "",
        currency: "",
        liveTime: "",
        niche: "",
        turnAroundTime: "",
        maxLinkAllowed: "",
        wordLimit: "",
        authorLink: "",
        linkInsertionPrice: "",
        newPostPrice: "",
      })
      setSelectedCategories([])
      setSiteTypes([])
      setLinkType("")

      setShowConfirmModal(true)
      Toast.showSuccess("Product created successfully!")
    } catch (error: any) {
      console.error("Error creating post:", error)

      // Show the actual API error message if available
      const errorMessage = error.response?.data?.message || "Failed to create post. Please try again."
      Toast.showError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // const handleConfirmPostedLink = async () => {
  //   if (!postedLink) {
  //     Toast.showError("Please paste the posted link")
  //     return
  //   }

  //   if (!productId) {
  //     Toast.showError("Product ID is missing. Please try again.")
  //     return
  //   }

  //   setIsSubmittingLink(true)

  //   try {
  //     console.log("Submitting posting link for product ID:", productId)

  //     const result = await submitPostingLink(productId, postedLink)
  //     console.log("API response result:", result)

  //     setShowConfirmModal(false)
  //     Toast.showSuccess("Post submitted successfully")

  //     setTimeout(() => {
  //       // router.push("/publisher/products");
  //     }, 10)
  //   } catch (error: any) {
  //     console.error("Error submitting posting link:", error)

  //     const errorMessage = error.response?.data?.message || "Failed to submit posting link. Please try again."
  //     Toast.showError(errorMessage)
  //   } finally {
  //     setIsSubmittingLink(false)
  //   }
  // }
  const handleConfirmPostedLink = async () => {
    if (!postedLink) {
      Toast.showError("Please paste the posted link")
      return
    }

    if (!productId) {
      Toast.showError("Product ID is missing. Please try again.")
      return
    }

    setIsSubmittingLink(true)

    try {
      console.log("Submitting posting link for product ID:", productId)

      const result = await submitPostingLink(productId, postedLink)
      console.log("API response result:", result)

      setSubmissionComplete(true)
      setShowConfirmModal(false)
      Toast.showSuccess("Post submitted successfully")

      // We'll let the useEffect handle the refresh when modal closes
    } catch (error: any) {
      console.error("Error submitting posting link:", error)

      const errorMessage = error.response?.data?.message || "Failed to submit posting link. Please try again."
      Toast.showError(errorMessage)
    } finally {
      setIsSubmittingLink(false)
    }
  }
  useEffect(() => {
    // Only refresh when the modal is closed AND we've completed a submission
    if (!showConfirmModal && submissionComplete) {
      console.log("Dialog closed after successful submission. Refreshing page...")
      // Small delay to ensure the modal is fully closed
      const refreshTimer = setTimeout(() => {
        window.location.reload()
        // Reset the flag
        setSubmissionComplete(false)
      }, 300)

      return () => clearTimeout(refreshTimer)
    }
  }, [showConfirmModal, submissionComplete])

  useEffect(() => {
    console.log("showConfirmModal state:", showConfirmModal)
  }, [showConfirmModal])

  return (
    <div className="px-5">
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>Fill in the details below to create a new post for your dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Site Type</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="link-insertion"
                    checked={siteTypes.includes("linkInsertion")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSiteTypes([...siteTypes, "linkInsertion"])
                      } else {
                        setSiteTypes(siteTypes.filter((type) => type !== "linkInsertion"))
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="link-insertion" className="cursor-pointer">
                    Link Insertion
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="new-post"
                    checked={siteTypes.includes("newPost")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSiteTypes([...siteTypes, "newPost"])
                      } else {
                        setSiteTypes(siteTypes.filter((type) => type !== "newPost"))
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="new-post" className="cursor-pointer">
                    New Post
                  </Label>
                </div>
              </div>
            </div>

            {siteTypes.includes("linkInsertion") && (
              <div className="space-y-2">
                <Label htmlFor="linkInsertionPrice">Link Insertion Price</Label>
                <Input
                  id="linkInsertionPrice"
                  placeholder="Enter price"
                  type="number"
                  value={formData.linkInsertionPrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {siteTypes.includes("newPost") && (
              <div className="space-y-2">
                <Label htmlFor="newPostPrice">New Post Price</Label>
                <Input
                  id="newPostPrice"
                  placeholder="Enter price"
                  type="number"
                  value={formData.newPostPrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                placeholder="https://example.com"
                type="url"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorLink">Author Link</Label>
              <Input
                id="authorLink"
                placeholder="https://author.example.com"
                type="url"
                value={formData.authorLink}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country">Select Country</Label>
                <Select defaultValue={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="germany">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Select Currency</Label>
                <Select
                  defaultValue={formData.currency}
                  onValueChange={(value) => handleSelectChange("currency", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="liveTime">Time Period</Label>
                <Select onValueChange={(value) => handleSelectChange("liveTime", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6 Month">6 months</SelectItem>
                    <SelectItem value="12 Month">12 months</SelectItem>
                    <SelectItem value="24 Month">24 months</SelectItem>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="niche">Niche</Label>
                <Select defaultValue={formData.niche} onValueChange={(value) => handleSelectChange("niche", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crypto">Crypto</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Forex">Forex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  placeholder="Enter site name"
                  value={formData.siteName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  defaultValue={formData.language}
                  onValueChange={(value) => handleSelectChange("language", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="turnAroundTime">Turn Around Time (in days)</Label>
                <Input
                  id="turnAroundTime"
                  placeholder="Enter days"
                  type="number"
                  min="1"
                  value={formData.turnAroundTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLinkAllowed">Max Link Allowed</Label>
                <Input
                  id="maxLinkAllowed"
                  placeholder="Enter max links"
                  type="number"
                  min="1"
                  value={formData.maxLinkAllowed}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordLimit">Word Limit</Label>
                <Input
                  id="wordLimit"
                  placeholder="Enter word limit"
                  type="number"
                  min="1"
                  value={formData.wordLimit}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-0">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1 mb-1">
                      {postCategories.find((c) => c.value === category)?.label}
                      <button
                        type="button"
                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={() => handleCategorySelect(category)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Popover open={openCategorySelector} onOpenChange={setOpenCategorySelector}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCategorySelector}
                      className="w-full justify-between mt-0"
                    >
                      Select categories
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <div className="relative">
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Search categories..."
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {postCategories.length === 0 && (
                        <div className="py-6 text-center text-sm">No category found.</div>
                      )}
                      <div className="p-1">
                        {postCategories.map((category) => (
                          <div
                            key={category.value}
                            className={cn(
                              "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                              selectedCategories.includes(category.value) ? "bg-accent text-accent-foreground" : "",
                            )}
                            onClick={() => handleCategorySelect(category.value)}
                          >
                            <div
                              className={cn(
                                "mr-2 h-4 w-4 flex items-center justify-center",
                                selectedCategories.includes(category.value) ? "opacity-100" : "opacity-0",
                              )}
                            >
                              <Check className="h-4 w-4" />
                            </div>
                            {category.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Link Type</Label>
              <RadioGroup
                defaultValue="doFollow"
                value={linkType}
                onValueChange={setLinkType}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="doFollow" id="doFollow" />
                  <Label htmlFor="doFollow" className="cursor-pointer">
                    DoFollow
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="noFollow" id="noFollow" />
                  <Label htmlFor="noFollow" className="cursor-pointer">
                    NoFollow
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="ml-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md py-5"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Post"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={showConfirmModal} onOpenChange={() => setShowConfirmModal(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Important!</DialogTitle>
            <DialogDescription className="text-destructive font-semibold">
              Copy this link, paste it in your website, and then submit your post link here.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="generated-link">Generated Link:</Label>
              <div className="flex items-center">
                <Input id="generated-link" value={generatedLink} readOnly className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-2 min-w-[80px]"
                  onClick={handleCopyToClipboard}
                >
                  {isCopied ? (
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </span>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="posted-link">Paste Posted Link:</Label>
              <Input
                id="posted-link"
                value={postedLink}
                onChange={(e) => setPostedLink(e.target.value)}
                placeholder="Paste your posted link here"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleConfirmPostedLink} disabled={isSubmittingLink}>
              {isSubmittingLink ? "Submitting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}