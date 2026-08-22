"use client";

import { useState } from "react";
import { formatViews, timeAgo } from "@/lib/format";

export default function DescriptionBox({
  views,
  hoursAgo,
  description,
  category,
}: {
  views: number;
  hoursAgo: number;
  description: string;
  category: string;
}) {
  const [open, setOpen] = useState(false);
  const tags = ["#clonetube", `#${category.toLowerCase()}`, "#trending"];

  return (
    <div
      className={`rounded-xl bg-yt-hover p-3 text-sm transition ${
        open ? "" : "cursor-pointer hover:bg-yt-active"
      }`}
      onClick={() => !open && setOpen(true)}
    >
      <div className="flex flex-wrap gap-x-2 font-medium">
        <span>{formatViews(views)}</span>
        <span>{timeAgo(hoursAgo)}</span>
        <span className="text-yt-blue">{tags.join(" ")}</span>
      </div>
      <p className={`mt-2 whitespace-pre-line ${open ? "" : "line-clamp-2"}`}>
        {description}
        {"\n\n"}
        Chapters:
        {"\n"}00:00 Intro
        {"\n"}02:14 The core idea
        {"\n"}06:40 Deep dive
        {"\n"}12:30 Final thoughts
        {"\n\n"}Subscribe for a new video every week. Follow us everywhere
        @clonetube.
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="mt-2 font-medium"
      >
        {open ? "Show less" : "...more"}
      </button>
    </div>
  );
}
