import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { UserProvider } from "@/lib/user-context";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Ag Daily",
  description: "Daily markets, weather, and farm news in under a minute."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-textPrimary">
        <UserProvider>
          <AppShell>{children}</AppShell>
        </UserProvider>
      </body>
    </html>
  );
}
