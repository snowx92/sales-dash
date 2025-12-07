export interface CreateSubscriptionRequest {
    planId: string;
    durationId: string;
    paidAmount: number;
    currency?: string;
    [key: string]: unknown;
  }
  export interface Subscription {
    id: string;
    planId: string;
    durationId: string;
    paidAmount: number;
  }
