// Root response for overview
export interface SalesAccountResponse {
  status: number;
  message: string;
  data: SalesAccountData;
}

// Main Data Object for overview
export interface SalesAccountData {
  user: User;
  counters: SubscriptionCounters;
  periodTransactionsCount: TransactionCount;
  totalRevenue: Revenue;
  periodRevenue: Revenue;
  assignedStoresCount: number;
  salesLeadsCount: number;
  newSubscriptionTarget: Target;
  renewalsTarget: Target;
  totalTarget: Target;
  charts: Charts;
}

// Generic user data
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  phoneCountryCode: string;
  isBanned: boolean;
  profilePic: string;
  isOnline: boolean;
  refferCode: string;
  refferLink: string;
}

// SalesUser with targets and tier/position info
export interface SalesUser extends User {
  tierSales: number;
  targets: {
    newSubscriptionTarget: Target;
    renewalsTarget: Target;
    totalTarget: Target;
  };
  leadboardPosition: number;
}

// SalesUsers list response
export interface SalesUsersResponse {
  status: number;
  message: string;
  data: SalesUser[];
}

// Sidebar counters response
export interface SidebarCountersResponse {
  status: number;
  message: string;
  data: SidebarCounters;
}

// Sidebar counters data
export interface SidebarCounters {
  stores: number;
  pendingLeads: number;
  allTransactions: number;
  newNotifications: number;
  retention: number;
}

// Counters for subscriptions
export interface SubscriptionCounters {
  starter: number;
  pro: number;
  plus: number;
}

// Transaction counts for the period
export interface TransactionCount {
  all: number;
  new: number;
  renew: number;
}

// Revenue (used for both total and period)
export interface Revenue {
  total: number;
  new: number;
  renew: number;
}

// Subscription/renewal targets
export interface Target {
  current: number;
  total: number;
  percentage: number | null;
}

// Chart structure
export interface Charts {
  merchants: ChartData;
  newSubscribtion: ChartData;
  renewSubscribtions: ChartData;
}

export interface ChartData {
  currentDurationData: ChartPoint[];
  prevDurationData: PrevChartPoint[];
  overallChangePercentage: number;
}

export interface ChartPoint {
  date: string;
  value: number;
  changePercentage: number;
}

export interface PrevChartPoint {
  date: string;
  value: number;
}
