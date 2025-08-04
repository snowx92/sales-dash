import { getFirebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { SessionManager } from "@/lib/utils/session";
import AUTH_CONFIG from "@/lib/config/auth";

export const logout = async (): Promise<void> => {
  try {
    const sessionManager = SessionManager.getInstance();
    
    // Clear local session data
    sessionManager.clearSession();
    
    // Sign out from Firebase (only on client side)
    if (typeof window !== 'undefined') {
      const auth = getFirebaseAuth();
      await signOut(auth);
    }
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = AUTH_CONFIG.ROUTES.LOGIN;
    }
  } catch {
    // Force redirect even if Firebase signout fails
    if (typeof window !== 'undefined') {
      window.location.href = AUTH_CONFIG.ROUTES.LOGIN;
    }
  }
};

export const handleAuthError = (error: unknown): string => {
  // Type guard to safely access properties
  const errorObj = error as { status?: number; message?: string };
  
  if (errorObj.status === 400) {
    // Handle Bad Request - usually validation errors
    return errorObj.message || "Invalid login credentials. Please check your email and password.";
  }
  
  if (errorObj.status === 401) {
    // More specific handling for different 401 scenarios
    if (errorObj.message?.includes('Invalid Firebase token')) {
      return "Your session has expired. Please login again.";
    }
    return AUTH_CONFIG.ERRORS.SESSION_EXPIRED;
  }
  
  if (errorObj.status === 403) {
    return AUTH_CONFIG.ERRORS.PERMISSION_DENIED;
  }
  
  if (errorObj.status === 404) {
    return "Service temporarily unavailable. Please try again later.";
  }
  
  if (errorObj.message?.includes("Network")) {
    return AUTH_CONFIG.ERRORS.NETWORK_ERROR;
  }
  
  if (errorObj.message?.includes("Invalid credentials")) {
    return AUTH_CONFIG.ERRORS.INVALID_CREDENTIALS;
  }
  
  if (errorObj.message?.includes("Cannot POST")) {
    return "Service temporarily unavailable. Please try again later.";
  }
  
  return errorObj.message || AUTH_CONFIG.ERRORS.UNEXPECTED_ERROR;
};
