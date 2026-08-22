"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  Home,
  Clapperboard,
  PlaySquare,
  Clock,
  ListVideo,
  History,
  ThumbsUp,
  ChevronDown,
  Flame,
  ShoppingBag,
  Music2,
  Film,
  Radio,
  Gamepad2,
  Newspaper,
  Trophy,
  Podcast,
  Settings,
  Flag,
  HelpCircle,
  MessageSquare,
  User,
} from "lucide-react";
import { channels } from "@/lib/data";
import Avatar from "@/components/ui/Avatar";

type Item = { label: string; href: string; icon: ComponentType<{ className?: string }> };

const primary: Item[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shorts", href: "/shorts", icon: Clapperboard },
  { label: "Subscriptions", href: "/feed/subscriptions", icon: PlaySquare },
];

const you: Item[] = [
  { label: "History", href: "/feed/history", icon: History },
  { label: "Playlists", href: "/feed/playlists", icon: ListVideo },
  { label: "Your videos", href: "/studio", icon: PlaySquare },
  { label: "Watch later", href: "/playlist/pl-watchlater", icon: Clock },
  { label: "Liked videos", href: "/playlist/pl-liked", icon: ThumbsUp },
];

const explore: Item[] = [
  { label: "Trending", href: "/feed/trending", icon: Flame },
  { label: "Shopping", href: "/feed/trending", icon: ShoppingBag },
  { label: "Music", href: "/feed/trending", icon: Music2 },
  { label: "Movies", href: "/feed/trending", icon: Film },
  { label: "Live", href: "/feed/trending", icon: Radio },
  { label: "Gaming", href: "/feed/trending", icon: Gamepad2 },
  { label: "News", href: "/feed/trending", icon: Newspaper },
  { label: "Sport", href: "/feed/trending", icon: Trophy },
  { label: "Podcasts", href: "/feed/trending", icon: Podcast },
];

const settings: Item[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Report history", href: "/feed/history", icon: Flag },
  { label: "Help", href: "/settings", icon: HelpCircle },
  { label: "Send feedback", href: "/settings", icon: MessageSquare },
];

function Row({ item }: { item: Item }) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-6 rounded-lg px-3 py-2.5 text-sm transition ${
        active ? "bg-yt-hover font-medium" : "hover:bg-yt-hover"
      }`}
    >
      <Icon className="size-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-3 pb-1 pt-2 text-base font-medium text-yt-text">{children}</h2>
  );
}

const Divider = () => <hr className="my-3 border-yt-border" />;

export default function Sidebar() {
  return (
    <nav className="yt-scroll h-full overflow-y-auto px-3 pb-8 pt-2 text-yt-text">
      <div className="space-y-0.5">
        {primary.map((i) => (
          <Row key={i.label} item={i} />
        ))}
      </div>

      <Divider />

      <Link
        href="/feed/you"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium hover:bg-yt-hover"
      >
        You <ChevronDown className="size-4 -rotate-90" />
      </Link>
      <div className="space-y-0.5">
        {you.map((i) => (
          <Row key={i.label} item={i} />
        ))}
      </div>

      <Divider />

      <SectionTitle>Subscriptions</SectionTitle>
      <div className="space-y-0.5">
        {channels.slice(0, 7).map((c) => (
          <Link
            key={c.id}
            href={`/channel/${c.id}`}
            className="flex items-center gap-6 rounded-lg px-3 py-2 text-sm hover:bg-yt-hover"
          >
            <Avatar name={c.name} size={24} />
            <span className="truncate">{c.name}</span>
          </Link>
        ))}
      </div>

      <Divider />

      <SectionTitle>Explore</SectionTitle>
      <div className="space-y-0.5">
        {explore.map((i) => (
          <Row key={i.label} item={i} />
        ))}
      </div>

      <Divider />

      <div className="space-y-0.5">
        {settings.map((i) => (
          <Row key={i.label} item={i} />
        ))}
      </div>

      <Divider />

      <p className="px-3 text-xs leading-5 text-yt-muted">
        About Press Copyright Contact us Creators Advertise Developers
      </p>
      <p className="mt-3 px-3 text-xs leading-5 text-yt-muted">
        Terms Privacy Policy &amp; Safety How YouTube works Test new features
      </p>
      <p className="mt-4 px-3 text-xs text-yt-muted/70">
        <User className="mb-0.5 mr-1 inline size-3" />© 2026 Clonetube
      </p>
    </nav>
  );
}
