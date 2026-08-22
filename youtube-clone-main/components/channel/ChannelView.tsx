"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { CheckCircle, Bell, Search, Globe, Video as VideoIcon } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import VideoGrid from "@/components/ui/VideoGrid";
import ShortCard from "@/components/ui/ShortCard";
import PlaylistCard from "@/components/ui/PlaylistCard";
import { formatCount, formatViews, timeAgo } from "@/lib/format";
import type { Channel, Video, Short, Playlist } from "@/lib/data";

const tabs = ["Home", "Videos", "Shorts", "Playlists", "Community", "About"];

export default function ChannelView({
  channel,
  videos,
  shorts,
  playlists,
}: {
  channel: Channel;
  videos: Video[];
  shorts: Short[];
  playlists: Playlist[];
}) {
  const [tab, setTab] = useState("Home");
  const [subscribed, setSubscribed] = useState(false);
  const featured = videos[0];

  return (
    <div className="mx-auto max-w-[1300px] px-4 pb-12 pt-4 md:px-6">
      {/* Banner */}
      <div className="aspect-[6/1] w-full overflow-hidden rounded-2xl bg-yt-hover">
        <img src={channel.banner} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name={channel.name} size={112} />
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            {channel.name}
            {channel.verified && <CheckCircle className="size-5 text-yt-muted" />}
          </h1>
          <p className="mt-1 text-sm text-yt-muted">
            <span className="font-medium text-yt-text">{channel.handle}</span> ·{" "}
            {formatCount(channel.subscribers)} subscribers · {videos.length} videos
          </p>
          <p className="mt-1 line-clamp-1 max-w-xl text-sm text-yt-muted">
            {channel.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSubscribed((s) => !s)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                subscribed
                  ? "bg-yt-hover hover:bg-yt-active"
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
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-10 mt-4 flex items-center gap-6 border-b border-yt-border bg-yt-bg">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative py-3 text-sm font-medium transition ${
              tab === t ? "text-yt-text" : "text-yt-muted hover:text-yt-text"
            }`}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-yt-text" />
            )}
          </button>
        ))}
        <button className="ml-auto text-yt-muted hover:text-yt-text" aria-label="Search channel">
          <Search className="size-5" />
        </button>
      </div>

      <div className="mt-6">
        {tab === "Home" && (
          <div className="space-y-8">
            {featured && (
              <div className="flex flex-col gap-4 border-b border-yt-border pb-8 md:flex-row">
                <div className="w-full md:w-[480px]">
                  <div className="overflow-hidden rounded-xl">
                    <img src={featured.thumb} alt={featured.title} className="w-full" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-medium">{featured.title}</h2>
                  <p className="mt-1 text-sm text-yt-muted">
                    {formatViews(featured.views)} · {timeAgo(featured.hoursAgo)}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-yt-muted">
                    {featured.description}
                  </p>
                </div>
              </div>
            )}
            <section>
              <h2 className="mb-4 text-lg font-medium">Videos</h2>
              <VideoGrid videos={videos.slice(0, 8)} showAvatar={false} />
            </section>
          </div>
        )}

        {tab === "Videos" && <VideoGrid videos={videos} showAvatar={false} />}

        {tab === "Shorts" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {shorts.map((s) => (
              <ShortCard key={s.id} short={s} />
            ))}
          </div>
        )}

        {tab === "Playlists" && (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {playlists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        )}

        {tab === "Community" && (
          <div className="mx-auto max-w-2xl space-y-6">
            {videos.slice(0, 3).map((v, i) => (
              <article key={v.id} className="rounded-xl border border-yt-border p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={channel.name} size={40} />
                  <div>
                    <p className="text-sm font-medium">{channel.name}</p>
                    <p className="text-xs text-yt-muted">{timeAgo((i + 1) * 20)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm">
                  New video is live! 🎉 {v.title} — let us know what you think in the
                  comments below. 👇
                </p>
                <div className="mt-3 overflow-hidden rounded-xl">
                  <img src={v.thumb} alt="" className="w-full" />
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-yt-muted">
                  <span>👍 {formatCount(v.likes)}</span>
                  <span>💬 {formatCount(v.views / 100)}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "About" && (
          <div className="max-w-2xl space-y-4">
            <p className="whitespace-pre-line text-sm">{channel.description}</p>
            <div className="space-y-2 text-sm text-yt-muted">
              <p className="flex items-center gap-2">
                <VideoIcon className="size-4" /> {formatCount(channel.subscribers)} subscribers
              </p>
              <p className="flex items-center gap-2">
                <Globe className="size-4" /> clonetube.example/{channel.handle}
              </p>
              <p>Joined Jan 2019</p>
              <p>
                {formatCount(
                  videos.reduce((sum, v) => sum + v.views, 0),
                )}{" "}
                total views
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
