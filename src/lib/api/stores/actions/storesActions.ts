import { ApiService } from "../../services/ApiService";

export interface ForcePasswordResetRequest {
  password: string; // The new store password
}

export interface StoreCredentials {
  email: string;
  password: string;
  token: string;
}

export interface StoreCredentialsResponse {
  status: number;
  message: string;
  data: string; // The token is returned directly as a string, not as an object
}

export interface ForcePasswordResetResponse {
  status: number;
  message: string;
  data?: Record<string, unknown>;
}

class StoresActionsApi extends ApiService {
  /**
   * Get store login credentials for a specific store
   * Sales person can view store credentials to help with access
   * @param storeId - The ID of the store to get credentials for
   * @returns Promise<string | null> - Returns the token directly
   */
  async getStoreCredentials(storeId: string): Promise<string | null> {
    try {
      console.log(`🔑 StoresActions: Getting credentials for store ${storeId}...`);
      
      // ApiService automatically extracts the data property, so we get the token directly
      const token = await this.get<string>(`/stores/single/${storeId}/credentials`);
      
      if (token && typeof token === 'string') {
        console.log("✅ StoresActions: Store credentials retrieved successfully");
        return token;
      } else {
        console.warn("⚠️ StoresActions: Invalid credentials response format:", token);
        return null;
      }
    } catch (error) {
      console.error("🚨 StoresActions: Error getting store credentials:", error);
      return null;
    }
  }

  /**
   * Force set a new password for a store
   * Sales person can reset store passwords when needed
   * @param storeId - The ID of the store to reset password for
   * @param newPassword - The new password to set
   * @returns Promise<ForcePasswordResetResponse | null>
   */
  async forcePasswordReset(storeId: string, newPassword: string): Promise<ForcePasswordResetResponse | null> {
    try {
      if (!newPassword || newPassword.trim().length === 0) {
        console.warn("⚠️ StoresActions: Invalid password provided");
        return null;
      }

      console.log(`🔒 StoresActions: Force setting password for store ${storeId}...`);
      
      const requestBody: Record<string, unknown> = {
        password: newPassword.trim()
      };

      const response = await this.post<ForcePasswordResetResponse>(`/stores/single/${storeId}/force-password`, requestBody);
      
      if (response && (response.status === 200 || response.status === 201)) {
        console.log("✅ StoresActions: Password reset successfully");
        return response;
      } else {
        console.warn("⚠️ StoresActions: Invalid password reset response format:", response);
        return null;
      }
    } catch (error) {
      console.error("🚨 StoresActions: Error resetting store password:", error);
      return null;
    }
  }
}

export const storesActionsApi = new StoresActionsApi(); 