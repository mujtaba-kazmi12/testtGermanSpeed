"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Star,
  Users,
  Eye,
  Filter,
  Sparkles,
  BarChart,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PostDrawer } from "./post-drawer"
import { TableData, type Product } from "@/app/[locale]/Services/product-service"

// Add after imports
const cardStyles = `
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 1200px) {
    .card-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }
  
  @media (max-width: 640px) {
    .card-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .card-equal-height {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .truncate-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(139, 92, 246, 0.3);
    border-radius: 3px;
  }

  .range-input-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .range-input {
    width: 70px;
    text-align: center;
  }

  .pagination-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    font-weight: 500;
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
    padding: 0.5rem 1rem;
  }

  .pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-active {
    background-color: rgb(139, 92, 246);
    color: white;
  }
`

const MarketSection = () => {
  const t = useTranslations("marketplace")
  useEffect(() => {
    // Component mount logic
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [viewsRange, setViewsRange] = useState([0, 15000])
  const [daRange, setDaRange] = useState([0, 100])
  const [drRange, setDrRange] = useState([0, 100])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [minMaxPrice, setMinMaxPrice] = useState<[number, number]>([0, 1000])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Product | null>(null)
  const [sortBy, setSortBy] = useState("newest")
  const [minRating, setMinRating] = useState("3.0")
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 9
  const [showMore, setShowMore] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({})
  const [filtersApplied, setFiltersApplied] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState({
    priceRange: [0, 1000],
    viewsRange: [0, 15000],
    daRange: [0, 100],
    drRange: [0, 100],
    categories: {} as Record<string, boolean>,
    minRating: "3.0",
  })
  // Add this state to store all products for frontend filtering
  const [allProducts, setAllProducts] = useState<Product[]>([])

  const handlePriceMinChange = (value: number) => {
    const newValue = Math.max(0, value)
    setPriceRange([newValue, Math.max(priceRange[1], newValue + 1)])
  }

  const handlePriceMaxChange = (value: number) => {
    const newValue = Math.max(priceRange[0] + 1, value)
    setPriceRange([priceRange[0], newValue])
  }

  const handleDaMinChange = (value: number) => {
    const newValue = Math.max(0, Math.min(100, value))
    setDaRange([newValue, Math.max(daRange[1], newValue + 1)])
  }

  const handleDaMaxChange = (value: number) => {
    const newValue = Math.max(daRange[0] + 1, Math.min(100, value))
    setDaRange([daRange[0], newValue])
  }

  const handleDrMinChange = (value: number) => {
    const newValue = Math.max(0, Math.min(100, value))
    setDrRange([newValue, Math.max(drRange[1], newValue + 1)])
  }

  const handleDrMaxChange = (value: number) => {
    const newValue = Math.max(drRange[0] + 1, Math.min(100, value))
    setDrRange([drRange[0], newValue])
  }

  // Helper function to search across all fields
  const searchAllFields = (item: Product, searchLower: string) => {
    // Check all string fields
    if (
      // Basic fields
      (item.siteName && item.siteName.toLowerCase().includes(searchLower)) ||
      (item.title && item.title.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      (item.productHandeledBy && item.productHandeledBy.toLowerCase().includes(searchLower)) ||
      (item.url && item.url.toLowerCase().includes(searchLower)) ||
      (item.email && item.email.toLowerCase().includes(searchLower)) ||
      (item.language && item.language.toLowerCase().includes(searchLower)) ||
      (item.country && item.country.toLowerCase().includes(searchLower)) ||
      // Category handling
      (Array.isArray(item.category) && item.category.some((cat) => cat.toLowerCase().includes(searchLower))) ||
      (typeof item.category === "string" && item.category.toLowerCase().includes(searchLower)) ||
      // Tags handling
      (Array.isArray(item.tags) && item.tags.some((tag) => tag.toLowerCase().includes(searchLower))) ||
      (typeof item.tags === "string" && item.tags.toLowerCase().includes(searchLower)) ||
      // Check any other potential text fields
      (item.notes && item.notes.toLowerCase().includes(searchLower)) ||
      (item.comments && item.comments.toLowerCase().includes(searchLower))
    ) {
      return true
    }

    // Check numeric fields as strings
    if (
      (item.domainAuthority !== undefined && item.domainAuthority.toString().includes(searchLower)) ||
      (item.domainRatings !== undefined && item.domainRatings.toString().includes(searchLower)) ||
      (item.monthlyTraffic !== undefined && item.monthlyTraffic.toString().includes(searchLower)) ||
      (item.adjustedPrice !== undefined && item.adjustedPrice.toString().includes(searchLower))
    ) {
      return true
    }

    // Check any nested objects that might contain searchable text
    if (item.metadata && typeof item.metadata === "object") {
      for (const key in item.metadata) {
        const value = (item.metadata as any)[key]
        if (typeof value === "string" && value.toLowerCase().includes(searchLower)) {
          return true
        }
      }
    }

    return false
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiFilters: any = {}
        if (filtersApplied) {
          apiFilters.minPrice = String(appliedFilters.priceRange[0])
          apiFilters.maxPrice = String(appliedFilters.priceRange[1])
          apiFilters.minDA = String(appliedFilters.daRange[0])
          apiFilters.maxDA = String(appliedFilters.daRange[1])
          apiFilters.minDR = String(appliedFilters.drRange[0])
          apiFilters.maxDR = String(appliedFilters.drRange[1])
          const appliedCats = Object.keys(appliedFilters.categories).filter((cat) => appliedFilters.categories[cat])
          if (appliedCats.length > 0) {
            apiFilters.categories = appliedCats
          }
        }
        // Remove search from API call - we'll filter on the frontend
        const response = await TableData(setError, currentPage, itemsPerPage, apiFilters)
        if (response && response.items && response.items.length > 0) {
          // Store all products for frontend filtering
          setAllProducts(response.items)

          // Apply frontend search filter if needed
          let filteredItems = response.items
          if (searchTerm && searchTerm.trim() !== "") {
            const searchLower = searchTerm.trim().toLowerCase()
            filteredItems = response.items.filter((item) => searchAllFields(item, searchLower))
          }

          setProducts(filteredItems)

          if (response.total && response.limit) {
            const calculatedTotalPages = Math.ceil(response.total / response.limit)
            setTotalItems(filteredItems.length) // Update to show filtered count
            setTotalPages(calculatedTotalPages > 1 ? calculatedTotalPages : 1)
          } else {
            setTotalItems(filteredItems.length)
            setTotalPages(1)
          }
          const prices = response.items
            .map((item) =>
              typeof item.adjustedPrice === "string" ? Number.parseFloat(item.adjustedPrice) : item.adjustedPrice || 0,
            )
            .filter((price) => !isNaN(price))
          if (prices.length > 0) {
            const minPrice = Math.floor(Math.min(...prices))
            const maxPrice = Math.ceil(Math.max(...prices))
            if (!filtersApplied) {
              setMinMaxPrice([minPrice, maxPrice])
              setPriceRange([minPrice, maxPrice])
            }
          }
          const daValues = response.items.map((item) => item.domainAuthority || item.da || 0).filter((da) => !isNaN(da))
          if (daValues.length > 0) {
            const minDA = Math.floor(Math.min(...daValues))
            const maxDA = Math.ceil(Math.max(...daValues))
            if (!filtersApplied) {
              setDaRange([minDA, maxDA])
            }
          }
          const drValues = response.items.map((item) => item.domainRatings || item.dr || 0).filter((dr) => !isNaN(dr))
          if (drValues.length > 0) {
            const minDR = Math.floor(Math.min(...drValues))
            const maxDR = Math.ceil(Math.max(...drValues))
            if (!filtersApplied) {
              setDrRange([minDR, maxDR])
            }
          }
          const categories = new Set<string>()
          response.items.forEach((item) => {
            if (Array.isArray(item.category)) {
              item.category.forEach((cat) => categories.add(cat))
            } else if (typeof item.category === "string") {
              categories.add(item.category)
            }
          })
          const categoryList = Array.from(categories)
          setAvailableCategories(categoryList)
          if (Object.keys(selectedCategories).length === 0) {
            setSelectedCategories(
              categoryList.reduce(
                (acc, category) => {
                  acc[category] = false
                  return acc
                },
                {} as Record<string, boolean>,
              ),
            )
          }
        } else {
          setError(t("error.noProducts"))
          setProducts([])
          setTotalPages(1)
          setTotalItems(0)
        }
      } catch (err) {
        setError(t("error.fetchFailed"))
        setProducts([])
        setTotalPages(1)
        setTotalItems(0)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filtersApplied, appliedFilters, currentPage, t])

  // Add a separate effect for search filtering
  useEffect(() => {
    if (allProducts.length > 0) {
      if (searchTerm && searchTerm.trim() !== "") {
        const searchLower = searchTerm.trim().toLowerCase()
        const filteredItems = allProducts.filter((item) => searchAllFields(item, searchLower))
        setProducts(filteredItems)
        setTotalItems(filteredItems.length)
      } else {
        // If no search term, restore original products
        setProducts(allProducts)
        setTotalItems(allProducts.length)
      }
    }
  }, [searchTerm, allProducts])

  const applyFilters = () => {
    setAppliedFilters({
      priceRange,
      viewsRange,
      daRange,
      drRange,
      categories: { ...selectedCategories },
      minRating,
    })
    setFiltersApplied(true)
    setCurrentPage(1)
  }

  const transformedProducts = products.map((product) => {
    return {
      ...product,
      title: product.siteName || "",
      category: Array.isArray(product.category) ? product.category.join(", ") : product.category || "",
      author: product.productHandeledBy || "",
      domainRatings: product.domainRatings || 0,
      domainAuthority: product.domainAuthority || 0,
      rating: product.domainRatings ? product.domainRatings / 20 : 4.0,
      views: product.monthlyTraffic || 1000,
      price:
        typeof product.adjustedPrice === "string"
          ? Number.parseFloat(product.adjustedPrice)
          : product.adjustedPrice || 0,
      dateAdded: new Date(product.createdAt || Date.now()),
    }
  })

  const sortedProducts = [...transformedProducts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    } else if (sortBy === "priceLowToHigh") {
      const priceA = typeof a.price === "number" ? a.price : Number.parseFloat(String(a.price || 0))
      const priceB = typeof b.price === "number" ? b.price : Number.parseFloat(String(b.price || 0))
      return priceA - priceB
    } else if (sortBy === "priceHighToLow") {
      const priceA = typeof a.price === "number" ? a.price : Number.parseFloat(String(a.price || 0))
      const priceB = typeof b.price === "number" ? b.price : Number.parseFloat(String(b.price || 0))
      return priceB - priceA
    } else if (sortBy === "rating") {
      return b.rating - a.rating
    } else {
      return (b.views || 0) - (a.views || 0)
    }
  })

  const newPosts = [...transformedProducts]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 3)

  const handleViewDetail = (post: Product) => {
    setSelectedPost(post)
    setIsDrawerOpen(true)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  useEffect(() => {
    document.querySelectorAll(".card-selected").forEach((card) => {
      card.classList.remove("card-selected")
    })

    if (isDrawerOpen && selectedPost) {
      const selectedCard = document.getElementById(`post-card-${selectedPost.id}`)
      if (selectedCard) {
        selectedCard.classList.add("card-selected")
      }
    }
  }, [isDrawerOpen, selectedPost])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisibleButtons = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1)

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1)
    }

    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className="mr-1"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>,
    )

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={`mx-1 ${currentPage === i ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg" : ""}`}
        >
          {i}
        </Button>,
      )
    }

    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="ml-1"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>,
    )

    return buttons
  }

  return (
    <section className="container mx-auto py-8 px-4">
      <style>{cardStyles}</style>
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
        <div className="space-y-2">
          <Badge className="inline-flex bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-700 border-violet-200">
            <Sparkles className="mr-1 h-3 w-3" /> {t("hero.badge")}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight glow-text">
            <span className="gradient-text">{t("hero.title1")}</span> {t("hero.title2")}
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">{t("hero.description")}</p>
        </div>
      </div>

      <Tabs defaultValue="trending" className="w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block w-72 flex-shrink-0 border rounded-xl p-6 bg-white shadow-md sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            <div className="font-semibold text-lg mb-6 flex items-center">
              <Filter className="mr-2 h-4 w-4 text-violet-600" /> {t("filters.title")}
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="price-range" className="text-sm font-medium">
                  {t("filters.price")}
                </Label>
                <div className="flex justify-between mb-2">
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceMinChange(Number.parseInt(e.target.value) || 0)}
                    className="w-[70px] text-center"
                    min={0}
                    aria-label={t("filters.min")}
                  />
                  <span className="text-sm text-muted-foreground self-center">{t("filters.toSeparator")}</span>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceMaxChange(Number.parseInt(e.target.value) || 0)}
                    className="w-[70px] text-center"
                    min={priceRange[0] + 1}
                    aria-label={t("filters.max")}
                  />
                </div>
                <Slider
                  id="price-range"
                  min={minMaxPrice[0]}
                  max={minMaxPrice[1]}
                  step={1}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="da-range" className="text-sm font-medium">
                  {t("filters.domain_authority")}
                </Label>
                <div className="flex justify-between mb-2">
                  <Input
                    type="number"
                    value={daRange[0]}
                    onChange={(e) => handleDaMinChange(Number.parseInt(e.target.value) || 0)}
                    className="w-[70px] text-center"
                    min={0}
                    max={100}
                    aria-label={t("filters.min")}
                  />
                  <span className="text-sm text-muted-foreground self-center">{t("filters.toSeparator")}</span>
                  <Input
                    type="number"
                    value={daRange[1]}
                    onChange={(e) => handleDaMaxChange(Number.parseInt(e.target.value) || 0)}
                    className="w-[70px] text-center"
                    min={daRange[0] + 1}
                    max={100}
                    aria-label={t("filters.max")}
                  />
                </div>
                <Slider
                  id="da-range"
                  min={0}
                  max={100}
                  step={1}
                  value={daRange}
                  onValueChange={setDaRange}
                  className="py-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dr-range" className="text-sm font-medium">
                  {t("filters.domain_rating")}
                </Label>
                <div className="flex justify-between mb-2">
                  <Input
                    type="number"
                    value={drRange[0]}
                    onChange={(e) => handleDrMinChange(Number.parseInt(e.target.value) || 0)}
                    className="w-[70px] text-center"
                    min={0}
                    max={100}
                    aria-label={t("filters.min")}
                  />
                  <span className="text-sm text-muted-foreground self-center">{t("filters.toSeparator")}</span>
                  <Input
                    type="number"
                    value={drRange[1]}
                    onChange={(e) => handleDrMaxChange(Number.parseInt(e.target.value) || 0)}
                    className="w-[70px] text-center"
                    min={drRange[0] + 1}
                    max={100}
                    aria-label={t("filters.max")}
                  />
                </div>
                <Slider
                  id="dr-range"
                  min={0}
                  max={100}
                  step={1}
                  value={drRange}
                  onValueChange={setDrRange}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("filters.categories")}</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {availableCategories.length > 0 ? (
                    <>
                      {availableCategories.slice(0, 5).map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories[category] || false}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <label htmlFor={`category-${category}`} className="text-sm">
                            {category}
                          </label>
                        </div>
                      ))}
                      {showMore && (
                        <div className="mt-2 space-y-2">
                          {availableCategories.slice(5).map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-${category}`}
                                checked={selectedCategories[category] || false}
                                onCheckedChange={() => toggleCategory(category)}
                              />
                              <label htmlFor={`category-${category}`} className="text-sm">
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      {availableCategories.length > 5 && (
                        <div className="pt-2">
                          <button
                            onClick={() => setShowMore(!showMore)}
                            className="text-sm text-violet-600 hover:text-violet-700"
                          >
                            {showMore ? t("filters.showLess") : t("filters.showMore")}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">{t("filters.noCategories")}</div>
                  )}
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={applyFilters}
              >
                {t("filters.apply_filters")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPriceRange(minMaxPrice)
                  setViewsRange([0, 15000])
                  const daValues = products
                    .map((item) => item.domainAuthority || item.da || 0)
                    .filter((da) => !isNaN(da))
                  if (daValues.length > 0) {
                    const minDA = Math.floor(Math.min(...daValues))
                    const maxDA = Math.ceil(Math.max(...daValues))
                    setDaRange([minDA, maxDA])
                  } else {
                    setDaRange([0, 100])
                  }
                  const drValues = products.map((item) => item.domainRatings || item.dr || 0).filter((dr) => !isNaN(dr))
                  if (drValues.length > 0) {
                    const minDR = Math.floor(Math.min(...drValues))
                    const maxDR = Math.ceil(Math.max(...drValues))
                    setDrRange([minDR, maxDR])
                  } else {
                    setDrRange([0, 100])
                  }
                  setSelectedCategories(
                    availableCategories.reduce(
                      (acc, key) => {
                        acc[key] = false
                        return acc
                      },
                      {} as Record<string, boolean>,
                    ),
                  )
                  setFiltersApplied(false)
                  setSearchTerm("")
                  setCurrentPage(1)
                }}
              >
                {t("filters.reset_filters")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("sort.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t("sort.newest")}</SelectItem>
                  <SelectItem value="priceLowToHigh">{t("sort.price_low_high")}</SelectItem>
                  <SelectItem value="priceHighToLow">{t("sort.price_high_low")}</SelectItem>
                  <SelectItem value="rating">{t("sort.rating")}</SelectItem>
                  <SelectItem value="views">{t("sort.views")}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 w-full sm:w-auto sm:min-w-[200px]">
                  <Input
                    type="text"
                    placeholder={t("filters.search")}
                    className="pr-10 w-full"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      // Reset to page 1 when searching
                      setCurrentPage(1)
                    }}
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {(searchTerm || filtersApplied) && (
              <div className="text-sm text-muted-foreground">
                {t("results.count", { count: sortedProducts.length })}
                {searchTerm && <span> {t("results.forTerm", { term: searchTerm })}</span>}
                {filtersApplied && <span> {t("results.withFilters")}</span>}
              </div>
            )}

            {loading && (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
                  <div className="text-lg font-medium">{("loading")}</div>
                </div>
              </div>
            )}

            {error && !loading && sortedProducts.length === 0 && (
              <div className="py-12 text-center">
                <div className="text-lg font-medium text-red-500">{error}</div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setError(null)
                    const fetchData = async () => {
                      setLoading(true)
                      try {
                        const response = await TableData(setError, 1, 10)
                        if (response) {
                          setProducts(response.items)
                          setAllProducts(response.items)
                          if (response.total) {
                            setTotalItems(response.total)
                            setTotalPages(Math.ceil(response.total / itemsPerPage))
                          }
                        }
                      } catch (err) {
                        setError(t("error.fetchFailed"))
                      } finally {
                        setLoading(false)
                      }
                    }
                    fetchData()
                  }}
                >
                  {t("error.tryAgain")}
                </Button>
              </div>
            )}
            <TabsContent value="trending">
              {!loading && !error && sortedProducts.length > 0 ? (
                <div className="card-grid py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedProducts.map((post, index) => (
                    <Card
                      key={post.id}
                      id={`post-card-${post.id}`}
                      className="transition-all duration-200 flex flex-col h-full overflow-hidden w-full hover:shadow-lg rounded-md border border-gray-200"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-semibold truncate">{post.siteName || post.title}</CardTitle>
                        <CardDescription className="mt-1">
  <Badge variant="outline" className="border-violet-200 text-violet-700 bg-violet-50">
    {(() => {
      const category = post.category as string | string[];

      if (Array.isArray(category)) {
        return category.slice(0, 3).join(", ");
      }

      if (typeof category === "string") {
        return category.split(",").slice(0, 3).join(", ");
      }

      return "";
    })()}
  </Badge>
</CardDescription>

                        <div className="flex items-center flex-shrink-0 ">
                          {[...Array(Math.round(post.rating || 4))].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-fuchsia-500 text-fuchsia-500 mr-1" />
                          ))}
                          <span className="font-medium">{post.rating?.toFixed(1) || "4.0"}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 pb-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm overflow-hidden">
                            <Users className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span className="font-medium truncate max-w-[150px]">
                              {t("product.authorPrefix")}
                              {post.productHandeledBy || post.author || "Anonymous"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm">
                          <Eye className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">
                            {post.monthlyTraffic?.toLocaleString() || post.views?.toLocaleString() || "0"}
                            {t("product.viewsSuffix")}
                          </span>
                        </div>

                        <div className="flex items-center text-sm">
                          <BarChart className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                          <span className="truncate font-medium">
                            {t("product.daPrefix")}
                            {post.domainAuthority || t("product.notAvailable")}
                          </span>
                        </div>

                        <div className="flex items-center text-sm">
                          <TrendingUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                          <span className="truncate font-medium">
                            {t("product.drPrefix")}
                            {post.domainRatings || t("product.notAvailable")}
                          </span>
                        </div>

                        <div className="mt-4 text-2xl font-bold text-right text-violet-600">
                          €
                          {typeof post.price === "number"
                            ? post.price.toFixed(2)
                            : Number.parseFloat(String(post.price || 0)).toFixed(2)}
                        </div>
                      </CardContent>
                      <CardFooter className="p-5 pt-0 mt-auto">
                        <Button
                          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md py-5"
                          onClick={() => handleViewDetail(post)}
                        >
                          {t("product.view_details")}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : !loading && !error ? (
                <div className="py-12 text-center">
                  <div className="text-lg font-medium">{t("noResults.title")}</div>
                  <p className="text-muted-foreground mt-2">{t("noResults.description")}</p>
                  {(searchTerm || filtersApplied) && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("")
                        setPriceRange(minMaxPrice)
                        setViewsRange([0, 15000])
                        setDaRange([daRange[0], daRange[1]])
                        setDrRange([drRange[0], drRange[1]])
                        setSelectedCategories(
                          availableCategories.reduce(
                            (acc, key) => {
                              acc[key] = false
                              return acc
                            },
                            {} as Record<string, boolean>,
                          ),
                        )
                        setFiltersApplied(false)
                        setCurrentPage(1)
                      }}
                    >
                      {t("noResults.clearFilters")}
                    </Button>
                  )}
                </div>
              ) : null}
            </TabsContent>

            {!loading && !error && sortedProducts.length > 0 && (
              <div className="flex justify-center items-center mt-6 mb-4">
                <div className="flex space-x-1">{renderPaginationButtons()}</div>
              </div>
            )}

            {!loading && !error && sortedProducts.length > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                {t("pagination.pageInfo", { currentPage: currentPage, totalPages: totalPages, totalItems: totalItems })}
              </div>
            )}
          </div>
        </div>
      </Tabs>
      <PostDrawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} post={selectedPost} loading={loading} />
    </section>
  )
}

export default MarketSection

