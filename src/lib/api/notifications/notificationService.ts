import { ApiService } from "../services/ApiService";
import { NotificationsResponse } from './types';

export interface GetNotificationsRequest {
  pageNo?: number;
  limit?: number;
}

export interface ReadAllNotificationsResponse {
  status: number;
  message: string;
  data?: Record<string, unknown>;
}

export interface FCMTokenRequest {
  token: string;
}

export interface FCMTokenResponse {
  status: number;
  message: string;
  data?: Record<string, unknown>;
}

export class NotificationService extends ApiService {
  /**
   * Get notifications with pagination
   * @param params - Pagination parameters (pageNo, limit)
   * @returns Promise<NotificationsResponse | null>
   */
  async getNotifications(params: GetNotificationsRequest = {}): Promise<NotificationsResponse | null> {
    try {
      const queryParams: Record<string, unknown> = {};

      // Set default values
      if (params.pageNo !== undefined) {
        queryParams.pageNo = params.pageNo.toString();
      } else {
        queryParams.pageNo = "1"; // Default to page 1
      }

      if (params.limit !== undefined) {
        queryParams.limit = params.limit.toString();
      } else {
        queryParams.limit = "12"; // Default to 12 items
      }

      console.log("🔔 NotificationService: Fetching notifications with params:", queryParams);

      const response = await this.get<NotificationsResponse>('/notifications', queryParams);
      
      if (response && response.status === 200 && response.data) {
        console.log("✅ NotificationService: Notifications fetched successfully");
        console.log("📊 NotificationService: New notifications:", response.data.newNotifications);
        console.log("📄 NotificationService: Page items:", response.data.pageItems);
        console.log("📋 NotificationService: Total items:", response.data.totalItems);
        return response;
      } else {
        console.warn("⚠️ NotificationService: Invalid response format:", response);
        return null;
      }
    } catch (error) {
      console.error("🚨 NotificationService: Error fetching notifications:", error);
      return null;
    }
  }

  /**
   * Mark all notifications as read
   * @returns Promise<ReadAllNotificationsResponse | null>
   */
  async readAllNotifications(): Promise<ReadAllNotificationsResponse | null> {
    try {
      console.log("🔔 NotificationService: Marking all notifications as read...");

      const response = await this.post<ReadAllNotificationsResponse>('/notifications/read-all', {});
      
      if (response && (response.status === 200 || response.status === 201)) {
        console.log("✅ NotificationService: All notifications marked as read successfully");
        return response;
      } else {
        console.warn("⚠️ NotificationService: Invalid response format:", response);
        return null;
      }
    } catch (error) {
      console.error("🚨 NotificationService: Error marking notifications as read:", error);
      return null;
    }
  }

  /**
   * Get unread notifications count
   * Convenience method to get just the count of new notifications
   * @returns Promise<number>
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.getNotifications({ pageNo: 1, limit: 1 });
      return response?.data?.newNotifications || 0;
    } catch (error) {
      console.error("🚨 NotificationService: Error fetching unread count:", error);
      return 0;
    }
  }

  /**
   * Register FCM token with the backend
   * @param token - FCM token string
   * @returns Promise<FCMTokenResponse | null>
   */
  async registerFCMToken(token: string): Promise<FCMTokenResponse | null> {
    try {
      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        console.warn("⚠️ NotificationService: Invalid FCM token provided");
        return null;
      }

      const trimmedToken = token.trim();
      console.log("📱 NotificationService: Registering FCM token...");

      // Check if token has changed to avoid unnecessary API calls
      const storedToken = this.getStoredFCMToken();
      if (storedToken === trimmedToken) {
        console.log("✅ NotificationService: FCM token already registered and up to date");
        return { status: 200, message: "Token already registered" };
      }

      const requestBody: Record<string, unknown> = {
        token: trimmedToken
      };

      const response = await this.post<FCMTokenResponse>('/notifications/fcm', requestBody);
      
      if (response && (response.status === 200 || response.status === 201)) {
        console.log("✅ NotificationService: FCM token registered successfully");
        
        // Store token locally for future comparison
        this.storeFCMToken(trimmedToken);
        
        return response;
      } else {
        console.warn("⚠️ NotificationService: Invalid response format:", response);
        return null;
      }
    } catch (error) {
      console.error("🚨 NotificationService: Error registering FCM token:", error);
      return null;
    }
  }

  /**
   * Update FCM token (alias for registerFCMToken for semantic clarity)
   * @param newToken - New FCM token string
   * @returns Promise<FCMTokenResponse | null>
   */
  async updateFCMToken(newToken: string): Promise<FCMTokenResponse | null> {
    console.log("🔄 NotificationService: Updating FCM token...");
    return this.registerFCMToken(newToken);
  }

  /**
   * Clear stored FCM token (useful for logout)
   * This doesn't call the API, just clears local storage
   */
  clearFCMToken(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('fcm_token');
        console.log("🧹 NotificationService: FCM token cleared from local storage");
      }
    } catch (error) {
      console.warn("⚠️ NotificationService: Error clearing FCM token:", error);
    }
  }

  /**
   * Get stored FCM token from local storage
   * @returns string | null
   */
  private getStoredFCMToken(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('fcm_token');
      }
    } catch (error) {
      console.warn("⚠️ NotificationService: Error reading stored FCM token:", error);
    }
    return null;
  }

  /**
   * Store FCM token in local storage
   * @param token - FCM token to store
   */
  private storeFCMToken(token: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('fcm_token', token);
        console.log("💾 NotificationService: FCM token stored in local storage");
      }
    } catch (error) {
      console.warn("⚠️ NotificationService: Error storing FCM token:", error);
    }
  }

  /**
   * Check if FCM token needs to be updated
   * @param currentToken - Current FCM token
   * @returns boolean - true if token needs to be updated
   */
  needsTokenUpdate(currentToken: string): boolean {
    const storedToken = this.getStoredFCMToken();
    return storedToken !== currentToken;
  }

  /**
   * Helper method to format Firestore timestamp to JavaScript Date
   * @param timestamp - Firestore timestamp object
   * @returns Date object
   */
  static formatFirestoreDate(timestamp: { _seconds: number; _nanoseconds: number }): Date {
    return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
  }

  /**
   * Helper method to format notification date for display
   * @param timestamp - Firestore timestamp object
   * @returns Formatted date string
   */
  static formatNotificationDate(timestamp: { _seconds: number; _nanoseconds: number }): string {
    const date = this.formatFirestoreDate(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();
