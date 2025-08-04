import { SessionManager } from "@/lib/utils/session";

export const printLogs = true; // Enable logging for debugging

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

export class ApiService {
  private baseURL: string;
  protected sessionManager: SessionManager;

  constructor() {
    // Check if the environment variable is defined
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/sales';
    console.log('🔧 ApiService: Base URL configured as:', baseURL);
    this.baseURL = baseURL;
    this.sessionManager = SessionManager.getInstance();
  }

  async request<T>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body: Record<string, unknown> | null = null,
    queryParams: Record<string, string> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    const query = new URLSearchParams(queryParams).toString();
    const fullUrl = query ? `${url}?${query}` : url;

    // Check if we should skip authentication
    const skipAuth = customHeaders["Skip-Auth"] === "true";
    const headersToUse = { ...customHeaders };
    delete headersToUse["Skip-Auth"]; // Remove the Skip-Auth header before sending

    if (skipAuth) {
      // Skip authentication, just add basic headers
      const staticHeaders = {
        Language: "en",
      };
      return this.makeRequest(fullUrl, method, body, staticHeaders, headersToUse);
    }

    // Get token from session manager
    const token = await this.sessionManager.getCurrentToken();
    const firebaseRefreshToken = this.sessionManager.getFirebaseRefreshToken();
    
    // For auth endpoints, try to use Firebase ID token if available
    let authToken = token;
    if (fullUrl.includes('/auth/') && !fullUrl.includes('/on-login')) {
      // For auth endpoints (except login), try to get Firebase ID token
      try {
        if (typeof window !== 'undefined') {
          const { auth } = await import("@/lib/firebase");
          
          // Check if user is signed in with Firebase
          const currentUser = auth.currentUser;
          if (currentUser) {
            const firebaseIdToken = await currentUser.getIdToken(true); // Force refresh
            authToken = firebaseIdToken;
          } else {
            // Try to sign in with Firebase if we have stored credentials
            const storedEmail = this.sessionManager.getEmail();
            if (storedEmail && firebaseRefreshToken) {
              // This would require implementing refresh token logic
              // For now, fall back to API token
            }
          }
        }
      } catch {
        // Fall back to API token
      }
    }
    
    if (!authToken) {
      // Try to get token from localStorage
      const storedToken = this.sessionManager.getToken();
      if (!storedToken) {
        throw new Error("Please log in to continue");
      }
      // Use stored token
      authToken = storedToken;
    }

    const staticHeaders = {
      Authorization: `Bearer ${authToken}`,
      Language: "en",
    };

