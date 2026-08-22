import { notFound } from "next/navigation";
import Link from "next/link";
import { Play, Shuffle, MoreVertical, Lock, Globe, EyeOff } from "lucide-react";
import { getPlaylist, getChannelSafe, videos } from "@/lib/data";
import { formatCount } from "@/lib/format";
import Avatar from "@/components/ui/Avatar";
import VideoRow from "@/components/ui/VideoRow";

/* eslint-disable @next/next/no-img-element */
export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playlist = getPlaylist(id);
  if (!playlist) notFound();

  const channel = getChannelSafe(playlist.channelId);
  const items = playlist.videoIds
    .map((vid) => videos.find((v) => v.id === vid))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
  const totalViews = items.reduce((sum, v) => sum + v.views, 0);

  const VisIcon =
    playlist.visibility === "Public"
      ? Globe
      : playlist.visibility === "Unlisted"
        ? EyeOff
        : Lock;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row">
      {/* Sidebar panel */}
      <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:h-fit lg:w-[360px]">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-yt-elevated to-yt-surface p-4">
          <div className="overflow-hidden rounded-xl">
            <img src={playlist.cover} alt={playlist.title} className="w-full" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">{playlist.title}</h1>
          <Link
            href={`/channel/${channel.id}`}
            className="mt-2 flex items-center gap-2"
          >
            <Avatar name={channel.name} size={24} />
            <span className="text-sm font-medium">{channel.name}</span>
          </Link>
          <p className="mt-2 flex items-center gap-2 text-xs text-yt-muted">
            <VisIcon className="size-3.5" /> {playlist.visibility} · {items.length}{" "}
            videos · {formatCount(totalViews)} views
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Link
              href={`/watch/${items[0]?.id ?? ""}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-yt-text py-2.5 text-sm font-medium text-yt-bg hover:bg-white"
            >
              <Play className="size-5 fill-yt-bg" /> Play all
            </Link>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-yt-hover py-2.5 text-sm font-medium hover:bg-yt-active">
              <Shuffle className="size-5" /> Shuffle
            </button>
          </div>
        </div>
      </aside>

      {/* Video list */}
      <div className="min-w-0 flex-1 space-y-3">
        {items.map((v, i) => (
          <div key={v.id} className="flex items-start gap-2 md:gap-4">
            <span className="mt-6 w-5 shrink-0 text-center text-sm text-yt-muted">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <VideoRow video={v} size="sm" />
            </div>
            <button
              className="mt-4 hidden size-8 items-center justify-center rounded-full hover:bg-yt-hover md:flex"
              aria-label="More"
            >
              <MoreVertical className="size-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
