import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { mockNews } from "@/lib/mockData";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tagsParam = url.searchParams.get("tags");
    const tags = tagsParam
      ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean)
      : null;

    let query = supabase
      .from("news_stories")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(50);

    if (tags && tags.length > 0) {
      // filter rows that have any of the given tags
      query = query.contains("tags", tags);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase news_stories error:", error);
      // Fallback to mock data if Supabase fails
      return NextResponse.json(
        { stories: mockNews },
        { status: 200 }
      );
    }

    if (!data || data.length === 0) {
      // No rows yet → fallback to mock
      return NextResponse.json(
        { stories: mockNews },
        { status: 200 }
      );
    }

    const stories = data.map((row: any) => ({
      id: row.id,
      headline: row.headline,
      source: row.source ?? "Unknown source",
      published_at: row.published_at,
      url: row.url,
      summary_bullets: row.summary_bullets ?? [],
      tags: row.tags ?? [],
      relevance_to_markets: row.relevance_to_markets ?? [],
      priority_score: row.priority_score ?? 5
    }));

    return NextResponse.json({ stories }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected /api/news error:", err);
    return NextResponse.json(
      { stories: mockNews },
      { status: 200 }
    );
  }
}
