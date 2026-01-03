"use client";

import { useState } from "react";
import { useCreateBatch } from "@/hooks/useBatch";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CreateBatchPage() {
  const createBatchMutation = useCreateBatch();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    className: "",
    group: 1,
    fees: 0,
  });

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

    createBatchMutation.mutate(form, {
      onSuccess: () => {
        setForm({ name: "", className: "", group: 1, fees: 0 });
        setTimeout(() => router.replace("/"), 800);
      },
    });
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black p-4 sm:p-6 font-sans">
      <Toaster position="top-right" />

    <div className="flex justify-between px-4">
        <button
          onClick={() => router.back()}
          className="text-white/70 hover:text-white transition text-xl flex items-center gap-1"
        >
           <ArrowLeft/>Back
        </button>

        <h1 className="text-xl font-extrabold text-center text-white mb-4 tracking-tight">
            Create New Batch
          </h1>
    </div>
    
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        
        

        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl"
        >
          

          {/* Labels on top */}
          <div className="flex flex-col">
            <label htmlFor="batchName" className="text-white/70 mb-1 text-sm">
              Batch Name*
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
              Class Name*
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
              Fees*
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
            disabled={createBatchMutation.isPending}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60"
          >
            {createBatchMutation.isPending ? "Creating..." : "Create Batch"}
          </button>
        </form>
      </div>
      </div>
    </main>
  );
}
