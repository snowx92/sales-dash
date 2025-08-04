import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { SessionManager } from "@/lib/utils/session";
import AUTH_CONFIG from "@/lib/config/auth";

export const logout = async (): Promise<void> => {
  try {
    const sessionManager = SessionManager.getInstance();
    
    // Clear local session data
    sessionManager.clearSession();
    
    // Sign out from Firebase
    await signOut(auth);
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = AUTH_CONFIG.ROUTES.LOGIN;
    }
  } catch (error) {
    // Force redirect even if Firebase signout fails
    if (typeof window !== 'undefined') {
      window.location.href = AUTH_CONFIG.ROUTES.LOGIN;
    }
  }
};

export const handleAuthError = (error: any): string => {
  if (error.status === 400) {
    // Handle Bad Request - usually validation errors
    return error.message || "Invalid login credentials. Please check your email and password.";
  }
  
  if (error.status === 401) {
    // More specific handling for different 401 scenarios
    if (error.message?.includes('Invalid Firebase token')) {
      return "Your session has expired. Please login again.";
    }
    return AUTH_CONFIG.ERRORS.SESSION_EXPIRED;
  }
  
  if (error.status === 403) {
    return AUTH_CONFIG.ERRORS.PERMISSION_DENIED;
  }
  
  if (error.status === 404) {
    return "Service temporarily unavailable. Please try again later.";
  }
  
  if (error.message?.includes("Network")) {
    return AUTH_CONFIG.ERRORS.NETWORK_ERROR;
  }
  
  if (error.message?.includes("Invalid credentials")) {
    return AUTH_CONFIG.ERRORS.INVALID_CREDENTIALS;
  }
  
  if (error.message?.includes("Cannot POST")) {
    return "Service temporarily unavailable. Please try again later.";
  }
  
  return error.message || AUTH_CONFIG.ERRORS.UNEXPECTED_ERROR;
};
