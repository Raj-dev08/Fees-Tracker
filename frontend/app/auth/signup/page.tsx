"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignup, useAuth } from "@/hooks/useAuth";
import { Toaster } from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const { mutate: signupMutation , isPending} = useSignup();



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { data: user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [isLoading, user, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation(form);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          FeesTracker
        </h1>
        <p className="mt-2 text-center text-sm text-white/60">
          Create your account
        </p>

        <div className="mt-8 relative">
          <div className="absolute inset-0 rounded-2xl bg-white/5 blur-xl" />
          <form
            className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-4"
            onSubmit={handleSubmit}
          >
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-white py-3 text-black font-medium hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-white/60">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="text-white hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </main>
  );
}
