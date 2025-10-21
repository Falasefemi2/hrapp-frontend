/** @format */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getCandidatesStats,
  type CreateCandidatePayload,
  type UpdateCandidatePayload,
  type CandidateQueryParams,
} from "@/api/candidate";
import { toast } from "sonner";

// Query keys
export const candidateKeys = {
  all: ["candidates"] as const,
  lists: () => [...candidateKeys.all, "list"] as const,
  list: (filters?: CandidateQueryParams) =>
    [...candidateKeys.lists(), { filters }] as const,
  details: () => [...candidateKeys.all, "detail"] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
  statistics: () => [...candidateKeys.all, "statistics"] as const,
};

// Get all candidates with optional filters
export const useCandidates = (params?: CandidateQueryParams) => {
  return useQuery({
    queryKey: candidateKeys.list(params),
    queryFn: () => getCandidates(params),
  });
};

// Get candidate statistics
export const useCandidateStats = () => {
  return useQuery({
    queryKey: candidateKeys.statistics(),
    queryFn: getCandidatesStats,
  });
};

// Get single candidate by ID
export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: candidateKeys.detail(id),
    queryFn: () => getCandidateById(id),
    enabled: !!id,
  });
};

// Create candidate
export const useCreateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.statistics() });
      toast.success("Candidate created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create candidate"
      );
    },
  });
};

// Update candidate
export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCandidatePayload;
    }) => updateCandidate(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: candidateKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: candidateKeys.statistics() });
      toast.success("Candidate updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update candidate"
      );
    },
  });
};

// Delete candidate
export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.statistics() });
      toast.success("Candidate deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete candidate"
      );
    },
  });
};
