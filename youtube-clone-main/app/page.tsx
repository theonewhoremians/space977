import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { categories, shorts, videos } from "@/lib/data";
import ChipBar from "@/components/ui/ChipBar";
import VideoGrid from "@/components/ui/VideoGrid";
import ShortCard from "@/components/ui/ShortCard";

export default function HomePage() {
  const firstRow = videos.slice(0, 8);
  const rest = videos.slice(8);

  return (
    <div>
      <div className="sticky top-14 z-20 bg-yt-bg/95 px-4 py-3 backdrop-blur md:px-6">
        <ChipBar items={categories} />
      </div>

      <div className="px-4 pb-10 md:px-6">
        <VideoGrid videos={firstRow} />

        {/* Shorts shelf */}
        <section className="my-10">
          <div className="mb-4 flex items-center gap-2">
            <Clapperboard className="size-6 text-yt-red" />
            <h2 className="text-xl font-semibold">Shorts</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {shorts.slice(0, 6).map((s) => (
              <ShortCard key={s.id} short={s} />
            ))}
          </div>
          <Link
            href="/shorts"
            className="mt-4 inline-block rounded-full bg-yt-hover px-4 py-2 text-sm font-medium hover:bg-yt-active"
          >
            Show more
          </Link>
        </section>

        <VideoGrid videos={rest} />
      </div>
    </div>
  );
}
