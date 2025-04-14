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
  FileText,
  Inbox,
  LayoutGrid,
  Link2,
  MoreHorizontal,
  Search,
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
import type { Order, OrdersResponse } from "@/types/order";
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

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [counts, setCounts] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    inProgress: 0,
    submitted: 0,
    completed: 0,
    all: 0,
  });

  // Fetch counts for all tabs
  useEffect(() => {
    fetchCounts();
  }, []);

  // Fetch orders for the active tab
  useEffect(() => {
    fetchOrders(
      activeTab,
      pagination.currentPage,
      searchTerm,
      pagination.limit
    );
  }, [activeTab, pagination.currentPage, searchTerm, pagination.limit]);

  // Fetch counts for all tabs
  const fetchCounts = async () => {
    try {
      const statuses = [
        "pending",
        "accepted",
        "rejected",
        "inProgress",
        "submitted",
        "completed",
      ];
      const countPromises = statuses.map((status) =>
        api.get<OrdersResponse>(
          `/v1/order/admin?page=1&limit=1&orderStatus=${status}`
        )
      );

      const responses = await Promise.all(countPromises);

      // Get the total count separately without specifying a status
      const allResponse = await api.get<OrdersResponse>(
        `/v1/order/admin?page=1&limit=1`
      );

      const newCounts = {
        pending: responses[0].data.total,
        accepted: responses[1].data.total,
        rejected: responses[2].data.total,
        inProgress: responses[3].data.total,
        submitted: responses[4].data.total,
        completed: responses[5].data.total,
        all: allResponse.data.total,
      };

      setCounts(newCounts);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const fetchOrders = async (
    status = "pending",
    page = 1,
    search = "",
    limit = pagination.limit
  ) => {
    setIsLoading(true);
    try {
      let url = `/v1/order/admin?page=${page}&limit=${limit}`;

      if (status !== "all") {
        url += `&orderStatus=${status}`;
      }

      if (search) {
        url += `&q=${encodeURIComponent(search)}`;
      }

      const response = await api.get<OrdersResponse>(url);

      if (response.data.items) {
        setOrders(response.data.items);
        setPagination({
          currentPage: Number.parseInt(response.data.page),
          totalPages: Math.ceil(
            response.data.total / Number.parseInt(response.data.limit)
          ),
          totalItems: response.data.total,
          limit: Number.parseInt(response.data.limit),
        });
      } else {
        console.warn(`Unexpected API response for ${status}:`, response.data);
        setOrders([]);
      }
    } catch (error) {
      console.error(`Error fetching ${status} orders:`, error);
      toast.error(`Failed to fetch ${status} orders`, {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Please check your network connection and try again.",
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle order acceptance
  const handleAccept = async (orderId: string) => {
    try {
      await api.put(`/v1/order/accepted/${orderId}`);
      toast.success("Order accepted successfully");
      fetchOrders(
        activeTab,
        pagination.currentPage,
        searchTerm,
        pagination.limit
      );
      fetchCounts();
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("Failed to accept order");
    }
  };

  // Handle order rejection
  const handleReject = async (orderId: string) => {
    try {
      await api.put(`/v1/order/rejectedAdmin/${orderId}`, {
        rejectionReason: rejectionReason,
      });

      toast.success("Order rejected successfully");
      fetchOrders(
        activeTab,
        pagination.currentPage,
        searchTerm,
        pagination.limit
      );
      fetchCounts();

      // Close modal
      setIsRejectModalOpen(false);
      setSelectedOrder(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast.error("Failed to reject order");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Reset to page 1 when searching
    setPagination((prev) => ({ ...prev, currentPage: 1 }));

    if (term.trim() === "") {
      fetchOrders(activeTab, 1, "", pagination.limit);
    } else {
      const timeoutId = setTimeout(() => {
        fetchOrders(activeTab, 1, term, pagination.limit);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // View more info
  const handleViewMore = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  // Open reject modal
  const openRejectModal = (order: Order) => {
    setSelectedOrder(order);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  // Format currency
  const formatCurrency = (amount: string | null, currency: string) => {
    if (!amount) return "N/A";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(Number(amount));
    } catch (error) {
      return `${amount} ${currency}`;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Get order status badge color
  const getOrderStatusColor = (status: string): string => {
    switch (status) {
      case "accepted":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "rejected":
        return "bg-rose-100 text-rose-800";
      case "inProgress":
        return "bg-blue-100 text-blue-800";
      case "submitted":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Get formatted status label
  const getFormattedStatus = (status: string): string => {
    switch (status) {
      case "inProgress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const { hasAnyPermission, hasPermission } = usePermissions();

  return (
    <div className="flex flex-col space-y-6">
      <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                Review and manage customer orders
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto h-auto px-2 sm:px-6">
          <Tabs
            defaultValue="pending"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="mb-6 bg-slate-200 lg:h-[70px] h-[auto] rounded-lg w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm"
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
                value="accepted"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm"
              >
                <div className="bg-emerald-200 text-emerald-700 p-1 rounded-md">
                  <Check className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Accepted</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.accepted}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm"
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
                value="inProgress"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm"
              >
                <div className="bg-blue-200 text-blue-700 p-1 rounded-md">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span>In Progress</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.inProgress}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="submitted"
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm"
              >
                <div className="bg-purple-200 text-purple-700 p-1 rounded-md">
                  <Archive className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Submitted</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.submitted}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm"
              >
                <div className="bg-green-200 text-green-700 p-1 rounded-md">
                  <Check className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Completed</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {counts.completed}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm flex items-center justify-start gap-1 sm:gap-2 py-2 sm:py-3 w-full text-xs sm:text-sm"
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

            {[
              "pending",
              "accepted",
              "rejected",
              "inProgress",
              "submitted",
              "completed",
              "all",
            ].map((tab) => (
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
                                Order #
                              </TableHead>
                              <TableHead className="py-4 text-left">
                                Customer
                              </TableHead>
                              <TableHead className="hidden md:table-cell py-4 text-left">
                                Date
                              </TableHead>
                              <TableHead className="py-4 text-left">
                                Amount
                              </TableHead>
                              <TableHead className="hidden lg:table-cell py-4 text-left">
                                Content By
                              </TableHead>
                              <TableHead className="hidden xl:table-cell py-4 text-left">
                                Products
                              </TableHead>
                              <TableHead className="hidden xl:table-cell py-4 text-left">
                                Status
                              </TableHead>
                              <TableHead className="py-4 text-center">
                                Action
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={8}
                                  className="h-24 text-center"
                                >
                                  No orders found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              orders.map((order) => (
                                <TableRow
                                  key={order.id}
                                  className={`${
                                    activeTab === "pending"
                                      ? "bg-amber-50"
                                      : activeTab === "accepted"
                                      ? "bg-emerald-50"
                                      : activeTab === "rejected"
                                      ? "bg-rose-50"
                                      : activeTab === "inProgress"
                                      ? "bg-blue-50"
                                      : activeTab === "submitted"
                                      ? "bg-purple-50"
                                      : activeTab === "completed"
                                      ? "bg-green-50"
                                      : "bg-slate-50"
                                  } hover:bg-slate-100 transition-colors`}
                                >
                                  <TableCell className="font-medium py-4 whitespace-nowrap">
                                    #{order.orderNumber}
                                  </TableCell>
                                  <TableCell className="py-4 max-w-[120px] sm:max-w-none">
                                    <div className="flex flex-col">
                                      <span className="truncate">
                                        {order.user.firstName}{" "}
                                        {order.user.lastName}
                                      </span>
                                      <span className="text-xs text-muted-foreground truncate">
                                        {order.user.email}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell py-4 whitespace-nowrap">
                                    {new Date(
                                      order.createdAt
                                    ).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="py-4 whitespace-nowrap">
                                    <span className="font-medium">
                                      € {order.totalAmount}
                                    </span>
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell py-4">
                                    {order.contentProvidedBy
                                      .charAt(0)
                                      .toUpperCase() +
                                      order.contentProvidedBy.slice(1)}
                                  </TableCell>
                                  <TableCell className="hidden xl:table-cell py-4">
                                    <div className="flex flex-col space-y-2">
                                      {order.products.map((product, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                        >
                                          {product.siteName}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden xl:table-cell py-4">
                                    <Badge
                                      variant="outline"
                                      className={getOrderStatusColor(
                                        order.orderStatus
                                      )}
                                    >
                                      {getFormattedStatus(order.orderStatus)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right py-4">
                                    <div className="flex justify-end gap-2">
                                      {order.orderStatus === "pending" && (
                                        <>
                                          {hasPermission("accept_order") && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                handleAccept(order.id)
                                              }
                                              className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                            >
                                              <Check className="h-4 w-4" />
                                              <span className="sr-only">
                                                Accept
                                              </span>
                                            </Button>
                                          )}

                                          {hasPermission("reject_order") && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                openRejectModal(order)
                                              }
                                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                                              handleViewMore(order)
                                            }
                                            className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                                          >
                                            <EyeIcon className="mr-2 h-4 w-4" />
                                            View details
                                          </DropdownMenuItem>
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing{" "}
                        {pagination.totalItems === 0
                          ? "0"
                          : (pagination.currentPage - 1) * pagination.limit + 1}
                        -
                        {Math.min(
                          pagination.currentPage * pagination.limit,
                          pagination.totalItems
                        )}{" "}
                        of {pagination.totalItems} orders
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          Items per page:
                        </span>
                        <select
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          value={pagination.limit}
                          onChange={(e) => {
                            const newLimit = Number(e.target.value);
                            setPagination((prev) => ({
                              ...prev,
                              limit: newLimit,
                              currentPage: 1,
                            }));
                            // Pass the new limit directly to fetchOrders
                            fetchOrders(activeTab, 1, searchTerm, newLimit);
                          }}
                        >
                          {[10, 25, 50, 100].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                      {pagination.totalPages > 0 && (
                        <div className="flex items-center justify-center sm:justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            disabled={pagination.currentPage === 1}
                          >
                            <ChevronLeft className="h-3 w-3 mr-1" />
                            First
                          </Button>
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
                                    onClick={() => handlePageChange(pageNum)}
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
                            onClick={() =>
                              handlePageChange(pagination.currentPage + 1)
                            }
                            disabled={
                              pagination.currentPage === pagination.totalPages
                            }
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(pagination.totalPages)
                            }
                            disabled={
                              pagination.currentPage === pagination.totalPages
                            }
                          >
                            Last
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl bg-white p-2 sm:p-4 md:p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Order Details
          </DialogTitle>
          {selectedOrder && (
            <>
              {/* Modal Header */}
              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Order #{selectedOrder.orderNumber} -{" "}
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={getOrderStatusColor(selectedOrder.orderStatus)}
                >
                  {getFormattedStatus(selectedOrder.orderStatus)}
                </Badge>
              </div>

              {/* Information Column Layout */}
              <div className="flex flex-col gap-4 mt-4">
                {/* Basic Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <ClipboardList className="h-5 w-5 text-gray-500" /> Order
                    Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">
                        Total Amount:
                      </span>{" "}
                      {formatCurrency(
                        selectedOrder.totalAmount,
                        selectedOrder.to_currency
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Content Provided By:
                      </span>{" "}
                      {selectedOrder.contentProvidedBy.charAt(0).toUpperCase() +
                        selectedOrder.contentProvidedBy.slice(1)}
                    </div>
                    {selectedOrder.file && (
                      <div>
                        <span className="font-medium text-gray-500">File:</span>{" "}
                        {selectedOrder.file.startsWith("http") ? (
                          <a
                            href={selectedOrder.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center"
                          >
                            View File <EyeIcon className="ml-1 h-4 w-4" />
                          </a>
                        ) : (
                          <span>{selectedOrder.file}</span>
                        )}
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div>
                        <span className="font-medium text-gray-500">
                          Notes:
                        </span>{" "}
                        {selectedOrder.notes}
                      </div>
                    )}
                    {selectedOrder.wordLimit && (
                      <div>
                        <span className="font-medium text-gray-500">
                          Word Limit:
                        </span>{" "}
                        {selectedOrder.wordLimit}
                      </div>
                    )}
                    {selectedOrder.anchor && (
                      <div>
                        <span className="font-medium text-gray-500">
                          Anchor Text:
                        </span>{" "}
                        {selectedOrder.anchor}
                      </div>
                    )}
                    {selectedOrder.anchorLink && (
                      <div>
                        <span className="font-medium text-gray-500">
                          Anchor Link:
                        </span>{" "}
                        <a
                          href={selectedOrder.anchorLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center"
                        >
                          {selectedOrder.anchorLink}{" "}
                          <Link2 className="ml-1 h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <Archive className="h-5 w-5 text-gray-500" /> Payment
                    Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">
                        Payment Status:
                      </span>{" "}
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        {selectedOrder.payment_status.charAt(0).toUpperCase() +
                          selectedOrder.payment_status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Payer Amount:
                      </span>{" "}
                      {selectedOrder.payer_amount}{" "}
                      {selectedOrder.payer_currency}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Network:
                      </span>{" "}
                      {selectedOrder.network}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Expires:
                      </span>{" "}
                      {formatDate(selectedOrder.expired_at)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Payment URL:
                      </span>{" "}
                      <a
                        href={selectedOrder.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        View Payment Link <Link2 className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <ClipboardList className="h-5 w-5 text-gray-500" /> Customer
                    Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Name:</span>{" "}
                      {selectedOrder.user.firstName}{" "}
                      {selectedOrder.user.lastName}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Email:</span>{" "}
                      {selectedOrder.user.email}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Backup Email:
                      </span>{" "}
                      {selectedOrder.backupEmail}
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-700">
                    <Archive className="h-5 w-5 text-gray-500" /> Products
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.products.map((product, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{product.siteName}</h4>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700"
                          >
                            {product.language}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-500">
                              Niche:
                            </span>{" "}
                            {product.niche}
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">
                              Price:
                            </span>{" "}
                            {formatCurrency(product.price, product.currency)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">
                              Adjusted Price:
                            </span>{" "}
                            {formatCurrency(
                              product.adjustedPrice ||
                                product.adjustPrice ||
                                "",
                              product.currency
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">
                              Turn Around Time:
                            </span>{" "}
                            {product.turnAroundTime} days
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">
                              Domain Authority:
                            </span>{" "}
                            {product.domainAuthority || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">
                              Domain Ratings:
                            </span>{" "}
                            {product.domainRatings || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">
                              Monthly Traffic:
                            </span>{" "}
                            {product.monthlyTraffic
                              ? product.monthlyTraffic.toLocaleString()
                              : "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">
                              Categories:
                            </span>{" "}
                            {product.category.join(", ")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buttons - Show Accept & Reject ONLY if status is "pending" */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6 border-t pt-4">
                {selectedOrder.orderStatus === "pending" && (
                  <>
                    {hasPermission("accept_order") && (
                      <Button
                        onClick={() => {
                          handleAccept(selectedOrder.id);
                          setIsDialogOpen(false);
                        }}
                        className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg w-full sm:w-auto"
                      >
                        <Check className="mr-2 h-4 w-4" /> Accept
                      </Button>
                    )}

                    {hasPermission("reject_order") && (
                      <Button
                        onClick={() => {
                          openRejectModal(selectedOrder);
                          setIsDialogOpen(false);
                        }}
                        className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg w-full sm:w-auto"
                      >
                        <X className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    )}
                  </>
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
            Reject Order
          </DialogTitle>
          {selectedOrder && (
            <>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">
                  Provide a reason for rejecting Order #
                  {selectedOrder.orderNumber}
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
                  onClick={() => handleReject(selectedOrder.id)}
                  className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg w-full sm:w-auto"
                  disabled={!rejectionReason.trim()}
                >
                  <X className="mr-2 h-4 w-4" /> Reject
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
