/** @format */

import { api } from "@/lib/axios";

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  department?: string;
  resumeUrl?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  offers?: Array<{
    id: string;
    candidateId: string;
    createdAt: string;
  }>;
  _count?: {
    offers: number;
  };
}

export interface CreateCandidatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  department?: string;
  resumeUrl?: string;
  status?: string;
}

export interface UpdateCandidatePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  resumeUrl?: string;
  status?: string;
}

export interface CandidateQueryParams {
  status?: string;
  department?: string;
  position?: string;
  search?: string;
}

export interface CandidateStatistics {
  total: number;
  byStatus: Record<string, number>;
  recentCandidates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    status: string;
    createdAt: string;
  }>;
}

export const createCandidate = async (
  payload: CreateCandidatePayload
): Promise<Candidate> => {
  const { data } = await api.post("/candidates", payload);
  return data;
};

export const getCandidates = async (
  params?: CandidateQueryParams
): Promise<Candidate[]> => {
  const { data } = await api.get("/candidates", { params });
  return data;
};

export const getCandidatesStats = async (): Promise<CandidateStatistics> => {
  const { data } = await api.get("/candidates/statistics");
  return data;
};

export const getCandidateById = async (id: string): Promise<Candidate> => {
  const { data } = await api.get(`/candidates/${id}`);
  return data;
};

export const updateCandidate = async (
  id: string,
  payload: UpdateCandidatePayload
): Promise<Candidate> => {
  const { data } = await api.patch(`/candidates/${id}`, payload);
  return data;
};

export const deleteCandidate = async (id: string): Promise<Candidate> => {
  const { data } = await api.delete(`/candidates/${id}`);
  return data;
};
