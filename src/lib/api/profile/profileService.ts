import { ApiService } from "../services/ApiService";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  phoneCountryCode: string;
  accountType: string;
  storeId: string;
  isBanned: boolean;
  profilePic: string;
  isOnline: boolean;
  needStoreCreating: boolean;
  accessLevels: Record<string, unknown>;
  authProviders: string[];
}

export interface ProfileResponse {
  status: boolean;
  message: string;
  data: UserProfile;
}

export interface UpdateProfileRequest {
  name: string;
  phone: string;
  phoneCountryCode: string;
  image?: string; // Base64 image
  [key: string]: unknown;
}

export interface UpdateProfileResponse {
  status: boolean;
  message: string;
  data: UserProfile;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  [key: string]: unknown;
}

export interface ChangePasswordResponse {
  status: boolean;
  message: string;
  data: null;
}

export interface ResetPasswordRequest {
  email: string;
  [key: string]: unknown;
}

export interface ResetPasswordResponse {
  status: boolean;
  message: string;
  data: null;
}

export class ProfileService extends ApiService {
  constructor() {
    super();
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<ProfileResponse | null> {
    try {
      const response = await this.get<ProfileResponse>("/auth/profile");
      return response;
    } catch (error: unknown) {
      // Type guard for error properties
      const errorObj = error as { status?: number; message?: string };
      
      // If API is completely unavailable or returns auth errors, provide fallback
      if (errorObj.status === 401 || errorObj.message?.includes('Unauthorized') || 
          errorObj.message?.includes('Invalid Firebase token')) {
        
        // Try to get user info from Firebase as fallback
        try {
          const { getAuth } = await import('firebase/auth');
          const auth = getAuth();
          const currentUser = auth.currentUser;
          
          if (currentUser) {
            // Create a minimal profile from Firebase user data
            const fallbackProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              phone: currentUser.phoneNumber || '',
              phoneCountryCode: '+1',
              accountType: 'sales',
              storeId: '',
              isBanned: false,
              profilePic: currentUser.photoURL || '',
              isOnline: true,
              needStoreCreating: false,
              accessLevels: {},
              authProviders: currentUser.providerData.map(p => p.providerId)
            };
            
            const fallbackResponse: ProfileResponse = {
              status: true,
              message: "Profile retrieved from Firebase",
              data: fallbackProfile
            };
            
            return fallbackResponse;
          }
        } catch {
          // Firebase also failed
        }
      }
      
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<UpdateProfileResponse | null> {
    try {
      const response = await this.put<UpdateProfileResponse>(
        "/auth/profile",
        profileData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse | null> {
    try {
      const response = await this.put<ChangePasswordResponse>(
        "/auth/change-password",
        passwordData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password (send reset email)
   */
  async resetPassword(resetData: ResetPasswordRequest): Promise<ResetPasswordResponse | null> {
    try {
      // Add account type for sales dashboard
      const requestData = {
        ...resetData,
        accountType: "sales"
      };
      
      const response = await this.post<ResetPasswordResponse>(
        "/auth/reset-password",
        requestData,
        { "Skip-Auth": "true" }
      );
      return response;
    } catch (error: unknown) {
      // Type guard for error properties
      const errorObj = error as { status?: number; message?: string };
      
      // If API is unavailable, try Firebase password reset as fallback
      if (errorObj.status === 404 || errorObj.message?.includes('404') || 
          errorObj.message?.includes('Cannot POST') || 
          errorObj.message?.includes('Not Found')) {
        
        try {
          const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
          const auth = getAuth();
          
          await sendPasswordResetEmail(auth, resetData.email);
          
          // Return success response in expected format
          return {
            status: true,
            message: "Password reset email sent successfully via Firebase",
            data: null
          };
        } catch {
          throw new Error("Failed to send password reset email. Please try again later.");
        }
      }
      
      throw error;
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
