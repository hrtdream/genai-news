"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { formatDate, type StoryDetail } from "@/lib/news-api";
import StoryImageCarousel from "@/components/story-image-carousel";

type StoryDetailContentProps = {
  story: StoryDetail;
};

export default function StoryDetailContent({ story }: StoryDetailContentProps) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const summaryBullets = story.summary.filter((sentence) => sentence.trim());

  return (
    <main className="mx-auto w-[min(1100px,94vw)] py-8 md:py-12">
      <div className="mb-7">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
      </div>

      <article className="detail-article">
        <StoryImageCarousel
          images={story.cover_images}
          activeIndex={activeImage}
          onChange={setActiveImage}
          heightClassName="h-72 md:h-96"
          prevButtonClassName="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer rounded-sm bg-black/60 px-3 py-2 text-sm text-white/85 transition-colors duration-200 hover:bg-black/80"
          nextButtonClassName="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-sm bg-black/60 px-3 py-2 text-sm text-white/85 transition-colors duration-200 hover:bg-black/80"
          dotsWrapperClassName="absolute right-4 bottom-4 flex gap-1.5 rounded-sm bg-black/50 px-2 py-1"
        />

        <div className="p-6 md:p-9 lg:p-11">
          <p className="detail-section-label">◆ Story Brief</p>

          <h1 className="detail-headline">{story.headline}</h1>

          {summaryBullets.length > 0 ? (
            <div
              style={{
                borderLeft: "2px solid var(--primary-border)",
                paddingLeft: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {summaryBullets.map((sentence, index) => (
                  <li
                    key={`${story.id}-summary-${index}`}
                    className="detail-summary-item"
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <>{children}</>,
                      }}
                    >
                      {sentence}
                    </ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="detail-meta">
            Latest reference — {formatDate(story.latest_ref_article_at)}
          </p>
        </div>
      </article>

      <section className="mt-10">
        <div
          className="mb-5"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.35rem",
              fontWeight: 600,
              color: "var(--heading)",
              margin: 0,
              flexShrink: 0,
            }}
          >
            Source Articles
          </h2>
          <div className="sources-divider" />
          <span className="sources-count" style={{ flexShrink: 0 }}>
            {story.ref_articles.length}{" "}
            {story.ref_articles.length === 1 ? "source" : "sources"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {story.ref_articles.map((ref, index) => {
            const title = ref.title.trim();
            const source = ref.source.trim();
            const publishedAt = ref.update_date.trim();
            const url = ref.url.trim();
            const itemKey = ref.article_id || url || `${story.id}-${index}`;

            return (
              <article key={itemKey} className="ref-card">
                <p className="ref-card-title">{title || `Reference ${index + 1}`}</p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.8rem",
                  }}
                >
                  {source ? (
                    <span className="ref-card-source">{source}</span>
                  ) : null}
                  {source && publishedAt ? (
                    <span
                      style={{
                        color: "var(--border-strong)",
                        fontSize: "0.7rem",
                      }}
                    >
                      /
                    </span>
                  ) : null}
                  {publishedAt ? (
                    <span className="ref-card-date">
                      {formatDate(publishedAt)}
                    </span>
                  ) : null}
                </div>

                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                    style={{ fontSize: "0.74rem", padding: "0.38rem 0.9rem" }}
                  >
                    Read source ↗
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
