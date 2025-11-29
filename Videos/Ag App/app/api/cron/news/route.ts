import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

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

export async function GET() {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 }
      );
    }
    if (!NEWS_API_KEY) {
      return NextResponse.json({ error: "Missing NEWS_API_KEY" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    const articles = await fetchNews();
    const rows = articles.map(toRow);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No news rows to insert" }, { status: 500 });
    }

    const { error } = await supabase.from("news_stories").insert(rows);
    if (error) {
      return NextResponse.json(
        { error: `Supabase insert failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err: any) {
    console.error("cron news error:", err);
    return NextResponse.json({ error: err.message ?? "error" }, { status: 500 });
  }
}
