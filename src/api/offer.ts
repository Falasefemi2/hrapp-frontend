/** @format */

import { api } from "@/lib/axios";

export interface Offer {
  id: string;
  candidateId: string;
  position: string;
  salary: number;
  startDate?: string;
  status: "Pending" | "Approved" | "Accepted" | "Rejected" | "Withdrawn";
  department?: { id: string; name: string };
  designation?: { id: string; name: string };
  level?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  offerLetterUrl?: string;
  candidate?: { firstName: string; lastName: string; email: string };
}

export interface CreateOfferDto {
  candidateId: string;
  position: string;
  departmentId?: string;
  designationId?: string;
  levelId?: string;
  salary: number;
  startDate?: string; // ISO string (YYYY-MM-DD)
}

export interface UpdateOfferDto {
  id: string;
  position?: string;
  departmentId?: string;
  designationId?: string;
  levelId?: string;
  salary?: number;
  startDate?: string;
  status?: string;
}

export interface RejectOfferDto {
  rejectionReason: string;
}

export interface ApproveOfferDto {
  comment?: string;
}

export interface WithdrawOfferDto {
  reason?: string;
}

export interface CandidateOfferActionDto {
  token: string;
}

export interface CreateOfferPayload {
  candidateId: string;
  position: string;
  departmentId?: string;
  designationId?: string;
  levelId?: string;
  salary: number;
  startDate?: string;
  expiresAt?: string;
  offerLetter?: string;
}

export interface UpdateOfferPayload {
  position?: string;
  departmentId?: string | null;
  designationId?: string | null;
  levelId?: string | null;
  salary?: number;
  startDate?: string | null;
  expiresAt?: string | null;
  offerLetter?: string | null;
}

export interface OfferQueryParams {
  status?: string;
  candidateId?: string;
  departmentId?: string;
}

export interface OfferStatistics {
  total: number;
  byStatus: Record<string, number>;
  recentOffers: Array<{
    id: string;
    candidate: {
      firstName: string;
      lastName: string;
      email: string;
      position?: string;
    };
    createdBy?: { firstName?: string; lastName?: string };
    createdAt?: string;
  }>;
}

// Offer API functions

// CREATE
export const createOffer = async (payload: CreateOfferDto): Promise<Offer> => {
  const { data } = await api.post("/offers", payload);
  return data;
};

// GET ALL
export const fetchOffers = async (): Promise<Offer[]> => {
  const { data } = await api.get("/offers");
  return data;
};

// GET BY ID
export const fetchOfferById = async (id: string): Promise<Offer> => {
  const { data } = await api.get(`/offers/${id}`);
  return data;
};

// UPDATE
export const updateOffer = async ({
  id,
  ...payload
}: UpdateOfferDto & { id: string }): Promise<Offer> => {
  const { data } = await api.patch(`/offers/${id}`, payload);
  return data;
};

// DELETE
export const deleteOffer = async (id: string): Promise<void> => {
  await api.delete(`/offers/${id}`);
};

// APPROVE (no body required, backend has optional dto)
export const approveOffer = async (
  id: string,
  dto?: ApproveOfferDto
): Promise<Offer> => {
  const { data } = await api.post(`/offers/${id}/approve`, dto || {});
  return data;
};

// REJECT
export const rejectOffer = async (
  id: string,
  dto: RejectOfferDto
): Promise<Offer> => {
  const { data } = await api.post(`/offers/${id}/reject`, dto);
  return data;
};

// WITHDRAW
export const withdrawOffer = async (
  id: string,
  dto?: WithdrawOfferDto
): Promise<Offer> => {
  const { data } = await api.post(`/offers/${id}/withdraw`, dto || {});
  return data;
};

// CANDIDATE ACCEPT (public)
export const acceptOffer = async (
  dto: CandidateOfferActionDto
): Promise<Offer> => {
  const { data } = await api.post("/offers/accept", dto);
  return data;
};

// CANDIDATE REJECT (public)
export const candidateRejectOffer = async (
  dto: CandidateOfferActionDto
): Promise<Offer> => {
  const { data } = await api.post("/offers/reject", dto);
  return data;
};

// STATISTICS
export const fetchOfferStatistics = async (): Promise<any> => {
  const { data } = await api.get("/offers/statistics");
  return data;
};
