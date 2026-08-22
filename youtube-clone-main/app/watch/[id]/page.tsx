import { notFound } from "next/navigation";
import { getVideo, getChannelSafe, getRelatedVideos } from "@/lib/data";
import VideoPlayer from "@/components/watch/VideoPlayer";
import VideoActions from "@/components/watch/VideoActions";
import DescriptionBox from "@/components/watch/DescriptionBox";
import CommentsSection from "@/components/watch/CommentsSection";
import VideoRow from "@/components/ui/VideoRow";
import ChipBar from "@/components/ui/ChipBar";

const relatedChips = [
  "All",
  "From this channel",
  "Related",
  "Recently uploaded",
  "Watched",
  "For you",
  "Live",
];

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = getVideo(id);
  if (!video) notFound();
  const channel = getChannelSafe(video.channelId);
  const related = getRelatedVideos(video.id, 14);

  return (
    <div className="mx-auto flex max-w-[1754px] flex-col gap-6 px-0 py-0 md:px-6 md:py-6 lg:flex-row">
      {/* Main column */}
      <div className="min-w-0 flex-1">
        <VideoPlayer poster={video.thumb} duration={video.duration} title={video.title} />

        <div className="px-4 md:px-0">
          <h1 className="mt-3 text-xl font-semibold leading-7">{video.title}</h1>
          <div className="mt-3">
            <VideoActions channel={channel} likes={video.likes} />
          </div>
          <div className="mt-4">
            <DescriptionBox
              views={video.views}
              hoursAgo={video.hoursAgo}
              description={video.description}
              category={video.category}
            />
          </div>
          <CommentsSection />
        </div>
      </div>

      {/* Related */}
      <aside className="w-full px-4 md:px-0 lg:w-[402px] lg:shrink-0">
        <div className="mb-3">
          <ChipBar items={relatedChips} />
        </div>
        <div className="space-y-2">
          {related.map((v) => (
            <VideoRow key={v.id} video={v} size="sm" />
          ))}
        </div>
      </aside>
    </div>
  );
}
