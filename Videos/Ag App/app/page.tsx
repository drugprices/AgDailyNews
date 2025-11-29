"use client";

import Link from "next/link";
import { useUser } from "@/lib/user-context";

export default function HomePage() {
  const { user, isGuest } = useUser();

  const hasCompletedOnboarding = !!user?.preferences?.location?.country;

  const primaryHref = hasCompletedOnboarding ? "/markets" : "/onboarding/location";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
      <div className="card w-full max-w-sm">
        <div className="text-5xl mb-4">🌾</div>
        <h1 className="text-2xl font-bold mb-2">Ag Daily</h1>
        <p className="text-textMuted mb-6">
          Your daily markets, weather, and farm news in under a minute.
        </p>
        <p className="text-sm text-textMuted mb-6">
          Pick your crops, set your location, and see what matters today—free and simple.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={primaryHref}
            className="w-full py-2 rounded-lg bg-ctaBlue text-white font-semibold"
          >
            {hasCompletedOnboarding ? "Go to Markets" : "Create account / Start setup"}
          </Link>
          <Link
            href="/markets"
            className="w-full py-2 rounded-lg border border-gray-300 text-sm text-textPrimary"
          >
            Continue as guest
          </Link>
        </div>

        {isGuest && (
          <p className="mt-4 text-xs text-textMuted">
            Guest mode: your preferences will be stored only on this device.
          </p>
        )}
      </div>
    </div>
  );
}
