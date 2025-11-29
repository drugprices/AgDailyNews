"use client";

import Link from "next/link";

export default function OnboardingDonePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
      <div className="card w-full max-w-sm">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">All set!</h1>
        <p className="text-sm text-textMuted mb-4">
          Your daily digest is ready. Ag Daily is free with light ads. You can upgrade to remove
          them anytime in Settings.
        </p>
        <Link
          href="/markets"
          className="mt-2 block w-full rounded-lg bg-ctaBlue px-4 py-2 text-sm font-semibold text-white"
        >
          Go to Markets
        </Link>
      </div>
    </div>
  );
}
