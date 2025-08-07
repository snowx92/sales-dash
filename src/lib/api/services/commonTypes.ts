// Common types used across the API services

export interface PaginationParams {
  pageNo: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  status: number;
  message: string;
  data: {
    items: T[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data?: T;
}
