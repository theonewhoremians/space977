import Link from "next/link";
import { ListVideo, Play } from "lucide-react";
import { getChannelSafe, type Playlist } from "@/lib/data";

/* eslint-disable @next/next/no-img-element */
export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const channel = getChannelSafe(playlist.channelId);
  return (
    <div className="group flex flex-col animate-fade-in">
      <Link
        href={`/playlist/${playlist.id}`}
        className="relative block aspect-video w-full overflow-hidden rounded-xl bg-yt-hover"
      >
        <img
          src={playlist.cover}
          alt={playlist.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-y-0 right-0 flex w-[42%] flex-col items-center justify-center gap-1 bg-black/70 text-white">
          <ListVideo className="size-5" />
          <span className="text-xs font-medium">{playlist.videoIds.length} videos</span>
        </span>
        <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
          <Play className="size-5 fill-white" /> Play all
        </span>
      </Link>
      <div className="mt-2">
        <Link href={`/playlist/${playlist.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium">{playlist.title}</h3>
        </Link>
        <Link
          href={`/channel/${channel.id}`}
          className="mt-1 block text-xs text-yt-muted hover:text-yt-text"
        >
          {channel.name}
        </Link>
        <Link
          href={`/playlist/${playlist.id}`}
          className="mt-1 block text-xs text-yt-muted hover:text-yt-text"
        >
          View full playlist
        </Link>
      </div>
    </div>
  );
}
