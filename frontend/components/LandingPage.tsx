"use client";

import { useState, useMemo } from "react";
import { useMyBatch, Batch, useDeleteBatch } from "@/hooks/useBatch";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LandingPage() {
  const router = useRouter();
  const { data, isLoading, error } = useMyBatch();
  const deleteBatchMutation = useDeleteBatch();

  // State for filter
  const [selectedClass, setSelectedClass] = useState<string | "All">("All");

  // Get unique classes for filter dropdown
  const classes = useMemo(() => {
    if (!data?.batches) return [];
    return Array.from(new Set(data.batches.map((b) => b.class)));
  }, [data?.batches]);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    if (!data?.batches) return [];
    if (selectedClass === "All") return data.batches;
    return data.batches.filter((b) => b.class === selectedClass);
  }, [data?.batches, selectedClass]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this batch?")) {
      deleteBatchMutation.mutate(id);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black text-white p-6 relative">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">FeesTracker</h1>

        {/* Class Filter */}
        {classes.length > 0 && (
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg bg-black/40 border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition"
          >
            <option value="All">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        )}
      </header>

      {/* Batches Grid */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading && <p>Loading batches...</p>}
        {error && <p className="text-red-400">Failed to load batches</p>}
        {filteredBatches.length === 0 && (
          <p className="text-white/60">No batches found for selected class.</p>
        )}

        {filteredBatches.map((batch: Batch) => (
          <div
            key={batch._id}
            className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition cursor-pointer flex flex-col justify-between"
          >
            <div onClick={() => router.push(`/batches/${batch._id}`)}>
              <h3 className="font-semibold text-lg">{batch.name}</h3>
              <p className="text-sm text-white/60">
                Class: {batch.class} | Group: {batch.group}
              </p>
              <p className="mt-2 font-medium">Fees: ₹ {batch.fees}</p>
              <p className="mt-1 text-xs text-white/50">
                Students: {batch.students.length}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => router.push(`/batches/update/${batch._id}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Update
              </button>
              <button
                onClick={() => handleDelete(batch._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Floating Create Button */}
      <button
        onClick={() => router.push("/batches/create")}
        className="fixed bottom-8 right-8 flex items-center justify-center w-16 h-16 rounded-full bg-white text-black text-2xl font-bold shadow-lg hover:scale-105 transition"
      >
        +
      </button>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/50 mt-12">
        © {new Date().getFullYear()} FeesTracker
      </footer>
    </main>
  );
}
