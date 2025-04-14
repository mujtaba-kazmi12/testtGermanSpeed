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
  X,
  Trash,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { WithdrawalRequest, WithdrawalResponse } from "@/types/withdrawal";
import usePermissions from "@/hooks/usePermissions";

// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://newbackend.crective.com";

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

export default function WithdrawRequestsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawalRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  // Update the state to include allWithdrawalRequests for storing the complete dataset
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [allWithdrawalRequests, setAllWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);

  // Update pagination state with itemsPerPage
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });

  // Fetch counts for all tabs
  useEffect(() => {
    fetchCounts();
  }, []);

  // Fetch withdrawal requests for the active tab
  useEffect(() => {
    fetchWithdrawalRequests(activeTab, pagination.currentPage);
  }, [activeTab, pagination.currentPage]);

  // Fetch counts for all tabs
  const fetchCounts = async () => {
    try {
      const statuses = ["pending", "approved", "rejected"];
      const countPromises = statuses.map((status) =>
        api.get<WithdrawalResponse>(
          `/v1/admin/get-withdrawl-requests?status=${status}`
        )
      );

      const responses = await Promise.all(countPromises);

      // Get the total count separately without specifying a status
      const allResponse = await api.get<WithdrawalResponse>(
        `/v1/admin/get-withdrawl-requests?status=all`
      );

      const newCounts = {
        pending: responses[0].data.data.length,
        approved: responses[1].data.data.length,
        rejected: responses[2].data.data.length,
        all: allResponse.data.data.length,
      };

      setCounts(newCounts);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  // Replace the fetchWithdrawalRequests function with this updated version that handles frontend pagination
  const fetchWithdrawalRequests = async (
    status = "pending",
    page = 1,
    search = ""
  ) => {
    setIsLoading(true);
    try {
      const url = `/v1/admin/get-withdrawl-requests?status=${status}`;

      const response = await api.get<WithdrawalResponse>(url);

      if (response.data.data) {
        // Store all data
        const allData = response.data.data;
        setAllWithdrawalRequests(allData);

        // Apply search filter if provided
        let filteredData = allData;
        if (search) {
          filteredData = allData.filter(
            (request) =>
              request.withdrawal.toLowerCase().includes(search.toLowerCase()) ||
              request.currency.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Calculate pagination
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);

        // Update pagination state
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        }));

        // Apply pagination to the data
        const startIndex = (page - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        // Set the paginated data to display
        setWithdrawalRequests(paginatedData);
      } else {
        console.warn(`Unexpected API response for ${status}:`, response.data);
        setAllWithdrawalRequests([]);
        setWithdrawalRequests([]);
      }
    } catch (error) {
      console.error(`Error fetching ${status} withdrawal requests:`, error);
      toast.error(`Failed to fetch ${status} withdrawal requests`, {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please check your network connection and try again.",
      });
      setAllWithdrawalRequests([]);
      setWithdrawalRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdrawal request approval
  const handleApprove = async (requestId: string) => {
    setIsApproving(true);
    setLoadingRequestId(requestId);
    try {
      await api.patch(`/v1/admin/approve-withdrawl-requests/${requestId}`);
      toast.success("Withdrawal request approved successfully");
      fetchWithdrawalRequests(activeTab, pagination.currentPage);
      fetchCounts();
    } catch (error) {
      console.error("Error approving withdrawal request:", error);
      toast.error("Failed to approve withdrawal request", {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please try again.",
      });
    } finally {
      setIsApproving(false);
      setLoadingRequestId(null);
    }
  };

  // Handle withdrawal request rejection
  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    setIsRejecting(true);
    try {
      await api.patch(`/v1/admin/reject-withdrawl-requests/${requestId}`, {
        rejectionReason: rejectionReason,
      });

      toast.success("Withdrawal request rejected successfully");
      fetchWithdrawalRequests(activeTab, pagination.currentPage);
      fetchCounts();

      // Close modal
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting withdrawal request:", error);
      toast.error("Failed to reject withdrawal request", {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please try again.",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  // Handle withdrawal request deletion
  const handleDelete = async (requestId: string) => {
    setIsDeleting(true);
    setLoadingRequestId(requestId);
    try {
      await api.delete(`/v1/admin/delete-withdrawl/${requestId}`);
      toast.success("Withdrawal request deleted successfully");
      fetchWithdrawalRequests(activeTab, pagination.currentPage);
      fetchCounts();
    } catch (error) {
      console.error("Error deleting withdrawal request:", error);
      toast.error("Failed to delete withdrawal request", {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setLoadingRequestId(null);
    }
  };

  // Update the handleSearch function to use client-side filtering
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Reset to page 1 when searching
    setPagination((prev) => ({ ...prev, currentPage: 1 }));

    if (term.trim() === "") {
      // If search is cleared, just paginate the full dataset
      const totalPages = Math.ceil(
        allWithdrawalRequests.length / pagination.itemsPerPage
      );
      setPagination((prev) => ({
        ...prev,
        totalItems: allWithdrawalRequests.length,
        totalPages,
      }));
      setWithdrawalRequests(
        allWithdrawalRequests.slice(0, pagination.itemsPerPage)
      );
    } else {
      // Filter the data client-side
      const filtered = allWithdrawalRequests.filter(
        (request) =>
          request.withdrawal.toLowerCase().includes(term.toLowerCase()) ||
          request.currency.toLowerCase().includes(term.toLowerCase())
      );

      // Update pagination based on filtered results
      const totalPages = Math.ceil(filtered.length / pagination.itemsPerPage);
      setPagination((prev) => ({
        ...prev,
        totalItems: filtered.length,
        totalPages,
      }));

      // Show first page of filtered results
      setWithdrawalRequests(filtered.slice(0, pagination.itemsPerPage));
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchTerm("");
    // Update the handleTabChange function to reset pagination
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchWithdrawalRequests(tab, 1);
  };

  // View more info
  const handleViewMore = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  // Open reject modal
  const openRejectModal = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  // Format currency
  const formatCurrency = (amount: string, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(Number(amount));
    } catch (error) {
      return `${amount} ${currency}`;
    }
  };

  // Get withdrawal request status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "rejected":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Get formatted status label
  const getFormattedStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Update the handlePageChange function to use client-side pagination
  const handlePageChange = (newPage: number) => {
    // Calculate the data slice for the new page
    const startIndex = (newPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;

    // Apply current search filter if any
    let dataToSlice = allWithdrawalRequests;
    if (searchTerm.trim() !== "") {
      dataToSlice = allWithdrawalRequests.filter(
        (request) =>
          request.withdrawal.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.currency.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Update the displayed data
    setWithdrawalRequests(dataToSlice.slice(startIndex, endIndex));

    // Update current page in pagination state
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };
  const { hasAnyPermission, hasPermission } = usePermissions();

  return (
    <div className="flex flex-col space-y-6">
      <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>
                Manage withdrawal requests from users
              </CardDescription>
            </div>
            <div className="relative w-full md:w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto h-auto ">
          <Tabs
            defaultValue="pending"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="mb-6 p-6 bg-slate-200 lg:h-[50px] h-[auto] rounded-lg w-full grid grid-cols-2 gap-4 md:flex md:flex-row md:justify-between md:gap-1">
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm h-[50px]"
              >
                <div className="bg-amber-200 text-amber-700 p-1 rounded-md">
                  <Inbox className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Pending</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.pending}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm h-[50px]"
              >
                <div className="bg-emerald-200 text-emerald-700 p-1 rounded-md">
                  <Check className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Approved</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.approved}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm h-[50px]"
              >
                <div className="bg-rose-200 text-rose-700 p-1 rounded-md">
                  <X className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Rejected</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.rejected}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm h-[50px]"
              >
                <div className="bg-slate-200 text-slate-700 p-1 rounded-md">
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span>All</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.all}
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>

            {["pending", "approved", "rejected", "all"].map((tab) => (
              <TabsContent key={tab} value={tab}>
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
                              <TableHead className="py-4 text-left">
                                Wallet Address
                              </TableHead>
                              <TableHead className="py-4 text-left">
                                Amount
                              </TableHead>
                              <TableHead className="py-4 text-left">
                                Currency
                              </TableHead>
                              <TableHead className="py-4 text-left">
                                Status
                              </TableHead>
                              <TableHead className="py-4 text-right">
                                Action
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {withdrawalRequests.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="h-24 text-center"
                                >
                                  No withdrawal requests found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              withdrawalRequests.map((request, index) => (
                                <TableRow
                                  key={request.id}
                                  className={`${
                                    activeTab === "pending"
                                      ? "bg-amber-50"
                                      : activeTab === "approved"
                                      ? "bg-emerald-50"
                                      : activeTab === "rejected"
                                      ? "bg-rose-50"
                                      : index % 2 === 0
                                      ? "bg-slate-50"
                                      : "bg-slate-50"
                                  } hover:bg-slate-100 transition-colors`}
                                >
                                  <TableCell className="font-medium py-4 max-w-[200px] truncate">
                                    {request.withdrawal}
                                  </TableCell>
                                  <TableCell className="py-4">
                                    {formatCurrency(
                                      request.amount,
                                      request.currency
                                    )}
                                  </TableCell>
                                  <TableCell className="py-4">
                                    {request.currency}
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <Badge
                                      variant="outline"
                                      className={getStatusColor(request.status)}
                                    >
                                      {getFormattedStatus(request.status)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right py-4">
                                    <div className="flex justify-end gap-2">
                                      {request.status === "pending" && (
                                        <>
                                          {hasPermission(
                                            "approve_withdrawl"
                                          ) && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                handleApprove(request.id)
                                              }
                                              className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                              disabled={
                                                loadingRequestId === request.id
                                              }
                                            >
                                              {loadingRequestId ===
                                                request.id && isApproving ? (
                                                <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                                              ) : (
                                                <Check className="h-4 w-4" />
                                              )}
                                              <span className="sr-only">
                                                Approve
                                              </span>
                                            </Button>
                                          )}

                                          {hasPermission(
                                            "reject_withdrawl"
                                          ) && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                openRejectModal(request)
                                              }
                                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                              disabled={
                                                loadingRequestId === request.id
                                              }
                                            >
                                              <X className="h-4 w-4" />
                                              <span className="sr-only">
                                                Reject
                                              </span>
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
                                            <span className="sr-only">
                                              More options
                                            </span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="end"
                                          className="border border-slate-200 shadow-lg"
                                        >
                                          <DropdownMenuLabel>
                                            Actions
                                          </DropdownMenuLabel>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleViewMore(request)
                                            }
                                            className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                                          >
                                            <EyeIcon className="mr-2 h-4 w-4" />
                                            View details
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          {hasPermission(
                                            "delete_withdrawl"
                                          ) && (
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleDelete(request.id)
                                              }
                                              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                              disabled={
                                                loadingRequestId ===
                                                  request.id && isDeleting
                                              }
                                            >
                                              {loadingRequestId ===
                                                request.id && isDeleting ? (
                                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-rose-500 border-t-transparent rounded-full"></div>
                                              ) : (
                                                <Trash className="mr-2 h-4 w-4" />
                                              )}
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
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                        <div className="text-sm text-muted-foreground">
                          Showing {withdrawalRequests.length} of{" "}
                          {pagination.totalItems} withdrawal requests
                        </div>
                        <div className="flex items-center justify-center sm:justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(pagination.currentPage - 1)
                            }
                            disabled={pagination.currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="text-sm whitespace-nowrap">
                            Page {pagination.currentPage} of{" "}
                            {pagination.totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(pagination.currentPage + 1)
                            }
                            disabled={
                              pagination.currentPage === pagination.totalPages
                            }
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-3xl bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Withdrawal Request Details
          </DialogTitle>
          {selectedRequest && (
            <>
              {/* Modal Header */}
              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Complete information about this withdrawal request.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={getStatusColor(selectedRequest.status)}
                >
                  {getFormattedStatus(selectedRequest.status)}
                </Badge>
              </div>

              {/* Information Column Layout */}
              <div className="flex flex-col gap-4 mt-4">
                {/* Basic Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <ClipboardList className="h-5 w-5 text-gray-500" /> Request
                    Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">
                        Wallet Address:
                      </span>{" "}
                      {selectedRequest.withdrawal}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Amount:</span>{" "}
                      {formatCurrency(
                        selectedRequest.amount,
                        selectedRequest.currency
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Currency:
                      </span>{" "}
                      {selectedRequest.currency}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Status:</span>{" "}
                      <Badge
                        variant="outline"
                        className={getStatusColor(selectedRequest.status)}
                      >
                        {getFormattedStatus(selectedRequest.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Invoice Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <Archive className="h-5 w-5 text-gray-500" /> Invoice
                    Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">
                        Invoice ID:
                      </span>{" "}
                      {selectedRequest.invoice.id}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Invoice Status:
                      </span>{" "}
                      <Badge
                        variant="outline"
                        className={getStatusColor(
                          selectedRequest.invoice.status
                        )}
                      >
                        {getFormattedStatus(selectedRequest.invoice.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons - Show Accept & Reject ONLY if status is "pending" */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6 border-t pt-4">
                {selectedRequest.status === "pending" && (
                  <>
                    {hasPermission("approve_withdrawl") && (
                      <Button
                        onClick={() => {
                          handleApprove(selectedRequest.id);
                          setIsDialogOpen(false);
                        }}
                        className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg w-full sm:w-auto"
                        disabled={isApproving}
                      >
                        {isApproving ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Approving...
                          </div>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Approve
                          </>
                        )}
                      </Button>
                    )}

                    {hasPermission("reject_withdrawl") && (
                      <Button
                        onClick={() => {
                          openRejectModal(selectedRequest);
                          setIsDialogOpen(false);
                        }}
                        className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg w-full sm:w-auto"
                      >
                        <X className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    )}
                  </>
                )}

                {hasPermission("delete_withdrawl") && (
                  <Button
                    onClick={() => {
                      handleDelete(selectedRequest.id);
                      setIsDialogOpen(false);
                    }}
                    className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-lg w-full sm:w-auto"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Deleting...
                      </div>
                    ) : (
                      <>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </>
                    )}
                  </Button>
                )}

                {/* Close Button */}
                <Button
                  variant="outline"
                  className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg w-full sm:w-auto"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Reject Withdrawal Request
          </DialogTitle>
          {selectedRequest && (
            <>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">
                  Provide a reason for rejecting this withdrawal request
                </p>
              </div>

              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleReject(selectedRequest.id)}
                  className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg w-full sm:w-auto"
                  disabled={!rejectionReason.trim() || isRejecting}
                >
                  {isRejecting ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Rejecting...
                    </div>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" /> Reject
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg w-full sm:w-auto"
                  onClick={() => setIsRejectModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
