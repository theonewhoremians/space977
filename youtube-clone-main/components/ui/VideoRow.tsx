import Link from "next/link";
import { CheckCircle, MoreVertical } from "lucide-react";
import { getChannelSafe, type Video } from "@/lib/data";
import { formatViews, timeAgo } from "@/lib/format";
import Avatar from "./Avatar";
import Thumbnail from "./Thumbnail";

export default function VideoRow({
  video,
  size = "lg",
}: {
  video: Video;
  size?: "lg" | "sm";
}) {
  const channel = getChannelSafe(video.channelId);
  const thumbWidth = size === "lg" ? "w-[168px] sm:w-[246px] md:w-[360px]" : "w-[168px]";
  return (
    <div className="group flex gap-3 animate-fade-in">
      <Link href={`/watch/${video.id}`} className={`shrink-0 ${thumbWidth}`}>
        <Thumbnail src={video.thumb} alt={video.title} duration={video.duration} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/watch/${video.id}`} className="min-w-0">
            <h3
              className={`line-clamp-2 font-medium text-yt-text ${
                size === "lg" ? "text-base md:text-lg" : "text-sm"
              }`}
            >
              {video.title}
            </h3>
          </Link>
          <button
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-yt-text opacity-0 transition hover:bg-yt-hover group-hover:opacity-100"
            aria-label="More options"
          >
            <MoreVertical className="size-5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-yt-muted">
          {formatViews(video.views)} · {timeAgo(video.hoursAgo)}
        </p>
        <Link
          href={`/channel/${channel.id}`}
          className="mt-2 flex items-center gap-2 text-xs text-yt-muted hover:text-yt-text"
        >
          {size === "lg" && <Avatar name={channel.name} size={24} />}
          <span className="truncate">{channel.name}</span>
          {channel.verified && <CheckCircle className="size-3 shrink-0" />}
        </Link>
        {size === "lg" && (
          <p className="mt-2 hidden line-clamp-2 text-xs text-yt-muted md:block">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
}
