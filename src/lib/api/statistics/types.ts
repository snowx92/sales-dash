export interface ChartDataPoint {
  date: string;
  value: number;
}

interface StatisticsCharts {
  sales: ChartDataPoint[];
  orders: ChartDataPoint[];
  merchants: ChartDataPoint[];
  newSubscribtions: ChartDataPoint[];
  renewSubscribtions: ChartDataPoint[];
  vpay: ChartDataPoint[];
}

export interface ExpenseData {
  id: string;
  name: string;
  totalAmount: number;
  count: number;
}

export interface StatisticsResponse {
  revenue: number;
  expanses: number;
  renewTransactions: number;
  renewSubscribtionsCount: number;
  newSubscriptions: number;
  newSubscribtionsCount: number;
  vpayTotalAmount: number;
  vTransactionsCount: number;
  newMerchant: number;
  orders: number;
  newProducts: number;
  totalSales: number;
  currentlyOnline: number;
  currentOnlineUser: number;
  charts: StatisticsCharts;
}

export interface CountryStats {
    storesCount: number;
    id: string;
    name: string;
    flag: string;
    defaultCurrency: string;
    currencyName: string;
}

export interface CategoryStats {
    storesCount: number;
    id: number;
    icon: string;
    name: string;
} 