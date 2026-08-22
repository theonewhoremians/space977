import { type Video } from "@/lib/data";
import VideoCard from "./VideoCard";

export default function VideoGrid({
  videos,
  showAvatar = true,
}: {
  videos: Video[];
  showAvatar?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} showAvatar={showAvatar} />
      ))}
    </div>
  );
}
