/** @format */

import { api } from "@/lib/axios";

export interface User {
  id?: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roleId: string;
  departmentId?: string;
  designationId?: string;
  levelId?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  // Relations (if your backend returns them)
  role?: {
    id: string;
    name: string;
    code: string;
  };
  department?: {
    id: string;
    name: string;
  };
  designation?: {
    id: string;
    title: string;
  };
  level?: {
    id: string;
    name: string;
  };
}

export interface CreateUserPayload {
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roleId: string;
  departmentId?: string;
  designationId?: string;
  levelId?: string;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface UserFilters {
  departmentId?: string;
  roleId?: string;
  status?: string;
  isActive?: boolean;
}

export type UserResponse = User | User[];

// Create user
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await api.post("/users", payload);
  return data;
};

// Get all users with optional filters
export const getUsers = async (filters?: UserFilters): Promise<User[]> => {
  const params = new URLSearchParams();

  if (filters?.departmentId)
    params.append("departmentId", filters.departmentId);
  if (filters?.roleId) params.append("roleId", filters.roleId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.isActive !== undefined)
    params.append("isActive", filters.isActive.toString());

  const { data } = await api.get(`/users?${params.toString()}`);
  return data;
};

// Get current user profile
export const getUserProfile = async (): Promise<User> => {
  const { data } = await api.get("/users/profile");
  return data;
};

// Get user by ID
export const getUserById = async (id: string): Promise<User> => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

// Update user
export const updateUser = async (
  id: string,
  payload: UpdateUserPayload
): Promise<User> => {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data;
};

// Change password
export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<void> => {
  const { data } = await api.patch("/users/change-password", payload);
  return data;
};

// Deactivate user
export const deactivateUser = async (id: string): Promise<User> => {
  const { data } = await api.patch(`/users/${id}/deactivate`);
  return data;
};

// Activate user
export const activateUser = async (id: string): Promise<User> => {
  const { data } = await api.patch(`/users/${id}/activate`);
  return data;
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};
