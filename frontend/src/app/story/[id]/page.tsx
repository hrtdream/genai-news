import { notFound } from "next/navigation";
import { fetchStoryDetail } from "@/lib/news-api";
import StoryDetailContent from "@/components/story-detail-content";

type StoryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps) {
  const { id } = await params;

  let story;
  try {
    story = await fetchStoryDetail(id);
  } catch (error) {
    if (error instanceof Error && error.message.includes("(404)")) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="min-h-screen">
      <StoryDetailContent story={story} />
    </div>
  );
}
