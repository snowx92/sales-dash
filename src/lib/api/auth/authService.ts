import { ApiService } from "../services/ApiService";
import AUTH_CONFIG from "@/lib/config/auth";
import { SessionManager } from "@/lib/utils/session";
import { signInWithCustomToken } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

interface LoginResponse {
  status: boolean;
  message: string;
  data: {
    token: string;
  };
}

interface SaveSessionResponse {
  status: boolean;
  message: string;
  data: null;
}

interface SessionRequest {
  fcmToken?: string;
  device: string;
  os: string;
  deviceId: string;
  [key: string]: unknown;
}

export class AuthService extends ApiService {
  constructor() {
    super();
    
    // Debug configuration on startup
    console.log('🔧 AuthService: Configuration check');
    console.log('📡 API Base URL:', AUTH_CONFIG.API.BASE_URL);
    console.log('🔗 Login endpoint will be:', `${AUTH_CONFIG.API.BASE_URL}${AUTH_CONFIG.API.ENDPOINTS.LOGIN}`);
    
    if (AUTH_CONFIG.API.BASE_URL.includes('your-sales-api-url.com')) {
      console.warn('⚠️  WARNING: Sales API URL is still using placeholder value!');
      console.warn('⚠️  Please update NEXT_PUBLIC_SALES_API_URL in .env.local');
    }
  }

