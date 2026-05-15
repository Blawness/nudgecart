export type UserRole = "BUYER" | "MERCHANT" | "ADMIN";

export type MerchantStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "BANK_TRANSFER" | "COD";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
}