    return this.makeRequest(fullUrl, method, body, staticHeaders, headersToUse);
  }

  private async makeRequest<T>(
    fullUrl: string,
    method: string,
    body: Record<string, unknown> | null,
    staticHeaders: Record<string, string>,
    customHeaders: Record<string, string>
  ): Promise<T | null> {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Client: "FETCH",
        ...customHeaders,
        ...staticHeaders,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${fullUrl}`, options);
      
      console.log("🌐 ApiService: Making request to:", `${this.baseURL}${fullUrl}`);

      if (response.status === 401) {
        // Try to refresh token before giving up
        try {
          const firebaseRefreshToken = this.sessionManager.getFirebaseRefreshToken();
          if (firebaseRefreshToken) {
            // Import authService dynamically to avoid circular dependency
            const { authService } = await import("@/lib/api/auth/authService");
            const refreshResponse = await authService.refreshToken(firebaseRefreshToken);
            
            if (refreshResponse && refreshResponse.status && refreshResponse.data.token) {
              // Update token and retry the request
              this.sessionManager.setToken(refreshResponse.data.token);
              
              // Update the authorization header and retry
              const newHeaders = {
                ...staticHeaders,
                Authorization: `Bearer ${refreshResponse.data.token}`
              };
              
              // Retry the request with new token
              const retryOptions: RequestInit = {
                ...options,
                headers: {
                  ...options.headers,
                  ...newHeaders
                }
              };
              
              const retryResponse = await fetch(`${this.baseURL}${fullUrl}`, retryOptions);
              
              if (retryResponse.status < 200 || retryResponse.status >= 300) {
                throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
              }
              
              const jsonResponse = await retryResponse.json() as ApiResponse<T>;
              return jsonResponse.data;
            }
          }
        } catch {
          // Token refresh failed, try fresh Firebase token approach
          try {
            // Check if we have Firebase auth
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            const currentUser = auth.currentUser;
            
            if (currentUser) {
              // Force refresh Firebase ID token to get a completely fresh one
              const freshFirebaseIdToken = await currentUser.getIdToken(true);
              
              // Update our stored token
              this.sessionManager.setToken(freshFirebaseIdToken);
              
              // Retry request with fresh Firebase token
              const firebaseHeaders = {
                ...staticHeaders,
                Authorization: `Bearer ${freshFirebaseIdToken}`
              };
              
              const firebaseRetryOptions: RequestInit = {
                ...options,
                headers: {
                  ...options.headers,
                  ...firebaseHeaders
                }
              };
              
              const firebaseRetryResponse = await fetch(`${this.baseURL}${fullUrl}`, firebaseRetryOptions);
              
              if (firebaseRetryResponse.ok) {
                const jsonResponse = await firebaseRetryResponse.json() as ApiResponse<T>;
                return jsonResponse.data;
              } else {
                // If still failing, the user might need to re-authenticate
                throw new Error(`Authentication failed after token refresh: ${firebaseRetryResponse.status}`);
              }
            }
          } catch {
            // Both refresh attempts failed
            throw new Error("Session expired. Please login again.");
          }
        }
        
        // All authentication attempts failed
        // Create error with status code for better error handling
        const error = new Error("Authentication failed - session expired. Please login again.") as Error & { status?: number };
        error.status = 401;
        throw error;
      }

      // Handle 403 Forbidden errors with more detailed information
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({ message: "Access forbidden" }));
        const errorMessage = errorData.message || "You don't have permission to access this resource";
        
        // Create a custom error object with status code
        const error = new Error(errorMessage) as Error & { status?: number };
        error.status = 403;
        
        throw error;
      }

      if (response.status < 200 || response.status >= 300) {
        // Try to get error details from response body
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If we can't parse the error response, use the status text
        }
        
        // Create error with status code
        const error = new Error(errorMessage) as Error & { status?: number };
        error.status = response.status;
        throw error;
      }

      try {
        const jsonResponse = await response.json();
        
        // For auth endpoints, return the full response
        if (fullUrl.includes('/auth/')) {
          return jsonResponse as T;
        }
        
        // For other endpoints, return just the data property
        const apiResponse = jsonResponse as ApiResponse<T>;
        return apiResponse.data;
      } catch {
        throw new Error(`Invalid JSON response from ${fullUrl}. This usually means the API endpoint doesn't exist or returned HTML.`);
      }
    } catch (error) {
      throw error;
    }
  }

  // GET request with query params and custom headers
  async get<T>(
    endpoint: string,
    queryParams: Record<string, unknown> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    const filteredQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([, value]) => value !== undefined)
    ) as Record<string, string>;

    return this.request<T>(
      endpoint,
      "GET",
      null,
      filteredQueryParams,
      customHeaders
    );
  }

  // POST request with optional body and custom headers
  async post<T>(
    endpoint: string,
    body: Record<string, unknown> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    const filterBody = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined)
    );
    return this.request<T>(endpoint, "POST", filterBody, {}, customHeaders);
  }

  // PUT request with optional body and custom headers
  async put<T>(
    endpoint: string,
    body: Record<string, unknown> | null = null,
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    return this.request<T>(endpoint, "PUT", body, {}, customHeaders);
  }

  // DELETE request with optional body and custom headers
  async delete<T>(
    endpoint: string,
    body: Record<string, unknown> | null = null,
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    return this.request<T>(endpoint, "DELETE", body, {}, customHeaders);
  }
} 