  /**
   * Make request with auth-specific base URL
   */
  private async makeAuthRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
    body: Record<string, unknown> | null = null,
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    const headers = {
      "Content-Type": "application/json",
      "Client": "FETCH",
      "Language": "en",
      ...customHeaders,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    try {
      const url = `${AUTH_CONFIG.API.BASE_URL}${endpoint}`;
      console.log(`🌐 AuthService: Making ${method} request to ${url}`);
      console.log(`📦 AuthService: Request body:`, body);
      console.log(`📋 AuthService: Request headers:`, headers);
      
      const response = await fetch(url, options);
      
      console.log(`📡 AuthService: Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ AuthService: HTTP Error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ AuthService: Request successful`, data);
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ AuthService: Request failed to ${AUTH_CONFIG.API.BASE_URL}${endpoint}`, error);
      
      // Add specific error messages for common issues
      if (errorMessage === 'Failed to fetch') {
        console.error(`🚨 AuthService: Network Error - Check if the API URL is correct and accessible`);
        console.error(`🔗 AuthService: Current API URL: ${AUTH_CONFIG.API.BASE_URL}`);
        throw new Error(`Cannot connect to sales API. Please check your network connection and API configuration.`);
      }
      
      throw error;
    }
  }

  /**
   * Complete authentication flow:
   * 1. Login to get custom token
   * 2. Use custom token with Firebase auth
   * 3. Get Firebase session token
   * 4. Save session
   */
  async login(email: string, password: string): Promise<LoginResponse | null> {
    try {
      console.log("🔐 AuthService: Starting login flow...");
      
      // TEST MODE: Check if we're using placeholder API URL
      if (AUTH_CONFIG.API.BASE_URL.includes('your-sales-api-url.com')) {
        console.warn('🧪 AuthService: TEST MODE - API URL is placeholder, using demo login');
        console.warn('🧪 AuthService: Please update NEXT_PUBLIC_SALES_API_URL in .env.local for production');
        
        // Demo login for testing UI without real API
        if (email === "demo@vondera.app" && password === "demo123") {
          console.log("✅ AuthService: Demo login successful");
          
          // Store demo session
          const sessionManager = SessionManager.getInstance();
          sessionManager.setToken("demo_firebase_token_" + Date.now());
          sessionManager.setEmail(email);
          sessionManager.setAccountType("sales");
          
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
          
          return {
            status: true,
            message: "Demo login successful",
            data: {
              token: "demo_firebase_token_" + Date.now()
            }
          };
        } else {
          throw new Error("In test mode, please use demo@vondera.app / demo123 or update your API URL");
        }
      }
      
      // PRODUCTION MODE: Real API flow
      // Step 1: Login to get custom token
      const loginResponse = await this.loginWithCustomToken(email, password);
      
      if (!loginResponse || !loginResponse.status || !loginResponse.data?.token) {
        throw new Error(loginResponse?.message || "Login failed");
      }
      
      console.log("🔐 AuthService: Received custom token from API");
      
      // Step 2: Use custom token with Firebase auth
      const auth = getFirebaseAuth();
      const userCredential = await signInWithCustomToken(auth, loginResponse.data.token);
      console.log("🔐 AuthService: Successfully signed in with Firebase");
      
      // Step 3: Get Firebase session token
      const firebaseToken = await userCredential.user.getIdToken();
      console.log("🔐 AuthService: Retrieved Firebase session token");
      
      // Step 4: Store tokens and user info
      const sessionManager = SessionManager.getInstance();
      sessionManager.setToken(firebaseToken);
      sessionManager.setEmail(email);
      sessionManager.setAccountType("sales");
      
      // Store Firebase refresh token for future use
      if (userCredential.user.refreshToken) {
        sessionManager.setFirebaseRefreshToken(userCredential.user.refreshToken);
      }
      
      // Step 5: Save session with backend
      try {
        await this.saveSession();
        console.log("🔐 AuthService: Session saved successfully");
      } catch (sessionError) {
        console.warn("⚠️ AuthService: Failed to save session, but continuing:", sessionError);
        // Don't fail the login if session save fails
      }
      
      // Return response with Firebase token
      return {
        status: true,
        message: "Login successful",
        data: {
          token: firebaseToken
        }
      };
      
    } catch (error: unknown) {
      console.error("❌ AuthService: Login failed:", error);
      throw error;
    }
  }

  /**
   * Login with email/password to get custom token from backend
   */
  private async loginWithCustomToken(email: string, password: string): Promise<LoginResponse | null> {
    const loginData = {
      email,
      password
    };

    try {
      const response = await this.makeAuthRequest<LoginResponse>(
        AUTH_CONFIG.API.ENDPOINTS.LOGIN,
        "POST",
        loginData
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save session after successful login
   */
  async saveSession(fcmToken?: string): Promise<SaveSessionResponse | null> {
    try {
      const sessionManager = SessionManager.getInstance();
      
      const sessionData: SessionRequest = {
        fcmToken: fcmToken || "",
        device: sessionManager.getBrowserInfo(),
        os: "Web",
        deviceId: sessionManager.getDeviceId()
      };

      // Get the current Firebase token for authorization
      const token = sessionManager.getToken();
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await this.makeAuthRequest<SaveSessionResponse>(
        AUTH_CONFIG.API.ENDPOINTS.SESSION,
        "POST",
        sessionData,
        headers
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh token using Firebase refresh token
   */
  async refreshToken(firebaseToken: string): Promise<LoginResponse | null> {
    try {
      const response = await this.post<LoginResponse>(
        AUTH_CONFIG.API.ENDPOINTS.REFRESH,
        { firebaseToken },
        {
          [AUTH_CONFIG.API.HEADERS.SKIP_AUTH]: "true"
        }
      );
      
      return response;
    } catch (error: unknown) {
      // If the refresh endpoint doesn't exist (404), try alternative approach
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage?.includes('404') || errorMessage?.includes('Not Found') || 
          errorMessage?.includes('Cannot POST')) {
        
        // The refresh-token endpoint doesn't exist, use Firebase auth directly
        try {
          const { getAuth } = await import('firebase/auth');
          const auth = getAuth();
          const currentUser = auth.currentUser;
          
          if (currentUser) {
            // Force refresh the Firebase ID token
            const freshFirebaseToken = await currentUser.getIdToken(true);
            
            // Store the fresh token
            const sessionManager = (await import('@/lib/utils/session')).SessionManager.getInstance();
            sessionManager.setToken(freshFirebaseToken);
            sessionManager.setFirebaseRefreshToken(currentUser.refreshToken);
            
            // Return a mock response structure with the fresh Firebase token
            return {
              status: true,
              message: "Firebase token refreshed successfully",
              data: {
                token: freshFirebaseToken,
                user: {
                  email: currentUser.email || '',
                  uid: currentUser.uid
                }
              }
            } as LoginResponse;
          }
        } catch {
          // Firebase approach failed, user needs to login again
          throw new Error("Authentication session expired. Please login again.");
        }
      }
      
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
