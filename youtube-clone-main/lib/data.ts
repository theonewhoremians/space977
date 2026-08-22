export type Channel = {
  id: string;
  name: string;
  handle: string;
  subscribers: number;
  verified: boolean;
  banner: string;
  description: string;
};

export type Video = {
  id: string;
  title: string;
  channelId: string;
  views: number;
  hoursAgo: number;
  duration: number; // seconds
  thumb: string;
  category: string;
  description: string;
  likes: number;
};

export type Short = {
  id: string;
  title: string;
  channelId: string;
  views: number;
  likes: number;
  thumb: string;
};

export type Comment = {
  id: string;
  author: string;
  hoursAgo: number;
  text: string;
  likes: number;
  replies: number;
};

export type Playlist = {
  id: string;
  title: string;
  channelId: string;
  videoIds: string[];
  cover: string;
  visibility: "Public" | "Private" | "Unlisted";
};

function thumb(seed: string, w = 640, h = 360) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export const channels: Channel[] = [
  {
    id: "ch-lumen",
    name: "Lumen Labs",
    handle: "@lumenlabs",
    subscribers: 2_140_000,
    verified: true,
    banner: thumb("lumenbanner", 1600, 320),
    description:
      "Deep dives into design, product and the craft of building beautiful software. New videos every Tuesday.",
  },
  {
    id: "ch-pixel",
    name: "Pixel & Pine",
    handle: "@pixelandpine",
    subscribers: 856_000,
    verified: true,
    banner: thumb("pixelbanner", 1600, 320),
    description: "Travel films, cinematic vlogs, and stories from the road.",
  },
  {
    id: "ch-devcamp",
    name: "DevCamp",
    handle: "@devcamp",
    subscribers: 5_620_000,
    verified: true,
    banner: thumb("devcampbanner", 1600, 320),
    description:
      "Full-stack tutorials, system design, and career advice for software engineers.",
  },
  {
    id: "ch-sonic",
    name: "Sonic Bloom",
    handle: "@sonicbloom",
    subscribers: 12_300_000,
    verified: true,
    banner: thumb("sonicbanner", 1600, 320),
    description: "Lo-fi beats, live sessions and music to focus / relax to.",
  },
  {
    id: "ch-kitchen",
    name: "The Slow Kitchen",
    handle: "@theslowkitchen",
    subscribers: 3_010_000,
    verified: true,
    banner: thumb("kitchenbanner", 1600, 320),
    description: "Comfort recipes cooked slowly, with love.",
  },
  {
    id: "ch-cosmos",
    name: "Cosmos Weekly",
    handle: "@cosmosweekly",
    subscribers: 9_780_000,
    verified: true,
    banner: thumb("cosmosbanner", 1600, 320),
    description: "The universe, explained. Space news, astrophysics and wonder.",
  },
  {
    id: "ch-fitflow",
    name: "FitFlow",
    handle: "@fitflow",
    subscribers: 1_450_000,
    verified: false,
    banner: thumb("fitbanner", 1600, 320),
    description: "Home workouts, mobility and mindful movement.",
  },
  {
    id: "ch-gadget",
    name: "Gadget Grid",
    handle: "@gadgetgrid",
    subscribers: 6_340_000,
    verified: true,
    banner: thumb("gadgetbanner", 1600, 320),
    description: "Honest tech reviews, unboxings and buying guides.",
  },
];

