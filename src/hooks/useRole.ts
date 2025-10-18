/** @format */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  type Role,
} from "@/api/role";
import { toast } from "sonner";

// Query keys
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters?: string) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

// Get all roles
export const useRoles = () => {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: getRoles,
  });
};

// Get single role by ID
export const useRole = (id: string) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => getRoleById(id),
    enabled: !!id,
  });
};

// Create role
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Role created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create role");
    },
  });
};

// Update role
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Role> }) =>
      updateRole(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: roleKeys.detail(variables.id),
      });
      toast.success("Role updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update role");
    },
  });
};

// Delete role
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Role deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete role");
    },
  });
};
