"use client";

import dynamic from 'next/dynamic';

// Dynamically import Navbar to prevent SSR issues with Firebase
const Navbar = dynamic(() => import('./Navbar'), {
  loading: () => (
    <nav className="bg-white border-b border-gray-100 shadow-sm h-16 flex items-center justify-between px-4">
      <div className="animate-pulse flex space-x-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </nav>
  ),
  ssr: false, // Disable server-side rendering for this component
});

export default Navbar;
