"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import { authService } from "@/lib/api/auth/authService";
import { handleAuthError } from "@/lib/api/auth/utils";
import { useIsClient } from "@/lib/hooks/useIsClient";
import ResetPasswordModal from "./ResetPasswordModal";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const router = useRouter();
  const isClient = useIsClient();

  const handleLogin = async (e: React.FormEvent) => {
    // Prevent form submission and page refresh
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure we're on the client side
    if (!isClient) {
      return false;
    }
    
    // Prevent multiple submissions
    if (isLoading) {
      return false;
    }
    
    setError("");
    setIsLoading(true);

    try {
      // Validate input
      if (!email || !password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      console.log("🔐 LoginForm: Starting Firebase auth login process...");
      
      // Use the complete Firebase authentication flow
      const loginResponse = await authService.login(email, password);
      console.log("🔐 LoginForm: Login response:", loginResponse);
      
      if (!loginResponse || !loginResponse.status || !loginResponse.data?.token) {
        console.error("❌ LoginForm: Login failed - invalid response");
        setError(loginResponse?.message || "Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      console.log("✅ LoginForm: Firebase auth login successful");
      
      // Wait a moment for all async operations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("🚀 LoginForm: Redirecting to dashboard...");
      
      // Use router.push for proper navigation
      router.push("/dashboard/overview");
        
    } catch (error: unknown) {
      console.error("❌ LoginForm: Login error:", error);
      setError(handleAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <>
      <form 
        onSubmit={handleLogin}
        className="space-y-6"
      >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-500 p-4 rounded-lg text-sm text-center border border-red-200"
        >
          {error}
        </motion.div>
      )}
      
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Vondera Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400"
              placeholder="sales@vondera.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Keep me signed in
            </label>
          </div>
        </div>
      </div>

      <div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isLoading || !isClient}
          className={`relative w-full flex items-center justify-center px-4 py-3 text-white rounded-lg text-sm font-medium transition-all
            ${isLoading || !isClient
              ? 'bg-gradient-to-r from-purple-400 to-indigo-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 active:to-indigo-800 shadow-lg hover:shadow-xl'
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Signing you in...
            </>
          ) : !isClient ? (
            'Loading...'
          ) : (
            'Access Sales Dashboard'
          )}
        </motion.button>
      </div>

      {/* Forgot Password Link */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="text-sm text-purple-600 hover:text-purple-700 hover:underline transition-colors"
        >
          Forgot your password?
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Powered by <span className="font-bold text-purple-900">Vondera</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Ecommerce Platform • Sales Team Portal
        </p>
      </div>
    </form>

    {/* Reset Password Modal */}
    <ResetPasswordModal 
      isOpen={showResetModal} 
      onClose={() => setShowResetModal(false)} 
    />
    </>
  );
};

export default LoginForm;
