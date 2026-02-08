import { PaginationParams, PaginatedResponse, Timestamp } from "../services/commonTypes";

export interface StoreCategory {
  id: number;
  icon: string;
  name: string;
}

export interface StoreCategoriesResponse {
  status: number;
  message: string;
  data: StoreCategory[];
}

export interface AssignedSales {
  id: string;
  avatar: string;
  name: string;
}

export interface Category {
  id: number;
  icon: string;
  name: string;
}

export interface Plan {
  id: string;
  isTrial: boolean;
  isExpired: boolean;
  planName: string;
  subscribeDate: Timestamp;
  expireDate: Timestamp;
  renewEnabled: boolean;
  currentOrders: number;
  maxOrders: number;
  usagePercent: number;
}

export interface Counters {
  collections: number;
  products: number;
  orders: number;
  reviews: number;
  customers: number;
  teamCount: number;
  hiddenOrders: number;
  visits: number;
}

export interface Store {
  id: string;
  enabled: boolean;
  finishedSetup: boolean;
  name: string;
  merchantId: string;
  logo: string;
  defaultCountry: string;
  defaultCurrency: string;
  domains: string[];
  defaultDomain: string;
  createdAt: Timestamp;
  apiKey: string;
  category: Category;
  vPayBalance: number;
  assignedTo: string;
  isBeta: boolean;
  isWebsiteExpired: boolean;
  websiteExpireDate: Timestamp | null;
  plan: Plan;
  counters: Counters;
  localMarkets: string[];
  assignedSales?: AssignedSales;
  steps?: {
    logo: { desc: string; completed: boolean };
    shippingAreas: { desc: string; completed: boolean };
    categories: { desc: string; completed: boolean };
    products: { desc: string; completed: boolean };
    adjustTheme: { desc: string; completed: boolean };
    order: { desc: string; completed: boolean };
    isAllComplete: boolean;
  };
  retantion?: {
    feedbacks: string[];
    priority: string;
    lastAttempt: Timestamp;
    attemps: number;
  };
}

export type StoresResponse = PaginatedResponse<Store>;

export interface GetStoresParams extends PaginationParams {
  status?: 'subscribed' | 'not_subscribed' | 'hidden';
  sortBy?: 'date' | 'orders' | 'site' | 'products';
  planId?: 'pro' | 'free' | 'starter' | 'plus';
  keyword?: string;
  storeCategoryNo?: number;
} 