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
      setLoadError(error instanceof Error ? error.message : "Failed to load more");
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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold tracking-tight text-heading">
          Latest stories
        </h2>
        <button
          type="button"
          onClick={refreshLatest}
          disabled={isRefreshing || isLoading}
          className="cursor-pointer rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-red-100 disabled:text-red-300"
        >
          <span className="inline-flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
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
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-white p-6 text-amber-900 shadow-sm">
          No visible stories yet. Backend returned an empty `items` array.
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {items.map((story) => (
          <article
            key={story.id}
            className="group overflow-hidden rounded-2xl border border-red-200 bg-white/95 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <StoryImageCarousel
              images={story.cover_images}
              activeIndex={activeImageByStory[story.id] ?? 0}
              onChange={(nextIndex) => setActiveImage(story.id, nextIndex)}
              heightClassName="h-52"
              prevButtonClassName="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer rounded-full bg-black/45 px-2.5 py-1.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-black/65"
              nextButtonClassName="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full bg-black/45 px-2.5 py-1.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-black/65"
              dotsWrapperClassName="absolute right-3 bottom-3 flex gap-1.5 rounded-full bg-black/35 px-2 py-1"
            />

            <div className="p-5">
              <h3 className="mb-2 line-clamp-2 text-xl font-semibold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-red-700">
                <Link
                  href={`/story/${story.id}`}
                  className="rounded-sm focus-visible:outline-3 focus-visible:outline-blue-700 focus-visible:outline-offset-2"
                >
                  {story.headline}
                </Link>
              </h3>
              <p className="text-sm text-muted">
                Latest reference: {formatDate(story.latest_ref_article_at)}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {hasNext ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="cursor-pointer rounded-full border border-blue-200 bg-blue-800 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-900 disabled:cursor-not-allowed disabled:border-blue-100 disabled:bg-blue-300"
          >
            {isLoading ? "Loading..." : "Load more stories"}
          </button>
        ) : (
          <p className="text-sm text-muted">You have reached the end of the feed.</p>
        )}
        {loadError ? (
          <p role="status" className="text-sm text-red-700">
            {loadError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
