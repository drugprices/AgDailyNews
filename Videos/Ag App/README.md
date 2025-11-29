# Ag Daily

Mobile-first Next.js app for daily markets, weather, and farm news in under a minute.

This project is wired with:

- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- A simple local user context (guest mode)
- Mock APIs for markets, weather, news, and today digest

You can connect Supabase, Stripe, and real data sources on top of this skeleton.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open http://localhost:3000 in your browser.

## Next steps for you

- Connect Supabase auth and replace the local `UserProvider` with real user data.
- Implement database tables for profiles, market_snapshots, weather_snapshots, news_stories, and today_digests.
- Replace the mock API handlers in `app/api/*/route.ts` with real queries.
- Integrate Stripe for the no-ads subscription and Google AdSense (or equivalent) in `components/AdSlot.tsx`.
