"use client";

import { useEffect, useState } from "react";

function WaitingScreen() {
  const [progress, setProgress] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down near the end (feels realistic)
        if (prev >= 90) return prev;
        return prev + Math.random() * 4;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-zinc-950 to-black text-white">
      <div className="w-full max-w-md px-6">
        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          FeesTracker
        </h1>

        <p className="mt-2 text-center text-sm text-white/60">
          Booting servers on Render
        </p>

        {/* Progress bar */}
        <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <p className="mt-4 text-center text-xs text-white/50 animate-pulse">
          This may take up to a minute on first load
        </p>
      </div>
    </div>
  );
}

export default WaitingScreen;
