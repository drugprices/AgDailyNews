"use client";

import { mockNews } from "@/lib/mockData";
import { AdSlot } from "@/components/AdSlot";
import { useUser } from "@/lib/user-context";

export default function NewsPage() {
  const { user } = useUser();

  const prefs = user?.preferences.news_preferences;

  // Build a set of allowed tags based on preferences
  const allowedTags = new Set<string>();

  // Markets & prices is always on
  allowedTags.add("markets");

  if (prefs?.weather_impacts) {
    allowedTags.add("weather_impact");
  }
  if (prefs?.policy_usda) {
    allowedTags.add("usda");
  }
  if (prefs?.tech_inputs) {
    allowedTags.add("tech");
  }

  const storiesToShow = mockNews.filter((story) =>
    story.tags.some((tag) => allowedTags.has(tag))
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">News</h1>
      <p className="text-xs text-textMuted mb-4">
        Today&apos;s key stories for you, based on your news topics in Settings.
      </p>

      <div className="space-y-3 mb-4">
        {storiesToShow.map((story) => (
          <article key={story.id} className="card">
            <h2 className="text-base font-semibold mb-1">{story.headline}</h2>
            <div className="text-xs text-textMuted mb-2">
              {story.source} ·{" "}
              {new Date(story.published_at).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
            <ul className="text-sm mb-3 list-disc ml-5 space-y-1">
              {story.summary_bullets.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
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

        {storiesToShow.length === 0 && (
          <div className="card text-sm text-textMuted">
            No stories match your current news topics. Try enabling more topics in Settings.
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
