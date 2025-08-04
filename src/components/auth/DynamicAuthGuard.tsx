"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import AuthGuard to prevent SSR issues with Firebase
const AuthGuard = dynamic(() => import('./AuthGuard'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
        <p className="mt-4 text-gray-600 text-lg">Authenticating...</p>
      </div>
    </div>
  ),
  ssr: false, // Disable server-side rendering for this component
});

export default AuthGuard;
