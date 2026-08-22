import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { type Short } from "@/lib/data";
import { formatViews } from "@/lib/format";

/* eslint-disable @next/next/no-img-element */
export default function ShortCard({ short }: { short: Short }) {
  return (
    <div className="group flex flex-col animate-fade-in">
      <Link
        href="/shorts"
        className="relative block aspect-9/16 w-full overflow-hidden rounded-xl bg-yt-hover"
      >
        <img
          src={short.thumb}
          alt={short.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </Link>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href="/shorts">
            <h3 className="line-clamp-2 text-sm font-medium text-yt-text">
              {short.title}
            </h3>
          </Link>
          <p className="mt-1 text-[13px] text-yt-muted">
            {formatViews(short.views)}
          </p>
        </div>
        <button
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-yt-text opacity-0 transition hover:bg-yt-hover group-hover:opacity-100"
          aria-label="More options"
        >
          <MoreVertical className="size-5" />
        </button>
      </div>
    </div>
  );
}
