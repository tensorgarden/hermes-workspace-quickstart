import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hermes Workspace Quickstart — Private AI Agent Setup",
  description:
    "Set up a private AI workspace using Hermes Agent or similar agent OS. Configure local LLMs, manage skills, and run autonomous workflows — all on your own hardware.",
  keywords: [
    "private AI",
    "AI agent",
    "local LLM",
    "Hermes Agent",
    "workspace",
    "autonomous workflow",
    "Ollama",
    "self-hosted AI",
  ],
  openGraph: {
    title: "Hermes Workspace Quickstart",
    description:
      "Set up a private AI workspace with local LLMs, skills, and autonomous workflows.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
