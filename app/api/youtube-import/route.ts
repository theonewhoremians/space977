type YouTubeThumbnail = { url?: string };
type ChannelItem = {
  id: string;
  snippet?: { title?: string; thumbnails?: Record<string, YouTubeThumbnail> };
  statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean };
};
type SearchItem = { id?: { videoId?: string; channelId?: string } };
type VideoItem = {
  id: string;
  snippet?: { title?: string; publishedAt?: string; thumbnails?: Record<string, YouTubeThumbnail> };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
};

const apiBase = "https://www.googleapis.com/youtube/v3";

function compactCount(value: string | undefined) {
  if (!value) return "0";
  const count = Number(value);
  if (!Number.isFinite(count)) return value;
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(count);
}

function bestThumbnail(thumbnails: Record<string, YouTubeThumbnail> | undefined) {
  return thumbnails?.maxres?.url || thumbnails?.standard?.url || thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || "";
}

async function youtube(path: string, parameters: Record<string, string>, key: string) {
  const url = new URL(`${apiBase}/${path}`);
  Object.entries({ ...parameters, key }).forEach(([name, value]) => url.searchParams.set(name, value));
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await response.json() as { error?: { message?: string }; items?: unknown[] };
  if (!response.ok) throw new Error(data.error?.message || "YouTube did not return channel data.");
  return data;
}

async function resolveChannel(query: string, key: string) {
  const trimmed = query.trim();
  let channelId = "";
  let handle = "";
  let username = "";

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://youtube.com/${trimmed.startsWith("@") ? trimmed : ""}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "channel") channelId = parts[1] || "";
    else if (parts[0]?.startsWith("@")) handle = parts[0].slice(1);
    else if (parts[0] === "user") username = parts[1] || "";
  } catch { /* Plain search text is handled below. */ }

  if (!channelId && /^UC[\w-]{22}$/.test(trimmed)) channelId = trimmed;
  if (!handle && trimmed.startsWith("@")) handle = trimmed.slice(1);

  const lookup = channelId
    ? await youtube("channels", { part: "snippet,statistics", id: channelId }, key)
    : handle
      ? await youtube("channels", { part: "snippet,statistics", forHandle: handle }, key)
      : username
        ? await youtube("channels", { part: "snippet,statistics", forUsername: username }, key)
        : null;
  const direct = lookup?.items?.[0] as ChannelItem | undefined;
  if (direct) return direct;

  const search = await youtube("search", { part: "snippet", q: trimmed, type: "channel", maxResults: "1" }, key);
  const foundId = (search.items?.[0] as SearchItem | undefined)?.id?.channelId;
  if (!foundId) throw new Error("No public YouTube channel matched that entry.");
  const channel = await youtube("channels", { part: "snippet,statistics", id: foundId }, key);
  const item = channel.items?.[0] as ChannelItem | undefined;
  if (!item) throw new Error("The YouTube channel could not be loaded.");
  return item;
}

export async function POST(request: Request) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return Response.json({ error: "YouTube import is not configured. Add YOUTUBE_API_KEY to the server environment." }, { status: 503 });

  try {
    const body = await request.json() as { channel?: string };
    const query = body.channel?.trim() || "";
    if (!query || query.length > 200) return Response.json({ error: "Enter a valid YouTube channel URL, handle, ID, or name." }, { status: 400 });

    const channel = await resolveChannel(query, key);
    const search = await youtube("search", { part: "snippet", channelId: channel.id, type: "video", order: "date", maxResults: "3" }, key);
    const videoIds = (search.items as SearchItem[] | undefined)?.map((item) => item.id?.videoId).filter((id): id is string => Boolean(id)) || [];
    if (!videoIds.length) return Response.json({ error: "This channel has no public videos or Shorts to import." }, { status: 404 });

    const videoResponse = await youtube("videos", { part: "snippet,statistics", id: videoIds.join(",") }, key);
    const items = videoResponse.items as VideoItem[] | undefined || [];
    const byId = new Map(items.map((item) => [item.id, item]));
    const videos = videoIds.map((id) => byId.get(id)).filter((item): item is VideoItem => Boolean(item)).map((item) => ({
      title: item.snippet?.title || "Untitled video",
      publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
      thumbnailUrl: bestThumbnail(item.snippet?.thumbnails),
      views: compactCount(item.statistics?.viewCount),
      likes: compactCount(item.statistics?.likeCount),
      comments: compactCount(item.statistics?.commentCount),
    }));

    return Response.json({
      channel: {
        title: channel.snippet?.title || query,
        avatarUrl: bestThumbnail(channel.snippet?.thumbnails),
        subscriberCount: channel.statistics?.hiddenSubscriberCount ? "Hidden" : compactCount(channel.statistics?.subscriberCount),
      },
      videos,
    }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "YouTube import failed." }, { status: 502 });
  }
}

export function GET() {
  return Response.json({ error: "Use POST to import a YouTube channel." }, { status: 405, headers: { Allow: "POST" } });
}
