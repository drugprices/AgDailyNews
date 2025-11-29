// scripts/fetchNews.ts
// Simple NewsAPI ingestion for ag/markets topics.

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!SUPABASE_URL) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY (required for inserts with RLS)");
  process.exit(1);
}
if (!NEWS_API_KEY) {
  console.error("Missing NEWS_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Keywords tuned for ag/markets; adjust as needed
const QUERY = "agriculture OR grain OR corn OR soybeans OR wheat OR USDA";

async function fetchNews() {
  const url =
    "https://newsapi.org/v2/everything" +
    `?q=${encodeURIComponent(QUERY)}` +
    "&language=en" +
    "&sortBy=publishedAt" +
    "&pageSize=30";

  const res = await fetch(url, {
    headers: { "X-Api-Key": NEWS_API_KEY as string }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NewsAPI error: ${res.status} ${res.statusText} - ${text}`);
  }
  const json = await res.json();
  if (!json.articles) {
    throw new Error("NewsAPI response missing articles");
  }
  return json.articles as any[];
}

function toRow(article: any) {
  return {
    headline: article.title,
    source: article.source?.name ?? "Unknown source",
    published_at: article.publishedAt,
    url: article.url,
    summary_bullets: [] as string[],
    full_text: null,
    tags: [],
    relevance_to_markets: [],
    priority_score: 5,
    fetched_at: new Date().toISOString()
  };
}

async function run() {
  console.log("News ingestion starting (NewsAPI)");
  const articles = await fetchNews();
  const rows = articles.map(toRow);

  if (rows.length === 0) {
    throw new Error("No news rows to insert");
  }

  const { error } = await supabase.from("news_stories").insert(rows);
  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  console.log(`Inserted ${rows.length} news stories`);
}

run().catch((err) => {
  console.error("News ingestion failed:", err.message);
  process.exit(1);
});
