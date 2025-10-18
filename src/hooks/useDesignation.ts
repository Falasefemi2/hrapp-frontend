/** @format */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDesignation,
  getDesignationById,
  getAllDesignations,
  updateDesignation,
  deleteDesignation,
  type DesignationResponse,
  type Designation,
} from "@/api/designation";

export const designationKeys = {
  all: ["designations"] as const,
  lists: () => [...designationKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...designationKeys.lists(), filters] as const,
  details: () => [...designationKeys.all, "detail"] as const,
  detail: (id: string) => [...designationKeys.details(), id] as const,
};

// get all designation
export const useGetDesignations = () => {
  return useQuery<DesignationResponse[], Error>({
    queryKey: designationKeys.lists(),
    queryFn: getAllDesignations,
  });
};

// Get single designation by ID
export const useGetDesignation = (id: string, enabled = true) => {
  return useQuery<DesignationResponse, Error>({
    queryKey: designationKeys.detail(id),
    queryFn: () => getDesignationById(id),
    enabled: !!id && enabled,
  });
};

// Create designation
export const useCreateDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation<DesignationResponse, Error, Designation>({
    mutationFn: createDesignation,
    onSuccess: () => {
      // Invalidate and refetch designation list
      queryClient.invalidateQueries({ queryKey: designationKeys.lists() });
    },
    onError: (error) => {
      console.error("Create designation failed:", error.message);
    },
  });
};

// Update designation
export const useUpdateDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DesignationResponse,
    Error,
    { id: string; payload: Partial<Designation> }
  >({
    mutationFn: ({ id, payload }) => updateDesignation(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate both the list and the specific designation detail
      queryClient.invalidateQueries({ queryKey: designationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: designationKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      console.error("Update designation failed:", error.message);
    },
  });
};

// Delete designation
export const useDeleteDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteDesignation,
    onSuccess: (_, id) => {
      // Remove the deleted designation from cache
      queryClient.removeQueries({ queryKey: designationKeys.detail(id) });
      // Invalidate the list to refetch
      queryClient.invalidateQueries({ queryKey: designationKeys.lists() });
    },
    onError: (error) => {
      console.error("Delete designation failed:", error.message);
    },
  });
};
