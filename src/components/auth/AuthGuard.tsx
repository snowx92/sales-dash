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
    let refreshInterval: number | undefined;
    let activityTimeout: number | undefined;
    let lastActivity = Date.now();

    // Track user activity to prevent logout during active sessions
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Handle Firebase auth state changes
    const handleAuthStateChange = async (user: User | null) => {
      console.log("🔐 AuthGuard: Auth state changed, user:", user ? user.email : "null");

      if (!user) {
        // No Firebase user - check if we have stored tokens to restore session
        const storedToken = sessionManager.getToken();
        const storedEmail = sessionManager.getEmail();

        console.log("🔐 AuthGuard: No Firebase user. Stored token:", storedToken ? "EXISTS" : "NONE");

        if (storedToken && storedEmail) {
          // We have stored credentials but Firebase user is null
          // This happens on page refresh - Firebase auth state hasn't restored yet
          // Wait a bit for Firebase to restore the session
          console.log("⏳ AuthGuard: Waiting for Firebase to restore session...");
          setIsLoading(false);
          return;
        }

        // No stored credentials either, redirect to login
        console.log("❌ AuthGuard: No credentials found, redirecting to login");
        sessionManager.clearSession();
        router.push("/login");
        return;
      }

      try {
        console.log("✅ AuthGuard: Firebase user authenticated:", user.email);

        // Get Firebase ID token (force refresh to ensure it's valid)
        const firebaseToken = await user.getIdToken(true);

        // Store Firebase refresh token for future use
        if (user.refreshToken) {
          sessionManager.setFirebaseRefreshToken(user.refreshToken);
        }

        // Store email
        if (user.email) {
          sessionManager.setEmail(user.email);
        }

        // Check if we have an API token
        const storedToken = sessionManager.getToken();

        if (!storedToken) {
          console.log("🔄 AuthGuard: No API token found, refreshing...");
          // Try to refresh API token using Firebase token
          try {
            const refreshResponse = await authService.refreshToken(firebaseToken);
            if (refreshResponse && refreshResponse.status && refreshResponse.data.token) {
              sessionManager.setToken(refreshResponse.data.token);
              console.log("✅ AuthGuard: API token refreshed successfully");
            } else {
              // Refresh failed, but we can still use Firebase token directly
              sessionManager.setToken(firebaseToken);
              console.log("✅ AuthGuard: Using Firebase token as fallback");
            }
          } catch (error) {
            console.warn("⚠️ AuthGuard: Token refresh failed, using Firebase token:", error);
            // If refresh completely fails, use Firebase token as fallback
            sessionManager.setToken(firebaseToken);
          }
        } else {
          console.log("✅ AuthGuard: API token exists, user is authenticated");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("❌ AuthGuard: Error in auth state handler:", error);
        await logout();
      }
    };

    // Proactively refresh token periodically based on user activity
    const startRefreshLoop = () => {
      // Reduced to 10 minute interval for more frequent checks during active sessions
      const INTERVAL_MS = 10 * 60 * 1000;
      // Check if user has been inactive for 5 minutes before skipping refresh
      const INACTIVE_THRESHOLD = 5 * 60 * 1000;

      if (refreshInterval) window.clearInterval(refreshInterval);
      refreshInterval = window.setInterval(async () => {
        try {
          const auth = getFirebaseAuth();
          const user = auth.currentUser;
          if (!user) {
            console.log("⏭️ AuthGuard: Skipping token refresh - no Firebase user");
            return;
          }

          // Check if user has been inactive
          const inactiveTime = Date.now() - lastActivity;
          if (inactiveTime > INACTIVE_THRESHOLD) {
            console.log("⏭️ AuthGuard: User inactive, skipping token refresh");
            return;
          }

          console.log("🔄 AuthGuard: Periodic token refresh starting...");

          // Force refresh Firebase ID token
          const freshFirebaseToken = await user.getIdToken(true);

          // Try backend refresh first (if endpoint exists)
          try {
            const refreshed = await authService.refreshToken(freshFirebaseToken);
            if (refreshed?.status && refreshed.data?.token) {
              sessionManager.setToken(refreshed.data.token);
              console.log("✅ AuthGuard: Periodic token refresh successful");
            } else {
              sessionManager.setToken(freshFirebaseToken);
              console.log("✅ AuthGuard: Using fresh Firebase token");
            }
          } catch (error) {
            console.warn("⚠️ AuthGuard: Backend refresh failed, using Firebase token:", error);
            // Fallback: store fresh Firebase token directly
            sessionManager.setToken(freshFirebaseToken);
          }

          // Update stored Firebase refresh token if available
          if (user.refreshToken) {
            sessionManager.setFirebaseRefreshToken(user.refreshToken);
          }
        } catch (error) {
          console.warn("⚠️ AuthGuard: Token refresh error:", error);
          // Silent – next cycle will try again
        }
      }, INTERVAL_MS);
    };

    // Main initialization flow
    const initialize = async () => {
      try {
        console.log("🚀 AuthGuard: Initializing...");

        const auth = getFirebaseAuth();

        // Check current Firebase user immediately (handles page refresh)
        const currentUser = auth.currentUser;
        console.log("🔐 AuthGuard: Current Firebase user:", currentUser ? currentUser.email : "null");

        if (currentUser) {
          // User is already signed in (session restored from persistence)
          await handleAuthStateChange(currentUser);
        } else {
          // Check if we have stored credentials
          const storedToken = sessionManager.getToken();
          const storedEmail = sessionManager.getEmail();

          if (storedToken && storedEmail) {
            // We have stored credentials, wait for Firebase to restore session
            console.log("⏳ AuthGuard: Waiting for Firebase to restore session...");
            // Set a timeout to prevent infinite loading
            setTimeout(() => {
              if (auth.currentUser) {
                console.log("✅ AuthGuard: Firebase session restored");
              } else {
                console.log("⚠️ AuthGuard: Firebase session not restored, but we have tokens");
                setIsLoading(false);
              }
            }, 2000);
          } else {
            // No stored credentials
            console.log("❌ AuthGuard: No stored credentials, will wait for auth state");
            setIsLoading(false);
          }
        }

        // Set up auth state listener for future changes
        unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

        // Start periodic token refresh
        startRefreshLoop();

      } catch (error) {
        console.error("❌ AuthGuard: Initialization error:", error);
        setIsLoading(false);
      }
    };

    initialize();

    // Add activity listeners to track user interaction
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', updateActivity);
      window.addEventListener('keydown', updateActivity);
      window.addEventListener('click', updateActivity);
      window.addEventListener('scroll', updateActivity);
    }

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (refreshInterval) {
        window.clearInterval(refreshInterval);
      }
      if (activityTimeout) {
        window.clearTimeout(activityTimeout);
      }
      // Remove activity listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
        window.removeEventListener('click', updateActivity);
        window.removeEventListener('scroll', updateActivity);
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
