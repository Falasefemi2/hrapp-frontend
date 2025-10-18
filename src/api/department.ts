/** @format */

import { api } from "@/lib/axios";

export interface Department {
  name: string;
  code: string;
  hodId?: string;
}

export interface DepartmentResponse extends Department {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export const createDepartment = async (payload: Department) => {
  const { data } = await api.post("/department", payload);
  return data;
};

export const getDepartmentById = async (id: string) => {
  const { data } = await api.get<DepartmentResponse>(`/department/${id}`);
  return data;
};

export const getAllDepartments = async () => {
  const { data } = await api.get<DepartmentResponse[]>("/department");
  return data;
};

export const updateDepartment = async (
  id: string,
  payload: Partial<Department>
) => {
  const { data } = await api.patch(`/department/${id}`, payload);
  return data;
};

export const deleteDepartment = async (id: string) => {
  const { data } = await api.delete(`/department/${id}`);
  return data;
};
