/** @format */

import { api } from "@/lib/axios";

export interface Designation {
  name: string;
  code: string;
  departmentId: string;
}

export interface DesignationResponse {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
  department: {
    id: string;
    name: string;
    code: string;
    hodId: string | null;
    createdAt: string;
    updatedAt: string;
  };
  _count: {
    users: number;
  };
}

export const createDesignation = async (payload: Designation) => {
  const { data } = await api.post("/designation", payload);
  return data;
};

export const getDesignationById = async (id: string) => {
  const { data } = await api.get<DesignationResponse>(`/designation/${id}`);
  return data;
};

export const getAllDesignations = async () => {
  const { data } = await api.get<DesignationResponse[]>("/designation");
  return data;
};

export const updateDesignation = async (
  id: string,
  payload: Partial<Designation>
) => {
  const { data } = await api.patch(`/designation/${id}`, payload);
  return data;
};

export const deleteDesignation = async (id: string) => {
  const { data } = await api.delete(`/designation/${id}`);
  return data;
};
