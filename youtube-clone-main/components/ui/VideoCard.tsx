import Link from "next/link";
import { CheckCircle, MoreVertical } from "lucide-react";
import { getChannelSafe, type Video } from "@/lib/data";
import { formatViews, timeAgo } from "@/lib/format";
import Avatar from "./Avatar";
import Thumbnail from "./Thumbnail";

export default function VideoCard({
  video,
  showAvatar = true,
}: {
  video: Video;
  showAvatar?: boolean;
}) {
  const channel = getChannelSafe(video.channelId);
  return (
    <div className="group flex flex-col animate-fade-in">
      <Link href={`/watch/${video.id}`} className="block">
        <Thumbnail src={video.thumb} alt={video.title} duration={video.duration} />
      </Link>
      <div className="mt-3 flex gap-3">
        {showAvatar && (
          <Link href={`/channel/${channel.id}`} className="shrink-0">
            <Avatar name={channel.name} size={36} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-medium leading-5 text-yt-text">
              {video.title}
            </h3>
          </Link>
          <Link
            href={`/channel/${channel.id}`}
            className="mt-1 flex items-center gap-1 text-[13px] text-yt-muted hover:text-yt-text"
          >
            <span className="truncate">{channel.name}</span>
            {channel.verified && (
              <CheckCircle className="size-3 shrink-0 text-yt-muted" />
            )}
          </Link>
          <p className="text-[13px] text-yt-muted">
            {formatViews(video.views)} · {timeAgo(video.hoursAgo)}
          </p>
        </div>
        <button
          className="mt-0.5 hidden size-8 shrink-0 items-center justify-center rounded-full text-yt-text opacity-0 transition hover:bg-yt-hover group-hover:opacity-100 md:flex"
          aria-label="More options"
        >
          <MoreVertical className="size-5" />
        </button>
      </div>
    </div>
  );
}
