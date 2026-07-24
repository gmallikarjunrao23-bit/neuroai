import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroAI - Multi-Model AI Chat",
  description: "Chat with GPT-5, Gemini, DeepSeek, and more — all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
