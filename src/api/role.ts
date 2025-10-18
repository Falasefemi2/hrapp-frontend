/** @format */

import { api } from "@/lib/axios";

export interface RolePermissions {
  canManageRoles?: boolean;
  canManageUsers?: boolean;
  canApproveLeave?: boolean;
  canManageOffers?: boolean;
  canManageDepartments?: boolean;
  canApproveExit?: boolean;
  canApproveMemo?: boolean;
  canApproveVoucher?: boolean;
  canGenerateReports?: boolean;
  canGenerateVoucher?: boolean;
  canApplyHMO?: boolean;
  canApplyMemo?: boolean;
  canApplyLeave?: boolean;
  canApplyVoucher?: boolean;
}

export interface Role {
  id?: string;
  name: string;
  code: string;
  description: string;
  permissions: RolePermissions;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    users: number;
  };
}

export type RoleResponse = Role | Role[];

export const createRole = async (payload: Role): Promise<RoleResponse> => {
  const { data } = await api.post("/roles", payload);
  return data;
};

export const getRoles = async (): Promise<Role[]> => {
  const { data } = await api.get("/roles");
  return data;
};

export const getRoleById = async (id: string): Promise<RoleResponse> => {
  const { data } = await api.get(`/roles/${id}`);
  return data;
};

export const updateRole = async (
  id: string,
  payload: Partial<Role>
): Promise<RoleResponse> => {
  const { data } = await api.patch(`/roles/${id}`, payload);
  return data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/roles/${id}`);
};
