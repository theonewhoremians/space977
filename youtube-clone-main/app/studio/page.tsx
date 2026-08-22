import Link from "next/link";
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  Upload,
  Globe,
  Pencil,
  MoreVertical,
} from "lucide-react";
import { getChannelSafe, getVideosByChannel } from "@/lib/data";
import { formatCount, formatViews, timeAgo } from "@/lib/format";
import Avatar from "@/components/ui/Avatar";

/* eslint-disable @next/next/no-img-element */
export default function StudioPage() {
  const channel = getChannelSafe("ch-lumen");
  const myVideos = getVideosByChannel("ch-lumen");
  const totalViews = myVideos.reduce((s, v) => s + v.views, 0);

  const stats = [
    { icon: Users, label: "Subscribers", value: formatCount(channel.subscribers) },
    { icon: Eye, label: "Views (28 days)", value: formatCount(totalViews) },
    { icon: Clock, label: "Watch time (hrs)", value: formatCount(totalViews / 12) },
    { icon: TrendingUp, label: "Revenue (est.)", value: `$${formatCount(totalViews / 900)}` },
  ];

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 md:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Avatar name={channel.name} size={64} />
        <div>
          <p className="text-sm text-yt-muted">Channel dashboard</p>
          <h1 className="text-2xl font-bold">{channel.name}</h1>
        </div>
        <button className="ml-auto flex items-center gap-2 rounded-full bg-yt-text px-4 py-2 text-sm font-medium text-yt-bg hover:bg-white">
          <Upload className="size-5" /> Upload video
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-yt-border bg-yt-surface p-4"
            >
              <div className="flex items-center gap-2 text-yt-muted">
                <Icon className="size-5" />
                <span className="text-sm">{s.label}</span>
              </div>
              <p className="mt-3 text-3xl font-bold">{s.value}</p>
              <p className="mt-1 text-xs text-green-400">▲ 12% vs last period</p>
            </div>
          );
        })}
      </div>

      {/* Videos table */}
      <h2 className="mb-4 text-xl font-semibold">Your content</h2>
      <div className="overflow-hidden rounded-2xl border border-yt-border">
        <div className="hidden grid-cols-[3fr_1fr_1fr_1fr_1fr] gap-4 border-b border-yt-border bg-yt-surface px-4 py-3 text-xs font-medium uppercase tracking-wide text-yt-muted md:grid">
          <span>Video</span>
          <span>Visibility</span>
          <span>Date</span>
          <span className="text-right">Views</span>
          <span className="text-right">Likes</span>
        </div>
        {myVideos.map((v) => (
          <div
            key={v.id}
            className="group grid grid-cols-1 gap-4 border-b border-yt-border px-4 py-3 last:border-0 hover:bg-yt-surface md:grid-cols-[3fr_1fr_1fr_1fr_1fr] md:items-center"
          >
            <div className="flex gap-3">
              <Link
                href={`/watch/${v.id}`}
                className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-yt-hover"
              >
                <img src={v.thumb} alt="" className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/watch/${v.id}`}
                  className="line-clamp-2 text-sm font-medium"
                >
                  {v.title}
                </Link>
                <p className="mt-1 line-clamp-1 text-xs text-yt-muted">
                  {v.description}
                </p>
                <div className="mt-1 flex gap-2 text-yt-muted opacity-0 transition group-hover:opacity-100">
                  <Pencil className="size-4" />
                  <MoreVertical className="size-4" />
                </div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-sm text-yt-muted">
              <Globe className="size-4" /> Public
            </span>
            <span className="text-sm text-yt-muted">{timeAgo(v.hoursAgo)}</span>
            <span className="text-sm md:text-right">{formatViews(v.views)}</span>
            <span className="text-sm md:text-right">{formatCount(v.likes)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
