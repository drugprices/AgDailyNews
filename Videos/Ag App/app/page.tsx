"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    router.replace("/markets");
  }, [router, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Redirecting…</h1>
        <p className="text-textMuted">Taking you to today&apos;s markets.</p>
      </div>
    </div>
  );
}
