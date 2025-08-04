"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import LoginForm to prevent SSR issues with Firebase
const LoginForm = dynamic(() => import('./LoginForm'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  ),
  ssr: false, // Disable server-side rendering for this component
});

export default LoginForm;
