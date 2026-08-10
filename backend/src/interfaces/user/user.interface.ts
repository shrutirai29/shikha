export type UserRole = "admin" | "customer" | "delivery_agent";

export interface IUserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}