export const videos: Video[] = [
  {
    id: "v-101",
    title: "Designing a beautiful UI from scratch — the full process",
    channelId: "ch-lumen",
    views: 1_240_000,
    hoursAgo: 20,
    duration: 1284,
    thumb: thumb("uidesign"),
    category: "Design",
    likes: 84_000,
    description:
      "In this video we design a complete product interface from a blank canvas — typography, spacing, color and motion. Timestamps in the comments.",
  },
  {
    id: "v-102",
    title: "I drove 3000km across Iceland — cinematic travel film",
    channelId: "ch-pixel",
    views: 542_000,
    hoursAgo: 51,
    duration: 934,
    thumb: thumb("iceland"),
    category: "Travel",
    likes: 41_000,
    description: "A cinematic journey through the land of fire and ice.",
  },
  {
    id: "v-103",
    title: "System Design Interview: design YouTube (step by step)",
    channelId: "ch-devcamp",
    views: 2_780_000,
    hoursAgo: 120,
    duration: 2731,
    thumb: thumb("systemdesign"),
    category: "Programming",
    likes: 132_000,
    description:
      "We break down how to design a video streaming platform at scale — storage, CDN, transcoding, and more.",
  },
  {
    id: "v-104",
    title: "3 hours of lo-fi beats to study & chill 🎧",
    channelId: "ch-sonic",
    views: 8_900_000,
    hoursAgo: 400,
    duration: 10812,
    thumb: thumb("lofi"),
    category: "Music",
    likes: 210_000,
    description: "Relax, focus, and unwind with mellow beats.",
  },
  {
    id: "v-105",
    title: "The perfect slow-cooked ramen (12 hour broth)",
    channelId: "ch-kitchen",
    views: 1_980_000,
    hoursAgo: 72,
    duration: 986,
    thumb: thumb("ramen"),
    category: "Cooking",
    likes: 96_000,
    description: "A rich, deep, restaurant-quality ramen you can make at home.",
  },
  {
    id: "v-106",
    title: "What's inside a black hole? New evidence explained",
    channelId: "ch-cosmos",
    views: 4_120_000,
    hoursAgo: 30,
    duration: 1123,
    thumb: thumb("blackhole"),
    category: "Science",
    likes: 188_000,
    description: "The latest research on the edge of physics, made simple.",
  },
  {
    id: "v-107",
    title: "20 minute full body workout — no equipment",
    channelId: "ch-fitflow",
    views: 720_000,
    hoursAgo: 10,
    duration: 1245,
    thumb: thumb("workout"),
    category: "Fitness",
    likes: 33_000,
    description: "Follow along, no gear needed. Great for mornings.",
  },
  {
    id: "v-108",
    title: "The best laptop of the year? Full review",
    channelId: "ch-gadget",
    views: 1_540_000,
    hoursAgo: 5,
    duration: 842,
    thumb: thumb("laptop"),
    category: "Tech",
    likes: 61_000,
    description: "We tested it for two weeks. Here is everything you need to know.",
  },
  {
    id: "v-109",
    title: "Micro-interactions that make apps feel alive",
    channelId: "ch-lumen",
    views: 640_000,
    hoursAgo: 96,
    duration: 712,
    thumb: thumb("microinteractions"),
    category: "Design",
    likes: 39_000,
    description: "Small details, big difference. Motion design fundamentals.",
  },
  {
    id: "v-110",
    title: "Sunrise over the Dolomites — 4K drone footage",
    channelId: "ch-pixel",
    views: 305_000,
    hoursAgo: 200,
    duration: 421,
    thumb: thumb("dolomites"),
    category: "Travel",
    likes: 22_000,
    description: "Peaceful aerial views to start your day.",
  },
  {
    id: "v-111",
    title: "Build a full-stack app with Next.js in 2026",
    channelId: "ch-devcamp",
    views: 980_000,
    hoursAgo: 15,
    duration: 3921,
    thumb: thumb("nextjs"),
    category: "Programming",
    likes: 58_000,
    description: "From zero to deployed. Routing, data, auth and UI.",
  },
  {
    id: "v-112",
    title: "Live jazz session — a rainy evening in the studio",
    channelId: "ch-sonic",
    views: 1_120_000,
    hoursAgo: 60,
    duration: 4523,
    thumb: thumb("jazz"),
    category: "Music",
    likes: 71_000,
    description: "A cozy live set recorded in one take.",
  },
  {
    id: "v-113",
    title: "10 knife skills every home cook should know",
    channelId: "ch-kitchen",
    views: 2_450_000,
    hoursAgo: 260,
    duration: 654,
    thumb: thumb("knife"),
    category: "Cooking",
    likes: 108_000,
    description: "Cut faster, safer and cleaner with these techniques.",
  },
  {
    id: "v-114",
    title: "The scale of the universe will blow your mind",
    channelId: "ch-cosmos",
    views: 6_700_000,
    hoursAgo: 500,
    duration: 987,
    thumb: thumb("universe"),
    category: "Science",
    likes: 240_000,
    description: "From quarks to galaxy clusters — a journey of scale.",
  },
  {
    id: "v-115",
    title: "Morning mobility routine for stiff backs",
    channelId: "ch-fitflow",
    views: 410_000,
    hoursAgo: 44,
    duration: 623,
    thumb: thumb("mobility"),
    category: "Fitness",
    likes: 19_000,
    description: "Gentle movements to loosen up and feel great.",
  },
  {
    id: "v-116",
    title: "Smartphone camera shootout — flagship edition",
    channelId: "ch-gadget",
    views: 2_010_000,
    hoursAgo: 28,
    duration: 1102,
    thumb: thumb("camera"),
    category: "Tech",
    likes: 74_000,
    description: "We compared every flagship camera so you don't have to.",
  },
  {
    id: "v-117",
    title: "Color theory for interfaces — a practical guide",
    channelId: "ch-lumen",
    views: 388_000,
    hoursAgo: 150,
    duration: 845,
    thumb: thumb("colortheory"),
    category: "Design",
    likes: 27_000,
    description: "Build palettes that are accessible and gorgeous.",
  },
  {
    id: "v-118",
    title: "48 hours in Tokyo — a food & neon adventure",
    channelId: "ch-pixel",
    views: 1_330_000,
    hoursAgo: 340,
    duration: 1420,
    thumb: thumb("tokyo"),
    category: "Travel",
    likes: 88_000,
    description: "Ramen, temples, and endless neon nights.",
  },
  {
    id: "v-119",
    title: "Data structures explained with animations",
    channelId: "ch-devcamp",
    views: 3_450_000,
    hoursAgo: 620,
    duration: 1876,
    thumb: thumb("datastructures"),
    category: "Programming",
    likes: 156_000,
    description: "Arrays, trees, graphs and hash maps — visualized.",
  },
  {
    id: "v-120",
    title: "Rainy piano — 2 hours to sleep & relax",
    channelId: "ch-sonic",
    views: 5_400_000,
    hoursAgo: 700,
    duration: 7321,
    thumb: thumb("piano"),
    category: "Music",
    likes: 165_000,
    description: "Soft piano and rain sounds for deep rest.",
  },
  {
    id: "v-121",
    title: "One-pan weeknight dinners (5 easy recipes)",
    channelId: "ch-kitchen",
    views: 890_000,
    hoursAgo: 18,
    duration: 743,
    thumb: thumb("onepan"),
    category: "Cooking",
    likes: 44_000,
    description: "Minimal cleanup, maximum flavor.",
  },
  {
    id: "v-122",
    title: "Could we live on Mars? The real science",
    channelId: "ch-cosmos",
    views: 2_900_000,
    hoursAgo: 90,
    duration: 1345,
    thumb: thumb("mars"),
    category: "Science",
    likes: 121_000,
    description: "Radiation, gravity, food — what it would really take.",
  },
  {
    id: "v-123",
    title: "The mechanical keyboard buyer's guide 2026",
    channelId: "ch-gadget",
    views: 1_180_000,
    hoursAgo: 66,
    duration: 967,
    thumb: thumb("keyboard"),
    category: "Tech",
    likes: 52_000,
    description: "Switches, layouts and the best boards at every price.",
  },
  {
    id: "v-124",
    title: "Prototyping motion in Figma — advanced tips",
    channelId: "ch-lumen",
    views: 512_000,
    hoursAgo: 240,
    duration: 1032,
    thumb: thumb("figma"),
    category: "Design",
    likes: 31_000,
    description: "Bring your designs to life with smart animate.",
  },
];

