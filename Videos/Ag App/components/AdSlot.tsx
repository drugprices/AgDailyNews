"use client";

import { useUser } from "@/lib/user-context";

interface AdSlotProps {
  position: string;
}

export function AdSlot({ position }: AdSlotProps) {
  const { user } = useUser();

  if (user?.plan === "no_ads") {
    return null;
  }

  return (
    <div className="card mt-4 flex flex-col items-start gap-1" aria-label="Advertisement">
      <span className="ad-label">Ad</span>
      <div className="text-sm text-textMuted">
        Placeholder ad slot ({position}). Integrate Google AdSense or your ad server here.
      </div>
    </div>
  );
}
