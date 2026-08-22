"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ChipBar({
  items,
  initial = 0,
}: {
  items: string[];
  initial?: number;
}) {
  const [active, setActive] = useState(initial);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    scrollerRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={() => scrollBy(-1)}
        className="absolute left-0 z-10 hidden size-8 items-center justify-center rounded-full bg-yt-bg text-yt-text hover:bg-yt-hover md:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft className="size-5" />
      </button>
      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth md:px-9"
      >
        {items.map((item, i) => (
          <button
            key={item}
            onClick={() => setActive(i)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active === i
                ? "bg-yt-text text-yt-bg"
                : "bg-yt-hover text-yt-text hover:bg-yt-active"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <button
        onClick={() => scrollBy(1)}
        className="absolute right-0 z-10 hidden size-8 items-center justify-center rounded-full bg-yt-bg text-yt-text hover:bg-yt-hover md:flex"
        aria-label="Scroll right"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
