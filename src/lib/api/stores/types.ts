import { PaginationParams, PaginatedResponse, Timestamp } from "../services/commonTypes";

export interface Category {
  id: number;
  icon: string;
  name: string;
}

export interface Plan {
  id: string;
  isTrial: boolean;
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
  category: Category;
  plan: Plan;
  counters: Counters;
  localMarkets: string[];
}

export type StoresResponse = PaginatedResponse<Store>;

export interface GetStoresParams extends PaginationParams {
  status?: 'subscribed' | 'not_subscribed' | 'hidden';
  sortBy?: 'date' | 'orders' | 'site' | 'products';
  planId?: 'pro' | 'free' | 'starter' | 'plus';
  keyword?: string;
} 