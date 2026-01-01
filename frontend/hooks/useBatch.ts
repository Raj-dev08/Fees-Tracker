"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

export type Batch = {
  _id: string;
  name: string;
  class: string;
  group: number;
  fees: number;
  owner: string;
  students: any[];
  createdAt?: string;
  updatedAt?: string;
};

export const useBatches = () => {
  return useQuery<{ batches: Batch[] }, AxiosError>({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await api.get("/batch");
      return res.data;
    },
  });
};

export const useCreateBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; className: string; group: number; fees: number }) =>
      api.post("/batch", data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch created successfully!");
    },
    onError: (err: AxiosError | any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to create batch");
    },
  });
};

export const useUpdateBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; name?: string; className?: string; group?: number; fees?: number}) =>
      api.put(`/batch/${data.id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch updated successfully!");
    },
    onError: (err: AxiosError | any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update batch");
    },
  });
};

export const useDeleteBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/batch/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch deleted successfully!");
    },
    onError: (err: AxiosError | any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to delete batch");
    },
  });
};

export const useBatchById = (id: string) => {
  return useQuery<{ batch: Batch }, AxiosError>({
    queryKey: ["batch", id],
    queryFn: async () => {
      const res = await api.get(`/batch/${id}`);
      return res.data;
    },
    enabled: !!id, 
  });
};

export const useMyBatch = () => {
    return useQuery<{ batches: Batch[] }, AxiosError>({
      queryKey: ["my-batches"],
      queryFn: async () => {
        const res = await api.get("/batch");
        return res.data;
      },
    });
}
