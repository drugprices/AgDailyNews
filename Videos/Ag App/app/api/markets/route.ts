import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { mockMarkets } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const instrumentsParam = url.searchParams.get("instruments");
    const instruments = instrumentsParam
      ? instrumentsParam.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

    let query = supabase
      .from("market_snapshots")
      .select("instrument,date,current_price,change_absolute,change_percent,day_high,day_low,reason_label,fetched_at")
      .order("fetched_at", { ascending: false })
      .order("date", { ascending: false });

    if (instruments && instruments.length > 0) {
      query = query.in("instrument", instruments);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase market_snapshots error:", error);
      // Fall back to mock data if Supabase fails
      return NextResponse.json(
        { markets: mockMarkets },
        { status: 200 }
      );
    }

    if (!data || data.length === 0) {
      // No rows yet → still return mock data so the UI is not empty
      return NextResponse.json(
        { markets: mockMarkets },
        { status: 200 }
      );
    }

    // Pick the latest row per instrument
    const latestByInstrument: Record<string, any> = {};
    for (const row of data) {
      if (!latestByInstrument[row.instrument]) {
        latestByInstrument[row.instrument] = row;
      }
    }

    const markets = Object.values(latestByInstrument).map((row: any) => ({
      instrument: row.instrument,
      current_price: Number(row.current_price),
      change_absolute: Number(row.change_absolute),
      change_percent: Number(row.change_percent),
      day_high: Number(row.day_high ?? row.current_price),
      day_low: Number(row.day_low ?? row.current_price),
      reason_label: row.reason_label ?? null
    }));

    return NextResponse.json({ markets }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected /api/markets error:", err);
    return NextResponse.json(
      { markets: mockMarkets },
      { status: 200 }
    );
  }
}
