export type UserRole = "ADMIN" | "OPERATOR";

export interface User {
  id: string;

  name: string;
  email: string;

  role: UserRole;

  createdAt: string;
  updatedAt?: string;
}