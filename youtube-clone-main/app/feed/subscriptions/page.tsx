import Link from "next/link";
import { Grid3x3, List } from "lucide-react";
import { channels, videos } from "@/lib/data";
import Avatar from "@/components/ui/Avatar";
import VideoGrid from "@/components/ui/VideoGrid";

export default function SubscriptionsPage() {
  return (
    <div className="px-4 py-6 md:px-6">
      {/* Subscribed channels strip */}
      <div className="no-scrollbar mb-6 flex gap-6 overflow-x-auto pb-2">
        {channels.map((c) => (
          <Link
            key={c.id}
            href={`/channel/${c.id}`}
            className="flex w-16 shrink-0 flex-col items-center gap-1"
          >
            <Avatar name={c.name} size={56} />
            <span className="w-full truncate text-center text-xs text-yt-muted">
              {c.name.split(" ")[0]}
            </span>
          </Link>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Latest</h1>
        <div className="flex items-center gap-1 text-yt-muted">
          <button className="rounded-full p-2 text-yt-text" aria-label="Grid view">
            <Grid3x3 className="size-5" />
          </button>
          <button className="rounded-full p-2 hover:bg-yt-hover" aria-label="List view">
            <List className="size-5" />
          </button>
        </div>
      </div>

      <VideoGrid videos={videos} />
    </div>
  );
}
