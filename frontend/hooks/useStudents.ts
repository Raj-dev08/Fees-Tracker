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
  admissionMonth?: number;
  admissionYear?: number;
  batch: any;
  fees?: any[];
  createdAt?: string;
  updatedAt?: string;
};


// Fetch a single student by ID
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

// Add a new student
export const useAddStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      mobileNumber?: string;
      lastFeesPaidFor: string;
      admissionMonth: string;
      admissionYear: number;
      batchId: string;
    }) => api.post("/student/add-student", data),
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

// Remove a student
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

