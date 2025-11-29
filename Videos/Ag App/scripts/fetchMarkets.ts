// scripts/fetchMarkets.ts
// Simple Alpha Vantage ingestion for latest quotes.

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MARKETS_API_KEY = process.env.MARKETS_API_KEY;

if (!SUPABASE_URL) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY (required for inserts with RLS)");
  process.exit(1);
}
if (!MARKETS_API_KEY) {
  console.error("Missing MARKETS_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Map app instruments to Alpha Vantage symbols (ETFs as proxies)
const INSTRUMENTS: Record<string, string> = {
  CORN: "CORN", // Teucrium Corn Fund
  SOYBEANS: "SOYB", // Teucrium Soybean Fund
  WHEAT: "WEAT" // Teucrium Wheat Fund
  // Add more mappings as needed
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

async function run() {
  console.log("Markets ingestion starting (Alpha Vantage)");
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
      console.log(`Fetched ${instrument} (${avSymbol})`);
    } catch (err: any) {
      console.error(`Failed to fetch ${instrument}:`, err.message);
    }
  }

  if (rows.length === 0) {
    throw new Error("No quotes fetched; aborting insert");
  }

  const { error } = await supabase.from("market_snapshots").insert(rows);
  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  console.log(`Inserted ${rows.length} market snapshots`);
}

run().catch((err) => {
  console.error("Markets ingestion failed:", err.message);
  process.exit(1);
});
