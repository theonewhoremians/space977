"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { Home, Clapperboard, PlaySquare, User } from "lucide-react";

const items: { label: string; href: string; icon: ComponentType<{ className?: string }> }[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shorts", href: "/shorts", icon: Clapperboard },
  { label: "Subscriptions", href: "/feed/subscriptions", icon: PlaySquare },
  { label: "You", href: "/feed/you", icon: User },
];

export default function MiniSidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col items-center gap-1 pt-2">
      {items.map((i) => {
        const Icon = i.icon;
        const active = pathname === i.href;
        return (
          <Link
            key={i.label}
            href={i.href}
            className={`flex w-16 flex-col items-center gap-1 rounded-lg py-3.5 text-[10px] transition ${
              active ? "bg-yt-hover" : "hover:bg-yt-hover"
            }`}
          >
            <Icon className="size-6" />
            <span>{i.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
