"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Filter, Search, Star, TrendingUp, Users } from "lucide-react"

export default function MarketplaceSeller() {
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [viewsRange, setViewsRange] = useState([0, 10000])

  // Mock data for guest posts
  const guestPosts = [
    {
      id: 1,
      title: "How to Increase Your Online Sales",
      category: "E-commerce",
      price: 350,
      views: 8500,
      rating: 4.8,
      author: "Marketing Expert",
      date: "2 days ago",
      featured: true,
    },
    {
      id: 2,
      title: "10 SEO Tips for Small Businesses",
      category: "Digital Marketing",
      price: 250,
      views: 5200,
      rating: 4.5,
      author: "SEO Specialist",
      date: "5 days ago",
      featured: false,
    },
    {
      id: 3,
      title: "Building a Brand on Social Media",
      category: "Social Media",
      price: 400,
      views: 7800,
      rating: 4.7,
      author: "Brand Strategist",
      date: "1 week ago",
      featured: true,
    },
    {
      id: 4,
      title: "Email Marketing Strategies That Work",
      category: "Email Marketing",
      price: 300,
      views: 4200,
      rating: 4.3,
      author: "Marketing Manager",
      date: "2 weeks ago",
      featured: false,
    },
    {
      id: 5,
      title: "Product Photography for E-commerce",
      category: "E-commerce",
      price: 450,
      views: 6100,
      rating: 4.9,
      author: "Professional Photographer",
      date: "3 days ago",
      featured: true,
    },
    {
      id: 6,
      title: "Customer Retention Strategies",
      category: "Business",
      price: 275,
      views: 3800,
      rating: 4.4,
      author: "Business Consultant",
      date: "1 week ago",
      featured: false,
    },
  ]

  // Filter posts based on price and views range
  const filteredPosts = guestPosts.filter(
    (post) =>
      post.price >= priceRange[0] &&
      post.price <= priceRange[1] &&
      post.views >= viewsRange[0] &&
      post.views <= viewsRange[1],
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar with filters */}
      <div className="hidden md:flex w-72 flex-col border-r p-6 bg-muted/20">
        <div className="font-semibold text-lg mb-6">Filters</div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="price-range">
              Price Range (${priceRange[0]} - ${priceRange[1]})
            </Label>
            <Slider
              id="price-range"
              min={0}
              max={1000}
              step={50}
              value={priceRange}
              onValueChange={setPriceRange}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="views-range">
              Views ({viewsRange[0]} - {viewsRange[1]})
            </Label>
            <Slider
              id="views-range"
              min={0}
              max={10000}
              step={500}
              value={viewsRange}
              onValueChange={setViewsRange}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="e-commerce" />
                <label htmlFor="e-commerce" className="text-sm">
                  E-commerce
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="digital-marketing" />
                <label htmlFor="digital-marketing" className="text-sm">
                  Digital Marketing
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="social-media" />
                <label htmlFor="social-media" className="text-sm">
                  Social Media
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="business" />
                <label htmlFor="business" className="text-sm">
                  Business
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Minimum Rating</Label>
            <Select defaultValue="4.0">
              <SelectTrigger id="rating">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3.0">3.0+</SelectItem>
                <SelectItem value="3.5">3.5+</SelectItem>
                <SelectItem value="4.0">4.0+</SelectItem>
                <SelectItem value="4.5">4.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Post Age</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="today" />
                <label htmlFor="today" className="text-sm">
                  Today
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="this-week" />
                <label htmlFor="this-week" className="text-sm">
                  This Week
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="this-month" />
                <label htmlFor="this-month" className="text-sm">
                  This Month
                </label>
              </div>
            </div>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90">Apply Filters</Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Guest Post Marketplace</h1>
              <p className="text-muted-foreground">Find and apply for guest posting opportunities</p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search posts..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon" className="md:hidden">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
              <Select defaultValue="trending">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="overflow-hidden border border-muted hover:border-primary/50 transition-colors"
                  >
                    {post.featured && (
                      <div className="bg-primary text-primary-foreground text-xs py-1 px-3 absolute right-2 top-2 rounded-full">
                        Featured
                      </div>
                    )}
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2">
                          {post.category}
                        </Badge>
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary mr-1" />
                          <span className="text-sm font-medium">{post.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        <span>By {post.author}</span>
                        <span className="mx-2">•</span>
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center text-sm">
                          <Eye className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>{post.views.toLocaleString()} views</span>
                        </div>
                        <div className="text-lg font-bold text-primary">${post.price}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full">Apply Now</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts
                  .filter((post) => post.featured)
                  .map((post) => (
                    <Card
                      key={post.id}
                      className="overflow-hidden border border-muted hover:border-primary/50 transition-colors"
                    >
                      <div className="bg-primary text-primary-foreground text-xs py-1 px-3 absolute right-2 top-2 rounded-full">
                        Featured
                      </div>
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="mb-2">
                            {post.category}
                          </Badge>
                          <div className="flex items-center">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary mr-1" />
                            <span className="text-sm font-medium">{post.rating}</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          <span>By {post.author}</span>
                          <span className="mx-2">•</span>
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center text-sm">
                            <Eye className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{post.views.toLocaleString()} views</span>
                          </div>
                          <div className="text-lg font-bold text-primary">${post.price}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full">Apply Now</Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 3)
                  .map((post) => (
                    <Card
                      key={post.id}
                      className="overflow-hidden border border-muted hover:border-primary/50 transition-colors"
                    >
                      {post.featured && (
                        <div className="bg-primary text-primary-foreground text-xs py-1 px-3 absolute right-2 top-2 rounded-full">
                          Featured
                        </div>
                      )}
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="mb-2">
                            {post.category}
                          </Badge>
                          <div className="flex items-center">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary mr-1" />
                            <span className="text-sm font-medium">{post.rating}</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          <span>By {post.author}</span>
                          <span className="mx-2">•</span>
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center text-sm">
                            <TrendingUp className="h-3.5 w-3.5 mr-1 text-primary" />
                            <span>{post.views.toLocaleString()} views</span>
                          </div>
                          <div className="text-lg font-bold text-primary">${post.price}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full">Apply Now</Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="new" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts
                  .filter((post) => post.date.includes("day"))
                  .map((post) => (
                    <Card
                      key={post.id}
                      className="overflow-hidden border border-muted hover:border-primary/50 transition-colors"
                    >
                      {post.featured && (
                        <div className="bg-primary text-primary-foreground text-xs py-1 px-3 absolute right-2 top-2 rounded-full">
                          Featured
                        </div>
                      )}
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="mb-2">
                            {post.category}
                          </Badge>
                          <div className="flex items-center">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary mr-1" />
                            <span className="text-sm font-medium">{post.rating}</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          <span>By {post.author}</span>
                          <span className="mx-2">•</span>
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center text-sm">
                            <Eye className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{post.views.toLocaleString()} views</span>
                          </div>
                          <div className="text-lg font-bold text-primary">${post.price}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full">Apply Now</Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-6">
            <Button variant="outline" className="mr-2">
              Previous
            </Button>
            <Button variant="outline" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" className="mx-1">
              2
            </Button>
            <Button variant="outline" className="mx-1">
              3
            </Button>
            <Button variant="outline" className="ml-2">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

