"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Scissors,
  MoreHorizontal,
  CheckCircle,
  Bell,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { formatCount } from "@/lib/format";
import type { Channel } from "@/lib/data";

export default function VideoActions({
  channel,
  likes,
}: {
  channel: Channel;
  likes: number;
}) {
  const [subscribed, setSubscribed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Channel */}
      <div className="flex items-center gap-3">
        <Link href={`/channel/${channel.id}`}>
          <Avatar name={channel.name} size={40} />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/channel/${channel.id}`}
            className="flex items-center gap-1 font-medium"
          >
            {channel.name}
            {channel.verified && <CheckCircle className="size-3.5 text-yt-muted" />}
          </Link>
          <p className="text-xs text-yt-muted">
            {formatCount(channel.subscribers)} subscribers
          </p>
        </div>
        <button
          onClick={() => setSubscribed((s) => !s)}
          className={`ml-2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            subscribed
              ? "bg-yt-hover text-yt-text hover:bg-yt-active"
              : "bg-yt-text text-yt-bg hover:bg-white"
          }`}
        >
          {subscribed ? (
            <>
              <Bell className="size-4" /> Subscribed
            </>
          ) : (
            "Subscribe"
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-full bg-yt-hover">
          <button
            onClick={() => {
              setLiked((l) => !l);
              setDisliked(false);
            }}
            className="flex items-center gap-2 rounded-l-full py-2 pl-4 pr-3 text-sm font-medium hover:bg-yt-active"
          >
            <ThumbsUp
              className={`size-5 ${liked ? "fill-yt-text" : ""}`}
            />
            {formatCount(likes + (liked ? 1 : 0))}
          </button>
          <span className="h-6 w-px bg-yt-border" />
          <button
            onClick={() => {
              setDisliked((d) => !d);
              setLiked(false);
            }}
            className="rounded-r-full px-4 py-2 hover:bg-yt-active"
            aria-label="Dislike"
          >
            <ThumbsDown className={`size-5 ${disliked ? "fill-yt-text" : ""}`} />
          </button>
        </div>

        <button className="flex items-center gap-2 rounded-full bg-yt-hover px-4 py-2 text-sm font-medium hover:bg-yt-active">
          <Share2 className="size-5" /> Share
        </button>
        <button className="hidden items-center gap-2 rounded-full bg-yt-hover px-4 py-2 text-sm font-medium hover:bg-yt-active sm:flex">
          <Download className="size-5" /> Download
        </button>
        <button className="hidden items-center gap-2 rounded-full bg-yt-hover px-4 py-2 text-sm font-medium hover:bg-yt-active md:flex">
          <Scissors className="size-5" /> Clip
        </button>
        <button
          className="flex size-9 items-center justify-center rounded-full bg-yt-hover hover:bg-yt-active"
          aria-label="More"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>
    </div>
  );
}
