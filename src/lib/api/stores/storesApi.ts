import { ApiService } from "../services/ApiService";
import { GetStoresParams, StoresResponse } from "./types";

class StoresApi extends ApiService {
  private static instance: StoresApi;

  private constructor() {
    super();
  }

  public static getInstance(): StoresApi {
    if (!StoresApi.instance) {
      StoresApi.instance = new StoresApi();
    }
    return StoresApi.instance;
  }

  async getStores(params: GetStoresParams): Promise<StoresResponse | null> {
    try {
      const queryParams: Record<string, unknown> = {
        pageNo: params.pageNo.toString(),
        limit: params.limit.toString()
      };
      
      // Add optional params only if they exist
      if (params.status) {
        queryParams.status = params.status;
      }
      if (params.sortBy && params.sortBy !== 'date') {
        queryParams.sortBy = params.sortBy;
      }
      if (params.planId) {
        queryParams.planId = params.planId;
      }
      // Only add keyword if it's defined and not empty
      if (params.keyword && params.keyword.trim() !== '') {
        queryParams.keyword = params.keyword.trim();
      }

      console.log("🏪 StoresApi: Fetching stores with params:", queryParams);

      const response = await this.get<StoresResponse>('/stores', queryParams);
      
      if (response) {
        console.log("✅ StoresApi: Stores fetched successfully");
        return response;
      } else {
        console.warn("⚠️ StoresApi: Invalid stores response format:", response);
        return null;
      }
    } catch (error) {
      console.error("🚨 StoresApi: Error fetching stores:", error);
      return null;
    }
  }

  /**
   * Get stores assigned to the current sales person
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<StoresResponse | null>
   */
  async getMyStores(params: GetStoresParams): Promise<StoresResponse | null> {
    try {
      const queryParams: Record<string, unknown> = {
        pageNo: params.pageNo.toString(),
        limit: params.limit.toString()
      };
      
      // Add optional params only if they exist
      if (params.status) {
        queryParams.status = params.status;
      }
      if (params.sortBy && params.sortBy !== 'date') {
        queryParams.sortBy = params.sortBy;
      }
      if (params.planId) {
        queryParams.planId = params.planId;
      }
      // Only add keyword if it's defined and not empty
      if (params.keyword && params.keyword.trim() !== '') {
        queryParams.keyword = params.keyword.trim();
      }

      console.log("👤 StoresApi: Fetching my stores with params:", queryParams);

      const response = await this.get<StoresResponse>('/stores/my', queryParams);
      
      if (response) {
        console.log("✅ StoresApi: My stores fetched successfully");
        return response;
      } else {
        console.warn("⚠️ StoresApi: Invalid my stores response format:", response);
        return null;
      }
    } catch (error) {
      console.error("🚨 StoresApi: Error fetching my stores:", error);
      return null;
    }
  }
}

export const storesApi = StoresApi.getInstance(); 