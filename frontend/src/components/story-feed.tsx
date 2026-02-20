"use client";

import { useState } from "react";
import Link from "next/link";
import { type StoryItem, fetchStories, formatDate } from "@/lib/news-api";
import StoryImageCarousel from "@/components/story-image-carousel";

type StoryFeedProps = {
  initialItems: StoryItem[];
  initialPage: number;
  initialHasNext: boolean;
};

export default function StoryFeed({
  initialItems,
  initialPage,
  initialHasNext,
}: StoryFeedProps) {
  const [items, setItems] = useState<StoryItem[]>(initialItems);
  const [page, setPage] = useState(initialPage);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [activeImageByStory, setActiveImageByStory] = useState<
    Record<string, number>
  >({});

  const setActiveImage = (storyId: string, index: number) => {
    setActiveImageByStory((prev) => ({ ...prev, [storyId]: index }));
  };

  const loadMore = async () => {
    if (isLoading || !hasNext) {
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const nextPage = page + 1;
      const response = await fetchStories(nextPage);

      setItems((prev) => {
        const seen = new Set(prev.map((story) => story.id));
        const incoming = response.items.filter((story) => !seen.has(story.id));
        return [...prev, ...incoming];
      });
      setPage(response.pagination.page);
      setHasNext(response.pagination.has_next);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load more",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLatest = async () => {
    if (isRefreshing || isLoading) {
      return;
    }

    setIsRefreshing(true);
    setLoadError("");

    try {
      const response = await fetchStories(1, { cache: "no-store" });
      setItems(response.items);
      setPage(response.pagination.page);
      setHasNext(response.pagination.has_next);
      setActiveImageByStory({});
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to refresh stories",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <section aria-label="Story feed">
      {/* Feed header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="story-card-label" style={{ marginBottom: "0.4rem" }}>
            ◆ Latest dispatches
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 600,
              color: "var(--heading)",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Intelligence Feed
          </h2>
        </div>

        <button
          type="button"
          onClick={refreshLatest}
          disabled={isRefreshing || isLoading}
          className="btn-ghost"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{
              width: "0.85rem",
              height: "0.85rem",
            }}
            className={isRefreshing ? "animate-spin" : ""}
          >
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M20 4v6h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isRefreshing ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          No stories available. Backend returned an empty response.
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        {items.map((story, index) => (
          <article
            key={story.id}
            className="story-card card-enter"
            style={{ animationDelay: `${(index % 10) * 65}ms` }}
          >
            <StoryImageCarousel
              images={story.cover_images}
              activeIndex={activeImageByStory[story.id] ?? 0}
              onChange={(nextIndex) => setActiveImage(story.id, nextIndex)}
              heightClassName="h-52"
              prevButtonClassName="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer rounded-sm bg-black/60 px-2.5 py-1.5 text-xs text-white/85 transition-colors duration-200 hover:bg-black/80"
              nextButtonClassName="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-sm bg-black/60 px-2.5 py-1.5 text-xs text-white/85 transition-colors duration-200 hover:bg-black/80"
              dotsWrapperClassName="absolute right-3 bottom-3 flex gap-1.5 rounded-sm bg-black/50 px-2 py-1"
            />

            <div className="p-5">
              <p className="story-card-label">◆ AI Intelligence</p>
              <h3 className="story-card-headline">
                <Link
                  href={`/story/${story.id}`}
                  className="rounded-sm focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1"
                >
                  {story.headline}
                </Link>
              </h3>
              <p className="story-card-meta">
                {formatDate(story.latest_ref_article_at)}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        {hasNext ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? "Loading..." : "Load more dispatches"}
          </button>
        ) : items.length > 0 ? (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            — End of feed —
          </p>
        ) : null}

        {loadError ? (
          <p
            role="status"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--error)",
            }}
          >
            {loadError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
