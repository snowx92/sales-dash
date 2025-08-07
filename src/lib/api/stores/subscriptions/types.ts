export interface CreateSubscriptionRequest {
    planId: string;
    durationId: string;
    paidAmount: number;
    [key: string]: unknown;
  }
  export interface Subscription {
    id: string;
    planId: string;
    durationId: string;
    paidAmount: number;
  }
