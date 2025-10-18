/** @format */

import { api } from "@/lib/axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: any;
  token: string;
}

export const loginUser = async (
  paylod: LoginPayload
): Promise<LoginResponse> => {
  const { data } = await api.post("/auth/login", paylod);
  return data;
};
