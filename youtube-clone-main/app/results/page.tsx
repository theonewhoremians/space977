import Link from "next/link";
import { SlidersHorizontal, CheckCircle } from "lucide-react";
import { searchVideos, channels, getChannelSafe } from "@/lib/data";
import { formatCount } from "@/lib/format";
import ChipBar from "@/components/ui/ChipBar";
import VideoRow from "@/components/ui/VideoRow";
import Avatar from "@/components/ui/Avatar";

const filters = ["All", "Videos", "Shorts", "Channels", "Playlists", "Movies"];

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ search_query?: string }>;
}) {
  const { search_query = "" } = await searchParams;
  const results = searchVideos(search_query);
  const channel = getChannelSafe(results[0]?.channelId ?? channels[0].id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 md:px-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <ChipBar items={filters} />
        </div>
        <button className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium hover:bg-yt-hover">
          <SlidersHorizontal className="size-5" /> Filters
        </button>
      </div>

      {search_query && (
        <p className="mb-4 text-sm text-yt-muted">
          Results for{" "}
          <span className="font-medium text-yt-text">
            &ldquo;{search_query}&rdquo;
          </span>
        </p>
      )}

      {/* Channel result */}
      <div className="mb-6 flex items-center gap-6 border-b border-yt-border pb-6">
        <Link href={`/channel/${channel.id}`}>
          <Avatar name={channel.name} size={120} />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/channel/${channel.id}`}
            className="flex items-center gap-1 text-lg font-medium"
          >
            {channel.name}
            {channel.verified && <CheckCircle className="size-4 text-yt-muted" />}
          </Link>
          <p className="text-xs text-yt-muted">
            {channel.handle} · {formatCount(channel.subscribers)} subscribers
          </p>
          <p className="mt-1 line-clamp-1 text-sm text-yt-muted">
            {channel.description}
          </p>
        </div>
        <Link
          href={`/channel/${channel.id}`}
          className="ml-auto hidden shrink-0 rounded-full bg-yt-text px-4 py-2 text-sm font-medium text-yt-bg hover:bg-white sm:block"
        >
          Subscribe
        </Link>
      </div>

      <div className="space-y-4">
        {results.map((v) => (
          <VideoRow key={v.id} video={v} size="lg" />
        ))}
      </div>
    </div>
  );
}
