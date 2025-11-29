// scripts/fetchWeather.ts

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env.local so secrets are available outside Next runtime
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local (needed for inserts under RLS)");
  process.exit(1);
}

// Service role key so we can insert with RLS enabled
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Fixed coordinates for MVP (Des Moines, Iowa)
const LAT = 41.5868;
const LNG = -93.625;

// Map Open-Meteo weather codes to a simple condition string
function mapWeatherCode(code: number): string {
  if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return "Rain";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([3].includes(code)) return "Cloudy";
  if ([2].includes(code)) return "Partly Cloudy";
  return "Clear";
}

async function fetchWeather(lat: number, lng: number) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lng}` +
    "&current_weather=true" +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weathercode" +
    "&forecast_days=7" +
    "&timezone=auto";

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Open-Meteo error: ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}

async function run() {
  console.log("Weather ingestion starting (Open-Meteo, fixed Des Moines coordinates)");

  const weather = await fetchWeather(LAT, LNG);

  const current = weather.current_weather;
  const daily = weather.daily;
  if (!current || !daily || !Array.isArray(daily.time) || daily.time.length === 0) {
    throw new Error("Unexpected Open-Meteo response shape (no current/daily data)");
  }

  const todayDaily = {
    date: daily.time[0],
    temp_max: daily.temperature_2m_max?.[0],
    temp_min: daily.temperature_2m_min?.[0],
    precip_prob: daily.precipitation_probability_max?.[0],
    precip_sum: daily.precipitation_sum?.[0],
    weathercode: daily.weathercode?.[0]
  };

  const row = {
    location_key: "default",
    date: todayDaily.date,
    temp_high: Math.round(todayDaily.temp_max ?? 0),
    temp_low: Math.round(todayDaily.temp_min ?? 0),
    precipitation_chance: Math.round(todayDaily.precip_prob ?? 0),
    precipitation_amount: todayDaily.precip_sum ?? 0,
    wind_speed: Math.round(current.windspeed ?? 0),
    conditions: mapWeatherCode(todayDaily.weathercode ?? current.weathercode ?? 0),
    risk_flags: [] as string[],
    summary_sentence:
      (todayDaily.precip_prob ?? 0) > 50
        ? "Rain likely today. Fieldwork may be delayed."
        : "Good conditions for fieldwork today.",
    forecast: daily.time.map((date: string, idx: number) => ({
      date,
      temp_high: Math.round(daily.temperature_2m_max?.[idx] ?? 0),
      temp_low: Math.round(daily.temperature_2m_min?.[idx] ?? 0),
      precipitation_chance: Math.round(daily.precipitation_probability_max?.[idx] ?? 0),
      conditions: mapWeatherCode(daily.weathercode?.[idx] ?? 0)
    }))
  };

  const { error } = await supabase.from("weather_snapshots").insert(row);
  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  console.log("Weather snapshot inserted successfully");
}

run().catch((err) => {
  console.error("Weather ingestion failed:", err.message);
  process.exit(1);
});
