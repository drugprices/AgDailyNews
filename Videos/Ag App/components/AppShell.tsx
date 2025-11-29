"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { href: "/markets", label: "Markets", icon: "⚡" },
  { href: "/weather", label: "Weather", icon: "☁️" },
  { href: "/news", label: "News", icon: "📰" },
  { href: "/settings", label: "Settings", icon: "⚙️" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showTabs = pathname !== "/" && !pathname.startsWith("/onboarding");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-20 bg-background border-b border-gray-200">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-semibold">🌾 Ag Daily</span>
          <span className="text-xs text-textMuted">Under a minute.</span>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-md px-4 py-4 pb-20">
        {children}
      </main>

      {showTabs && (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-card">
          <div className="mx-auto flex max-w-md items-center justify-around py-2">
            {tabs.map((tab) => {
              const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-col items-center text-xs ${
                    active ? "text-ctaBlue font-semibold" : "text-textMuted"
                  }`}
                >
                  <span className="text-lg mb-0.5">{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
