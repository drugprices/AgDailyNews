import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { mockWeatherToday, mockWeatherForecast } from "@/lib/mockData";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // Later: pick location_key based on lat/lng or user profile
    url.searchParams.get("lat");
    url.searchParams.get("lng");

    const locationKey = "default";

    const { data, error } = await supabase
      .from("weather_snapshots")
      .select(
        "date,temp_high,temp_low,precipitation_chance,precipitation_amount,wind_speed,conditions,risk_flags,summary_sentence,forecast,fetched_at"
      )
      .eq("location_key", locationKey)
      .order("fetched_at", { ascending: false })
      .order("date", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Supabase weather_snapshots error:", error);
      return NextResponse.json(
        { today: mockWeatherToday, forecast: mockWeatherForecast },
        { status: 200 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { today: mockWeatherToday, forecast: mockWeatherForecast },
        { status: 200 }
      );
    }

    const row = data[0];

    const today = {
      date: row.date,
      temp_high: Number(row.temp_high),
      temp_low: Number(row.temp_low),
      precipitation_chance: Number(row.precipitation_chance),
      wind_speed: Number(row.wind_speed),
      risk_flags: row.risk_flags ?? [],
      summary_sentence: row.summary_sentence ?? ""
    };

    const forecast = Array.isArray(row.forecast)
      ? row.forecast.map((d: any) => ({
          date: d.date,
          temp_high: Number(d.temp_high),
          temp_low: Number(d.temp_low),
          precipitation_chance: Number(d.precipitation_chance),
          conditions: d.conditions
        }))
      : mockWeatherForecast;

    return NextResponse.json(
      {
        today,
        forecast
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Unexpected /api/weather error:", err);
    return NextResponse.json(
      { today: mockWeatherToday, forecast: mockWeatherForecast },
      { status: 200 }
    );
  }
}
