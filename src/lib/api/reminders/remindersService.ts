import { ApiService } from "../services/ApiService";
import type {
  CreateReminderRequest,
  ReminderQueryParams,
  ReminderStatus,
  SalesReminder,
  UpdateReminderRequest,
} from "./types";

export class RemindersService extends ApiService {
  async getReminders(params: ReminderQueryParams = {}): Promise<SalesReminder[]> {
    const queryParams: Record<string, string> = {};

    if (params.parentId) queryParams.parentId = params.parentId;
    if (params.sourceType) queryParams.sourceType = params.sourceType;
    if (params.from) queryParams.from = params.from;
    if (params.to) queryParams.to = params.to;
    if (params.status) queryParams.status = params.status;

    const response = await this.get<SalesReminder[] | { items?: SalesReminder[] }>(
      "/reminders",
      queryParams
    );

    if (Array.isArray(response)) return response;
    if (response && typeof response === "object" && Array.isArray(response.items)) {
      return response.items;
    }

    return [];
  }

  async createReminder(payload: CreateReminderRequest): Promise<SalesReminder | null> {
    return this.post<SalesReminder>("/reminders", payload as Record<string, unknown>);
  }

  async updateReminder(id: string, payload: UpdateReminderRequest): Promise<SalesReminder | null> {
    return this.put<SalesReminder>(`/reminders/${id}`, payload as Record<string, unknown>);
  }

  async deleteReminder(id: string): Promise<boolean> {
    await this.delete<unknown>(`/reminders/${id}`);
    return true;
  }

  async updateReminderStatus(id: string, status: ReminderStatus): Promise<SalesReminder | null> {
    try {
      return await this.put<SalesReminder>(`/reminders/${id}/status`, { status });
    } catch {
      // Some deployments may accept status update on /reminders/:id
      return this.put<SalesReminder>(`/reminders/${id}`, { status });
    }
  }
}

export const remindersService = new RemindersService();
