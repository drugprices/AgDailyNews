"use client";

import { useEffect, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { StatLabel } from "@/components/StatLabel";
import { useUser } from "@/lib/user-context";

type MarketItem = {
  instrument: string;
  current_price: number;
  change_absolute: number;
  change_percent: number;
  day_high: number;
  day_low: number;
  reason_label?: string | null;
};

export default function MarketsPage() {
  const { user, isGuest } = useUser();

  const selected = user?.preferences.selected_markets ?? [];

  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // If you later want per-instrument query, you can pass ?instruments=CORN,SOYBEANS...
        const res = await fetch("/api/markets");
        if (!res.ok) {
          throw new Error("Failed to load markets");
        }
        const body = await res.json();

        // Support both { markets: [...] } and plain [...] shapes
        const list: any[] = Array.isArray(body)
          ? body
          : Array.isArray(body.markets)
            ? body.markets
            : [];

        setMarkets(
          list.map((m) => ({
            instrument: m.instrument,
            current_price: Number(m.current_price),
            change_absolute: Number(m.change_absolute),
            change_percent: Number(m.change_percent),
            day_high: Number(m.day_high),
            day_low: Number(m.day_low),
            reason_label: m.reason_label ?? null
          }))
        );
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const marketsToShow =
    selected.length > 0
      ? markets.filter((m) => selected.includes(m.instrument))
      : markets;

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Markets</h1>
        <div className="card text-sm text-textMuted">
          Loading today&apos;s markets…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Markets</h1>
        <div className="card text-sm text-textMuted">
          Could not load markets. Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Markets</h1>

      {isGuest && (
        <div className="card mb-4 text-xs text-textMuted">
          You are in guest mode.{" "}
          <span className="font-medium text-textPrimary">
            Create an account later to save your farm location and markets.
          </span>
        </div>
      )}

      <div className="space-y-3">
        {marketsToShow.map((m) => {
          const positive = m.change_absolute >= 0;
          return (
            <div key={m.instrument} className="card">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm font-semibold">{m.instrument}</div>
                <div className="text-xs text-textMuted">
                  Tap for chart (future)
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {m.current_price.toFixed(2)} ¢/bu
              </div>
              <div
                className={`text-sm font-medium mb-1 ${positive ? "text-accentGreen" : "text-accentRed"
                  }`}
              >
                {positive ? "+" : ""}
                {m.change_absolute.toFixed(2)} ({positive ? "+" : ""}
                {m.change_percent.toFixed(2)}%)
              </div>
              {m.reason_label && (
                <div className="text-sm text-textMuted mb-2">
                  {m.reason_label}
                </div>
              )}
              <StatLabel
                label="Day high/low"
                value={`H ${m.day_high.toFixed(2)} · L ${m.day_low.toFixed(
                  2
                )}`}
              />
              <div className="mt-1 text-xs text-textMuted">
                Charts and more details will be added in a later version.
              </div>
            </div>
          );
        })}

        {marketsToShow.length === 0 && (
          <div className="card text-sm text-textMuted">
            You have no markets selected or no data loaded. Go to Settings and
            choose your markets.
          </div>
        )}
      </div>

      <AdSlot position="markets-mid" />
    </div>
  );
}
