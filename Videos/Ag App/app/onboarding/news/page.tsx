"use client";

import { useRouter } from "next/navigation";
import { useUser, defaultPreferences } from "@/lib/user-context";
import { useState } from "react";

export default function OnboardingNewsPage() {
  const router = useRouter();
  const { completeOnboarding, user } = useUser();

  const [weatherImpacts, setWeatherImpacts] = useState(
    user?.preferences.news_preferences.weather_impacts ??
      defaultPreferences.news_preferences.weather_impacts
  );
  const [policyUsda, setPolicyUsda] = useState(
    user?.preferences.news_preferences.policy_usda ??
      defaultPreferences.news_preferences.policy_usda
  );
  const [techInputs, setTechInputs] = useState(
    user?.preferences.news_preferences.tech_inputs ??
      defaultPreferences.news_preferences.tech_inputs
  );

  const handleFinish = () => {
    completeOnboarding({
      news_preferences: {
        markets_prices: true,
        weather_impacts: weatherImpacts,
        policy_usda: policyUsda,
        tech_inputs: techInputs
      }
    } as any);
    router.push("/onboarding/done");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">News topics</h1>
      <p className="text-sm text-textMuted mb-4">What matters most to you?</p>

      <div className="card mb-4 space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked disabled className="h-4 w-4" />
          <span>Markets & prices (always on)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={weatherImpacts}
            onChange={() => setWeatherImpacts((v) => !v)}
            className="h-4 w-4"
          />
          <span>Weather impacts</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={policyUsda}
            onChange={() => setPolicyUsda((v) => !v)}
            className="h-4 w-4"
          />
          <span>Policy / USDA</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={techInputs}
            onChange={() => setTechInputs((v) => !v)}
            className="h-4 w-4"
          />
          <span>Tech / inputs</span>
        </label>
      </div>

      <button
        onClick={handleFinish}
        className="mt-4 w-full rounded-lg bg-ctaBlue px-4 py-2 text-sm font-semibold text-white"
      >
        Finish setup
      </button>
    </div>
  );
}
