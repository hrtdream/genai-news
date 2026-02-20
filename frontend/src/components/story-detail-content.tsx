"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, type StoryDetail } from "@/lib/news-api";
import StoryImageCarousel from "@/components/story-image-carousel";

type StoryDetailContentProps = {
  story: StoryDetail;
};

export default function StoryDetailContent({ story }: StoryDetailContentProps) {
  const [activeImage, setActiveImage] = useState(0);
  const summaryBullets = story.summary.filter((sentence) => sentence.trim());

  return (
    <main className="mx-auto w-[min(1100px,94vw)] py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="cursor-pointer rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-50"
        >
          Back to stories
        </Link>
      </div>

      <article className="overflow-hidden rounded-3xl border border-red-200/80 bg-white/95 shadow-sm">
        <StoryImageCarousel
          images={story.cover_images}
          activeIndex={activeImage}
          onChange={setActiveImage}
          heightClassName="h-72 md:h-96"
          prevButtonClassName="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer rounded-full bg-black/45 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-black/65"
          nextButtonClassName="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-full bg-black/45 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-black/65"
          dotsWrapperClassName="absolute right-4 bottom-4 flex gap-1.5 rounded-full bg-black/35 px-2 py-1"
        />

        <div className="p-6 md:p-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-red-700">
            Story Detail
          </p>
          <h1 className="mb-4 text-2xl leading-tight font-semibold tracking-tight text-slate-900 md:text-3xl">
            {story.headline}
          </h1>

          {summaryBullets.length > 0 ? (
            <ul className="mb-5 list-disc space-y-3 pl-6 text-[1.06rem] leading-8 font-medium text-slate-700 marker:text-blue-800 md:text-lg">
              {summaryBullets.map((sentence, index) => (
                <li key={`${story.id}-summary-${index}`}>{sentence}</li>
              ))}
            </ul>
          ) : null}

          <p className="text-sm text-muted">
            Latest reference at {formatDate(story.latest_ref_article_at)}
          </p>
        </div>
      </article>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold text-heading">
          Reference articles
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {story.ref_articles.map((ref, index) => {
            const title = ref.title.trim();
            const source = ref.source.trim();
            const publishedAt = ref.update_date.trim();
            const url = ref.url.trim();
            const itemKey = ref.article_id || url || `${story.id}-${index}`;

            return (
              <article
                key={itemKey}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="line-clamp-2 text-base font-semibold text-slate-900">
                  {title || `Reference ${index + 1}`}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {source || "Unknown source"}
                </p>
                {publishedAt ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(publishedAt)}
                  </p>
                ) : null}
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex cursor-pointer rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-medium text-blue-800 transition-colors duration-200 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-blue-700 focus-visible:outline-offset-2"
                  >
                    Read source
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
