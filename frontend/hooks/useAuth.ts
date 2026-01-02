"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

type User = {
  _id: string;
  name: string;
  email: string;
  batches?: string[];
};

export const useAuth = () => {
  return useQuery<User | null>({
    queryKey: ["auth"],
    queryFn: async () => {
      try {
        const res = await api.get("/auth/check-auth");
        return res.data;
      } catch {
        return null;
      }
    },
    retry: false,
  });
};

export const useLogin = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post("/auth/login", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Logged in successfully!");
    },
    onError: (err: AxiosError | any) => {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    },
  });
};

export const useSignup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      api.post("/auth/signup", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Account created successfully!");
    },
    onError: (err: AxiosError | any) => {
      toast.error(err.response?.data?.message || err.message || "Signup failed");
    },
  });
};

//not really needed for now so not in use
export const useLogout = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.get("/auth/logout"),
    onSuccess: () => {
      qc.setQueryData(["auth"], null);
      toast.success("Logged out successfully!");
    },
    onError: (err: AxiosError | any) => {
      toast.error(err.response?.data?.message || err.message || "Logout failed");
    },
  });
};
