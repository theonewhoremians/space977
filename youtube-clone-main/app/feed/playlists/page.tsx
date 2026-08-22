import { Plus } from "lucide-react";
import { playlists } from "@/lib/data";
import PlaylistCard from "@/components/ui/PlaylistCard";

export default function PlaylistsPage() {
  return (
    <div className="px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Playlists</h1>
        <button className="flex items-center gap-2 rounded-full bg-yt-hover px-4 py-2 text-sm font-medium hover:bg-yt-active">
          <Plus className="size-5" /> New playlist
        </button>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {playlists.map((p) => (
          <PlaylistCard key={p.id} playlist={p} />
        ))}
      </div>
    </div>
  );
}
