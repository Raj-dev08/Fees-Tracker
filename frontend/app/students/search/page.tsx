"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRemoveStudent, useSearchStudents, Student } from "@/hooks/useStudents";

const monthMapObj: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
};

function calculatePending(lastMonth?: string, lastYear?: number, batchFees?: number) {
  if (!lastMonth || !lastYear || !batchFees) return 0;
  const now = new Date();
  const currentIndex = now.getFullYear() * 12 + now.getMonth();
  const lastPaidIndex = lastYear * 12 + monthMapObj[lastMonth];
  const pendingMonths = Math.max(0, currentIndex - lastPaidIndex);
  return pendingMonths * batchFees;
}

export default function SearchStudentsPage() {
  const router = useRouter();
  const removeStudentMutation = useRemoveStudent();

  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Use the hook properly
  const { data, isLoading, error } = useSearchStudents(searchTerm);

  const handleRemoveStudent = (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    removeStudentMutation.mutate(studentId, {
      onSuccess: () => {
        toast.success("Student removed!");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Please enter a name to search");
      return;
    }
    setSearchTerm(input.trim());
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black p-4 sm:p-6 font-sans">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center mb-6 gap-4 justify-between">
        <button
          onClick={() => router.back()}
          className="text-white/70 hover:text-white flex items-center gap-1 text-xl"
        >
          <ArrowLeft /> Back
        </button>
        <h1 className="text-xl font-extrabold text-white/70 tracking-tight">
          Search Students
        </h1>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter student name"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
        >
          Search
        </button>
      </form>

      {isLoading && <p className="text-white/70">Searching students...</p>}
      {error && <p className="text-red-400">Failed to load students</p>}
      {!isLoading && searchTerm && data?.students.length === 0 && (
        <p className="text-white/50">No students found</p>
      )}

      <div className="flex flex-col gap-2">
        {data?.students.map(student => {
          const pending = calculatePending(student.lastFeesPaidFor, student.lastFeesPaidForYear, student.batch.fees);
          return (
            <div
              key={student._id}
              className="px-3 py-2 w-full bg-white/10 text-white rounded-md flex justify-between items-center text-sm transition hover:bg-white/20"
            >
              <button
                className="flex flex-col text-left w-full"
                onClick={() => router.push(`/students/${student._id}`)}
              >
                <p className="font-semibold">{student.name}</p>
                <p className="text-white/80 text-sm">
                  Mobile: {student.mobileNumber || "N/A"} | Batch: {student.batch.name} ({student.batch.class})
                </p>
                <p className={`${pending === 0 ? "text-green-400" : "text-yellow-400"} text-xs`}>
                  Last Paid: {student.lastFeesPaidFor} {student.lastFeesPaidForYear} | Pending: ₹ {pending}
                </p>
              </button>
              <button
                onClick={() => handleRemoveStudent(student._id)}
                className="text-red-500 cursor-pointer hover:text-red-400 p-1 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