export const shorts: Short[] = [
  { id: "s-1", title: "This UI trick is everywhere 👀", channelId: "ch-lumen", views: 2_400_000, likes: 180_000, thumb: thumb("short1", 360, 640) },
  { id: "s-2", title: "60 seconds in Kyoto 🌸", channelId: "ch-pixel", views: 5_100_000, likes: 320_000, thumb: thumb("short2", 360, 640) },
  { id: "s-3", title: "The fastest sort, explained", channelId: "ch-devcamp", views: 1_800_000, likes: 96_000, thumb: thumb("short3", 360, 640) },
  { id: "s-4", title: "Beat drop 🔊", channelId: "ch-sonic", views: 9_900_000, likes: 720_000, thumb: thumb("short4", 360, 640) },
  { id: "s-5", title: "1-minute garlic butter noodles", channelId: "ch-kitchen", views: 3_300_000, likes: 210_000, thumb: thumb("short5", 360, 640) },
  { id: "s-6", title: "How big is the Sun, really?", channelId: "ch-cosmos", views: 7_200_000, likes: 410_000, thumb: thumb("short6", 360, 640) },
  { id: "s-7", title: "30-second plank challenge", channelId: "ch-fitflow", views: 1_100_000, likes: 66_000, thumb: thumb("short7", 360, 640) },
  { id: "s-8", title: "This phone folds?!", channelId: "ch-gadget", views: 4_600_000, likes: 290_000, thumb: thumb("short8", 360, 640) },
  { id: "s-9", title: "Golden hour hack 📸", channelId: "ch-pixel", views: 2_050_000, likes: 140_000, thumb: thumb("short9", 360, 640) },
  { id: "s-10", title: "One line of CSS 🤯", channelId: "ch-devcamp", views: 3_900_000, likes: 260_000, thumb: thumb("short10", 360, 640) },
  { id: "s-11", title: "Espresso, but make it art", channelId: "ch-kitchen", views: 1_700_000, likes: 88_000, thumb: thumb("short11", 360, 640) },
  { id: "s-12", title: "A star is born (literally)", channelId: "ch-cosmos", views: 6_100_000, likes: 355_000, thumb: thumb("short12", 360, 640) },
];

