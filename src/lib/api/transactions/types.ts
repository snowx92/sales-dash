// Transaction types based on the API response

export interface TransactionTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface TransactionPlan {
  id: string;
  name: string;
  duration: string;
}

export interface TransactionStore {
  id: string;
  merchantId: string;
  name: string;
  logo?: string;
  country: string;
  link?: string;
}

export interface TransactionAdmin {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  discountCode?: string;
  createdAt: TransactionTimestamp;
  method: string;
  type?: string;
  kashierLink?: string | null;
  plan: TransactionPlan;
  store: TransactionStore;
  admin: TransactionAdmin | null;
}

export interface TransactionsResponse {
  status: number;
  message: string;
  data: {
    items: Transaction[];
    pageItems: number;
    totalItems: number;
    isLastPage: boolean;
    nextPageNumber: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface TransactionsRequest {
  pageNo?: number;
  limit?: number;
}
