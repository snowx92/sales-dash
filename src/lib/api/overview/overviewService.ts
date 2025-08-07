import { ApiService } from "../services/ApiService";
import { SalesAccountData, SalesUser, SidebarCounters } from './type';

export interface OverviewRequest {
  from?: string; // ISO date string (YYYY-MM-DD)
  to?: string;   // ISO date string (YYYY-MM-DD)
}

export class OverviewService extends ApiService {
  /**
   * Get sales overview data with optional date range
   * If no date range is provided, defaults to current month (start of month to today)
   */
  async getOverview(params: OverviewRequest = {}): Promise<SalesAccountData | null> {
    try {
      const queryParams: Record<string, string> = {};

      // If no date range provided, use current month (start to today)
      if (!params.from && !params.to) {
        const now = new Date();
        // Ensure we get the exact start of the month in local timezone
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Format dates properly to avoid timezone issues
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        queryParams.from = formatDate(startOfMonth);
        queryParams.to = formatDate(today);
        
        console.log("📊 OverviewService: Using default current month range:", queryParams);
      } else {
        // Add date range parameters if provided
        if (params.from) {
          queryParams.from = params.from;
        }
        if (params.to) {
          queryParams.to = params.to;
        }
      }

      console.log("📊 OverviewService: Fetching overview with params:", queryParams);

      // The ApiService.get returns the extracted data directly
      const response = await this.get<SalesAccountData>(
        "/overview",
        queryParams
      );

      console.log("📊 OverviewService: Overview response received:", response);

      return response;
    } catch (error) {
      console.error("🚨 OverviewService: Error fetching overview:", error);
      throw error;
    }
  }

  /**
   * Get overview for current month (from start of month to today)
   */
  async getCurrentMonthOverview(): Promise<SalesAccountData | null> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Format dates properly to avoid timezone issues
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return this.getOverview({
      from: formatDate(startOfMonth),
      to: formatDate(today)
    });
  }

  /**
   * Get overview for current month to end of month (full month)
   */
  async getCurrentMonthFullOverview(): Promise<SalesAccountData | null> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getOverview({
      from: startOfMonth.toISOString().split('T')[0],
      to: endOfMonth.toISOString().split('T')[0]
    });
  }

  /**
   * Get overview for a specific month
   */
  async getMonthlyOverview(year: number, month: number): Promise<SalesAccountData | null> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.getOverview({
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0]
    });
  }

  /**
   * Get overview for a custom date range
   */
  async getDateRangeOverview(fromDate: string, toDate: string): Promise<SalesAccountData | null> {
    return this.getOverview({
      from: fromDate,
      to: toDate
    });
  }

  /**
   * Get overview for the last N days
   */
  async getLastNDaysOverview(days: number): Promise<SalesAccountData | null> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return this.getOverview({
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0]
    });
  }

  /**
   * Get sales leaderboard data
   */
  async getLeaderboard(): Promise<SalesUser[] | null> {
    try {
      console.log("🏆 OverviewService: Fetching leaderboard data");

      // The ApiService.get returns the extracted data directly
      const response = await this.get<SalesUser[]>(
        "/overview/leaderboard"
      );

      console.log("🏆 OverviewService: Leaderboard response received:", response);

      return response;
    } catch (error) {
      console.error("🚨 OverviewService: Error fetching leaderboard:", error);
      throw error;
    }
  }

  /**
   * Get sidebar counters data
   */
  async getCounters(): Promise<SidebarCounters | null> {
    try {
      console.log("📊 OverviewService: Fetching sidebar counters");

      // The ApiService.get returns the extracted data directly
      const response = await this.get<SidebarCounters>(
        "/overview/counters"
      );

      console.log("📊 OverviewService: Counters response received:", response);

      return response;
    } catch (error) {
      console.error("🚨 OverviewService: Error fetching counters:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const overviewService = new OverviewService();