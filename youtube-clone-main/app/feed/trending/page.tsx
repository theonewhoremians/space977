import { Flame, Music2, Gamepad2, Film, Trophy, Newspaper } from "lucide-react";
import { videos } from "@/lib/data";
import ChipBar from "@/components/ui/ChipBar";
import VideoRow from "@/components/ui/VideoRow";

const tabs = ["Now", "Music", "Gaming", "Movies", "News", "Sport"];

const categories = [
  { icon: Music2, label: "Music" },
  { icon: Gamepad2, label: "Gaming" },
  { icon: Film, label: "Movies" },
  { icon: Trophy, label: "Sport" },
  { icon: Newspaper, label: "News" },
];

export default function TrendingPage() {
  const sorted = [...videos].sort((a, b) => b.views - a.views);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-yt-red to-orange-500">
          <Flame className="size-7 text-white" />
        </span>
        <div>
          <h1 className="text-3xl font-bold">Trending</h1>
          <p className="text-sm text-yt-muted">See what the world is watching right now</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <span
              key={c.label}
              className="flex items-center gap-2 rounded-full border border-yt-border px-4 py-2 text-sm"
            >
              <Icon className="size-4" /> {c.label}
            </span>
          );
        })}
      </div>

      <div className="mb-6">
        <ChipBar items={tabs} />
      </div>

      <div className="space-y-5">
        {sorted.map((v, i) => (
          <div key={v.id} className="flex items-start gap-3 md:gap-5">
            <span className="mt-6 w-6 shrink-0 text-center text-lg font-semibold text-yt-muted">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <VideoRow video={v} size="lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
