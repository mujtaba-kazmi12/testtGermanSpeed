"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  EyeIcon,
  Inbox,
  LayoutGrid,
  MoreHorizontal,
  Search,
  Trash,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Publisher } from "@/types/publisher";
import { toast } from "sonner";
import usePermissions from "@/hooks/usePermissions";

// Custom CSS for email text wrapping
const styles = `
  .truncate-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }
  
  .overflow-wrap-anywhere {
    overflow-wrap: anywhere;
  }
`;

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function PublisherManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allPublishers, setAllPublishers] = useState<Publisher[]>([]);
  const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  });

  // Fetch counts for all tabs
  useEffect(() => {
    fetchCounts();
  }, []);

  // Fetch publishers for the active tab
  useEffect(() => {
    fetchPublishers(activeTab);
  }, [activeTab]);

  // Update filtered publishers when search term changes
  useEffect(() => {
    filterPublishers();
  }, [searchTerm, allPublishers]);

  // Update pagination when filtered publishers change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1, // Reset to first page when filtered publishers change
      totalPages: Math.max(
        1,
        Math.ceil(filteredPublishers.length / prev.itemsPerPage)
      ),
    }));
  }, [filteredPublishers]);

  // Update pagination when items per page changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      totalPages: Math.ceil(filteredPublishers.length / prev.itemsPerPage),
    }));
  }, [pagination.itemsPerPage, filteredPublishers]);

  // Fetch counts for all tabs
  const fetchCounts = async () => {
    try {
      const pendingResponse = await api.get(
        "/v1/admin/get-publisher?status=pending"
      );
      const approvedResponse = await api.get(
        "/v1/admin/get-publisher?status=approved"
      );
      const rejectedResponse = await api.get(
        "/v1/admin/get-publisher?status=rejected"
      );
      const allResponse = await api.get("/v1/admin/get-publisher?status=all");
      setCounts({
        pending: pendingResponse.data.data?.length || 0,
        approved: approvedResponse.data.data?.length || 0,
        rejected: rejectedResponse.data.data?.length || 0,
        all: allResponse.data.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const fetchPublishers = async (status = "pending") => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/v1/admin/get-publisher?status=${status}`
      );

      console.log(`Fetched ${status} publishers:`, response.data.data); // Debugging

      if (Array.isArray(response.data.data)) {
        setAllPublishers(response.data.data);
        setFilteredPublishers(response.data.data); // Initially, filtered publishers are the same as all publishers
      } else {
        console.warn(`Unexpected API response for ${status}:`, response.data);
        setAllPublishers([]);
        setFilteredPublishers([]);
      }
    } catch (error) {
      console.error(`Error fetching ${status} publishers:`, error);
      toast.error(`Failed to fetch ${status} publishers`, {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please check your network connection and try again.",
      });
      setAllPublishers([]);
      setFilteredPublishers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter publishers based on search term
  const filterPublishers = () => {
    if (!searchTerm.trim()) {
      setFilteredPublishers(allPublishers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = allPublishers.filter(
      (publisher) =>
        `${publisher.firstName} ${publisher.lastName}`
          .toLowerCase()
          .includes(term) ||
        publisher.email.toLowerCase().includes(term) ||
        publisher.businessName?.toLowerCase().includes(term)
    );
    setFilteredPublishers(filtered);
  };

  // Get paginated publishers
  const getPaginatedPublishers = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredPublishers.slice(startIndex, endIndex);
  };

  // Handle publisher approval
  const handleApprove = async (publisherId: string) => {
    try {
      await api.put(`/v1/admin/approve-publisher/${publisherId}`);

      // Update counts
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1,
      }));

      // Refresh publishers list
      fetchPublishers(activeTab);

      toast.success("Publisher approved successfully");
    } catch (error) {
      console.error("Error approving publisher:", error);
      toast.error("Failed to approve publisher", {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please try again.",
      });
    }
  };

  // Handle publisher rejection
  const handleReject = async (publisherId: string) => {
    try {
      await api.put(`/v1/admin/reject-publisher/${publisherId}`);

      // Update counts
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        rejected: prev.rejected + 1,
      }));

      // Refresh publishers list
      fetchPublishers(activeTab);

      toast.success("Publisher rejected successfully");
    } catch (error) {
      console.error("Error rejecting publisher:", error);
      toast.error("Failed to reject publisher", {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please try again.",
      });
    }
  };

  // Handle publisher deletion
  const handleDelete = async (publisherId: string) => {
    try {
      await api.delete(`/v1/admin/delete-publisher/${publisherId}`);

      // Find the publisher to determine which count to update
      const publisherToDelete = allPublishers.find((p) => p.id === publisherId);

      // Update counts
      if (publisherToDelete) {
        const newCounts = { ...counts, all: counts.all - 1 };

        if (publisherToDelete.isApproved) {
          newCounts.approved = Math.max(0, counts.approved - 1);
        } else if (publisherToDelete.isaffiliateRequested) {
          newCounts.pending = Math.max(0, counts.pending - 1);
        } else {
          newCounts.rejected = Math.max(0, counts.rejected - 1);
        }

        setCounts(newCounts);
      }

      // Refresh publishers list
      fetchPublishers(activeTab);

      toast.success("Publisher deleted successfully");
    } catch (error) {
      console.error("Error deleting publisher:", error);
      toast.error("Failed to delete publisher", {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please try again.",
      });
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchTerm("");
    setPagination({ ...pagination, currentPage: 1 }); // Reset page on tab change
    fetchPublishers(tab); // Ensure fresh data when switching tabs
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, currentPage: newPage });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setPagination({
      currentPage: 1, // Reset to first page
      itemsPerPage: newItemsPerPage,
      totalPages: Math.max(
        1,
        Math.ceil(filteredPublishers.length / newItemsPerPage)
      ),
    });
  };

  // View more info
  const handleViewMore = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
    setIsDialogOpen(true);
  };

  // Format currency
  const formatCurrency = (amount: string | null, currency: string) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(Number.parseFloat(amount));
  };

  // Get publisher status label
  const getPublisherStatusLabel = (publisher: Publisher): string => {
    if (publisher.isApproved) return "Approved";
    if (publisher.isaffiliateRequested) return "Pending";
    return "Rejected";
  };

  // Get publisher status badge color
  const getPublisherStatusColor = (status: string): string => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-800";
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "Rejected":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const { hasAnyPermission, hasPermission } = usePermissions();

  return (
    <div className="flex flex-col space-y-6">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Publisher Management</CardTitle>
              <CardDescription>
                Review and manage publisher requests
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search publishers..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto h-auto">
          <Tabs
            defaultValue="pending"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="mb-6 p-6 bg-slate-200 lg:h-[50px] h-[auto] rounded-lg w-full grid grid-cols-2 gap-4 md:flex md:flex-row md:justify-between md:gap-1">
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm flex items-center justify-start gap-2 py-6 w-full"
              >
                <div className="bg-amber-200 text-amber-700 p-2 rounded-md">
                  <Inbox className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Pending</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.pending} requests
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm flex items-center justify-start gap-2 py-6 w-full"
              >
                <div className="bg-emerald-200 text-emerald-700 p-2 rounded-md">
                  <Check className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Approved</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.approved} requests
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900 data-[state=active]:shadow-sm flex items-center justify-start gap-2 py-6 w-full"
              >
                <div className="bg-rose-200 text-rose-700 p-2 rounded-md">
                  <X className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Rejected</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.rejected} requests
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm flex items-center justify-start gap-2 py-6 w-full"
              >
                <div className="bg-blue-200 text-blue-700 p-2 rounded-md">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span>All</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.all} total
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PublisherTable
                  publishers={getPaginatedPublishers()}
                  totalItems={filteredPublishers.length}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onViewMore={handleViewMore}
                  formatCurrency={formatCurrency}
                  activeTab={activeTab}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </TabsContent>
            <TabsContent value="approved">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PublisherTable
                  publishers={getPaginatedPublishers()}
                  totalItems={filteredPublishers.length}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onViewMore={handleViewMore}
                  formatCurrency={formatCurrency}
                  activeTab={activeTab}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </TabsContent>
            <TabsContent value="rejected">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PublisherTable
                  publishers={getPaginatedPublishers()}
                  totalItems={filteredPublishers.length}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onViewMore={handleViewMore}
                  formatCurrency={formatCurrency}
                  activeTab={activeTab}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </TabsContent>
            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PublisherTable
                  publishers={getPaginatedPublishers()}
                  totalItems={filteredPublishers.length}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onViewMore={handleViewMore}
                  formatCurrency={formatCurrency}
                  activeTab={activeTab}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-3xl bg-white p-4 md:p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Publisher Details
          </DialogTitle>
          {selectedPublisher && (
            <>
              {/* Modal Header */}
              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Complete information about {selectedPublisher.firstName}{" "}
                    {selectedPublisher.lastName}'s publisher account.
                  </p>
                </div>
              </div>

              {/* Information Column Layout */}
              <div className="flex flex-col gap-4 mt-4">
                {/* Basic Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <ClipboardList className="h-5 w-5 text-gray-500" /> Basic
                    Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">
                        1. Name:
                      </span>{" "}
                      {selectedPublisher.firstName} {selectedPublisher.lastName}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        2. Email:
                      </span>{" "}
                      {selectedPublisher.email}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        3. Phone:
                      </span>{" "}
                      {selectedPublisher.phoneNo || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        4. Business:
                      </span>{" "}
                      {selectedPublisher.businessName}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <Archive className="h-5 w-5 text-gray-500" /> Additional
                    Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">
                        6. Country:
                      </span>{" "}
                      {selectedPublisher.country}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        7. Currency:
                      </span>{" "}
                      {selectedPublisher.currency}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        9. Referral Code:
                      </span>{" "}
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {selectedPublisher.referralCode}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        10. Verification:
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          selectedPublisher.isVerified
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }
                      >
                        {selectedPublisher.isVerified
                          ? "Verified"
                          : "Not Verified"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons - Show Accept & Reject ONLY if status is "pending" */}
              <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                {activeTab === "pending" && (
                  <>
                    {hasPermission("approve_publisher") && (
                      <Button
                        onClick={() => {
                          handleApprove(selectedPublisher.id);
                          setIsDialogOpen(false);
                        }}
                        className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg"
                      >
                        <Check className="mr-2 h-4 w-4" /> Accept
                      </Button>
                    )}

                    {hasPermission("reject_publisher") && (
                      <Button
                        onClick={() => {
                          handleReject(selectedPublisher.id);
                          setIsDialogOpen(false);
                        }}
                        className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg"
                      >
                        <X className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    )}
                  </>
                )}

                {hasPermission("delete_publisher") && (
                  <Button
                    onClick={() => {
                      handleDelete(selectedPublisher.id);
                      setIsDialogOpen(false);
                    }}
                    className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-lg"
                  >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </Button>
                )}
                {/* Close Button */}
                <Button
                  variant="outline"
                  className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Publisher Table Component with pagination
function PublisherTable({
  publishers,
  totalItems,
  onApprove,
  onReject,
  onDelete,
  onViewMore,
  formatCurrency,
  activeTab,
  pagination,
  onPageChange,
  onItemsPerPageChange,
}: {
  publishers: Publisher[];
  totalItems: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onViewMore: (publisher: Publisher) => void;
  formatCurrency: (amount: string | null, currency: string) => string;
  activeTab: string;
  pagination: { currentPage: number; itemsPerPage: number; totalPages: number };
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}) {
  const { hasAnyPermission, hasPermission } = usePermissions();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead className="py-4 text-left">Name</TableHead>
              <TableHead className="py-4 text-left">Email</TableHead>
              <TableHead className="hidden md:table-cell py-4 text-left">
                Phone
              </TableHead>
              <TableHead className="py-4 text-left">Wallet Balance</TableHead>
              <TableHead className="hidden md:table-cell py-4 text-left">
                Currency
              </TableHead>
              <TableHead className="hidden lg:table-cell py-4 text-left">
                Business Name
              </TableHead>
              <TableHead className="hidden xl:table-cell py-4 text-left">
                Sites
              </TableHead>
              <TableHead className="py-4 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No publishers found.
                </TableCell>
              </TableRow>
            ) : (
              publishers.map((publisher) => (
                <TableRow
                  key={publisher.id}
                  className={`${
                    activeTab === "pending"
                      ? "bg-amber-50"
                      : activeTab === "approved"
                      ? "bg-emerald-50"
                      : activeTab === "rejected"
                      ? "bg-rose-50"
                      : activeTab === "all"
                      ? "bg-blue-50"
                      : ""
                  } hover:bg-slate-100 transition-colors`}
                >
                  <TableCell className="font-medium py-4">
                    {publisher.firstName} {publisher.lastName}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="truncate md:break-all md:whitespace-normal md:line-clamp-2">
                      {publisher.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-4">
                    <div className="truncate md:break-all">
                      {publisher.phoneNo || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-medium">
                      {formatCurrency(
                        publisher.walletBalance,
                        publisher.currency
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-4">
                    {publisher.currency}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-4">
                    <div className="truncate lg:break-all lg:whitespace-normal lg:line-clamp-2">
                      {publisher.businessName}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell py-4">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      {publisher.numberOfSites} sites
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex justify-end gap-2">
                      {activeTab === "pending" && (
                        <>
                          {hasPermission("approve_publisher") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onApprove(publisher.id)}
                              className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                          )}

                          {hasPermission("reject_publisher") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onReject(publisher.id)}
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          )}
                        </>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border border-slate-200 shadow-lg"
                        >
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onViewMore(publisher)}
                            className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                          >
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {hasPermission("delete_publisher") && (
                            <DropdownMenuItem
                              onClick={() => onDelete(publisher.id)}
                              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls - Matching the Order Management design */}
      {pagination.totalPages > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
            -
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              totalItems
            )}{" "}
            of {totalItems} publishers
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Items per page:
            </span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              value={pagination.itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  // Logic to show pages around current page
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (
                    pagination.currentPage >=
                    pagination.totalPages - 2
                  ) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pagination.currentPage === pageNum
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Last
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
