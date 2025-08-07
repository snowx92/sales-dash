import { Timestamp } from "../services/commonTypes";
import { Store } from "../stores/types";

export type PayoutStatus = "Pending" | "Success" | "Failed" | "Canceled"

export interface User {
  id: string
  name: string
  avatar: string
}

export interface StoreOwner {
  user: User
  store: Store
}

export interface Payout {
  id: string
  amount: number
  currency: string
  createdAt: Timestamp
  method: string
  lastUpdated: Timestamp
  walletNumber: string
  owner: StoreOwner
  actionedBy: string | null
  status: PayoutStatus
}

export interface Transaction {
  id: string
  totalAmount: number
  amountAfterFees: number
  commission: number
  currency: string
  orderId: string
  createdAt: Timestamp
  method: string
  kashierLink: string
  orderLink: string
  owner: StoreOwner
}

export interface Balance {
  balance: number
  currency: string
  payouts: number
  wallets: number
}

export interface StoreCategory {
  id: number
  icon: string
  name: string
}

export interface StorePlan {
  id: string
  planName: string
  subscribeDate: Timestamp
  expireDate: Timestamp
  renewEnabled: boolean
  currentOrders: number
  maxOrders: number
  usagePercent: number
}

export interface StoreWithBalance {
  id: string
  enabled: boolean
  finishedSetup: boolean
  name: string
  merchantId: string
  logo: string
  defaultCountry: string
  defaultCurrency: string
  createdAt: Timestamp
  category: StoreCategory
  vPayBalance: number
  plan: StorePlan
}

export interface UpdatePayoutStatusRequest {
  status: PayoutStatus
}

export interface PayoutRequest {
  id: string
  amount: number
  currency: string
  createdAt: Timestamp
  method: string
  lastUpdated:Timestamp
  walletNumber: string
  owner: StoreOwner
  actionedBy: string | null
}
  
  