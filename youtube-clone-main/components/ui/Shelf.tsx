import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export default function Shelf({
  title,
  href,
  icon,
  children,
}: {
  title: string;
  href: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link
          href={href}
          className="ml-auto flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium hover:bg-yt-hover"
        >
          View all <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">{children}</div>
    </section>
  );
}
