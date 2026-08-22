# Clonetube — a beautiful YouTube clone (UI)

A polished, responsive YouTube clone UI built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. This project focuses on pixel-crafted, YouTube-like UI pages with a dark theme, smooth interactions, and mock data.

## ✨ Pages

| Route | Description |
| --- | --- |
| `/` | Home feed with category chips, video grid and a Shorts shelf |
| `/watch/[id]` | Watch page: player with controls, actions, description, comments, related videos |
| `/shorts` | Immersive vertical Shorts feed with snap scrolling and action rail |
| `/results?search_query=` | Search results with filters and a channel result |
| `/channel/[id]` | Channel page with banner and Home / Videos / Shorts / Playlists / Community / About tabs |
| `/feed/subscriptions` | Subscriptions feed |
| `/feed/trending` | Trending / Explore |
| `/feed/you` | "You" overview with History, Playlists, Watch later, Liked shelves |
| `/feed/history` | Watch history with controls |
| `/feed/playlists` | All playlists |
| `/playlist/[id]` | Playlist detail (Liked videos, Watch later, custom) |
| `/studio` | Creator dashboard ("Your videos") with stats and content table |
| `/settings` | Settings with account, notifications, playback, privacy, appearance, billing |

## 🧩 Features

- Fixed top navbar with search, voice, create, notifications, and account
- Collapsible sidebar (full ↔ mini rail) plus a mobile/immersive overlay drawer
- Reusable components: video cards/rows, thumbnails, letter avatars, category chip bar, playlist cards, shelves
- Interactive bits: like/dislike, subscribe, expandable descriptions, post a comment, Shorts like, settings toggles, theme selector
- Fully responsive, dark-themed, with subtle hover/scale/fade animations

## 🛠 Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- [lucide-react](https://lucide.dev/) icons

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
```

## 📁 Project structure

```
app/                 # routes (App Router)
components/
  layout/            # AppShell, Header, Sidebar, MiniSidebar
  ui/                # VideoCard, VideoRow, Thumbnail, Avatar, ChipBar, ...
  watch/             # VideoPlayer, VideoActions, DescriptionBox, CommentsSection
  channel/           # ChannelView (tabbed)
lib/
  data.ts            # mock channels, videos, shorts, playlists, comments
  format.ts          # view/time/duration formatting helpers
```

## 📝 Notes

- All content is mock data in `lib/data.ts`; thumbnails use [picsum.photos](https://picsum.photos).
- This is a UI-only clone — there is no real video playback or backend yet.
