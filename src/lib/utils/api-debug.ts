// Utility to test API connectivity and debug configuration issues

export const testApiConnectivity = async (): Promise<{
  success: boolean;
  url: string;
  error?: string;
  fallbackUrl?: string;
  fallbackSuccess?: boolean;
}> => {
  const primaryUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/sales';
  const testEndpoint = '/health'; // Simple health check endpoint
  
  console.log('🔍 Testing API connectivity...');
  console.log('🔗 Primary URL:', primaryUrl);
  
  // Test primary URL
  try {
    const fullUrl = `${primaryUrl}${testEndpoint}`;
    console.log('🌐 Testing URL:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Primary API URL is accessible:', data);
      return { success: true, url: primaryUrl };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Primary API URL failed:', errorMessage);
    
    // Try fallback if primary URL is not a relative path
    if (!primaryUrl.startsWith('/api')) {
      const fallbackUrl = '/api/sales';
      console.log('🔄 Trying fallback URL:', fallbackUrl);
      
      try {
        const fallbackFullUrl = `${fallbackUrl}${testEndpoint}`;
        console.log('🌐 Testing fallback URL:', fallbackFullUrl);
        
        const fallbackResponse = await fetch(fallbackFullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('✅ Fallback API URL is accessible:', fallbackData);
          return { 
            success: false, 
            url: primaryUrl, 
            error: errorMessage,
            fallbackUrl,
            fallbackSuccess: true
          };
        } else {
          throw new Error(`HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
        }
      } catch (fallbackError) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
        console.error('❌ Fallback API URL also failed:', fallbackErrorMessage);
        return { 
          success: false, 
          url: primaryUrl, 
          error: errorMessage,
          fallbackUrl,
          fallbackSuccess: false
        };
      }
    }
    
    return { success: false, url: primaryUrl, error: errorMessage };
  }
};

export const debugApiConfiguration = () => {
  console.log('🔧 API Configuration Debug:');
  console.log('📍 Environment Variables:');
  console.log('  - NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('  - NEXT_PUBLIC_SALES_API_URL:', process.env.NEXT_PUBLIC_SALES_API_URL);
  console.log('🌐 Current Location:');
  if (typeof window !== 'undefined') {
    console.log('  - hostname:', window.location.hostname);
    console.log('  - protocol:', window.location.protocol);
    console.log('  - origin:', window.location.origin);
  }
};
