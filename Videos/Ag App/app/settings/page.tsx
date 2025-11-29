"use client";

import { useUser, defaultPreferences } from "@/lib/user-context";
import { FormEvent, useState } from "react";

export default function SettingsPage() {
  const { user, isGuest, signOut, completeOnboarding, loading } = useUser();
  const [prefs, setPrefs] = useState(user?.preferences ?? defaultPreferences);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const planLabel = user?.plan === "no_ads" ? "No ads" : "Free (ads on)";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(null);
    try {
      // This updates context + Supabase profile (if logged in)
      completeOnboarding(prefs);
      setSavedMessage("Preferences saved.");
    } finally {
      setSaving(false);
    }
  };

  const toggleMarket = (instrument: string) => {
    setPrefs((prev) => {
      const exists = prev.selected_markets.includes(instrument);
      return {
        ...prev,
        selected_markets: exists
          ? prev.selected_markets.filter((m) => m !== instrument)
          : [...prev.selected_markets, instrument]
      };
    });
  };

  const toggleNews = (key: keyof typeof prefs.news_preferences) => {
    if (key === "markets_prices") return;
    setPrefs((prev) => ({
      ...prev,
      news_preferences: {
        ...prev.news_preferences,
        [key]: !prev.news_preferences[key]
      }
    }));
  };

  const handleUpgrade = () => {
    // For now just flip plan in memory; Stripe integration later.
    if (!user) return;
    // In a real app you would call Stripe here.
    completeOnboarding(prefs); // keep prefs synced
  };

  if (loading) {
    return <div>Loading settings…</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <section className="card mb-4">
        <h2 className="section-title">Account</h2>
        <div className="text-sm mb-3">
          {user?.email ?? "Guest user"}{" "}
          {user?.email ? "" : "(preferences saved only on this device)"}
        </div>
        {isGuest ? (
          <a
            href="/auth"
            className="inline-flex items-center justify-center rounded-lg bg-ctaBlue px-4 py-2 text-sm font-semibold text-white"
          >
            Log in / Sign up
          </a>
        ) : (
          <button
            type="button"
            onClick={() => {
              void signOut();
            }}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
          >
            Log out
          </button>
        )}
      </section>

      <section className="card mb-4">
        <h2 className="section-title">Subscription</h2>
        <div className="text-sm mb-3">
          <span className="font-semibold">{planLabel}</span>
          {user?.plan === "free" ? (
            <span className="text-textMuted">
              {" "}
              · Ag Daily is free with light ads. Prefer a cleaner screen? Go ad-free for €7.99 per
              month.
            </span>
          ) : (
            <span className="text-textMuted">
              {" "}
              · No ads · Same data, cleaner view. Renews monthly (mocked locally).
            </span>
          )}
        </div>
        {user?.plan === "free" ? (
          <button
            type="button"
            onClick={handleUpgrade}
            className="mt-1 inline-flex items-center justify-center rounded-lg bg-ctaBlue px-4 py-2 text-sm font-semibold text-white"
          >
            Upgrade to No Ads (placeholder)
          </button>
        ) : (
          <button
            type="button"
            className="mt-1 inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
          >
            Manage subscription (placeholder)
          </button>
        )}
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="card">
          <h2 className="section-title">Location</h2>
          <div className="space-y-2 text-sm">
            <div>
              <label className="block text-textMuted text-xs mb-1">Country</label>
              <input
                type="text"
                value={prefs.location.country}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    location: { ...p.location, country: e.target.value }
                  }))
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-textMuted text-xs mb-1">State / Region</label>
              <input
                type="text"
                value={prefs.location.state_region}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    location: { ...p.location, state_region: e.target.value }
                  }))
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-textMuted text-xs mb-1">Nearest town</label>
              <input
                type="text"
                value={prefs.location.nearest_town}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    location: { ...p.location, nearest_town: e.target.value }
                  }))
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Your markets</h2>
          <p className="text-xs text-textMuted mb-2">Select all that apply.</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {["CORN", "SOYBEANS", "WHEAT", "COTTON", "LIVE_CATTLE", "FEEDER_CATTLE", "LEAN_HOGS"].map(
              (m) => {
                const checked = prefs.selected_markets.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMarket(m)}
                    className={`rounded border px-2 py-1 text-left ${checked
                        ? "border-ctaBlue bg-blue-50 text-ctaBlue"
                        : "border-gray-300 text-textPrimary"
                      }`}
                  >
                    {checked ? "✓ " : "○ "}
                    {m.replace("_", " ")}
                  </button>
                );
              }
            )}
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">News topics</h2>
          <div className="space-y-1 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked disabled className="h-4 w-4" />
              <span>Markets & prices (always on)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.news_preferences.weather_impacts}
                onChange={() => toggleNews("weather_impacts")}
                className="h-4 w-4"
              />
              <span>Weather impacts</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.news_preferences.policy_usda}
                onChange={() => toggleNews("policy_usda")}
                className="h-4 w-4"
              />
              <span>Policy / USDA</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.news_preferences.tech_inputs}
                onChange={() => toggleNews("tech_inputs")}
                className="h-4 w-4"
              />
              <span>Tech / inputs</span>
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="mb-2 inline-flex items-center justify-center rounded-lg bg-ctaBlue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>

        {savedMessage && (
          <p className="text-xs text-textMuted mb-16">{savedMessage}</p>
        )}
      </form>
    </div>
  );
}
