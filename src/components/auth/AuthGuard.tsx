"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { SessionManager } from "@/lib/utils/session";
import { authService } from "@/lib/api/auth/authService";
import { logout } from "@/lib/api/auth/utils";
import { onAuthStateChanged, User } from "firebase/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const sessionManager = SessionManager.getInstance();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    let unsubscribe: (() => void) | undefined;
    
    // Check if we have a valid API token
    const checkApiToken = async () => {
      try {
        const token = sessionManager.getToken();
        if (token) {
          // We have a token, assume it's valid for now
          // TODO: You might want to add token validation here
          setIsLoading(false);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };

    // Handle Firebase auth state changes
    const handleAuthStateChange = async (user: User | null) => {
      if (!user) {
        // No Firebase user, clear session and redirect
        sessionManager.clearSession();
        router.push("/login");
        return;
      }

      try {
        // Get Firebase ID token
        const firebaseToken = await user.getIdToken(true);
        
        // Store Firebase refresh token for future use
        if (user.refreshToken) {
          sessionManager.setFirebaseRefreshToken(user.refreshToken);
        }

        // Check if we have an API token
        const hasApiToken = await checkApiToken();
        
        if (!hasApiToken) {
          // Try to refresh API token using Firebase token
          try {
            const refreshResponse = await authService.refreshToken(firebaseToken);
            if (refreshResponse && refreshResponse.status && refreshResponse.data.token) {
              sessionManager.setToken(refreshResponse.data.token);
              setIsLoading(false);
            } else {
              // Refresh failed, but we can still use Firebase token directly
              sessionManager.setToken(firebaseToken);
              setIsLoading(false);
            }
          } catch {
            // If refresh completely fails, use Firebase token as fallback
            sessionManager.setToken(firebaseToken);
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch {
        await logout();
      }
    };

    // Set up auth state listener
    const setupAuthListener = () => {
      try {
        const auth = getFirebaseAuth();
        unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
      } catch (error) {
        console.warn('Firebase not available:', error);
        // If Firebase is not available, skip auth state listening
        setIsLoading(false);
      }
    };

    // Main initialization flow
    const initialize = async () => {
      // First check if we have a valid API token
      const hasApiToken = await checkApiToken();
      
      if (hasApiToken) {
        // We have an API token, but still set up Firebase listener for token refresh
        setupAuthListener();
      } else {
        // No API token, set up Firebase listener to handle authentication
        setupAuthListener();
      }
    };

    initialize();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router, sessionManager, isMounted]);

  // Show loading state while checking authentication or during hydration
  if (isLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
