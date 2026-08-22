import { avatarColor } from "@/lib/data";

export default function Avatar({
  name,
  size = 36,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const letter = name.replace(/^@/, "").charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: avatarColor(name),
        fontSize: size * 0.45,
      }}
      aria-hidden
    >
      {letter}
    </span>
  );
}
