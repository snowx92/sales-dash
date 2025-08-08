import { ApiService } from "../services/ApiService";
import { storesApi } from "../stores/storesApi";

// Helper function to get the correct API base URL
const getApiBaseUrl = () => {
  // First priority: explicit sales API URL
  if (process.env.NEXT_PUBLIC_SALES_API_URL) {
    return process.env.NEXT_PUBLIC_SALES_API_URL;
  }
  
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // Fallback for development
  return '/api/sales';
};

export interface ExportParams {
  status?: 'not_subscribed' | 'subscribed' | 'hidden' | 'auto_renew' | 'stopped_subscribe';
  sortBy?: 'site' | 'orders' | 'date' | 'products';
  planId?: 'pro' | 'free' | 'starter' | 'plus';
  storeCategoryNo?: number;
}

export interface LeadExportParams {
  status?: 'NEW' | 'INTERSTED' | 'SUBSCRIBED' | 'NOT_INTERSTED' | 'NO_ANSWER' | 'FOLLOW_UP';
}

export interface StoreCategory {
  id: number;
  name: string;
  icon: string;
}

class ExportService extends ApiService {
  private static instance: ExportService;

  private constructor() {
    super();
  }

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Get store categories for export filter
   */
  async getStoreCategories(): Promise<StoreCategory[] | null> {
    return await storesApi.getStoreCategories();
  }

  /**
   * Export stores data as Excel file
   */
  async exportStores(params: ExportParams = {}): Promise<boolean> {
    try {
      const queryParams: Record<string, string> = {};
      
      // Add optional params only if they exist
      if (params.status) {
        queryParams.status = params.status;
      }
      if (params.sortBy) {
        queryParams.sortBy = params.sortBy;
      }
      if (params.planId) {
        queryParams.planId = params.planId;
      }
      if (params.storeCategoryNo !== undefined) {
        queryParams.storeCategoryNo = params.storeCategoryNo.toString();
      }

      console.log("📊 ExportService: Exporting stores with params:", queryParams);

      // Check if the exports endpoint is available
      const testUrl = `${getApiBaseUrl()}/exports/stores`;
      console.log("🔍 ExportService: Testing endpoint availability at:", testUrl);

      // Create the download using a custom method for file handling
      const success = await this.downloadFile('/exports/stores', queryParams, 'stores_export.xlsx');
      
      if (success) {
        console.log("✅ ExportService: File downloaded successfully");
        return true;
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error("🚨 ExportService: Error exporting stores:", error);
      throw error;
    }
  }

  /**
   * Export leads data as Excel file
   */
  async exportLeads(params: LeadExportParams = {}): Promise<boolean> {
    try {
      const queryParams: Record<string, string> = {};
      
      // Add optional params only if they exist
      if (params.status) {
        queryParams.status = params.status;
      }

      console.log("📊 ExportService: Exporting leads with params:", queryParams);

      // Check if the exports endpoint is available
      const testUrl = `${getApiBaseUrl()}/exports/leads`;
      console.log("🔍 ExportService: Testing endpoint availability at:", testUrl);

      // Create the download using a custom method for file handling
      const success = await this.downloadFile('/exports/leads', queryParams, 'leads_export.xlsx');
      
      if (success) {
        console.log("✅ ExportService: Leads file downloaded successfully");
        return true;
      } else {
        throw new Error('Leads export failed');
      }
    } catch (error) {
      console.error("🚨 ExportService: Error exporting leads:", error);
      throw error;
    }
  }

  /**
   * Download a file from the API
   */
  private async downloadFile(
    endpoint: string, 
    queryParams: Record<string, string> = {}, 
    filename: string = 'download.xlsx'
  ): Promise<boolean> {
    try {
      // Get token for authorization
      const token = this.sessionManager.getToken();
      
      // Build the URL
      const query = new URLSearchParams(queryParams).toString();
      const url = query ? `${endpoint}?${query}` : endpoint;
      const fullUrl = `${getApiBaseUrl()}${url}`;

      console.log("🔗 ExportService: Downloading from:", fullUrl);

      // Headers for the request
      const headers: Record<string, string> = {
        'Client': 'FETCH',
        'Language': 'en',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make the request
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.error("🚨 ExportService: Download failed with status:", response.status);
        console.error("🚨 ExportService: Response:", await response.text());
        
        if (response.status === 404) {
          throw new Error('Export endpoint not found. The backend may not have this feature implemented yet.');
        }
        
        throw new Error(`Download failed with status ${response.status}`);
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error("🚨 ExportService: Error downloading file:", error);
      return false;
    }
  }
}

export const exportService = ExportService.getInstance();
