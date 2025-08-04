import { ApiService } from "../services/ApiService";
import type { 
  LeadsResponse, 
  LeadsRequest, 
  CreateLeadRequest, 
  CreateLeadResponse,
  ApiLead,
  UpdateLeadRequest,
  UpdateLeadResponse,
  GetSingleLeadResponse,
  DeleteLeadResponse,
  AddFeedbackResponse
} from "./types";

export class LeadsService extends ApiService {
  /**
   * Create a new lead
   */
  async createLead(leadData: CreateLeadRequest): Promise<CreateLeadResponse | null> {
    try {
      console.log("📝 LeadsService: Creating lead with data:", leadData);

      const response = await this.post<CreateLeadResponse>(
        "/leads",
        leadData
      );

      console.log("📝 LeadsService: Create response received:", response);

      return response;
    } catch (error) {
      console.error("🚨 LeadsService: Error creating lead:", error);
      throw error;
    }
  }

  /**
   * Fetch leads with pagination and filters
   */
  async getLeads(params: LeadsRequest = {}): Promise<LeadsResponse["data"] | null> {
    try {
      const queryParams: Record<string, string> = {
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString()
      };

      // Add optional filters if provided
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;
      if (params.status) queryParams.status = params.status;
      if (params.searchQuery) queryParams.searchQuery = params.searchQuery;

      console.log("📋 LeadsService: Fetching leads with params:", queryParams);

      // The ApiService.get returns the 'data' property directly for non-auth endpoints
      const response = await this.get<LeadsResponse["data"]>(
        "/leads",
        queryParams
      );

      console.log("📋 LeadsService: Response received:", response);

      return response;
    } catch (error) {
      console.error("🚨 LeadsService: Error fetching leads:", error);
      throw error;
    }
  }

  /**
   * Get a single lead by ID
   */
  async getSingleLead(id: string): Promise<ApiLead | null> {
    try {
      console.log("📋 LeadsService: Fetching single lead with ID:", id);

      const response = await this.get<GetSingleLeadResponse["data"]>(
        `/leads/single/${id}`
      );

      console.log("📋 LeadsService: Single lead response:", response);

      return response;
    } catch (error) {
      console.error("🚨 LeadsService: Error fetching single lead:", error);
      throw error;
    }
  }

  /**
   * Update a lead
   */
  async updateLead(id: string, updates: UpdateLeadRequest): Promise<ApiLead | null> {
    try {
      console.log("📝 LeadsService: Updating lead with ID:", id, "Updates:", updates);

      const response = await this.put<UpdateLeadResponse["data"]>(
        `/leads/single/${id}`,
        updates
      );

      console.log("📝 LeadsService: Update response:", response);

      return response;
    } catch (error) {
      console.error("🚨 LeadsService: Error updating lead:", error);
      throw error;
    }
  }

  /**
   * Delete a lead
   */
  async deleteLead(id: string): Promise<boolean> {
    try {
      console.log("🗑️ LeadsService: Deleting lead with ID:", id);

      await this.delete<DeleteLeadResponse>(
        `/leads/single/${id}`
      );

      console.log("🗑️ LeadsService: Lead deleted successfully");

      return true;
    } catch (error) {
      console.error("🚨 LeadsService: Error deleting lead:", error);
      throw error;
    }
  }

  /**
   * Add feedback to a lead
   */
  async addFeedback(id: string, feedback: string): Promise<ApiLead | null> {
    try {
      console.log("💬 LeadsService: Adding feedback to lead:", id, "Feedback:", feedback);

      const response = await this.post<AddFeedbackResponse["data"]>(
        `/leads/single/${id}/feedback`,
        { feedback }
      );

      console.log("💬 LeadsService: Add feedback response:", response);

      return response;
    } catch (error) {
      console.error("🚨 LeadsService: Error adding feedback:", error);
      throw error;
    }
  }

  /**
   * Upload bulk leads from Excel file
   */
  async uploadBulkLeads(file: File): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      console.log("📁 LeadsService: Uploading bulk leads file:", file.name);

      // Convert file to base64
      const base64File = await this.fileToBase64(file);

      const response = await this.post<{ success: boolean; message: string; count?: number }>(
        "/leads/bulk",
        { file: base64File }
      );

      console.log("📁 LeadsService: Bulk upload response:", response);

      return response || { success: false, message: "No response received" };
    } catch (error) {
      console.error("🚨 LeadsService: Error uploading bulk leads:", error);
      throw error;
    }
  }

  /**
   * Convert file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Extract base64 data and format as requested: data:xlsx,<base64data>
          const base64Data = reader.result.split(',')[1];
          const dataUrl = `data:xlsx,${base64Data}`;
          resolve(dataUrl);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }
}

// Export a singleton instance
export const leadsService = new LeadsService();
