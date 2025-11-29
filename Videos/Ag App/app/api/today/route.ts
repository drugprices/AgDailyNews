import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { mockMarkets, mockWeatherToday, mockWeatherForecast, mockNews } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const todayDate = new Date().toISOString().slice(0, 10);

    // Markets: latest snapshot per instrument
    const { data: marketRows, error: marketsError } = await supabase
      .from("market_snapshots")
      .select("instrument,date,current_price,change_absolute,change_percent,day_high,day_low,reason_label,fetched_at")
      .order("fetched_at", { ascending: false })
      .order("date", { ascending: false });

    const markets = !marketsError && marketRows
      ? Object.values(
          marketRows.reduce((acc: Record<string, any>, row) => {
            if (!acc[row.instrument]) acc[row.instrument] = row;
            return acc;
          }, {})
        ).map((row: any) => ({
          instrument: row.instrument,
          current_price: Number(row.current_price),
          change_absolute: Number(row.change_absolute),
          change_percent: Number(row.change_percent),
          day_high: Number(row.day_high ?? row.current_price),
          day_low: Number(row.day_low ?? row.current_price),
          reason_label: row.reason_label ?? null
        }))
      : mockMarkets;

    // Weather: latest snapshot for default location
    const { data: weatherRows, error: weatherError } = await supabase
      .from("weather_snapshots")
      .select(
        "date,temp_high,temp_low,precipitation_chance,precipitation_amount,wind_speed,conditions,risk_flags,summary_sentence,forecast,fetched_at"
      )
      .eq("location_key", "default")
      .order("fetched_at", { ascending: false })
      .order("date", { ascending: false })
      .limit(1);

    const weatherToday =
      !weatherError && weatherRows && weatherRows.length > 0
        ? {
            date: weatherRows[0].date,
            temp_high: Number(weatherRows[0].temp_high),
            temp_low: Number(weatherRows[0].temp_low),
            precipitation_chance: Number(weatherRows[0].precipitation_chance),
            wind_speed: Number(weatherRows[0].wind_speed),
            risk_flags: weatherRows[0].risk_flags ?? [],
            summary_sentence: weatherRows[0].summary_sentence ?? ""
          }
        : mockWeatherToday;

    const weatherForecast =
      !weatherError && weatherRows && weatherRows.length > 0 && Array.isArray(weatherRows[0].forecast)
        ? weatherRows[0].forecast.map((d: any) => ({
            date: d.date,
            temp_high: Number(d.temp_high),
            temp_low: Number(d.temp_low),
            precipitation_chance: Number(d.precipitation_chance),
            conditions: d.conditions
          }))
        : mockWeatherForecast;

    // News: latest 5 by published_at, priority_score desc first
    const { data: newsRows, error: newsError } = await supabase
      .from("news_stories")
      .select("id,headline,source,published_at,url,summary_bullets,tags,relevance_to_markets,priority_score")
      .order("priority_score", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(5);

    const topStories =
      !newsError && newsRows
        ? newsRows.map((n: any) => ({
            id: n.id,
            headline: n.headline,
            source: n.source ?? "Unknown source",
            published_at: n.published_at,
            url: n.url,
            summary_bullets: n.summary_bullets ?? [],
            tags: n.tags ?? [],
            relevance_to_markets: n.relevance_to_markets ?? [],
            priority_score: n.priority_score ?? 5
          }))
        : mockNews.slice(0, 5);

    return NextResponse.json({
      date: todayDate,
      markets_snapshot: markets,
      weather: {
        today: weatherToday,
        forecast: weatherForecast,
        summary_sentence: weatherToday.summary_sentence
      },
      top_stories: topStories
    });
  } catch (err) {
    console.error("Unexpected /api/today error:", err);
    return NextResponse.json({
      date: new Date().toISOString().slice(0, 10),
      markets_snapshot: mockMarkets,
      weather: {
        today: mockWeatherToday,
        forecast: mockWeatherForecast,
        summary_sentence: mockWeatherToday.summary_sentence
      },
      top_stories: mockNews.slice(0, 3)
    });
  }
}
