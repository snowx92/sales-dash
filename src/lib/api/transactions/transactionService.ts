import { ApiService } from "../services/ApiService";
import type { TransactionsResponse, TransactionsRequest } from "./types";

export class TransactionService extends ApiService {
  /**
   * Fetch transactions with pagination
   */
  async getTransactions(params: TransactionsRequest = {}): Promise<TransactionsResponse["data"] | null> {
    try {
      const queryParams = {
        pageNo: (params.pageNo || 1).toString(),
        limit: (params.limit || 10).toString()
      };

      console.log("📊 TransactionService: Fetching transactions with params:", queryParams);

      // The ApiService.get returns the 'data' property directly for non-auth endpoints
      const response = await this.get<TransactionsResponse["data"]>(
        "/transactions",
        queryParams
      );

      console.log("📊 TransactionService: Response received:", response);

      return response;
    } catch (error) {
      console.error("🚨 TransactionService: Error fetching transactions:", error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<unknown> {
    try {
      console.log("📊 TransactionService: Fetching transaction:", transactionId);

      const response = await this.get(`/transactions/${transactionId}`);

      console.log("📊 TransactionService: Transaction response:", response);

      return response;
    } catch (error) {
      console.error("🚨 TransactionService: Error fetching transaction:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const transactionService = new TransactionService();
