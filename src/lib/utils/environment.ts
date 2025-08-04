// Environment variable validation and setup for different deployment platforms

export const validateEnvironment = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  const isNetlify = process.env.NETLIFY === 'true';
  
  console.log('🔍 Environment Check:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - Is Production:', isProduction);
  console.log('  - Is Vercel:', isVercel);
  console.log('  - Is Netlify:', isNetlify);
  
  // Check for required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars);
  } else {
    console.log('✅ All required Firebase environment variables are present');
  }
  
  // API URL validation
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_SALES_API_URL;
  if (apiUrl) {
    console.log('✅ API URL configured:', apiUrl);
  } else {
    console.log('ℹ️ No API URL configured, will use relative paths');
  }
  
  return {
    isProduction,
    isVercel,
    isNetlify,
    missingVars,
    apiUrl
  };
};

export const getRecommendedApiUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: always use relative paths
    return '/api/sales';
  }
  
  // Client-side: determine based on hostname
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    // Local development
    return '/api/sales';
  }
  
  if (hostname.includes('.vercel.app') || hostname.includes('.netlify.app')) {
    // Deployment platforms - use relative paths
    return '/api/sales';
  }
  
  // Custom domain - use relative paths (most reliable)
  return '/api/sales';
};
