import { ApiService } from "../../services/ApiService";
import { 
  StoreAnalyticsResponse, 
  OrdersResponse, 
  PaymentHistoryResponse, 
  VPayTransactionsResponse,
  GetOrdersParams,
  GetPaymentHistoryParams,
  GetVPayTransactionsParams,
  ChartsData,
  GetChartsParams
} from "./types";

export class ProfileService extends ApiService {
  private static instance: ProfileService;
  private readonly baseEndpoint = '/stores/single/';

  private constructor() {
    super();
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Get store analytics
   * @param storeId Store ID
   * @returns Store analytics data
   */
  async getStoreAnalytics(storeId: string): Promise<StoreAnalyticsResponse> {
    const response = await this.get<StoreAnalyticsResponse>(`${this.baseEndpoint}${storeId}`);
    if (!response) {
      throw new Error('Failed to fetch store analytics');
    }
    return response;
  }

  /**
   * Get store orders
   * @param storeId Store ID
   * @param params Pagination parameters
   * @returns Paginated orders data
   */
  async getStoreOrders(storeId: string, params: GetOrdersParams): Promise<OrdersResponse> {
    const queryParams: Record<string, string> = {
      pageNo: params.pageNo.toString(),
      limit: params.limit.toString()
    };

    const response = await this.get<OrdersResponse>(
      `${this.baseEndpoint}${storeId}/orders`, 
      queryParams
    );
    
    if (!response) {
      throw new Error('Failed to fetch store orders');
    }
    return response;
  }

  /**
   * Get store payment history
   * @param storeId Store ID
   * @param params Pagination parameters
   * @returns Paginated payment history data
   */
  async getPaymentHistory(storeId: string, params: GetPaymentHistoryParams): Promise<PaymentHistoryResponse> {
    const queryParams: Record<string, string> = {
      pageNo: params.pageNo.toString(),
      limit: params.limit.toString()
    };

    const response = await this.get<PaymentHistoryResponse>(
      `${this.baseEndpoint}${storeId}/payment-history`, 
      queryParams
    );
    
    if (!response) {
      throw new Error('Failed to fetch payment history');
    }
    return response;
  }

  /**
   * Get store VPay transactions
   * @param storeId Store ID
   * @param params Pagination parameters
   * @returns Paginated VPay transactions data
   */
  async getVPayTransactions(storeId: string, params: GetVPayTransactionsParams): Promise<VPayTransactionsResponse> {
    const queryParams: Record<string, string> = {
      pageNo: params.pageNo.toString(),
      limit: params.limit.toString()
    };

    const response = await this.get<VPayTransactionsResponse>(
      `${this.baseEndpoint}${storeId}/vpay-transactions`, 
      queryParams
    );
    
    if (!response) {
      throw new Error('Failed to fetch VPay transactions');
    }
    return response;
  }

  /**
   * Get store charts data
   * @param storeId Store ID
   * @param params Chart parameters with from and to dates
   * @returns Charts data including counters and time series
   */
  async getCharts(storeId: string, params: GetChartsParams): Promise<ChartsData> {
    const queryParams: Record<string, string> = {
      from: params.from,
      to: params.to
    };

    try {
      const response = await this.get<ChartsData>(
        `${this.baseEndpoint}${storeId}/charts`, 
        queryParams
      );
      
      if (!response) {
        throw new Error('Failed to fetch charts data');
      }
      return response;
    } catch (error) {
      // If the error is about owner being undefined, return a default response
      if (error instanceof Error && error.message.includes('owner is not defined')) {
        return {
          counters: {
            totalSales: 0,
            totalVPayTransactions: 0,
            totalOrders: 0,
            totalWebsiteVisits: 0
          },
          charts: {
            ordersChart: [],
            vPayTransactionsChart: []
          }
        };
      }
      throw error;
    }
  }
}

export const profileService = ProfileService.getInstance(); 