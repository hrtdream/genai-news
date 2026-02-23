"use client";

import { type KeyboardEvent, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type StoryItem, fetchStories, formatDate } from "@/lib/news-api";
import StoryImageCarousel from "@/components/story-image-carousel";
import SourceDropdown from "@/components/source-dropdown";
import { SOURCE_MAP } from "@/lib/constants";

type StoryFeedProps = {
  initialItems: StoryItem[];
  initialPage: number;
  initialHasNext: boolean;
  initialCollections?: string[];
};

export default function StoryFeed({
  initialItems,
  initialPage,
  initialHasNext,
  initialCollections = [],
}: StoryFeedProps) {
  const router = useRouter();
  const [items, setItems] = useState<StoryItem[]>(initialItems);
  const [page, setPage] = useState(initialPage);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [selectedCollections, setSelectedCollections] = useState<string[]>(initialCollections);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [activeImageByStory, setActiveImageByStory] = useState<
    Record<string, number>
  >({});

  const isFirstRender = useRef(true);

  const setActiveImage = (storyId: string, index: number) => {
    setActiveImageByStory((prev) => ({ ...prev, [storyId]: index }));
  };

  const getFetchOptions = useCallback(() => {
    const allSelected = selectedCollections.length === Object.keys(SOURCE_MAP).length;
    return allSelected ? {} : { collections: selectedCollections };
  }, [selectedCollections]);

  const loadMore = async () => {
    if (isLoading || !hasNext || selectedCollections.length === 0) {
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const nextPage = page + 1;
      const response = await fetchStories(nextPage, getFetchOptions());

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

    if (selectedCollections.length === 0) {
      setItems([]);
      setHasNext(false);
      setLoadError("");
      setActiveImageByStory({});
      return;
    }

    setIsRefreshing(true);
    setLoadError("");

    try {
      const response = await fetchStories(1, { ...getFetchOptions(), cache: "no-store" });
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

  // Automatically fetch when filters change, but skip initial render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let isActive = true;

    const fetchFiltered = async () => {
      if (selectedCollections.length === 0) {
        setItems([]);
        setHasNext(false);
        setLoadError("");
        setActiveImageByStory({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetchStories(1, getFetchOptions());
        if (!isActive) return;
        
        setItems(response.items);
        setPage(response.pagination.page);
        setHasNext(response.pagination.has_next);
        setActiveImageByStory({});
      } catch (error) {
        if (!isActive) return;
        
        setLoadError(
          error instanceof Error ? error.message : "Failed to filter stories",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchFiltered();

    return () => {
      isActive = false;
    };
  }, [selectedCollections, getFetchOptions]);

  const handleCardNavigate = (storyId: string) => {
    router.push(`/story/${storyId}`);
  };

  return (
    <section aria-label="Story feed">
      {/* Feed header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="story-card-label"
            style={{ marginBottom: 0, fontSize: "0.92rem" }}
          >
            ◆ Latest dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SourceDropdown
            selectedCollections={selectedCollections}
            onChange={setSelectedCollections}
          />
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
      </div>

      {items.length === 0 && !isLoading ? (
        <div className="empty-state">
          {selectedCollections.length === 0 ? (
            <span className="text-gray-500">
              No dispatches available. Please select at least one source.
            </span>
          ) : (
            "No stories available. Backend returned an empty response."
          )}
        </div>
      ) : null}

      {items.length === 0 && isLoading ? (
        <div className="empty-state animate-pulse text-gray-500">
          Loading dispatches...
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        {items.map((story, index) => (
          <article
            key={story.id}
            role="link"
            tabIndex={0}
            aria-label={`Open story: ${story.headline}`}
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest("button,a")) {
                return;
              }
              handleCardNavigate(story.id);
            }}
            onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
              const target = event.target as HTMLElement;
              if (target.closest("button,a")) {
                return;
              }

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleCardNavigate(story.id);
              }
            }}
            className="story-card card-enter flex h-full cursor-pointer flex-col focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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

            <div className="flex flex-1 flex-col p-5">
              <h3 className="story-card-headline">{story.headline}</h3>
              <p className="story-card-meta mt-auto pt-2">
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
              fontSize: "0.8rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            — End of dispatches —
          </p>
        ) : null}

        {loadError ? (
          <p
            role="status"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
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
