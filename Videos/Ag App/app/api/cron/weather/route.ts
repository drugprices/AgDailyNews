import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const LAT = 41.5868;
const LNG = -93.625;

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

export async function GET() {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    const weather = await fetchWeather(LAT, LNG);

    const current = weather.current_weather;
    const daily = weather.daily;
    if (!current || !daily || !Array.isArray(daily.time) || daily.time.length === 0) {
      return NextResponse.json(
        { error: "Unexpected Open-Meteo response shape" },
        { status: 500 }
      );
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
      return NextResponse.json(
        { error: `Supabase insert failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("cron weather error:", err);
    return NextResponse.json({ error: err.message ?? "error" }, { status: 500 });
  }
}
