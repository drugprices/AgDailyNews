"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { FormEvent, useState } from "react";

export default function OnboardingLocationPage() {
  const router = useRouter();
  const { completeOnboarding, user } = useUser();

  const [country, setCountry] = useState(user?.preferences.location.country ?? "USA");
  const [stateRegion, setStateRegion] = useState(
    user?.preferences.location.state_region ?? "Iowa"
  );
  const [town, setTown] = useState(user?.preferences.location.nearest_town ?? "Des Moines");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    completeOnboarding({
      location: {
        country,
        state_region: stateRegion,
        nearest_town: town
      }
    } as any);
    router.push("/onboarding/markets");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Set location</h1>
      <p className="text-sm text-textMuted mb-4">
        Where&apos;s your farm? We use this for weather forecasts.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-textMuted mb-1">Country</label>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-textMuted mb-1">State / Region</label>
          <input
            value={stateRegion}
            onChange={(e) => setStateRegion(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-textMuted mb-1">Nearest town</label>
          <input
            value={town}
            onChange={(e) => setTown(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-ctaBlue px-4 py-2 text-sm font-semibold text-white"
        >
          Next
        </button>
      </form>
    </div>
  );
}
