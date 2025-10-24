/** @format */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOffer,
  updateOffer,
  approveOffer,
  rejectOffer,
  withdrawOffer,
  acceptOffer,
  candidateRejectOffer,
  fetchOfferById,
  fetchOffers,
  fetchOfferStatistics,
} from "@/api/offer";

import type {
  CreateOfferPayload,
  UpdateOfferPayload,
  OfferQueryParams,
  CandidateOfferActionDto,
} from "@/api/offer";

import { toast } from "sonner";

// Query keys
export const offerKeys = {
  all: ["offers"] as const,
  lists: () => [...offerKeys.all, "list"] as const,
  list: (filters?: OfferQueryParams) =>
    [...offerKeys.lists(), { filters }] as const,
  details: () => [...offerKeys.all, "detail"] as const,
  detail: (id: string) => [...offerKeys.details(), id] as const,
  statistics: () => [...offerKeys.all, "statistics"] as const,
};

// Get all offers with optional filters
export const useOffers = (params?: OfferQueryParams) =>
  useQuery({
    queryKey: offerKeys.list(params),
    queryFn: () => fetchOffers(),
  });

// Get offer statistics
export const useOfferStats = () =>
  useQuery({
    queryKey: offerKeys.statistics(),
    queryFn: fetchOfferStatistics,
  });

// Get single offer by ID
export const useOffer = (id: string) =>
  useQuery({
    queryKey: offerKeys.detail(id),
    queryFn: () => fetchOfferById(id),
    enabled: !!id,
  });

// Create offer
export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOfferPayload) => createOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offerKeys.statistics() });
      toast.success("Offer created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create offer");
    },
  });
};

// Update offer
export const useUpdateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateOfferPayload;
    }) => updateOffer(payload, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: offerKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: offerKeys.statistics() });
      toast.success("Offer updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update offer");
    },
  });
};

// Approve offer
export const useApproveOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveOffer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: offerKeys.statistics() });
      toast.success("Offer approved");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve offer");
    },
  });
};

// Reject offer (by EXCO/ADMIN)
export const useRejectOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { rejectionReason: string };
    }) => rejectOffer(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: offerKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: offerKeys.statistics() });
      toast.success("Offer rejected");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject offer");
    },
  });
};

// Withdraw offer
export const useWithdrawOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => withdrawOffer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: offerKeys.statistics() });
      toast.success("Offer withdrawn");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to withdraw offer");
    },
  });
};
// Candidate accepts offer (public)
export const useAcceptOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CandidateOfferActionDto) => acceptOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offerKeys.statistics() });
      toast.success("Offer accepted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to accept offer");
    },
  });
};

// Candidate rejects offer (public)
export const useCandidateRejectOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      rejectionReason,
    }: {
      token: string;
      rejectionReason: string;
    }) => candidateRejectOffer(token, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offerKeys.statistics() });
      toast.success("Offer rejected");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject offer");
    },
  });
};
