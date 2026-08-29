type PublicChannel = { id: string; pageUrl: string; pageHtml: string };

const youtubeHostPattern = /(^|\.)youtube\.com$/i;
const channelIdPattern = /^UC[A-Za-z0-9_-]{22}$/;
const publicHeaders = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.8",
  "User-Agent": "Mozilla/5.0 (compatible; YouTubeInsight/1.0; +https://space977.vercel.app)",
};

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function decodeJsonText(value: string) {
  try {
    return JSON.parse(`"${value.replace(/"/g, '\\"')}"`) as string;
  } catch {
    return value.replace(/\\u0026/g, "&").replace(/\\\//g, "/");
  }
}

function compactCount(value: string | undefined) {
  if (!value) return "—";
  const count = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(count)) return value;
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(count);
}

function firstMatch(source: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = source.match(pattern)?.[1];
    if (match) return decodeEntities(decodeJsonText(match));
  }
  return "";
}

async function fetchPublicPage(url: string) {
  const response = await fetch(url, { headers: publicHeaders, redirect: "follow" });
  if (!response.ok) throw new Error("The public YouTube channel page could not be loaded.");
  return response.text();
}

function channelIdFromPage(html: string) {
  return firstMatch(html, [
    /<meta[^>]+itemprop=["']channelId["'][^>]+content=["'](UC[A-Za-z0-9_-]{22})["']/i,
    /<meta[^>]+content=["'](UC[A-Za-z0-9_-]{22})["'][^>]+itemprop=["']channelId["']/i,
    /["']channelId["']\s*:\s*["'](UC[A-Za-z0-9_-]{22})["']/i,
    /youtube\.com\/channel\/(UC[A-Za-z0-9_-]{22})/i,
  ]);
}

async function resolveChannel(query: string): Promise<PublicChannel> {
  const trimmed = query.trim();
  let channelId = channelIdPattern.test(trimmed) ? trimmed : "";
  let pageUrl = channelId ? `https://www.youtube.com/channel/${channelId}` : "";

  if (!pageUrl && trimmed.startsWith("@")) {
    if (!/^@[A-Za-z0-9._-]{3,30}$/.test(trimmed)) throw new Error("Enter a valid YouTube @handle.");
    pageUrl = `https://www.youtube.com/${trimmed}`;
  }

  if (!pageUrl) {
    let suppliedUrl: URL;
    try {
      suppliedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    } catch {
      throw new Error("Enter a YouTube channel URL, @handle, or channel ID.");
    }
    if (!youtubeHostPattern.test(suppliedUrl.hostname)) throw new Error("Only public youtube.com channel links can be imported.");
    const parts = suppliedUrl.pathname.split("/").filter(Boolean);
    const supported = parts[0] === "channel" || parts[0] === "user" || parts[0] === "c" || parts[0]?.startsWith("@");
    if (!supported) throw new Error("Enter a YouTube channel URL, @handle, or channel ID.");
    pageUrl = `https://www.youtube.com/${parts.slice(0, 2).join("/")}`;
    if (parts[0] === "channel" && channelIdPattern.test(parts[1] || "")) channelId = parts[1];
  }

  const pageHtml = await fetchPublicPage(pageUrl).catch((error) => {
    if (channelId) return "";
    throw error;
  });
  channelId ||= channelIdFromPage(pageHtml);
  if (!channelIdPattern.test(channelId)) throw new Error("That public YouTube channel could not be identified.");
  return { id: channelId, pageUrl, pageHtml };
}

function channelMetadata(channel: PublicChannel, feedXml: string) {
  const title = firstMatch(channel.pageHtml, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /["']channelMetadataRenderer["']\s*:\s*\{[^}]*["']title["']\s*:\s*["']((?:\\.|[^"'])+)["']/i,
  ]) || firstMatch(feedXml, [/<author>\s*<name>([\s\S]*?)<\/name>/i]);
  const avatarUrl = firstMatch(channel.pageHtml, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /["']avatar["']\s*:\s*\{[\s\S]{0,300}?["']url["']\s*:\s*["']((?:\\.|[^"'])+)["']/i,
  ]);
  const subscriberText = firstMatch(channel.pageHtml, [
    /["']subscriberCountText["']\s*:\s*\{[\s\S]{0,160}?["']simpleText["']\s*:\s*["']((?:\\.|[^"'])+)["']/i,
    /["']subscriberCountText["']\s*:\s*\{[\s\S]{0,240}?["']label["']\s*:\s*["']((?:\\.|[^"'])+)["']/i,
  ]).replace(/\s+subscribers?\b/i, "").trim();
  return { title: title || "YouTube channel", avatarUrl, subscriberCount: subscriberText || "—" };
}

function xmlTag(source: string, tag: string) {
  return firstMatch(source, [new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i")]);
}

function xmlAttribute(source: string, tag: string, attribute: string) {
  return firstMatch(source, [new RegExp(`<${tag}\\b[^>]*\\s${attribute}=["']([^"']+)["'][^>]*>`, "i")]);
}

function parseVideos(feedXml: string) {
  return Array.from(feedXml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)).slice(0, 3).map((match) => {
    const entry = match[1];
    const videoId = xmlTag(entry, "yt:videoId");
    const thumbnail = xmlAttribute(entry, "media:thumbnail", "url");
    return {
      title: xmlTag(entry, "title") || "Untitled video",
      publishedAt: xmlTag(entry, "published") || new Date().toISOString(),
      thumbnailUrl: thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : ""),
      views: compactCount(xmlAttribute(entry, "media:statistics", "views")),
      likes: compactCount(xmlAttribute(entry, "media:starRating", "count")),
      comments: "—",
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { channel?: string };
    const query = body.channel?.trim() || "";
    if (!query || query.length > 200) return Response.json({ error: "Enter a valid YouTube channel URL, @handle, or channel ID." }, { status: 400 });

    const channel = await resolveChannel(query);
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel.id)}`;
    const feedResponse = await fetch(feedUrl, { headers: { Accept: "application/atom+xml,application/xml" } });
    if (!feedResponse.ok) throw new Error("The channel's public upload feed could not be loaded.");
    const feedXml = await feedResponse.text();
    const videos = parseVideos(feedXml);
    if (!videos.length) return Response.json({ error: "This channel has no public videos or Shorts to import." }, { status: 404 });

    return Response.json({ channel: channelMetadata(channel, feedXml), videos }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "YouTube import failed." }, { status: 502 });
  }
}

export function GET() {
  return Response.json({ error: "Use POST to import a public YouTube channel." }, { status: 405, headers: { Allow: "POST" } });
}
