"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { SessionManager } from "@/lib/utils/session";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const sessionManager = SessionManager.getInstance();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    // Check token in SessionManager first
    const checkSession = async () => {
      try {
        // First try to get a token from the session manager
        const token = await sessionManager.getCurrentToken();
        if (token) {
          setIsLoading(false);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error checking session:", error);
        return false;
      }
    };

    // Set up auth state listener
    const setupAuthListener = () => {
      // Listen for auth state changes
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          // No authenticated user, redirect to login
          router.push("/login");
        } else {
          // User is authenticated, ensure we have the latest token
          try {
            await user.getIdToken(true);
            setIsLoading(false);
          } catch (error) {
            console.error("Error refreshing token:", error);
            router.push("/login");
          }
        }
      });
    };

    // Main initialization flow
    const initialize = async () => {
      // First try to restore session from localStorage
      const hasSession = await checkSession();
      
      // If we don't have a valid session, set up the auth listener
      if (!hasSession) {
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
  }, [router, sessionManager]);

  // Show loading state or children
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
