export type UserRole = "admin" | "customer";

export interface IUserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}
