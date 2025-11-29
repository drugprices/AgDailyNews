import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MARKETS_API_KEY = process.env.MARKETS_API_KEY;

// Map app instruments to Alpha Vantage symbols (ETFs as proxies)
const INSTRUMENTS: Record<string, string> = {
  CORN: "CORN", // Teucrium Corn Fund
  SOYBEANS: "SOYB", // Teucrium Soybean Fund
  WHEAT: "WEAT" // Teucrium Wheat Fund
};

async function fetchQuote(symbol: string) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${MARKETS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AlphaVantage ${symbol} HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  const quote = json["Global Quote"];
  if (!quote || !quote["05. price"]) {
    throw new Error(`AlphaVantage ${symbol} missing quote payload`);
  }
  return {
    price: Number(quote["05. price"]),
    change: Number(quote["09. change"]),
    changePercent: Number((quote["10. change percent"] || "0%").replace("%", "")),
    dayHigh: Number(quote["03. high"] || quote["05. price"]),
    dayLow: Number(quote["04. low"] || quote["05. price"]),
    date: quote["07. latest trading day"]
  };
}

export async function GET() {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 }
      );
    }
    if (!MARKETS_API_KEY) {
      return NextResponse.json(
        { error: "Missing MARKETS_API_KEY" },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    const rows: any[] = [];
    for (const [instrument, avSymbol] of Object.entries(INSTRUMENTS)) {
      try {
        const q = await fetchQuote(avSymbol);
        rows.push({
          instrument,
          date: q.date,
          current_price: q.price,
          change_absolute: q.change,
          change_percent: q.changePercent,
          day_high: q.dayHigh,
          day_low: q.dayLow,
          fetched_at: new Date().toISOString()
        });
      } catch (err: any) {
        console.error(`Failed to fetch ${instrument}:`, err.message);
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "No quotes fetched" }, { status: 500 });
    }

    const { error } = await supabase.from("market_snapshots").insert(rows);
    if (error) {
      return NextResponse.json(
        { error: `Supabase insert failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err: any) {
    console.error("cron markets error:", err);
    return NextResponse.json({ error: err.message ?? "error" }, { status: 500 });
  }
}
