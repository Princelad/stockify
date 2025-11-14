import React, { useState, useEffect } from "react";
import { Plus, Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { apiService } from "@/lib/api";
import type { Return, ReturnFilters, ReturnsResponse } from "@/types/return";

const Returns: React.FC = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReturnFilters>({
    page: 1,
    limit: 10,
  });
  const [summary, setSummary] = useState({
    totalReturns: 0,
    totalRefundAmount: 0,
    pendingReturns: 0,
    processedReturns: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReturns: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReturns(filters);

      if (response.success && "data" in response) {
        const data = response.data as ReturnsResponse;
        setReturns(data.returns);
        setSummary(data.summary);
        setPagination(data.pagination);
        setError(null);
      } else {
        setError("Failed to fetch returns");
      }
    } catch (err) {
      setError("Error fetching returns");
      console.error("Error fetching returns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [filters]);

  const handleStatusFilter = (status: Return["refundStatus"] | "") => {
    setFilters((prev) => ({
      ...prev,
      status: status || undefined,
      page: 1,
    }));
  };

  const handleSearch = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const getStatusIcon = (status: Return["refundStatus"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "processed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Return["refundStatus"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processed":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && returns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Returns & Refunds
        </h1>
        <p className="text-gray-600">
          Manage product returns and process refunds
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalReturns}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Refund Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalRefundAmount)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Returns</p>
              <p className="text-2xl font-bold text-yellow-600">
                {summary.pendingReturns}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processed Returns</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.processedReturns}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by return number, product name, or notes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusFilter("")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !filters.status
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter("pending")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.status === "pending"
                    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusFilter("processed")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.status === "processed"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                Processed
              </button>
              <button
                onClick={() => handleStatusFilter("rejected")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.status === "rejected"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {returns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No returns found
            </h3>
            <p className="text-gray-600">
              No returns match your current filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Return #
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Original Sale
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Items
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Refund Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {returns.map((returnItem) => (
                    <tr key={returnItem._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {returnItem.returnNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {returnItem.sale.invoiceNumber}
                          </div>
                          <div className="text-gray-600">
                            {formatDate(returnItem.sale.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {returnItem.customer?.name || "Walk-in Customer"}
                          </div>
                          {returnItem.customer?.email && (
                            <div className="text-gray-600">
                              {returnItem.customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {returnItem.items.length} item
                            {returnItem.items.length !== 1 ? "s" : ""}
                          </div>
                          <div className="text-gray-600">
                            {returnItem.items
                              .map((item) => item.productName)
                              .join(", ")}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(returnItem.totalRefundAmount)}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {returnItem.refundMethod}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            returnItem.refundStatus
                          )}`}
                        >
                          {getStatusIcon(returnItem.refundStatus)}
                          <span className="capitalize">
                            {returnItem.refundStatus}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(returnItem.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {returnItem.refundStatus === "pending" && (
                            <>
                              <button
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                title="Approve Return"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Reject Return"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.currentPage - 1) * filters.limit! + 1} to{" "}
                  {Math.min(
                    pagination.currentPage * filters.limit!,
                    pagination.totalReturns
                  )}{" "}
                  of {pagination.totalReturns} returns
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Returns;
