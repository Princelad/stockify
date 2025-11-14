export interface ReturnItem {
  productId: string;
  productName: string;
  quantityReturned: number;
  originalQuantity: number;
  unitPrice: number;
  totalRefunded: number;
  reason:
    | "defective"
    | "wrong-item"
    | "customer-changed-mind"
    | "damaged"
    | "expired"
    | "other";
  product?: {
    _id: string;
    name: string;
    sku: string;
    currentStock?: number;
  };
}

export interface Return {
  _id: string;
  returnNumber: string;
  sale: {
    _id: string;
    invoiceNumber: string;
    createdAt: string;
    totalAmount?: number;
    paymentMethod?: string;
  };
  customer?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  items: ReturnItem[];
  totalRefundAmount: number;
  refundMethod: "cash" | "card" | "upi" | "netbanking" | "store-credit";
  refundStatus: "pending" | "processed" | "rejected";
  notes: string;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReturnEligibility {
  sale: {
    id: string;
    invoiceNumber: string;
    createdAt: string;
    totalAmount: number;
  };
  eligibleItems: {
    productId: string;
    productName: string;
    originalQuantity: number;
    alreadyReturned: number;
    availableToReturn: number;
    unitPrice: number;
    isEligible: boolean;
  }[];
  hasEligibleItems: boolean;
}

export interface CreateReturnData {
  saleId: string;
  items: {
    productId: string;
    quantityReturned: number;
    reason: ReturnItem["reason"];
  }[];
  refundMethod: Return["refundMethod"];
  notes?: string;
}

export interface ReturnFilters {
  page?: number;
  limit?: number;
  status?: Return["refundStatus"];
  startDate?: string;
  endDate?: string;
  customerId?: string;
  search?: string;
}

export interface ReturnSummary {
  totalReturns: number;
  totalRefundAmount: number;
  pendingReturns: number;
  processedReturns: number;
}

export interface ReturnsResponse {
  returns: Return[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReturns: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: ReturnSummary;
}
