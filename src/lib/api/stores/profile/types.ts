import { PaginationParams, Timestamp } from "../../services/commonTypes";
import { Store } from "../types";
import { Transaction } from "../../transactions/types";
import { Transaction as VPayTransaction } from "../../vpay/types";

export interface StoreAnalyticsResponse {
  store: Store;
  owner: {
    id: string;
    email: string;
    name: string;
    phone: string;
    profilePic: string;
    isOnline: boolean;
  };
  counters: {
    products: number;
    orders: number;
    clients: number;
    employees: number;
    collections: number;
    storeFronts: number;
    couriers: number;
  };
}

export interface OrderProduct {
  id: string;
  name: string;
  variantId: string;
  link: string;
  previewImage: string;
  itemPrice: number;
  quantity: number;
  totalPrice: number;
  variantDisplay: Record<string, string>;
}

export interface CommentDisplay {
  id: string;
  imageUrl: string;
  name: string;
}

export interface OrderComment {
  id: string;
  text: string;
  date: Timestamp;
  display: CommentDisplay;
}

export interface OrderPayment {
  gateway: string;
  method: string;
  paymentStatus: string;
  productsPrice: number;
  shippingFees: number;
  discount: number;
  currency: string;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email: string;
  otherPhone: string;
  address: string;
  gov: string;
  cityId: string;
}

export interface OrderCourier {
  name: string;
  id: string;
}

export interface Order {
  id: string;
  date: Timestamp;
  isPinned: boolean;
  status: string;
  attachmentsCount: number;
  link: string;
  marketPlaceId: string;
  productsCount: number;
  discountCode: string;
  products: OrderProduct[];
  comments: OrderComment[];
  payment: OrderPayment;
  customer: OrderCustomer;
  courier: OrderCourier;
}

export interface ExtractedPaginatedData<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type OrdersResponse = ExtractedPaginatedData<Order>;

export type PaymentHistoryResponse = ExtractedPaginatedData<Transaction>;

export type VPayTransactionsResponse = ExtractedPaginatedData<VPayTransaction>;

export type GetOrdersParams = PaginationParams;
export type GetPaymentHistoryParams = PaginationParams;
export type GetVPayTransactionsParams = PaginationParams;

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface ChartsData {
  counters: {
    totalSales: number;
    totalVPayTransactions: number;
    totalOrders: number;
    totalWebsiteVisits: number;
  };
  charts: {
    ordersChart: ChartDataPoint[];
    vPayTransactionsChart: ChartDataPoint[];
  };
}

export interface GetChartsParams {
  from: string; // Date in format YYYY-MM-DD
  to: string;   // Date in format YYYY-MM-DD
} 