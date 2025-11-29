"use client";

import { AdSlot } from "@/components/AdSlot";
import { mockWeatherToday, mockWeatherForecast } from "@/lib/mockData";
import { useUser } from "@/lib/user-context";

export default function WeatherPage() {
  const { user } = useUser();
  const location =
    user?.preferences.location ?? {
      country: "USA",
      state_region: "Iowa",
      nearest_town: "Des Moines"
    };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Weather</h1>
      <p className="text-xs text-textMuted mb-4">
        Location: {location.country}, {location.state_region}, {location.nearest_town}
      </p>

      <div className="card mb-4">
        <div className="text-sm text-textMuted mb-1">Today · {mockWeatherToday.date}</div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-3xl">
            🌤 {mockWeatherToday.temp_high}° / {mockWeatherToday.temp_low}°
          </div>
          <div className="text-sm text-right">
            <div>Rain: {mockWeatherToday.precipitation_chance}%</div>
            <div>Wind: {mockWeatherToday.wind_speed} mph</div>
          </div>
        </div>
        <div className="text-sm mb-2">
          {mockWeatherToday.risk_flags.length === 0 ? (
            <span>✅ No major risks today.</span>
          ) : (
            <span>Risk: {mockWeatherToday.risk_flags.join(", ")}</span>
          )}
        </div>
        <div className="text-sm text-textMuted">
          {mockWeatherToday.summary_sentence}
        </div>
      </div>

      <div className="mb-2 section-title">Next 7 days</div>
      <div className="card overflow-x-auto">
        <div className="flex gap-4">
          {mockWeatherForecast.map((d) => (
            <div key={d.date} className="min-w-[60px] text-center">
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
