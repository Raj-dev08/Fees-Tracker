"use client";

import { useState, useEffect } from "react";
import { useBatchById, useUpdateBatch } from "@/hooks/useBatch";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function UpdateBatchPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;

  const { data, isLoading, error } = useBatchById(batchId);
  const updateBatchMutation = useUpdateBatch();

  const [form, setForm] = useState({
    name: "",
    className: "",
    group: 1,
    fees: 0,
  });

  // Populate form once data loads
  useEffect(() => {
    if (data?.batch) {
      setForm({
        name: data.batch.name,
        className: data.batch.class,
        group: data.batch.group,
        fees: data.batch.fees,
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.className || form.group <= 0 || form.fees < 0) {
      toast.error("Please fill all fields correctly");
      return;
    }

    updateBatchMutation.mutate(
      { id: batchId, name: form.name, className: form.className, group: form.group, fees: form.fees },
      {
        onSuccess: () => {
          setTimeout(() => router.replace("/"), 800);
        },
      }
    );
  };

  if (isLoading)
    return <p className="text-white text-center mt-12">Loading batch...</p>;
  if (error)
    return (
      <p className="text-red-400 text-center mt-12">
        Failed to load batch details
      </p>
    );

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black p-4 sm:p-6 font-sans">
      <Toaster position="top-right" />

      <div className="flex justify-between px-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-white/70 hover:text-white transition text-xl flex items-center gap-1"
        >
          <ArrowLeft /> Back
        </button>

        <h1 className="text-xl font-extrabold text-center text-white tracking-tight">
          Update Batch
        </h1>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl"
          >
            <div className="flex flex-col">
              <label htmlFor="batchName" className="text-white/70 mb-1 text-sm">
                Batch Name
              </label>
              <input
                id="batchName"
                name="name"
                placeholder="Enter batch name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/40 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="className" className="text-white/70 mb-1 text-sm">
                Class Name
              </label>
              <input
                id="className"
                name="className"
                placeholder="Enter class name"
                value={form.className}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/40 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="group" className="text-white/70 mb-1 text-sm">
                Group
              </label>
              <input
                id="group"
                name="group"
                type="number"
                min={1}
                placeholder="Enter group number"
                value={form.group}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/40 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="fees" className="text-white/70 mb-1 text-sm">
                Fees
              </label>
              <input
                id="fees"
                name="fees"
                type="number"
                min={0}
                placeholder="Enter fees amount"
                value={form.fees}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/40 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={updateBatchMutation.isPending}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60"
            >
              {updateBatchMutation.isPending ? "Updating..." : "Update Batch"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
