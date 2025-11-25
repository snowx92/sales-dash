import { ApiService } from "../services/ApiService";
import {
  EndedSubscriptionsData,
  FeedbackRequest,
  FeedbackResponse,
  RetentionQueryParams,
  RetentionOverviewData,
  EndingInPeriodQueryParams
} from './types';

export class RetentionService extends ApiService {
  /**
   * Get ended subscriptions (retention list) with pagination and filters
   */
  async getEndedSubscriptions(params: RetentionQueryParams = {}): Promise<EndedSubscriptionsData | null> {
    try {
      const queryParams: Record<string, string> = {};

      // Add pagination parameters
      if (params.limit !== undefined) {
        queryParams.limit = params.limit.toString();
      }
      if (params.pageNo !== undefined) {
        queryParams.pageNo = params.pageNo.toString();
      }

      // Add filter parameters
      if (params.keyword) {
        queryParams.keyword = params.keyword;
      }
      if (params.priority) {
        queryParams.priority = params.priority;
      }

      console.log("🔄 RetentionService: Fetching ended subscriptions with params:", queryParams);

      // The ApiService.get returns the extracted data directly
      const response = await this.get<EndedSubscriptionsData>(
        "/retention",
        queryParams
      );

      console.log("🔄 RetentionService: Ended subscriptions response received:", response);

      return response;
    } catch (error) {
      console.error("🚨 RetentionService: Error fetching ended subscriptions:", error);
      throw error;
    }
  }

  /**
   * Submit feedback for retention
   */
  async submitFeedback(feedbackData: FeedbackRequest): Promise<FeedbackResponse | null> {
    try {
      console.log("💬 RetentionService: Submitting feedback:", feedbackData);
      console.log("💬 RetentionService: Using ID from API:", feedbackData.id);
      console.log("💬 RetentionService: URL will be:", `/retention/${feedbackData.id}/feedback`);

      // Validate required fields
      if (!feedbackData.id || !feedbackData.feedback || !feedbackData.priority) {
        console.error("💬 RetentionService: Validation failed:", {
          hasId: !!feedbackData.id,
          hasFeedback: !!feedbackData.feedback,
          hasPriority: !!feedbackData.priority
        });
        throw new Error("ID, feedback and priority are required");
      }

      // The ApiService.post returns the extracted data directly
      const response = await this.post<FeedbackResponse>(
        `/retention/${feedbackData.id}/feedback`,
        { 
          feedback: feedbackData.feedback, 
          priority: feedbackData.priority 
        }
      );

      console.log("💬 RetentionService: Feedback response received:", response);

      return response;
    } catch (error) {
      console.error("🚨 RetentionService: Error submitting feedback:", error);
      throw error;
    }
  }

  /**
   * Get paginated ended subscriptions with default pagination
   */
  async getRetentionPage(page: number = 1, limit: number = 10): Promise<EndedSubscriptionsData | null> {
    return this.getEndedSubscriptions({
      pageNo: page,
      limit: limit
    });
  }

  /**
   * Search ended subscriptions by keyword
   */
  async searchRetention(keyword: string, page: number = 1, limit: number = 50): Promise<EndedSubscriptionsData | null> {
    return this.getEndedSubscriptions({
      keyword,
      pageNo: page,
      limit: limit
    });
  }

  /**
   * Get first page with single item (useful for testing/preview)
   */
  async getRetentionPreview(): Promise<EndedSubscriptionsData | null> {
    return this.getEndedSubscriptions({
      limit: 1,
      pageNo: 1
    });
  }

  /**
   * Get retention overview for stats section
   */
  async getOverview(): Promise<RetentionOverviewData | null> {
    try {
      const response = await this.get<RetentionOverviewData>("/retention/overview");
      return response;
    } catch (error) {
      console.error("🚨 RetentionService: Error fetching retention overview:", error);
      throw error;
    }
  }

  /**
   * Get subscriptions ending in a specific period
   */
  async getEndingInPeriod(params: EndingInPeriodQueryParams): Promise<EndedSubscriptionsData | null> {
    try {
      const queryParams: Record<string, string> = {
        period: params.period
      };

      // Add pagination parameters
      if (params.limit !== undefined) {
        queryParams.limit = params.limit.toString();
      }
      if (params.pageNo !== undefined) {
        queryParams.pageNo = params.pageNo.toString();
      }

      // Add filter parameters
      if (params.keyword) {
        queryParams.keyword = params.keyword;
      }
      if (params.priority) {
        queryParams.priority = params.priority;
      }

      console.log("🔄 RetentionService: Fetching ending-in-period subscriptions with params:", queryParams);

      const response = await this.get<EndedSubscriptionsData>(
        "/retention/ending-in-period",
        queryParams
      );

      console.log("🔄 RetentionService: Ending-in-period response received:", response);

      return response;
    } catch (error) {
      console.error("🚨 RetentionService: Error fetching ending-in-period subscriptions:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const retentionService = new RetentionService();
