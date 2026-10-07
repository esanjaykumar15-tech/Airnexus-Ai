import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIRNEXUS AI | Delhi-NCR Environmental Intelligence",
  description: "AI-driven pollution source identification, forecasting, and policy intelligence for Delhi-NCR.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-void-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
