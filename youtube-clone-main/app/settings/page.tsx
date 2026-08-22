"use client";

import { useState } from "react";
import {
  User,
  Bell,
  PlayCircle,
  Shield,
  Palette,
  CreditCard,
  Sun,
  Moon,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";

const sections = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "playback", label: "Playback & performance", icon: PlayCircle },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Billing & payments", icon: CreditCard },
];

export default function SettingsPage() {
  const [active, setActive] = useState("account");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Nav */}
        <nav className="flex shrink-0 gap-1 overflow-x-auto md:w-64 md:flex-col">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  active === s.id ? "bg-yt-hover" : "hover:bg-yt-hover"
                }`}
              >
                <Icon className="size-5" /> {s.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {active === "account" && <AccountSection />}
          {active === "notifications" && <NotificationsSection />}
          {active === "playback" && <PlaybackSection />}
          {active === "privacy" && <PrivacySection />}
          {active === "appearance" && <AppearanceSection />}
          {active === "billing" && <BillingSection />}
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-yt-border bg-yt-surface p-6">
      {children}
    </div>
  );
}

function Toggle({ label, desc, on = false }: { label: string; desc?: string; on?: boolean }) {
  const [checked, setChecked] = useState(on);
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-yt-muted">{desc}</p>}
      </div>
      <button
        onClick={() => setChecked((c) => !c)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-yt-blue" : "bg-yt-active"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function AccountSection() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name="Akram" size={72} />
          <div>
            <h2 className="text-lg font-medium">Akram Khan</h2>
            <p className="text-sm text-yt-muted">@akram1112 · comeingame72@gmail.com</p>
          </div>
          <button className="ml-auto rounded-full bg-yt-hover px-4 py-2 text-sm font-medium hover:bg-yt-active">
            Edit
          </button>
        </div>
      </Card>
      <Card>
        <h3 className="mb-2 text-base font-medium">Your channel</h3>
        <p className="text-sm text-yt-muted">
          This is your public presence. You need a channel to upload your own
          videos, comment, or make playlists.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            defaultValue="Lumen Labs"
            className="flex-1 rounded-lg border border-yt-border bg-transparent px-3 py-2 text-sm focus:border-yt-blue focus:outline-none"
          />
          <button className="rounded-full bg-yt-text px-4 py-2 text-sm font-medium text-yt-bg hover:bg-white">
            Save
          </button>
        </div>
      </Card>
    </div>
  );
}

function NotificationsSection() {
  return (
    <Card>
      <h3 className="mb-2 text-base font-medium">Notifications</h3>
      <div className="divide-y divide-yt-border">
        <Toggle label="Subscriptions" desc="Notify me about activity from channels I'm subscribed to" on />
        <Toggle label="Recommended videos" desc="Videos we think you'll like" on />
        <Toggle label="Activity on my channel" desc="Comments, mentions and shares" on />
        <Toggle label="Replies to my comments" />
        <Toggle label="Promotional content and offers" />
      </div>
    </Card>
  );
}

function PlaybackSection() {
  return (
    <Card>
      <h3 className="mb-2 text-base font-medium">Playback & performance</h3>
      <div className="divide-y divide-yt-border">
        <Toggle label="Autoplay next video" on />
        <Toggle label="Play muted on hover" on />
        <div className="flex items-center justify-between py-3">
          <p className="text-sm font-medium">Default quality</p>
          <select className="rounded-lg border border-yt-border bg-yt-elevated px-3 py-1.5 text-sm">
            <option>Auto</option>
            <option>1080p</option>
            <option>720p</option>
            <option>480p</option>
          </select>
        </div>
        <Toggle label="Ambient mode" desc="Soft glow that matches the video colors" on />
      </div>
    </Card>
  );
}

function PrivacySection() {
  return (
    <Card>
      <h3 className="mb-2 text-base font-medium">Privacy</h3>
      <div className="divide-y divide-yt-border">
        <Toggle label="Keep all my liked videos private" />
        <Toggle label="Keep all my subscriptions private" on />
        <Toggle label="Pause watch history" />
        <Toggle label="Pause search history" />
      </div>
    </Card>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  return (
    <Card>
      <h3 className="mb-4 text-base font-medium">Appearance</h3>
      <div className="flex gap-3">
        {(["dark", "light"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-6 text-sm font-medium capitalize transition ${
              theme === t
                ? "border-yt-blue bg-yt-hover"
                : "border-yt-border hover:bg-yt-hover"
            }`}
          >
            {t === "dark" ? <Moon className="size-5" /> : <Sun className="size-5" />}
            {t} theme
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-yt-muted">
        This demo ships with a polished dark theme by default.
      </p>
    </Card>
  );
}

function BillingSection() {
  return (
    <Card>
      <h3 className="mb-2 text-base font-medium">Clonetube Premium</h3>
      <p className="text-sm text-yt-muted">
        Ad-free, background play, and downloads. Manage your membership and
        payment methods here.
      </p>
      <button className="mt-4 rounded-full bg-gradient-to-r from-yt-red to-orange-500 px-5 py-2.5 text-sm font-semibold text-white">
        Get Premium
      </button>
    </Card>
  );
}
