"use client";

import { useRouter } from "next/navigation";
import { useUser, defaultPreferences } from "@/lib/user-context";
import { useState } from "react";

const ALL_MARKETS = [
  "CORN",
  "SOYBEANS",
  "WHEAT",
  "COTTON",
  "LIVE_CATTLE",
  "FEEDER_CATTLE",
  "LEAN_HOGS"
];

export default function OnboardingMarketsPage() {
  const router = useRouter();
  const { completeOnboarding, user } = useUser();
  const [selected, setSelected] = useState<string[]>(
    user?.preferences.selected_markets ?? defaultPreferences.selected_markets
  );

  const toggle = (m: string) => {
    setSelected((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const handleNext = () => {
    completeOnboarding({ selected_markets: selected });
    router.push("/onboarding/news");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your markets</h1>
      <p className="text-sm text-textMuted mb-4">
        What do you grow or trade? This tailors the daily digest to you.
      </p>

      <div className="card mb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {ALL_MARKETS.map((m) => {
            const checked = selected.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggle(m)}
                className={`rounded border px-2 py-1 text-left ${
                  checked
                    ? "border-ctaBlue bg-blue-50 text-ctaBlue"
                    : "border-gray-300 text-textPrimary"
                }`}
              >
                {checked ? "✓ " : "○ "}
                {m.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="mt-4 w-full rounded-lg bg-ctaBlue px-4 py-2 text-sm font-semibold text-white"
      >
        Next
      </button>
    </div>
  );
}
