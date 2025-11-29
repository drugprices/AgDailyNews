"use client";

import { useEffect, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { useUser } from "@/lib/user-context";

type NewsStory = {
    id: string;
    headline: string;
    source: string;
    published_at: string;
    url: string;
    summary_bullets: string[];
    tags: string[];
};

export default function NewsPage() {
    const { user } = useUser();
    const prefs = user?.preferences.news_preferences;

    const [stories, setStories] = useState<NewsStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Build allowed tags from preferences
    const allowedTags = new Set<string>();
    allowedTags.add("markets"); // always on

    if (prefs?.weather_impacts) allowedTags.add("weather_impact");
    if (prefs?.policy_usda) allowedTags.add("usda");
    if (prefs?.tech_inputs) allowedTags.add("tech");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                // Later you can add query params like ?tags=markets,usda
                const res = await fetch("/api/news");
                if (!res.ok) {
                    throw new Error("Failed to load news");
                }

                const body = await res.json();
                const list: any[] = Array.isArray(body)
                    ? body
                    : Array.isArray(body.stories)
                        ? body.stories
                        : [];

                setStories(
                    list.map((s) => ({
                        id: s.id ?? s.url ?? s.headline,
                        headline: s.headline,
                        source: s.source ?? "Unknown source",
                        published_at: s.published_at,
                        url: s.url,
                        summary_bullets: s.summary_bullets ?? [],
                        tags: s.tags ?? []
                    }))
                );
            } catch (err: any) {
                setError(err.message ?? "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const filteredStories = stories.filter((story) =>
        story.tags.some((tag) => allowedTags.has(tag))
    );

    if (loading) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-2">News</h1>
                <p className="text-xs text-textMuted mb-4">
                    Today&apos;s key stories for you.
                </p>
                <div className="card text-sm text-textMuted">
                    Loading news…
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-2">News</h1>
                <p className="text-xs text-textMuted mb-4">
                    Today&apos;s key stories for you.
                </p>
                <div className="card text-sm text-textMuted">
                    Could not load news. Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-2">News</h1>
            <p className="text-xs text-textMuted mb-4">
                Today&apos;s key stories for you, based on your news topics in Settings.
            </p>

            <div className="space-y-3 mb-4">
                {filteredStories.map((story) => (
                    <article key={story.id} className="card">
                        <h2 className="text-base font-semibold mb-1">{story.headline}</h2>
                        <div className="text-xs text-textMuted mb-2">
                            {story.source} ·{" "}
                            {new Date(story.published_at).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </div>
                        {story.summary_bullets.length > 0 && (
                            <ul className="text-sm mb-3 list-disc ml-5 space-y-1">
                                {story.summary_bullets.map((b, idx) => (
                                    <li key={idx}>{b}</li>
                                ))}
                            </ul>
                        )}
                        <a
                            href={story.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-ctaBlue font-medium"
                        >
                            Read more →
                        </a>
                    </article>
                ))}

                {filteredStories.length === 0 && (
                    <div className="card text-sm text-textMuted">
                        No stories match your current news topics. Try enabling more topics
                        in Settings.
                    </div>
                )}
            </div>

            <AdSlot position="news-mid" />

            <div className="mt-4 card">
                <div className="section-title mb-1">More news (examples)</div>
                <ul className="text-sm list-disc ml-5 space-y-1 text-ctaBlue">
                    <li>Cattle futures edge higher on packer demand</li>
                    <li>Wheat export sales improve week-over-week</li>
                    <li>China books additional U.S. soybean cargoes</li>
                    <li>Input costs stable heading into planting season</li>
                </ul>
            </div>
        </div>
    );
}
