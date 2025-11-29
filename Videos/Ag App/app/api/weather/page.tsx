"use client";

import { useEffect, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { useUser } from "@/lib/user-context";

export interface WeatherToday {
  date: string;
  temp_high: number;
  temp_low: number;
  precipitation_chance: number;
  wind_speed: number;
  risk_flags: string[];
  summary_sentence: string;
}

export interface WeatherForecastDay {
  date: string;
  temp_high: number;
  temp_low: number;
  precipitation_chance: number;
  conditions: string;
}

export default function WeatherPage() {
  const { user } = useUser();
  const location = user?.preferences.location;

  const [today, setToday] = useState<WeatherToday | null>(null);
  const [forecast, setForecast] = useState<WeatherForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/weather");
        if (!res.ok) {
          throw new Error("Failed to load weather");
        }

        const data = await res.json();
        setToday(data.today);
        setForecast(data.forecast || []);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Weather</h1>
        <p className="text-xs text-textMuted mb-4">
          Location: {location.country}, {location.state_region},{" "}
          {location.nearest_town}
        </p>
        <div className="card mb-4 text-sm text-textMuted">
          Loading today&apos;s weather…
        </div>
      </div>
    );
  }

  if (error || !today) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Weather</h1>
        <p className="text-xs text-textMuted mb-4">
          Location: {location.country}, {location.state_region},{" "}
          {location.nearest_town}
        </p>
        <div className="card mb-4 text-sm text-textMuted">
          Could not load weather data.
          <br />
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Weather</h1>
      <p className="text-xs text-textMuted mb-4">
        Location: {location.country}, {location.state_region},{" "}
        {location.nearest_town}
      </p>

      <div className="card mb-4">
        <div className="text-sm text-textMuted mb-1">Today · {today.date}</div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-3xl">
            🌤 {today.temp_high}° / {today.temp_low}°
          </div>
          <div className="text-sm text-right">
            <div>Rain: {today.precipitation_chance}%</div>
            <div>Wind: {today.wind_speed} mph</div>
          </div>
        </div>

        <div className="text-sm mb-2">
          {today.risk_flags.length === 0 ? (
            <span>✅ No major risks today.</span>
          ) : (
            <span>Risk: {today.risk_flags.join(", ")}</span>
          )}
        </div>

        <div className="text-sm text-textMuted">
          {today.summary_sentence}
        </div>
      </div>

      <div className="mb-2 section-title">Next 7 days</div>
      <div className="card overflow-x-auto">
        <div className="flex gap-4">
          {forecast.map((d) => (
            <div key={d.date} className="min-w-[70px] text-center">
              <div className="text-sm font-medium mb-1">{d.date}</div>
              <div className="text-sm mb-1">
                {d.temp_high}° / {d.temp_low}°
              </div>
              <div className="text-2xl mb-1">
                {d.conditions.includes("Rain")
                  ? "🌧"
                  : d.conditions.includes("Cloud")
                  ? "☁️"
                  : "🌤"}
              </div>
              <div className="text-xs text-textMuted">
                {d.precipitation_chance}% rain
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdSlot position="weather-bottom" />
    </div>
  );
}
