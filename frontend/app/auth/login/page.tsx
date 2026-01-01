"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password }, {
      onSuccess: () => {
        setTimeout(() => router.replace("/"), 500); // slight delay for toast
      },
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          FeesTracker
        </h1>
        <p className="mt-2 text-center text-sm text-white/60">
          Welcome back! Log in to your account
        </p>

        <div className="mt-8 relative">
          <div className="absolute inset-0 rounded-2xl bg-white/5 blur-xl" />
          <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-4"
          >
            {error && (
              <p className="text-sm text-red-400 text-center">
                {error.message || "Invalid credentials"}
              </p>
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-white py-3 text-black font-medium hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-white/60">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/auth/signup")}
            className="text-white font-medium hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </main>
  );
}
