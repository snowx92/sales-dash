// Authentication configuration for the Sales Dashboard
export const AUTH_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_SALES_API_URL || "https://sales-api.vondera.app", // Update to match your salesUrl
    ENDPOINTS: {
      LOGIN: "/auth/login",
      SESSION: "/auth/on-login", // This maps to your save session endpoint
      REFRESH: "/auth/refresh-token"
    },
    HEADERS: {
      SKIP_AUTH: "Skip-Auth",
      AUTHORIZATION: "Authorization",
      CONTENT_TYPE: "application/json",
      CLIENT: "FETCH",
      LANGUAGE: "en"
    }
  },

  // Session Configuration
  SESSION: {
    TOKEN_KEY: "authToken",
    FIREBASE_REFRESH_TOKEN_KEY: "firebaseRefreshToken",
    EMAIL_KEY: "userEmail",
    REMEMBER_ME_KEY: "rememberMe"
  },

  // Routes Configuration
  ROUTES: {
    LOGIN: "/login",
    DASHBOARD: "/dashboard/overview",
    PROTECTED_ROUTES: ["/dashboard"],
    PUBLIC_ROUTES: ["/login", "/", "/register"]
  },

  // Error Messages
  ERRORS: {
    INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
    NETWORK_ERROR: "Network error. Please check your connection and try again.",
    SESSION_EXPIRED: "Your session has expired. Please log in again.",
    PERMISSION_DENIED: "You don't have permission to access this resource.",
    UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
    TOKEN_REFRESH_FAILED: "Unable to refresh your session. Please log in again."
  },

  // Timeouts
  TIMEOUTS: {
    REQUEST_TIMEOUT: 30000, // 30 seconds
    TOKEN_REFRESH_INTERVAL: 15 * 60 * 1000, // 15 minutes
    SESSION_CHECK_INTERVAL: 5 * 60 * 1000 // 5 minutes
  }
};

export default AUTH_CONFIG;
