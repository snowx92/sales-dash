import { ApiService } from "../services/ApiService";
import { PaginatedResponse } from "../services/commonTypes";
import {
  Transaction,
} from "./types";

export class VPayService extends ApiService {
  private readonly basePath = "/stores/single";

  async getStoreVPayTransactions(
    storeId: string, 
    pageNo: number = 1, 
    limit: number = 10
  ): Promise<PaginatedResponse<Transaction>> {
    const response = await this.get<PaginatedResponse<Transaction>>(
      `${this.basePath}/${storeId}/vpay-transactions`, 
      {
        pageNo,
        limit,
      }
    );
    if (!response) throw new Error("Failed to fetch store VPay transactions");
    return response;
  }
}

// Export service instance
export const vPayService = new VPayService(); 