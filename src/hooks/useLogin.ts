/** @format */

import { useMutation } from "@tanstack/react-query";
import { loginUser, type LoginPayload, type LoginResponse } from "@/api/auth";

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // store token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    },
    onError: (error) => {
      console.error("Login failed:", error.message);
    },
  });
};
