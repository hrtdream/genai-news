import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenAI News",
  description: "A modern feed of curated GenAI stories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
