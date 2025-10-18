/** @format */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDepartment,
  getDepartmentById,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
  type Department,
  type DepartmentResponse,
} from "@/api/department";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...departmentKeys.lists(), filters] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
};

// get all departments
export const useGetDepartments = () => {
  return useQuery<DepartmentResponse[], Error>({
    queryKey: departmentKeys.lists(),
    queryFn: getAllDepartments,
  });
};

// Get single department by ID
export const useGetDepartment = (id: string, enabled = true) => {
  return useQuery<DepartmentResponse, Error>({
    queryKey: departmentKeys.detail(id),
    queryFn: () => getDepartmentById(id),
    enabled: !!id && enabled,
  });
};

// Create department
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation<DepartmentResponse, Error, Department>({
    mutationFn: createDepartment,
    onSuccess: () => {
      // Invalidate and refetch departments list
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    onError: (error) => {
      console.error("Create department failed:", error.message);
    },
  });
};

// Update department
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DepartmentResponse,
    Error,
    { id: string; payload: Partial<Department> }
  >({
    mutationFn: ({ id, payload }) => updateDepartment(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate both the list and the specific department detail
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      console.error("Update department failed:", error.message);
    },
  });
};

// Delete department
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteDepartment,
    onSuccess: (_, id) => {
      // Remove the deleted department from cache
      queryClient.removeQueries({ queryKey: departmentKeys.detail(id) });
      // Invalidate the list to refetch
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    onError: (error) => {
      console.error("Delete department failed:", error.message);
    },
  });
};
