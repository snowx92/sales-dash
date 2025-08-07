import { ApiService } from "../../services/ApiService";

import { CreateSubscriptionRequest , Subscription } from "./types";
export type { Subscription };

export class SubscriptionService extends ApiService {
  private static subscriptionCallCount = 0;

  async createSubscription(id: string, data: CreateSubscriptionRequest): Promise<void> {
    SubscriptionService.subscriptionCallCount++;
    console.log(`[Subscription API] Call #${SubscriptionService.subscriptionCallCount}`, {
      storeId: id,
      requestData: data,
      timestamp: new Date().toISOString()
    });

    try {
      // Use the correct endpoint format: /stores/single/{id}/subscribe
      await this.post(`/stores/single/${id}/subscribe`, data);
      
      console.log(`[Subscription API] Success #${SubscriptionService.subscriptionCallCount}`, {
        storeId: id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`[Subscription API] Error #${SubscriptionService.subscriptionCallCount}`, {
        storeId: id,
        requestData: data,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error,
        timestamp: new Date().toISOString()
      });
      
      // Re-throw the error for the caller to handle
      throw error;
    }
  }
} 