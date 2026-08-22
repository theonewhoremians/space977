"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  Search,
  Mic,
  Video,
  Bell,
  ArrowLeft,
  Plus,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/results?search_query=${encodeURIComponent(q)}` : "/results");
    setMobileSearch(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-4 bg-yt-bg px-4">
      {/* Left */}
      {!mobileSearch && (
        <div className="flex items-center gap-1 md:gap-4">
          <button
            onClick={onMenuClick}
            aria-label="Menu"
            className="flex size-10 items-center justify-center rounded-full hover:bg-yt-hover"
          >
            <Menu className="size-6" />
          </button>
          <Link href="/" className="flex items-center gap-1">
            <span className="flex h-6 w-8 items-center justify-center rounded-md bg-yt-red">
              <span className="ml-0.5 border-y-[6px] border-l-[9px] border-y-transparent border-l-white" />
            </span>
            <span className="text-xl font-semibold tracking-tighter">
              Clonetube
            </span>
          </Link>
        </div>
      )}

      {/* Center: search */}
      <div
        className={`${
          mobileSearch ? "flex" : "hidden md:flex"
        } max-w-2xl flex-1 items-center gap-2`}
      >
        {mobileSearch && (
          <button
            onClick={() => setMobileSearch(false)}
            aria-label="Back"
            className="flex size-10 items-center justify-center rounded-full hover:bg-yt-hover"
          >
            <ArrowLeft className="size-6" />
          </button>
        )}
        <form onSubmit={submit} className="flex flex-1">
          <div className="flex flex-1 items-center rounded-l-full border border-yt-border bg-[#121212] pl-4 focus-within:border-yt-blue">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-10 w-full bg-transparent text-base text-yt-text placeholder:text-yt-muted focus:outline-none"
            />
          </div>
          <button
            type="submit"
            aria-label="Search"
            className="flex h-10 w-16 items-center justify-center rounded-r-full border border-l-0 border-yt-border bg-yt-hover hover:bg-yt-active"
          >
            <Search className="size-5" />
          </button>
        </form>
        <button
          aria-label="Search with your voice"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yt-hover hover:bg-yt-active"
        >
          <Mic className="size-5" />
        </button>
      </div>

      {/* Right */}
      {!mobileSearch && (
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setMobileSearch(true)}
            aria-label="Search"
            className="flex size-10 items-center justify-center rounded-full hover:bg-yt-hover md:hidden"
          >
            <Search className="size-6" />
          </button>
          <button className="hidden items-center gap-2 rounded-full bg-yt-hover px-4 py-2 text-sm font-medium hover:bg-yt-active sm:flex">
            <Plus className="size-5" />
            Create
          </button>
          <button
            aria-label="Create"
            className="flex size-10 items-center justify-center rounded-full hover:bg-yt-hover sm:hidden"
          >
            <Video className="size-6" />
          </button>
          <button
            aria-label="Notifications"
            className="relative flex size-10 items-center justify-center rounded-full hover:bg-yt-hover"
          >
            <Bell className="size-6" />
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-yt-red px-1 text-[10px] font-semibold text-white">
              9+
            </span>
          </button>
          <button aria-label="Account" className="ml-1">
            <Avatar name="Akram" size={32} />
          </button>
        </div>
      )}
    </header>
  );
}
