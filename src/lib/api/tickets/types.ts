import type { FirestoreDateInput } from "@/lib/utils/firestoreDate";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface TicketUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface SalesTicket {
  id: string;
  title: string;
  desc: string;
  attachments: string[];
  tags: string[];
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  createdAt: FirestoreDateInput;
  updatedAt: FirestoreDateInput;
  user?: TicketUser;
}

export interface TicketListData {
  items: SalesTicket[];
  pageItems: number;
  totalItems: number;
  isLastPage: boolean;
  nextPageNumber: number;
  currentPage: number;
  totalPages: number;
  docsReaded?: number;
}

export interface TicketQueryParams {
  pageNo?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface CreateTicketRequest extends Record<string, unknown> {
  title: string;
  desc: string;
  attachments?: string[];
  tags?: string[];
  priority: TicketPriority;
}

export interface UpdateTicketInfoRequest extends Record<string, unknown> {
  title: string;
  desc: string;
  attachments?: string[];
  tags?: string[];
  priority: TicketPriority;
}
