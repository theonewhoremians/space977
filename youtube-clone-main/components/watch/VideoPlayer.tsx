"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  Settings,
  Maximize,
  SkipForward,
  Captions,
  PictureInPicture2,
} from "lucide-react";
import { formatDuration } from "@/lib/format";

export default function VideoPlayer({
  poster,
  duration,
  title,
}: {
  poster: string;
  duration: number;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(8);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 100 / duration));
      }, 1000);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, duration]);

  const current = formatDuration((progress / 100) * duration);
  const total = formatDuration(duration);

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-none bg-black md:rounded-2xl">
      <img src={poster} alt={title} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Center play button */}
      {!playing && (
        <button
          onClick={() => setPlaying(true)}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-black/60 backdrop-blur transition hover:scale-110 hover:bg-yt-red">
            <Play className="ml-1 size-8 fill-white text-white" />
          </span>
        </button>
      )}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        {/* progress bar */}
        <div className="group/bar mb-2 h-1 w-full cursor-pointer rounded-full bg-white/30">
          <div
            className="relative h-full rounded-full bg-yt-red"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute -right-1.5 top-1/2 size-3 -translate-y-1/2 rounded-full bg-yt-red opacity-0 group-hover/bar:opacity-100" />
          </div>
        </div>
        <div className="flex items-center gap-4 text-white">
          <button onClick={() => setPlaying((p) => !p)} aria-label="Play/Pause">
            {playing ? (
              <Pause className="size-6 fill-white" />
            ) : (
              <Play className="size-6 fill-white" />
            )}
          </button>
          <button aria-label="Next">
            <SkipForward className="size-6 fill-white" />
          </button>
          <div className="flex items-center gap-2">
            <Volume2 className="size-6" />
            <div className="h-1 w-16 rounded-full bg-white/40">
              <div className="h-full w-2/3 rounded-full bg-white" />
            </div>
          </div>
          <span className="text-sm tabular-nums">
            {current} / {total}
          </span>
          <div className="ml-auto flex items-center gap-4">
            <Captions className="size-6" />
            <Settings className="size-6" />
            <PictureInPicture2 className="size-6" />
            <Maximize className="size-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
