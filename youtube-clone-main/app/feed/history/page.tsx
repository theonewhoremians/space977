import { Search, Trash2, PauseCircle, Settings } from "lucide-react";
import { videos } from "@/lib/data";
import VideoRow from "@/components/ui/VideoRow";

export default function HistoryPage() {
  const today = videos.slice(0, 4);
  const yesterday = videos.slice(4, 9);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 md:flex-row md:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="mb-6 text-3xl font-bold">Watch history</h1>

        <h2 className="mb-4 text-lg font-medium">Today</h2>
        <div className="space-y-4">
          {today.map((v) => (
            <VideoRow key={v.id} video={v} size="lg" />
          ))}
        </div>

        <h2 className="mb-4 mt-8 text-lg font-medium">Yesterday</h2>
        <div className="space-y-4">
          {yesterday.map((v) => (
            <VideoRow key={v.id} video={v} size="lg" />
          ))}
        </div>
      </div>

      {/* Controls */}
      <aside className="w-full shrink-0 md:w-72">
        <div className="flex items-center gap-3 border-b border-yt-border pb-2">
          <Search className="size-5 text-yt-muted" />
          <input
            placeholder="Search watch history"
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>
        <div className="mt-4 space-y-1">
          <ControlRow icon={<Trash2 className="size-5" />} label="Clear all watch history" />
          <ControlRow icon={<PauseCircle className="size-5" />} label="Pause watch history" />
          <ControlRow icon={<Settings className="size-5" />} label="Manage all history" />
        </div>
      </aside>
    </div>
  );
}

function ControlRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full items-center gap-4 rounded-lg px-2 py-2 text-sm font-medium hover:bg-yt-hover">
      {icon}
      {label}
    </button>
  );
}
