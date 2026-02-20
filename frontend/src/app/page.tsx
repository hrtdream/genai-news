import StoryFeed from "@/components/story-feed";
import { type StoriesResponse, fetchStories } from "@/lib/news-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  let stories: StoriesResponse | null = null;
  let errorMessage = "";

  try {
    stories = await fetchStories(1);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Could not load stories";
  }

  if (errorMessage) {
    return (
      <main className="mx-auto w-[min(1100px,94vw)] py-10">
        <section className="error-state">
          <p className="error-state-title">Backend unavailable</p>
          <p>{errorMessage}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-[min(1100px,94vw)] py-10">
      <StoryFeed
        initialItems={stories?.items ?? []}
        initialPage={stories?.pagination.page ?? 1}
        initialHasNext={stories?.pagination.has_next ?? false}
      />
    </main>
  );
}
