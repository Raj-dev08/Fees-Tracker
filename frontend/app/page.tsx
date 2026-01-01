"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import WaitingScreen from "@/components/WaitingPage";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <WaitingScreen />;
  }

  if (!user) {
    return <WaitingScreen />;
  }

  return <LandingPage />;
}
