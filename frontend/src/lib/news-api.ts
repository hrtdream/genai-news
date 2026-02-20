export type StoryItem = {
  id: string;
  headline: string;
  latest_ref_article_at: string;
  cover_images: string[];
};

export type StoriesResponse = {
  items: StoryItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
  };
};

export type RefArticle = {
  article_id: string;
  url: string;
  title: string;
  update_date: string;
  source: string;
};

export type StoryDetail = {
  id: string;
  headline: string;
  summary: string[];
  cover_images: string[];
  latest_ref_article_at: string;
  ref_articles: RefArticle[];
};

function resolveApiUrl(path: string): string {
  return path;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveApiUrl(path), init);

  if (!response.ok) {
    throw new Error(`Request failed: ${path} (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function fetchStories(
  page = 1,
  init?: RequestInit,
): Promise<StoriesResponse> {
  return fetchJson<StoriesResponse>(`/api/stories?page=${page}`, init);
}

export async function fetchStoryDetail(
  storyId: string,
  init?: RequestInit,
): Promise<StoryDetail> {
  return fetchJson<StoryDetail>(`/api/story/${storyId}`, init);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
