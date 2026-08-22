"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { comments as seedComments } from "@/lib/data";
import { formatCount, timeAgo } from "@/lib/format";

export default function CommentsSection() {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [posted, setPosted] = useState<
    { id: string; text: string }[]
  >([]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    setPosted((p) => [{ id: `me-${Date.now()}`, text: t }, ...p]);
    setText("");
    setFocused(false);
  };

  const total = seedComments.length + posted.length;

  return (
    <section className="mt-6">
      <div className="mb-6 flex items-center gap-6">
        <h2 className="text-xl font-semibold">{total} Comments</h2>
        <button className="flex items-center gap-2 text-sm font-medium">
          <ChevronDown className="size-5" /> Sort by
        </button>
      </div>

      {/* Add comment */}
      <div className="mb-8 flex gap-3">
        <Avatar name="Akram" size={40} />
        <div className="flex-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Add a comment..."
            className="w-full border-b border-yt-border bg-transparent pb-1 text-sm focus:border-yt-text focus:outline-none"
          />
          {focused && (
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setText("");
                  setFocused(false);
                }}
                className="rounded-full px-4 py-2 text-sm font-medium hover:bg-yt-hover"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!text.trim()}
                className="rounded-full bg-yt-blue px-4 py-2 text-sm font-medium text-yt-bg disabled:bg-yt-hover disabled:text-yt-muted"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <ul className="space-y-6">
        {posted.map((c) => (
          <Comment
            key={c.id}
            author="Akram (you)"
            hoursAgo={0}
            text={c.text}
            likes={0}
            replies={0}
          />
        ))}
        {seedComments.map((c) => (
          <Comment
            key={c.id}
            author={c.author}
            hoursAgo={c.hoursAgo}
            text={c.text}
            likes={c.likes}
            replies={c.replies}
          />
        ))}
      </ul>
    </section>
  );
}

function Comment({
  author,
  hoursAgo,
  text,
  likes,
  replies,
}: {
  author: string;
  hoursAgo: number;
  text: string;
  likes: number;
  replies: number;
}) {
  return (
    <li className="flex gap-3">
      <Avatar name={author} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{author}</span>
          <span className="text-xs text-yt-muted">{timeAgo(hoursAgo)}</span>
        </div>
        <p className="mt-1 text-sm">{text}</p>
        <div className="mt-2 flex items-center gap-4 text-yt-muted">
          <button className="flex items-center gap-1 text-xs hover:text-yt-text">
            <ThumbsUp className="size-4" /> {likes ? formatCount(likes) : ""}
          </button>
          <button className="hover:text-yt-text" aria-label="Dislike">
            <ThumbsDown className="size-4" />
          </button>
          <button className="text-xs font-medium hover:text-yt-text">Reply</button>
        </div>
        {replies > 0 && (
          <button className="mt-2 flex items-center gap-1 text-sm font-medium text-yt-blue">
            <ChevronDown className="size-4" /> {replies} replies
          </button>
        )}
      </div>
    </li>
  );
}
