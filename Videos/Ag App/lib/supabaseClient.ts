import { createClient } from "@supabase/supabase-js";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

console.log("DEBUG SUPABASE URL =", url);

if (!url) {
    throw new Error("ENV ERROR: NEXT_PUBLIC_SUPABASE_URL is undefined or empty");
}

if (!key) {
    throw new Error("ENV ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined or empty");
}

export const supabase = createClient(url, key);
