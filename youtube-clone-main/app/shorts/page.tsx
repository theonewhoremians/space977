"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Music2,
  Play,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { shorts, getChannelSafe } from "@/lib/data";
import { formatCount } from "@/lib/format";

export default function ShortsPage() {
  return (
    <div className="flex justify-center">
      <div className="h-[calc(100vh-3.5rem)] w-full snap-y snap-mandatory overflow-y-scroll yt-scroll">
        {shorts.map((s) => (
          <ShortSlide key={s.id} short={s} />
        ))}
      </div>
    </div>
  );
}

function ShortSlide({ short }: { short: (typeof shorts)[number] }) {
  const channel = getChannelSafe(short.channelId);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] snap-start snap-always items-center justify-center py-3">
      <div className="flex h-full items-end gap-4">
        {/* Video */}
        <div className="relative h-full max-h-[820px] w-[min(462px,calc((100vh-3.5rem)*0.5625))] overflow-hidden rounded-2xl bg-yt-hover">
          <img src={short.thumb} alt={short.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <button className="absolute inset-0 flex items-center justify-center">
            <Play className="size-14 fill-white/80 text-white/80" />
          </button>

          {/* Bottom info */}
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <div className="mb-3 flex items-center gap-2">
              <Avatar name={channel.name} size={32} />
              <span className="text-sm font-medium">{channel.handle}</span>
              <button
                onClick={() => setSubscribed((v) => !v)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  subscribed ? "bg-white/20" : "bg-white text-black"
                }`}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>
            <p className="line-clamp-2 text-sm">{short.title}</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Music2 className="size-4" />
              <span className="truncate">Original audio · {channel.name}</span>
            </div>
          </div>
        </div>

        {/* Actions rail */}
        <div className="flex flex-col items-center gap-5 pb-4">
          <RailButton
            onClick={() => setLiked((v) => !v)}
            icon={<Heart className={`size-7 ${liked ? "fill-yt-red text-yt-red" : ""}`} />}
            label={formatCount(short.likes + (liked ? 1 : 0))}
          />
          <RailButton icon={<ThumbsDown className="size-7" />} label="Dislike" />
          <RailButton icon={<MessageCircle className="size-7" />} label={formatCount(short.views / 40)} />
          <RailButton icon={<Share2 className="size-7" />} label="Share" />
          <RailButton icon={<MoreHorizontal className="size-7" />} label="" />
          <Link
            href={`/channel/${channel.id}`}
            className="mt-1 overflow-hidden rounded-lg"
          >
            <Avatar name={channel.name} size={40} className="rounded-lg" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function RailButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <span className="flex size-12 items-center justify-center rounded-full bg-yt-hover hover:bg-yt-active">
        {icon}
      </span>
      {label && <span className="text-xs font-medium">{label}</span>}
    </button>
  );
}
