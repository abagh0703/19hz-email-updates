import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "HardstyleEvents - Weekly Hardstyle Event Alerts",
  description: "Get weekly hardstyle and hardcore event notifications delivered to your inbox.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Vercel built-in analytics only */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}


