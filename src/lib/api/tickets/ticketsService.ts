import { ApiService } from "../services/ApiService";
import type {
  CreateTicketRequest,
  SalesTicket,
  TicketListData,
  TicketPriority,
  TicketQueryParams,
  TicketStatus,
  UpdateTicketInfoRequest,
} from "./types";

type TicketByIdResponse = TicketListData | SalesTicket | { items?: SalesTicket[] };

export class TicketsService extends ApiService {
  async getTickets(params: TicketQueryParams = {}): Promise<TicketListData | null> {
    const queryParams: Record<string, string> = {
      pageNo: String(params.pageNo ?? 1),
      limit: String(params.limit ?? 10),
    };

    if (params.status) queryParams.status = params.status;
    if (params.priority) queryParams.priority = params.priority;

    return this.get<TicketListData>("/tickets", queryParams);
  }

  async getTicketById(id: string): Promise<SalesTicket | null> {
    const response = await this.get<TicketByIdResponse>(`/tickets/${id}`);

    if (!response) return null;

    if ("items" in response && Array.isArray(response.items)) {
      return response.items[0] || null;
    }

    if ("id" in response) {
      return response;
    }

    return null;
  }

  async createTicket(payload: CreateTicketRequest): Promise<SalesTicket | null> {
    return this.post<SalesTicket>("/tickets", payload as Record<string, unknown>);
  }

  async updateTicketInfo(id: string, payload: UpdateTicketInfoRequest): Promise<SalesTicket | null> {
    return this.put<SalesTicket>(`/tickets/${id}/info`, payload as Record<string, unknown>);
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<SalesTicket | null> {
    return this.put<SalesTicket>(`/tickets/${id}/status`, { status });
  }

  async deleteTicket(id: string): Promise<boolean> {
    await this.delete<unknown>(`/tickets/${id}`);
    return true;
  }

  async getTicketCounters(): Promise<{ open: number; inProgress: number; resolved: number; closed: number }> {
    const [open, inProgress, resolved, closed] = await Promise.all([
      this.getTickets({ pageNo: 1, limit: 1, status: "OPEN" }),
      this.getTickets({ pageNo: 1, limit: 1, status: "IN_PROGRESS" }),
      this.getTickets({ pageNo: 1, limit: 1, status: "RESOLVED" }),
      this.getTickets({ pageNo: 1, limit: 1, status: "CLOSED" }),
    ]);

    return {
      open: open?.totalItems || 0,
      inProgress: inProgress?.totalItems || 0,
      resolved: resolved?.totalItems || 0,
      closed: closed?.totalItems || 0,
    };
  }

  async getPriorityCounters(): Promise<{ low: number; medium: number; high: number; critical: number }> {
    const priorities: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    const responses = await Promise.all(
      priorities.map((priority) => this.getTickets({ pageNo: 1, limit: 1, priority }))
    );

    return {
      low: responses[0]?.totalItems || 0,
      medium: responses[1]?.totalItems || 0,
      high: responses[2]?.totalItems || 0,
      critical: responses[3]?.totalItems || 0,
    };
  }
}

export const ticketsService = new TicketsService();
