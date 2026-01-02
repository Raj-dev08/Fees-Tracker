"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

export type Student = {
  _id: string;
  name: string;
  mobileNumber?: string;
  lastFeesPaidFor?: string;
  lastFeesPaidForYear?: number;
  admissionMonth?: string;
  admissionYear?: number;
  batch: any;
  fees?: any[];
  createdAt?: string;
  updatedAt?: string;
};


export const useStudentById = (studentId: string) => {
  return useQuery<{ student: Student }, AxiosError>({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const res = await api.get(`/student/student/${studentId}`);
      return res.data;
    },
    enabled: !!studentId,
  });
};

export const useSearchStudents = (search: string) => {
  return useQuery<{ students: Student[] }, AxiosError>({
    queryKey: ["students", search],
    queryFn: async () => {
      const res = await api.get(`/student/search?name=${search}`);
      return res.data;
    },
      enabled: !!search,
  });
}

export const useAddStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      mobileNumber?: string;
      lastFeesPaidFor: string;
      lastFeesPaidForYear: number;
      admissionMonth: string;
      admissionYear: number;
      batchId: string;
    }) => api.post("/student/add-student", data).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Student added successfully!");
    },
    onError: (err: AxiosError | any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to add student");
    },
  });
};

export const useRemoveStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => api.delete(`/student/remove-student/${studentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Student removed successfully!");
    },
    onError: (err: AxiosError | any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to remove student");
    },
  });
};

export const useCreateBill = (studentId: string) => {
  const qc = useQueryClient();

  return useMutation<
    any,
    AxiosError,
    { forMonth: string; forYear: number }
  >({
    mutationFn: async (data) => {
      const res = await api.post(
        `/fees/add-fees/${studentId}`,
        data
      );
      return res.data;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student", studentId] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["batches"] });

      toast.success("Fees added successfully");
    },

    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to add fees"
      );
    },
  });
};
