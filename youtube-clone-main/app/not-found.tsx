import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-yt-hover text-5xl font-bold text-yt-muted">
        404
      </span>
      <h1 className="mt-6 text-2xl font-semibold">This page isn&apos;t available</h1>
      <p className="mt-2 max-w-md text-sm text-yt-muted">
        Sorry about that. Try searching for something else, or head back to the
        home page.
      </p>
      <Link
        href="/"
        className="mt-6 flex items-center gap-2 rounded-full bg-yt-text px-5 py-2.5 text-sm font-medium text-yt-bg hover:bg-white"
      >
        <Home className="size-5" /> Go home
      </Link>
    </div>
  );
}
