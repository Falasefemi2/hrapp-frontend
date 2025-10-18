/** @format */

import { api } from "@/lib/axios";

export interface Level {
  id?: string;
  name: string;
  code: string;
  annualLeaveDays: number;
  basicSalary: number;
  transportAllowance: number;
  domesticAllowance: number;
  utilityAllowance: number;
  lunchSubsidy: number;
  entertainmentAllowance: number;
  telephoneAllowance: number;
  fuelAllowance: number;
  maintenanceAllowance: number;
  housingAllowance: number;
  dressingAllowance: number;
  furnitureAllowance: number;
  educationAllowance: number;
  medicalAllowance: number;
  passageAllowance: number;
  annualLeaveAllowance: number;
  thirteenthMonth: number;
  total: number;
  leaveExpirationInterval: number;
  minimumLeaveDays: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    users: number;
  };
}

export type LevelResponse = Level | Level[];

export const createLevel = async (payload: Level): Promise<LevelResponse> => {
  const { data } = await api.post("/levels", payload);
  return data;
};

export const getLevels = async (): Promise<Level[]> => {
  const { data } = await api.get("/levels");
  return data;
};

export const getLevelById = async (id: string): Promise<LevelResponse> => {
  const { data } = await api.get(`/levels/${id}`);
  return data;
};

export const updateLevel = async (
  id: string,
  payload: Partial<Level>
): Promise<LevelResponse> => {
  const { data } = await api.patch(`/levels/${id}`, payload);
  return data;
};

export const deleteLevel = async (id: string): Promise<void> => {
  await api.delete(`/levels/${id}`);
};
