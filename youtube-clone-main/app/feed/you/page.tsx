import Link from "next/link";
import { History, ListVideo, Clock, ThumbsUp, ChevronRight } from "lucide-react";
import { videos, getPlaylist } from "@/lib/data";
import Avatar from "@/components/ui/Avatar";
import Shelf from "@/components/ui/Shelf";
import VideoCard from "@/components/ui/VideoCard";

export default function YouPage() {
  const watchLater = getPlaylist("pl-watchlater");
  const liked = getPlaylist("pl-liked");
  const history = videos.slice(0, 8);
  const wl = (watchLater?.videoIds ?? []).map((id) => videos.find((v) => v.id === id)!).filter(Boolean);
  const lk = (liked?.videoIds ?? []).map((id) => videos.find((v) => v.id === id)!).filter(Boolean);

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 md:px-6">
      {/* Profile */}
      <div className="mb-8 flex items-center gap-4">
        <Avatar name="Akram" size={80} />
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Akram Khan</h1>
          <p className="text-sm text-yt-muted">@akram1112</p>
          <Link
            href="/channel/ch-lumen"
            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-yt-blue"
          >
            View your channel <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <Shelf title="History" href="/feed/history" icon={<History className="size-6" />}>
        {history.map((v) => (
          <div key={v.id} className="w-72 shrink-0">
            <VideoCard video={v} showAvatar={false} />
          </div>
        ))}
      </Shelf>

      <Shelf title="Playlists" href="/feed/playlists" icon={<ListVideo className="size-6" />}>
        {videos.slice(8, 16).map((v) => (
          <div key={v.id} className="w-72 shrink-0">
            <VideoCard video={v} showAvatar={false} />
          </div>
        ))}
      </Shelf>

      <Shelf title="Watch later" href="/playlist/pl-watchlater" icon={<Clock className="size-6" />}>
        {wl.map((v) => (
          <div key={v.id} className="w-72 shrink-0">
            <VideoCard video={v} showAvatar={false} />
          </div>
        ))}
      </Shelf>

      <Shelf title="Liked videos" href="/playlist/pl-liked" icon={<ThumbsUp className="size-6" />}>
        {lk.map((v) => (
          <div key={v.id} className="w-72 shrink-0">
            <VideoCard video={v} showAvatar={false} />
          </div>
        ))}
      </Shelf>
    </div>
  );
}