export const comments: Comment[] = [
  { id: "c-1", author: "Aria Mendez", hoursAgo: 3, text: "This is exactly the breakdown I needed. The pacing is perfect and the examples are so clean. Subscribed!", likes: 1240, replies: 32 },
  { id: "c-2", author: "kevin.builds", hoursAgo: 8, text: "Timestamp at 4:12 changed how I think about spacing forever. Thank you 🙏", likes: 842, replies: 11 },
  { id: "c-3", author: "Noor", hoursAgo: 26, text: "Came for the tutorial, stayed for the vibes. That color palette though 🔥", likes: 512, replies: 5 },
  { id: "c-4", author: "The Daily Dev", hoursAgo: 50, text: "Underrated channel. The production quality keeps getting better every single video.", likes: 388, replies: 8 },
  { id: "c-5", author: "mia_creates", hoursAgo: 120, text: "Watching this for the third time. Bookmarking for my next project.", likes: 176, replies: 2 },
];

export const playlists: Playlist[] = [
  {
    id: "pl-liked",
    title: "Liked videos",
    channelId: "ch-lumen",
    videoIds: ["v-101", "v-106", "v-111", "v-114", "v-119", "v-124"],
    cover: thumb("uidesign"),
    visibility: "Private",
  },
  {
    id: "pl-watchlater",
    title: "Watch later",
    channelId: "ch-lumen",
    videoIds: ["v-103", "v-118", "v-122", "v-116"],
    cover: thumb("systemdesign"),
    visibility: "Private",
  },
  {
    id: "pl-design",
    title: "Design inspiration",
    channelId: "ch-lumen",
    videoIds: ["v-101", "v-109", "v-117", "v-124"],
    cover: thumb("colortheory"),
    visibility: "Public",
  },
  {
    id: "pl-focus",
    title: "Focus & study mix",
    channelId: "ch-sonic",
    videoIds: ["v-104", "v-112", "v-120"],
    cover: thumb("lofi"),
    visibility: "Public",
  },
  {
    id: "pl-learn",
    title: "Learn to code",
    channelId: "ch-devcamp",
    videoIds: ["v-103", "v-111", "v-119"],
    cover: thumb("nextjs"),
    visibility: "Unlisted",
  },
];

export const categories: string[] = [
  "All",
  "Music",
  "Programming",
  "Design",
  "Live",
  "Science",
  "Cooking",
  "Travel",
  "Gaming",
  "Podcasts",
  "Fitness",
  "News",
  "Recently uploaded",
  "Watched",
  "New to you",
];

// ---- lookups & helpers ----

const channelMap = new Map(channels.map((c) => [c.id, c]));
const videoMap = new Map(videos.map((v) => [v.id, v]));

export function getChannel(id: string): Channel | undefined {
  return channelMap.get(id);
}

export function getVideo(id: string): Video | undefined {
  return videoMap.get(id);
}

export function getChannelSafe(id: string): Channel {
  return channelMap.get(id) ?? channels[0];
}

export function getVideosByChannel(channelId: string): Video[] {
  return videos.filter((v) => v.channelId === channelId);
}

export function getRelatedVideos(id: string, count = 12): Video[] {
  return videos.filter((v) => v.id !== id).slice(0, count);
}

export function searchVideos(query: string): Video[] {
  const q = query.trim().toLowerCase();
  if (!q) return videos;
  const hits = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      (getChannel(v.channelId)?.name.toLowerCase().includes(q) ?? false),
  );
  return hits.length ? hits : videos;
}

export function getPlaylist(id: string): Playlist | undefined {
  return playlists.find((p) => p.id === id);
}

const AVATAR_COLORS = [
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#0891b2",
  "#16a34a",
  "#2563eb",
  "#dc2626",
  "#9333ea",
];

export function avatarColor(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}
