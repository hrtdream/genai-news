import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenAI News",
  description: "Curated stories from the frontier of Generative AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const edition = new Date()
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <header
          style={{ background: "var(--background)", paddingTop: "1.5rem" }}
        >
          <div
            className="mx-auto w-[min(1100px,94vw)]"
            style={{ paddingBottom: "1px" }}
          >
            {/* Thick crimson rule */}
            <div className="masthead-rule" />

            {/* Top meta row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.55rem 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.57rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase" as const,
                  color: "var(--muted)",
                }}
              >
                Generative AI · Intelligence
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.57rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  color: "var(--muted)",
                }}
              >
                {edition}
              </span>
            </div>

            {/* Publication name */}
            <div
              style={{
                textAlign: "center" as const,
                padding: "1.1rem 0 1rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <a
                href="/"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 5vw, 3.25rem)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "var(--heading)",
                  textDecoration: "none",
                  display: "block",
                  lineHeight: 1,
                }}
              >
                GenAI News
              </a>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase" as const,
                  color: "var(--muted)",
                  marginTop: "0.45rem",
                }}
              >
                The Intelligence Wire
              </p>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
