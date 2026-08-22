import { formatDuration } from "@/lib/format";

/* eslint-disable @next/next/no-img-element */
export default function Thumbnail({
  src,
  alt,
  duration,
  className = "",
  rounded = "rounded-xl",
}: {
  src: string;
  alt: string;
  duration?: number;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`group/thumb relative w-full overflow-hidden bg-yt-hover ${rounded} ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {duration !== undefined && (
        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}
