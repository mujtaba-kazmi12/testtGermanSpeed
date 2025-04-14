"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import { Check, ChevronDown, Edit, EyeIcon, Plus, Search, Trash, X, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Moderator, ModeratorFormData } from "@/types/moderator"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://newbackend.crective.com"

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

export default function ModeratorManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [moderators, setModerators] = useState<Moderator[]>([])
  const [filteredModerators, setFilteredModerators] = useState<Moderator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(null)
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([])
  const [formData, setFormData] = useState<ModeratorFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    permissions: [],
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadingModeratorId, setLoadingModeratorId] = useState<string | null>(null)

  // Add pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  })

  // Fetch moderators and permissions on component mount
  useEffect(() => {
    fetchModerators()
    fetchPermissions()
  }, [])

  // Filter moderators when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredModerators(moderators)
    } else {
      const filtered = moderators.filter(
        (moderator) =>
          moderator.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          moderator.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          moderator.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredModerators(filtered)
    }
  }, [searchTerm, moderators])

  // Fetch moderators
  const fetchModerators = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await api.get(`/v1/admin/get-moderators-by-admin?page=${page}&limit=${pagination.limit}`)
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setModerators(response.data.data)
        setFilteredModerators(response.data.data)
        setPagination({
          currentPage: response.data.page || 1,
          totalPages: Math.ceil(response.data.total / response.data.limit) || 1,
          totalItems: response.data.total || 0,
          limit: response.data.limit || 10,
        })
      } else {
        console.warn("Unexpected API response format:", response.data)
        setModerators([])
        setFilteredModerators([])
      }
    } catch (error) {
      console.error("Error fetching moderators:", error)
      toast.error("Failed to fetch moderators")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch available permissions
  const fetchPermissions = async () => {
    try {
      const response = await api.get("/v1/admin/get-permissions")
      if (response.data && response.data.permission && Array.isArray(response.data.permission)) {
        setAvailablePermissions(response.data.permission)
      } else {
        console.warn("Unexpected permissions API response format:", response.data)
        setAvailablePermissions([])
      }
    } catch (error) {
      console.error("Error fetching permissions:", error)
      toast.error("Failed to fetch permissions")
    }
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Open form dialog for adding a new moderator
  const openAddModeratorDialog = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      permissions: [],
    })
    setIsEditMode(false)
    setIsFormDialogOpen(true)
  }

  // Open form dialog for editing a moderator
  const openEditModeratorDialog = (moderator: Moderator) => {
    setSelectedModerator(moderator)
    setFormData({
      firstName: moderator.firstName,
      lastName: moderator.lastName,
      email: moderator.email,
      password: "", // Password field is empty when editing
      permissions: moderator.permissions || [],
    })
    setIsEditMode(true)
    setIsFormDialogOpen(true)
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (moderator: Moderator) => {
    setSelectedModerator(moderator)
    setIsDeleteDialogOpen(true)
  }

  // Open permissions view dialog
  const openPermissionsDialog = (moderator: Moderator) => {
    setSelectedModerator(moderator)
    setIsPermissionsDialogOpen(true)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Toggle permission selection
  const togglePermission = (permission: string) => {
    setFormData((prev) => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission];
      
      return {
        ...prev,
        permissions: newPermissions,
      };
    });
    // Don't close the popover so users can select multiple permissions
    // setPermissionsOpen(false);
  }

  // Remove permission from selection
  const removePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.filter((p) => p !== permission),
    }))
  }

  // Handle pagination handler
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }))
    fetchModerators(newPage)
  }

  // Submit form to create or update moderator
  const handleSubmit = async () => {
    // Validate form
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate password
    if (!isEditMode && !formData.password) {
      toast.error("Password is required for new moderators")
      return
    }

    // Password validation when password is provided (required for new moderators, optional for editing)
    if (formData.password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
      if (!passwordRegex.test(formData.password)) {
        toast.error("Password must be at least 8 characters long and include at least one capital letter, one number, and one special character")
        return
      }
    }

    // Validate permissions
    if (formData.permissions.length === 0) {
      toast.error("Please select at least one permission")
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && selectedModerator) {
        // Update existing moderator
        const payload = { ...formData }

        // Only include password if it's provided
        if (!payload.password || payload.password.trim() === "") {
          delete payload.password // This is now safe because password is optional
        }

        await api.put(`/v1/admin/update-moderator/${selectedModerator.id}`, payload)
        toast.success("Moderator updated successfully")
      } else {
        // Create new moderator
        await api.post("/v1/admin/create-moderator", formData)
        toast.success("Moderator created successfully")
      }

      // Refresh moderators list and close dialog
      fetchModerators(pagination.currentPage)
      setIsFormDialogOpen(false)
    } catch (error) {
      console.error("Error saving moderator:", error)
      toast.error(isEditMode ? "Failed to update moderator" : "Failed to create moderator", {
        description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete moderator
  const handleDelete = async () => {
    if (!selectedModerator) return

    setIsDeleting(true)
    try {
      await api.delete(`/v1/admin/delete-moderator/${selectedModerator.id}`)
      toast.success("Moderator deleted successfully")
      fetchModerators(pagination.currentPage)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting moderator:", error)
      toast.error("Failed to delete moderator", {
        description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : "Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditClick = (moderator: Moderator) => {
    setLoadingModeratorId(moderator.id)
    setTimeout(() => {
      openEditModeratorDialog(moderator)
      setLoadingModeratorId(null)
    }, 500) // Simulate a short loading time
  }

  // Add togglePasswordVisibility function
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col space-y-6">
      <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Moderator Management</CardTitle>
              <CardDescription>Manage moderator accounts and permissions</CardDescription>
            </div>
            <div className="relative w-full md:w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search moderators..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto h-auto px-2 sm:px-6 pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <Button onClick={openAddModeratorDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Loading...
                </div>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Add Moderator
                </>
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-slate-100">
                        <TableHead className="py-4 text-left">Name</TableHead>
                        <TableHead className="py-4 text-left">Email</TableHead>
                        <TableHead className="py-4 text-left">Permissions</TableHead>
                        <TableHead className="py-4 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredModerators.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No moderators found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredModerators.map((moderator, index) => (
                          <TableRow
                            key={moderator.id}
                            className={cn("hover:bg-slate-50", index % 2 === 0 ? "bg-amber-100" : "bg-blue-50")}
                          >
                            <TableCell className="font-medium py-4">
                              {moderator.firstName} {moderator.lastName}
                            </TableCell>
                            <TableCell className="py-4 max-w-[200px] truncate">{moderator.email}</TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center">
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200">
                                  {moderator.permissions?.length || 0} permissions
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 h-8 w-8 p-0"
                                  onClick={() => openPermissionsDialog(moderator)}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  <span className="sr-only">View permissions</span>
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(moderator)}
                                  className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  disabled={loadingModeratorId === moderator.id}
                                >
                                  {loadingModeratorId === moderator.id ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                  ) : (
                                    <Edit className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog(moderator)}
                                  className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  disabled={loadingModeratorId === moderator.id}
                                >
                                  {loadingModeratorId === moderator.id ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-rose-500 border-t-transparent rounded-full"></div>
                                  ) : (
                                    <Trash className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredModerators.length} of {pagination.totalItems} moderators
                  </div>
                  <div className="flex items-center justify-center sm:justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm whitespace-nowrap">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Moderator Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold text-gray-800 sticky top-0 bg-white pt-2 pb-4 z-10">
            {isEditMode ? "Edit Moderator" : "Add Moderator"}
          </DialogTitle>
          <div className="space-y-4 py-4 overflow-y-auto">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {isEditMode && <span className="text-xs text-gray-500">(Leave blank to keep current)</span>}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={isEditMode ? "••••••••" : "Create password"}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long and include at least one capital letter, one number, and one special character.
                </p>
              </div>
              <div className="space-y-2">
                <Label>
                  Permissions <span className="text-xs text-rose-500">*</span>
                </Label>
                <div className="flex flex-wrap gap-2 mb-2 max-h-[150px] overflow-y-auto p-2 border rounded-md">
                  {formData.permissions.map((permission) => (
                    <Badge
                      key={permission}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1"
                    >
                      {permission.replace(/_/g, " ")}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-blue-200 rounded-full"
                        onClick={() => removePermission(permission)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </Badge>
                  ))}
                  {formData.permissions.length === 0 && (
                    <p className="text-gray-500 italic text-sm">No permissions selected</p>
                  )}
                </div>
                
                <Popover open={permissionsOpen} onOpenChange={setPermissionsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={permissionsOpen}
                      className={cn(
                        "w-full justify-between",
                        formData.permissions.length === 0 && "border-rose-300 focus:ring-rose-300",
                        "hover:bg-blue-50 hover:border-blue-300 transition-colors",
                      )}
                    >
                      Select permissions
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="w-full p-2">
                      <div className="flex items-center justify-between mb-2">
                        <Input 
                          type="text"
                          placeholder="Search permissions..."
                          className="flex-1 mr-2"
                          onChange={(e) => {
                            const searchValue = e.target.value.toLowerCase();
                            // You can implement search functionality here if needed
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700 rounded-full"
                          onClick={() => setPermissionsOpen(false)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Close</span>
                        </Button>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto border rounded-md">
                        {availablePermissions.map((permission) => (
                          <div
                            key={permission}
                            className={cn(
                              "px-3 py-2 cursor-pointer border-b last:border-b-0 flex items-center justify-between",
                              formData.permissions.includes(permission) 
                                ? "bg-blue-50 text-blue-700 font-medium" 
                                : "hover:bg-gray-50"
                            )}
                            onClick={() => togglePermission(permission)}
                          >
                            <div className="flex items-center">
                              {formData.permissions.includes(permission) && (
                                <Check className="h-4 w-4 mr-2 text-blue-600" />
                              )}
                              <span>{permission.replace(/_/g, " ")}</span>
                            </div>
                            {formData.permissions.includes(permission) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-blue-100 rounded-full opacity-70 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePermission(permission);
                                }}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            )}
                          </div>
                        ))}
                        {availablePermissions.length === 0 && (
                          <div className="px-2 py-2 text-gray-500 italic text-sm">
                            No permissions available
                          </div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {formData.permissions.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1">At least one permission is required</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white z-10">
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {isEditMode ? "Updating..." : "Adding..."}
                </div>
              ) : isEditMode ? (
                "Update Moderator"
              ) : (
                "Add Moderator"
              )}
            </Button>
            <Button
              variant="outline"
              className="text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg w-full sm:w-auto"
              onClick={() => setIsFormDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg">
          <DialogTitle className="text-xl font-semibold text-gray-800">Delete Moderator</DialogTitle>
          {selectedModerator && (
            <>
              <div className="py-4">
                <p className="text-gray-600">
                  Are you sure you want to delete the moderator{" "}
                  <span className="font-medium">
                    {selectedModerator.firstName} {selectedModerator.lastName}
                  </span>
                  ?
                </p>
                <p className="text-gray-600 mt-2">This action cannot be undone.</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg w-full sm:w-auto"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Deleting...
                    </div>
                  ) : (
                    "Delete"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg w-full sm:w-auto"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions View Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg">
          <DialogTitle className="text-xl font-semibold text-gray-800">Moderator Permissions</DialogTitle>
          {selectedModerator && (
            <>
              <div className="py-4">
                <p className="text-gray-600 mb-4">
                  Permissions for{" "}
                  <span className="font-medium">
                    {selectedModerator.firstName} {selectedModerator.lastName}
                  </span>
                  :
                </p>
                <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-md">
                  {selectedModerator.permissions && selectedModerator.permissions.length > 0 ? (
                    selectedModerator.permissions.map((permission) => (
                      <Badge
                        key={permission}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                      >
                        {permission.replace(/_/g, " ")}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No permissions assigned</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg"
                  onClick={() => setIsPermissionsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

