"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import { activateLicense, canRefreshLicense, clearLicenseSession, getLicenseStatus, isDefinitiveLicenseFailure, licenseHasExpired, loadLicenseSession, refreshLicense } from "../lib/license";

const iconPath = (name: string) => `/ui-icons/${name}.svg`;
const textStorageKey = "creator-studio-saved-text-v3";
const cardImageStorageKey = "creator-studio-card-images-v1";
const topGapStorageKey = "creator-studio-phone-top-gap-v1";
const PHONE_TOP_GAP_PX = 32;

function percentageValue(text: string | null | undefined) {
  const value = Number.parseFloat((text || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
}

function syncReachPercentageBars(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".source-card, .term-row").forEach((container) => {
    const percentage = percentageValue(container.querySelector("strong")?.textContent);
    const bar = container.querySelector<HTMLElement>(".source-progress i");
    if (bar) bar.style.width = `${percentage}%`;
  });

  const trafficSegments = root.querySelectorAll<HTMLElement>(".traffic-bar i");
  root.querySelectorAll<HTMLElement>(".traffic-list > div").forEach((row, index) => {
    const percentage = percentageValue(row.querySelector("strong")?.textContent);
    const segment = trafficSegments[index];
    if (segment) {
      segment.style.width = `${percentage}%`;
      segment.style.flex = "0 0 auto";
    }
  });

  const engagedSegments = root.querySelectorAll<HTMLElement>(".engaged-bar i");
  root.querySelectorAll<HTMLElement>(".engaged-values strong").forEach((value, index) => {
    const segment = engagedSegments[index];
    if (segment) {
      segment.style.width = `${percentageValue(value.textContent)}%`;
      segment.style.flex = "0 0 auto";
    }
  });

  root.querySelectorAll<HTMLElement>(".audience-row").forEach((row) => {
    const percentage = percentageValue(row.querySelector("strong")?.textContent);
    const bar = row.querySelector<HTMLElement>(".audience-progress i");
    if (bar) bar.style.width = `${percentage}%`;
  });

  const deviceSegments = root.querySelectorAll<HTMLElement>(".device-bar i");
  root.querySelectorAll<HTMLElement>(".device-list > div").forEach((row, index) => {
    const segment = deviceSegments[index];
    if (segment) {
      segment.style.width = `${percentageValue(row.querySelector("strong")?.textContent)}%`;
      segment.style.flex = "0 0 auto";
    }
  });
}

function SvgIcon({ name, size, className = "" }: { name: string; size: number; className?: string }) {
  return <img className={`svg-icon ${className}`} src={iconPath(name)} width={size} height={size} alt="" aria-hidden="true" contentEditable={false} draggable={false} data-no-edit="true" />;
}

function TopHeader({ avatarSrc, editMode, topGapEnabled, onToggleEdit, onToggleTopGap }: { avatarSrc: string; editMode: boolean; topGapEnabled: boolean; onToggleEdit: () => void; onToggleTopGap: () => void }) {
  const logoTapCountRef = useRef(0);
  const logoTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogoTap() {
    logoTapCountRef.current += 1;
    if (logoTapCountRef.current >= 2) {
      if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);
      logoTapCountRef.current = 0;
      logoTapTimerRef.current = null;
      onToggleEdit();
      return;
    }

    if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);
    logoTapTimerRef.current = setTimeout(() => {
      logoTapCountRef.current = 0;
      logoTapTimerRef.current = null;
    }, 700);
  }

  return (
    <header className="studio-header">
      <button className={`studio-brand${editMode ? " editing" : ""}`} type="button" onClick={handleLogoTap} aria-pressed={editMode} aria-label={editMode ? "Double tap to save text changes" : "Double tap to edit page text"} title={editMode ? "Double tap to save" : "Double tap to edit"}>
        <img src="/youtube-studio-logo-white.svg" alt="Studio" contentEditable={false} draggable={false} data-no-edit="true" />
      </button>
      <div className="header-actions">
        <button className={`safe-gap-toggle${topGapEnabled ? " active" : ""}`} type="button" aria-label={topGapEnabled ? "Remove phone top gap" : "Add phone top gap"} aria-pressed={topGapEnabled} title={topGapEnabled ? "Turn off phone top gap" : "Turn on phone top gap"} onClick={onToggleTopGap}><SvgIcon name="add-circle" size={25} /></button>
        <button aria-label="Notifications"><SvgIcon name="notification-bell" size={25} /></button>
        <button className="header-avatar" aria-label="Account"><img src={avatarSrc} alt="Channel profile" contentEditable={false} draggable={false} data-no-edit="true" /></button>
      </div>
    </header>
  );
}

function ChannelProfile({ avatarSrc, onAvatarChange }: { avatarSrc: string; onAvatarChange: (file: File, preview: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onAvatarChange(file, reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <section className="channel-profile-accurate">
      <div className="avatar-uploader">
        <button className="large-avatar" type="button" aria-label="Change channel profile picture" onClick={() => fileInputRef.current?.click()}>
          <img src={avatarSrc} alt="Channel profile" contentEditable={false} draggable={false} data-no-edit="true" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarUpload} hidden />
      </div>
      <div className="channel-copy"><h1>Smili Gamer</h1><strong>2,328</strong><p>Total subscribers</p></div>
    </section>
  );
}

function AnalyticsHeader() {
  return <div className="analytics-heading"><h2>Channel analytics</h2><span>Last 28 days</span></div>;
}

function MetricCard({ label, value, status = "success" }: { label: string; value: string; status?: "success" | "down" }) {
  return <article className="metric-card-accurate"><span>{label}</span><strong><span>{value}</span><SvgIcon name={status === "down" ? "down-circle" : "check-circle-green"} size={18} /></strong></article>;
}

function EngagementStats({ views, likes, comments, expanded, onToggle }: { views: string; likes: string; comments: string; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="engagement-stats" role="button" tabIndex={0} aria-label={expanded ? "Collapse content details" : "Expand content details"} aria-expanded={expanded} onClick={onToggle} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onToggle(); } }}>
      <span><SvgIcon name="views-studio" size={22} /><span>{views}</span></span>
      <span><SvgIcon name="likes-studio" size={22} /><span>{likes}</span></span>
      <span><SvgIcon name="comments-studio" size={22} /><span>{comments}</span></span>
      <button className="content-toggle" type="button" aria-label={expanded ? "Collapse content details" : "Expand content details"} aria-expanded={expanded} onClick={(event) => { event.stopPropagation(); onToggle(); }}>
        <ChevronUp className={expanded ? "" : "collapsed-chevron"} size={22} strokeWidth={2.2} />
      </button>
    </div>
  );
}

type StatusIcon = "right" | "down" | "success";

function StatusIcon({ type }: { type: StatusIcon }) {
  if (type === "right") return <ChevronRight size={21} strokeWidth={2} />;
  return <SvgIcon name={type === "down" ? "down-circle" : "check-circle-green"} size={20} />;
}

function PerformanceRow({ label, value, status }: { label: string; value: string; status: StatusIcon }) {
  return <div className="performance-row"><span>{label}</span><div><b>{value}</b><StatusIcon type={status} /></div></div>;
}

function CommentsSection() {
  return <section className="comments-section"><div><span>Comments</span><b>1</b></div><p>No unresponded comments</p></section>;
}

type PublishedVideo = {
  title: string;
  metadata: string;
  views: string;
  likes: string;
  comments: string;
  ranking: string;
  average: string;
  thumb: number;
};

type VideoGraphData = {
  views: number[];
  viewsShadow: number[];
  subscribers: number[];
  subscribersShadow: number[];
  retention: number[];
  reachViews: number[];
  reachViewsShadow: number[];
  engagedViews: number[];
  engagedViewsShadow: number[];
  uniqueViewers: number[];
  uniqueViewersShadow: number[];
  watchTime: number[];
  watchTimeShadow: number[];
  averageDuration: number[];
  averageDurationShadow: number[];
  engagementRetention: number[];
};

const defaultVideoGraphs: VideoGraphData = {
  views: [0, 2, 2, 5, 5, 7, 7, 8, 8, 11, 11, 13, 14, 15, 15, 18, 18],
  viewsShadow: [4, 6, 7, 7, 8, 8, 9, 9, 9, 9, 9, 9, 18, 18, 18, 18, 18],
  subscribers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  subscribersShadow: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  retention: [138, 112, 106, 106, 106, 88, 81, 72, 72, 60, 53, 53, 44, 44, 44, 36, 36],
  reachViews: [0, 1, 1, 2, 2, 3, 4, 5, 6, 7, 9, 13, 22, 38, 61, 82],
  reachViewsShadow: [36, 36, 37, 37, 38, 38, 39, 39, 39, 39, 40, 40, 40, 40, 40, 40],
  engagedViews: [0, 330, 332, 332, 332, 332, 332, 332, 332, 332, 332, 332],
  engagedViewsShadow: [0, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300],
  uniqueViewers: [0, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  uniqueViewersShadow: [0, 260, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
  watchTime: [0, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3],
  watchTimeShadow: [0, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15],
  averageDuration: [0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  averageDurationShadow: [0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  engagementRetention: [112, 108, 106, 104, 84, 74, 64, 57, 43, 32, 28, 26, 23, 21, 18, 16, 14, 13, 12, 10, 8, 8],
};

function PublishedContentCard({ video, initiallyExpanded = false, imageSrc, onImageChange, onOpen }: { video: PublishedVideo; initiallyExpanded?: boolean; imageSrc?: string; onImageChange: (file: File, preview: string) => void; onOpen: () => void }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleThumbnailUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onImageChange(file, reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <article className={`latest-card-accurate ${expanded ? "expanded" : "collapsed"}`}>
      <div className="latest-video-row" role="button" tabIndex={0} aria-label={`Open details for ${video.title}`} onClick={onOpen} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onOpen(); }}>
        <div className="thumbnail-uploader">
          <button className={`reference-thumb thumb-${video.thumb}${imageSrc ? " has-upload" : " has-reference"}`} type="button" aria-label={`Change thumbnail for ${video.title}`} onClick={(event) => { event.stopPropagation(); imageInputRef.current?.click(); }}>
            {imageSrc ? <img className="uploaded-thumbnail" src={imageSrc} alt="Video thumbnail" /> : <img className={`reference-sheet reference-sheet-${video.thumb}`} src="/pixel-reference.jpeg" alt="Video thumbnail" />}
          </button>
          <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleThumbnailUpload} hidden />
        </div>
        <div><h3>{video.title}</h3><p>{video.metadata}</p></div>
      </div>
      <EngagementStats views={video.views} likes={video.likes} comments={video.comments} expanded={expanded} onToggle={() => setExpanded((value) => !value)} />
      <div className="performance-list">
        <PerformanceRow label="Ranking by views" value={video.ranking} status="right" />
        <PerformanceRow label="Views" value={video.views} status="down" />
        <PerformanceRow label="Average percentage viewed" value={video.average} status="down" />
        <PerformanceRow label="Likes" value={video.likes} status="success" />
      </div>
      <section className="comments-section"><div><span>Comments</span><b>{video.comments}</b></div><p>No unresponded comments</p></section>
    </article>
  );
}

const publishedVideos: PublishedVideo[] = [
  { title: "Earn Dollars through Whop 🤑🤑 (ver...", metadata: "First 21 days 23 hours", views: "11", likes: "1", comments: "1", ranking: "8 of 10", average: "19.8%", thumb: 1 },
  { title: "Funding Pips @fundingpipscom #sh...", metadata: "First 70 days 18 hours", views: "53", likes: "1", comments: "0", ranking: "6 of 10", average: "31.2%", thumb: 2 },
  { title: "One injury changed everything #shor...", metadata: "First 71 days 4 hours", views: "6", likes: "0", comments: "0", ranking: "9 of 10", average: "14.6%", thumb: 3 },
];

const navItems = [
  ["dashboard", "Dashboard"],
  ["content", "Content"],
  ["analytics", "Analytics"],
  ["community", "Community"],
  ["earn", "Earn"],
] as const;

type PageName = (typeof navItems)[number][1];

function BottomNavItem({ icon, label, active, onSelect }: { icon: string; label: PageName; active: boolean; onSelect: () => void }) {
  const iconSrc = active
    ? `/nav-icons/${icon}-active.svg`
    : icon === "analytics"
      ? "/nav-icons/analytics-inactive.svg"
      : `/nav-icons/${icon}.svg`;

  return (
    <button className={`bottom-nav-item${active ? " active" : ""}`} aria-label={label} aria-current={active ? "page" : undefined} onClick={onSelect}>
      <img src={iconSrc} alt="" aria-hidden="true" contentEditable={false} draggable={false} data-no-edit="true" />
      <span>{label}</span>
    </button>
  );
}

function BottomNavigation({ active, onSelect }: { active: PageName; onSelect: (page: PageName) => void }) {
  return <nav className="bottom-navigation" aria-label="Studio navigation">{navItems.map(([icon, label]) => <BottomNavItem key={label} icon={icon} label={label} active={active === label} onSelect={() => onSelect(label)} />)}</nav>;
}

function DashboardPage({ avatarSrc, onAvatarChange, cardImages, onCardImageChange, onOpenVideo }: { avatarSrc: string; onAvatarChange: (file: File, preview: string) => void; cardImages: Array<{ file: File | null; src: string } | undefined>; onCardImageChange: (index: number, file: File, preview: string) => void; onOpenVideo: (index: number) => void }) {
  return (
    <>
      <ChannelProfile avatarSrc={avatarSrc} onAvatarChange={onAvatarChange} />
      <AnalyticsHeader />
      <section className="metrics-grid"><MetricCard label="Views" value="2.5K" status="down" /><MetricCard label="Watch time (hours)" value="9.2" /></section>
      <h2 className="latest-title">Latest published content</h2>
      <section className="published-content-list">{publishedVideos.map((video, index) => <PublishedContentCard key={index} video={video} imageSrc={cardImages[index]?.src} onImageChange={(file, preview) => onCardImageChange(index, file, preview)} onOpen={() => onOpenVideo(index)} />)}</section>
    </>
  );
}

function VideoDetailPage({ video, imageSrc, editMode, onBack, onToggleEdit, onOpenAnalytics, onImageChange }: { video: PublishedVideo; imageSrc?: string; editMode: boolean; onBack: () => void; onToggleEdit: () => void; onOpenAnalytics: () => void; onImageChange: (file: File, preview: string) => void }) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onImageChange(file, reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <section className={`video-detail-page${editMode ? " page-editing" : ""}`}>
      <header className="detail-toolbar">
        <button type="button" aria-label="Back to dashboard" onClick={onBack}><SvgIcon name="detail-back" size={30} /></button>
        <div>
          <button className={editMode ? "detail-editing" : ""} type="button" aria-label={editMode ? "Save changes" : "Edit video details"} aria-pressed={editMode} onClick={onToggleEdit}><SvgIcon name="detail-edit" size={29} /></button>
          <button type="button" aria-label="Share video"><SvgIcon name="detail-share" size={31} /></button>
          <button type="button" aria-label="View on YouTube"><SvgIcon name="detail-video" size={30} /></button>
        </div>
      </header>

      <button className="detail-preview" type="button" aria-label="Change detail thumbnail" onClick={() => imageInputRef.current?.click()}>
        {imageSrc ? <img className="detail-uploaded-image" src={imageSrc} alt="Video thumbnail" /> : <img className="detail-reference-image" src="/video-detail-reference.jpeg" alt="Video thumbnail" />}
        <span className="detail-duration">0:30</span>
      </button>
      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} hidden />

      <div className="detail-copy">
        <h1>{video.title}</h1>
        <p>February 27, 2024 • Published</p>
      </div>

      <section className="detail-card detail-info-card">
        <div className="detail-info-row"><span>Visibility</span><strong><SvgIcon name="detail-public" size={22} /><span>Public</span></strong></div>
        <div className="detail-info-row"><span>Notices</span><strong><span>Other notices</span></strong></div>
      </section>

      <section className="detail-card detail-performance-card" role="button" tabIndex={editMode ? -1 : 0} aria-label="Open video performance analytics" onClick={() => { if (!editMode) onOpenAnalytics(); }} onKeyDown={(event) => { if (!editMode && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onOpenAnalytics(); } }}>
        <h2>Video performance</h2>
        <p>{video.metadata}</p>
        <div className="detail-performance-rows">
          <PerformanceRow label="Ranking by views" value={video.ranking} status="right" />
          <PerformanceRow label="Views" value={video.views} status="down" />
          <PerformanceRow label="Average percentage viewed" value={video.average} status="down" />
          <PerformanceRow label="Likes" value={video.likes} status="success" />
        </div>
      </section>

      <section className="detail-card detail-comments-card">
        <div className="detail-comments-heading"><h2>Comments</h2><button type="button"><span>View all</span></button></div>
        <div className="detail-empty-comments"><span>No unresponded comments</span></div>
      </section>
    </section>
  );
}

function EditableLineChart({ data, shadowData, max, color, editMode, fill = false, onChange, onShadowChange }: { data: number[]; shadowData?: number[]; max: number; color: string; editMode: boolean; fill?: boolean; onChange: (next: number[]) => void; onShadowChange?: (next: number[]) => void }) {
  const chartRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);
  const draggingSeriesRef = useRef<"line" | "shadow">("line");
  const width = 300;
  const height = 132;
  const pointY = (value: number) => height - (Math.min(max, Math.max(0, value)) / max) * height;
  const seriesPoints = (series: number[]) => series.map((value, index) => `${(index / Math.max(1, series.length - 1)) * width},${pointY(value)}`).join(" ");
  const points = seriesPoints(data);
  const editableShadow = fill ? (shadowData || data) : undefined;
  const shadowPoints = editableShadow ? seriesPoints(editableShadow) : "";

  function reshapeChart(event: React.PointerEvent<SVGSVGElement>) {
    if (!editMode || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = Math.min(width, Math.max(0, ((event.clientX - rect.left) / rect.width) * width));
    const y = Math.min(height, Math.max(0, ((event.clientY - rect.top) / rect.height) * height));
    const source = draggingSeriesRef.current === "shadow" && editableShadow && onShadowChange ? editableShadow : data;
    const index = Math.round((x / width) * Math.max(1, source.length - 1));
    const next = [...source];
    next[index] = Math.round((1 - y / height) * max);
    if (draggingSeriesRef.current === "shadow" && editableShadow && onShadowChange) onShadowChange(next);
    else onChange(next);
  }

  function startReshaping(event: React.PointerEvent<SVGSVGElement>) {
    if (!editMode) return;
    event.preventDefault();
    if (chartRef.current && editableShadow && onShadowChange) {
      const rect = chartRef.current.getBoundingClientRect();
      const x = Math.min(width, Math.max(0, ((event.clientX - rect.left) / rect.width) * width));
      const y = Math.min(height, Math.max(0, ((event.clientY - rect.top) / rect.height) * height));
      const lineIndex = Math.round((x / width) * Math.max(1, data.length - 1));
      const shadowIndex = Math.round((x / width) * Math.max(1, editableShadow.length - 1));
      draggingSeriesRef.current = Math.abs(y - pointY(editableShadow[shadowIndex])) < Math.abs(y - pointY(data[lineIndex])) ? "shadow" : "line";
    } else {
      draggingSeriesRef.current = "line";
    }
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    reshapeChart(event);
  }

  function continueReshaping(event: React.PointerEvent<SVGSVGElement>) {
    if (draggingRef.current) reshapeChart(event);
  }

  function stopReshaping(event: React.PointerEvent<SVGSVGElement>) {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <svg ref={chartRef} className={`editable-line-chart${editMode ? " chart-editing" : ""}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" onPointerDown={startReshaping} onPointerMove={continueReshaping} onPointerUp={stopReshaping} onPointerCancel={stopReshaping} aria-label={editMode ? "Editable graph. Drag colored points for the line and gray points for the shadow." : "Analytics graph"}>
      {[0, 44, 88, 132].map((y) => <line key={y} x1="0" y1={y} x2={width} y2={y} stroke="#555" strokeWidth="1" />)}
      {fill && <polygon points={`0,${height} ${shadowPoints} ${width},${height}`} fill="rgba(120,120,120,.42)" />}
      {fill && <polyline points={shadowPoints} fill="none" stroke="rgba(180,180,180,.7)" strokeWidth="1.5" strokeLinejoin="round" />}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {editMode && editableShadow && onShadowChange && editableShadow.map((value, index) => (
        <circle className="shadow-graph-point" key={`shadow-${index}`} cx={(index / Math.max(1, editableShadow.length - 1)) * width} cy={pointY(value)} r="5.5" fill="#777" stroke="#f1f1f1" strokeWidth="1.5" />
      ))}
      {editMode && data.map((value, index) => (
        <circle className="line-graph-point" key={index} cx={(index / Math.max(1, data.length - 1)) * width} cy={pointY(value)} r="5.5" fill={color} stroke="#f1f1f1" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function EngagementMetricCard({ label, value, note, yLabels, xStart, xEnd, data, shadowData, max, color = "#eb3b98", editMode, onChange, onShadowChange }: { label: string; value: string; note?: string; yLabels: string[]; xStart: string; xEnd: string; data: number[]; shadowData: number[]; max: number; color?: string; editMode: boolean; onChange: (data: number[]) => void; onShadowChange: (data: number[]) => void }) {
  return (
    <article className="engagement-metric-card">
      <span>{label}</span><strong><span>{value}</span><SvgIcon name="check-circle-green" size={20} /></strong>{note && <p>{note}</p>}
      <div className="chart-shell engagement-chart-shell">
        <div className="chart-y-labels">{yLabels.map((item) => <span key={item}>{item}</span>)}</div>
        <EditableLineChart data={data} shadowData={shadowData} max={max} color={color} fill editMode={editMode} onChange={onChange} onShadowChange={onShadowChange} />
        <div className="chart-x-labels"><span>{xStart}</span><span>{xEnd}</span></div>
      </div>
    </article>
  );
}

function AudiencePercentageCard({ title, subtitle, rows }: { title: string; subtitle: string; rows: Array<[string, string]> }) {
  return (
    <article className="audience-card audience-percentage-card">
      <h2>{title}</h2><p>{subtitle}</p>
      <div className="audience-rows">{rows.map(([label, value]) => <div className="audience-row" key={label}><div><span>{label}</span><strong>{value}</strong></div><div className="audience-progress"><i style={{ width: value }} /></div></div>)}</div>
    </article>
  );
}

type VideoAnalyticsTab = "Overview" | "Reach" | "Engagement" | "Audience";

function VideoAnalyticsPage({ video, imageSrc, graphData, analyticsTab, editMode, onBack, onToggleEdit, onAnalyticsTabChange, onGraphChange }: { video: PublishedVideo; imageSrc?: string; graphData: VideoGraphData; analyticsTab: VideoAnalyticsTab; editMode: boolean; onBack: () => void; onToggleEdit: () => void; onAnalyticsTabChange: (tab: VideoAnalyticsTab) => void; onGraphChange: (key: keyof VideoGraphData, data: number[]) => void }) {
  const titleTapCountRef = useRef(0);
  const titleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyticsCarouselRef = useRef<HTMLDivElement>(null);
  const engagementCarouselRef = useRef<HTMLDivElement>(null);
  const audienceCarouselRef = useRef<HTMLDivElement>(null);
  const [activeChartCard, setActiveChartCard] = useState(0);
  const [activeEngagementCard, setActiveEngagementCard] = useState(0);
  const [activeAudienceCard, setActiveAudienceCard] = useState(0);

  function handleTitleTap() {
    titleTapCountRef.current += 1;
    if (titleTapCountRef.current >= 2) {
      if (titleTapTimerRef.current) clearTimeout(titleTapTimerRef.current);
      titleTapCountRef.current = 0;
      titleTapTimerRef.current = null;
      onToggleEdit();
      return;
    }
    if (titleTapTimerRef.current) clearTimeout(titleTapTimerRef.current);
    titleTapTimerRef.current = setTimeout(() => {
      titleTapCountRef.current = 0;
      titleTapTimerRef.current = null;
    }, 700);
  }

  function syncCarouselDot() {
    const carousel = analyticsCarouselRef.current;
    if (!carousel) return;
    const cardWidth = carousel.querySelector<HTMLElement>(".overview-chart-card")?.offsetWidth || 344;
    const gap = 10;
    setActiveChartCard(Math.max(0, Math.min(1, Math.round(carousel.scrollLeft / (cardWidth + gap)))));
  }

  function selectChartCard(index: number) {
    const carousel = analyticsCarouselRef.current;
    if (!carousel) return;
    const cardWidth = carousel.querySelector<HTMLElement>(".overview-chart-card")?.offsetWidth || 344;
    carousel.scrollTo({ left: index * (cardWidth + 10), behavior: "smooth" });
    setActiveChartCard(index);
  }

  function syncEngagementDot() {
    const carousel = engagementCarouselRef.current;
    if (!carousel) return;
    const cardWidth = carousel.querySelector<HTMLElement>(".engagement-metric-card")?.offsetWidth || 344;
    setActiveEngagementCard(Math.max(0, Math.min(3, Math.round(carousel.scrollLeft / (cardWidth + 10)))));
  }

  function selectEngagementCard(index: number) {
    const carousel = engagementCarouselRef.current;
    if (!carousel) return;
    const cardWidth = carousel.querySelector<HTMLElement>(".engagement-metric-card")?.offsetWidth || 344;
    carousel.scrollTo({ left: index * (cardWidth + 10), behavior: "smooth" });
    setActiveEngagementCard(index);
  }

  function syncAudienceDot() {
    const carousel = audienceCarouselRef.current;
    if (!carousel) return;
    const cardWidth = carousel.querySelector<HTMLElement>(".engagement-metric-card")?.offsetWidth || 344;
    setActiveAudienceCard(Math.max(0, Math.min(1, Math.round(carousel.scrollLeft / (cardWidth + 10)))));
  }

  function selectAudienceCard(index: number) {
    const carousel = audienceCarouselRef.current;
    if (!carousel) return;
    const cardWidth = carousel.querySelector<HTMLElement>(".engagement-metric-card")?.offsetWidth || 344;
    carousel.scrollTo({ left: index * (cardWidth + 10), behavior: "smooth" });
    setActiveAudienceCard(index);
  }

  function selectAnalyticsTab(tab: VideoAnalyticsTab) {
    if (editMode) return;
    onAnalyticsTabChange(tab);
    document.querySelector(".screen-scroll")?.scrollTo({ top: 0 });
  }

  return (
    <section className="video-analytics-page">
      <header className="video-analytics-header">
        <button type="button" aria-label="Back to pencil page" onClick={onBack}><SvgIcon name="detail-back" size={30} /></button>
        <img src={imageSrc || "/video-detail-reference.jpeg"} alt="Video thumbnail" />
        <button className={editMode ? "analytics-title editing" : "analytics-title"} type="button" onClick={handleTitleTap} aria-label={editMode ? "Double tap to save analytics" : "Double tap to edit analytics"} aria-pressed={editMode}><span>{video.title}</span></button>
      </header>

      <nav className="analytics-tabs" aria-label="Video analytics sections">
        {(["Overview", "Reach", "Engagement", "Audience"] as const).map((tab) => <button key={tab} className={analyticsTab === tab ? "active" : ""} type="button" aria-current={analyticsTab === tab ? "page" : undefined} onClick={() => selectAnalyticsTab(tab)}><span>{tab}</span></button>)}
      </nav>

      {analyticsTab === "Overview" ? <>
        <h1 className="analytics-summary">This Short has gotten {video.views} views since it was published</h1>

        <div ref={analyticsCarouselRef} className="analytics-carousel" aria-label="Analytics cards" onScroll={syncCarouselDot}>
          <article className="overview-chart-card">
            <span>Views</span><strong><span>{video.views}</span><SvgIcon name="check-circle-green" size={20} /></strong><p>About the same as usual</p>
            <div className="chart-shell views-chart-shell">
              <div className="chart-y-labels"><span>21</span><span>14</span><span>7</span><span>0</span></div>
              <EditableLineChart data={graphData.views} shadowData={graphData.viewsShadow || defaultVideoGraphs.viewsShadow} max={21} color="#00a9c7" fill editMode={editMode} onChange={(data) => onGraphChange("views", data)} onShadowChange={(data) => onGraphChange("viewsShadow", data)} />
              <div className="chart-x-labels"><span>0</span><span>907 days</span></div>
            </div>
          </article>
          <article className="overview-chart-card">
            <span>Subscribers</span><strong>0</strong>
            <div className="chart-shell subscriber-chart-shell">
              <div className="chart-y-labels"><span>3</span><span>2</span><span>1</span><span>0</span></div>
              <EditableLineChart data={graphData.subscribers} max={3} color="#00a9c7" editMode={editMode} onChange={(data) => onGraphChange("subscribers", data)} />
              <div className="chart-x-labels"><span>0</span><span>907 days</span></div>
            </div>
          </article>
        </div>
        <div className="carousel-dots" aria-label="Choose analytics graph">
          <button className={activeChartCard === 0 ? "active" : ""} type="button" aria-label="Show Views graph" aria-current={activeChartCard === 0 ? "true" : undefined} onClick={() => selectChartCard(0)} />
          <button className={activeChartCard === 1 ? "active" : ""} type="button" aria-label="Show Subscribers graph" aria-current={activeChartCard === 1 ? "true" : undefined} onClick={() => selectChartCard(1)} />
        </div>

        <article className="analytics-large-card retention-card">
          <div className="retention-heading"><h2>Audience Retention</h2><strong>0:19 (65.0%)</strong></div><p>Average view duration · Lifetime</p>
          <div className="chart-shell retention-chart-shell">
            <div className="chart-y-labels"><span>100%</span><span>66%</span><span>33%</span><span>0%</span></div>
            <EditableLineChart data={graphData.retention} max={140} color="#d24b90" editMode={editMode} onChange={(data) => onGraphChange("retention", data)} />
            <div className="chart-x-labels"><span>0:00</span><span>0:30</span></div>
          </div>
        </article>

        <article className="analytics-large-card realtime-card">
          <h2>Realtime</h2><strong>0</strong><p>Views · 48 hours</p><div className="realtime-rule" /><span>Nothing to show for these dates</span>
        </article>
      </> : analyticsTab === "Reach" ? (
        <section className="reach-page-content">
          <article className="reach-card reach-views-card">
            <span>Views</span><strong><span>4.8K</span><SvgIcon name="check-circle-green" size={21} /></strong><p>About the same as usual</p>
            <div className="chart-shell reach-chart-shell">
              <div className="chart-y-labels"><span>5.7K</span><span>3.8K</span><span>1.9K</span><span>0</span></div>
              <EditableLineChart data={graphData.reachViews || defaultVideoGraphs.reachViews} shadowData={graphData.reachViewsShadow || defaultVideoGraphs.reachViewsShadow} max={90} color="#6254db" fill editMode={editMode} onChange={(data) => onGraphChange("reachViews", data)} onShadowChange={(data) => onGraphChange("reachViewsShadow", data)} />
              <div className="chart-x-labels"><span>0</span><span>634 days</span></div>
            </div>
          </article>

          <article className="reach-card traffic-card">
            <h2>How viewers find this video</h2><p>Views · Since published</p>
            <div className="traffic-bar" aria-label="Traffic source distribution"><i /><i /><i /><i /><i /></div>
            <div className="traffic-list">
              <div><i /><span>YouTube search</span><strong>80.9%</strong></div><div><i /><span>Shorts feed</span><strong>17.1%</strong></div><div><i /><span>Channel pages</span><strong>0.7%</strong></div><div><i /><span>Hashtag pages</span><strong>0.5%</strong></div><div><i /><span>Other</span><strong>0.8%</strong></div>
            </div>
          </article>

          <article className="reach-card source-card">
            <h2>External sites or apps</h2><p>Views · Since published</p><div className="source-row"><span>Google Search</span><strong>87.5%</strong></div><div className="source-progress"><i style={{ width: "87.5%" }} /></div>
          </article>

          <article className="reach-card search-terms-card">
            <h2>YouTube search terms</h2><p>Views · Since published</p>
            {[["red sun", "28.6%"], ["sun red", "20.4%"], ["red sun minecraft", "6.5%"]].map(([term, value]) => <div className="term-row" key={term}><div><span>{term}</span><strong>{value}</strong></div><div className="source-progress"><i style={{ width: value }} /></div></div>)}
          </article>

          <article className="reach-card suggesting-card">
            <h2>Content suggesting this Short</h2><p>Views · Since published</p><div><img src={imageSrc || "/video-detail-reference.jpeg"} alt="Suggested video thumbnail" /><span>Tôi Săn Lùng Những Ngọn Giáo...</span><strong>40.0%</strong></div>
          </article>

          <article className="reach-card playlists-card">
            <h2>Playlists featuring this Short</h2><p>Views · Since published</p><div><SvgIcon name="detail-info" size={25} /><span>Not enough traffic data to show this report</span></div>
          </article>
        </section>
      ) : analyticsTab === "Engagement" ? (
        <section className="engagement-page-content">
          <div ref={engagementCarouselRef} className="engagement-carousel" aria-label="Engagement metric graphs" onScroll={syncEngagementDot}>
            <EngagementMetricCard label="Engaged views" value="332" yLabels={["360", "240", "120", "0"]} xStart="0" xEnd="142 days" data={graphData.engagedViews || defaultVideoGraphs.engagedViews} shadowData={graphData.engagedViewsShadow || defaultVideoGraphs.engagedViewsShadow} max={360} editMode={editMode} onChange={(data) => onGraphChange("engagedViews", data)} onShadowChange={(data) => onGraphChange("engagedViewsShadow", data)} />
            <EngagementMetricCard label="Unique viewers" value="306" yLabels={["300", "200", "100", "0"]} xStart="Apr 1" xEnd="Aug 22" data={graphData.uniqueViewers || defaultVideoGraphs.uniqueViewers} shadowData={graphData.uniqueViewersShadow || defaultVideoGraphs.uniqueViewersShadow} max={300} editMode={editMode} onChange={(data) => onGraphChange("uniqueViewers", data)} onShadowChange={(data) => onGraphChange("uniqueViewersShadow", data)} />
            <EngagementMetricCard label="Watch time (hours)" value="1.3" note="About the same as usual" yLabels={["2.0", "1.3", "0.6", "0.0"]} xStart="0" xEnd="142 days" data={graphData.watchTime || defaultVideoGraphs.watchTime} shadowData={graphData.watchTimeShadow || defaultVideoGraphs.watchTimeShadow} max={2} editMode={editMode} onChange={(data) => onGraphChange("watchTime", data)} onShadowChange={(data) => onGraphChange("watchTimeShadow", data)} />
            <EngagementMetricCard label="Average view duration" value="0:11" note="About the same as usual" yLabels={["0:24", "0:16", "0:08", "0:00"]} xStart="0" xEnd="142 days" data={graphData.averageDuration || defaultVideoGraphs.averageDuration} shadowData={graphData.averageDurationShadow || defaultVideoGraphs.averageDurationShadow} max={24} editMode={editMode} onChange={(data) => onGraphChange("averageDuration", data)} onShadowChange={(data) => onGraphChange("averageDurationShadow", data)} />
          </div>
          <div className="engagement-dots" aria-label="Choose engagement graph">{[0, 1, 2, 3].map((index) => <button key={index} className={activeEngagementCard === index ? "active" : ""} type="button" aria-label={`Show engagement graph ${index + 1}`} aria-current={activeEngagementCard === index ? "true" : undefined} onClick={() => selectEngagementCard(index)} />)}</div>

          <article className="engagement-card hype-card">
            <h2>Hype</h2><p>First 7 days</p><div><section><strong>0</strong><span>Hype points</span></section><section><strong>0</strong><span>Hypes</span></section></div>
          </article>

          <article className="engagement-card viewers-engaged-card">
            <h2>How viewers engaged</h2><p>Since published</p><div className="engaged-bar"><i /><i /></div>
            <div className="engaged-values"><section><strong>32.0%</strong><span>Stayed to watch</span></section><section><strong>68.0%</strong><span>Swiped away</span></section></div>
          </article>

          <article className="analytics-large-card engagement-retention-card">
            <div className="retention-heading"><h2>Audience Retention</h2><strong>0:11 (40.8%)</strong></div><p>Average view duration · Lifetime</p>
            <div className="chart-shell retention-chart-shell">
              <div className="chart-y-labels"><span>100%</span><span>66%</span><span>33%</span><span>0%</span></div>
              <EditableLineChart data={graphData.engagementRetention || defaultVideoGraphs.engagementRetention} max={120} color="#d24b90" editMode={editMode} onChange={(data) => onGraphChange("engagementRetention", data)} />
              <div className="chart-x-labels"><span>0:00</span><span>0:28</span></div>
            </div>
          </article>
        </section>
      ) : analyticsTab === "Audience" ? (
        <section className="audience-page-content">
          <div ref={audienceCarouselRef} className="engagement-carousel" aria-label="Audience metric graphs" onScroll={syncAudienceDot}>
            <EngagementMetricCard label="Unique viewers" value="306" yLabels={["300", "200", "100", "0"]} xStart="Apr 1" xEnd="Aug 22" data={graphData.uniqueViewers || defaultVideoGraphs.uniqueViewers} shadowData={graphData.uniqueViewersShadow || defaultVideoGraphs.uniqueViewersShadow} max={300} color="#932bc5" editMode={editMode} onChange={(data) => onGraphChange("uniqueViewers", data)} onShadowChange={(data) => onGraphChange("uniqueViewersShadow", data)} />
            <EngagementMetricCard label="Subscribers" value="0" yLabels={["3", "2", "1", "0"]} xStart="0" xEnd="142 days" data={graphData.subscribers || defaultVideoGraphs.subscribers} shadowData={graphData.subscribersShadow || defaultVideoGraphs.subscribersShadow} max={3} color="#932bc5" editMode={editMode} onChange={(data) => onGraphChange("subscribers", data)} onShadowChange={(data) => onGraphChange("subscribersShadow", data)} />
          </div>
          <div className="engagement-dots" aria-label="Choose audience graph">{[0, 1].map((index) => <button key={index} className={activeAudienceCard === index ? "active" : ""} type="button" aria-label={`Show audience graph ${index + 1}`} aria-current={activeAudienceCard === index ? "true" : undefined} onClick={() => selectAudienceCard(index)} />)}</div>

          <article className="audience-card audience-report-card">
            <h2>Audience by watch behavior</h2><p>Unique viewers · Since published</p><div><SvgIcon name="detail-info" size={25} /><span>Not enough data to show this report</span></div>
          </article>
          <article className="audience-card viewers-also-card"><h2>Viewers also watch</h2><p>Last 90 days</p><span>Not enough data to show this report</span></article>

          <article className="audience-card device-card">
            <h2>Device type</h2><p>Watch time (hours) · Since published</p><div className="device-bar"><i /><i /><i /><i /></div>
            <div className="device-list"><div><i /><span>Mobile</span><strong>77.8%</strong></div><div><i /><span>Tablet</span><strong>12.6%</strong></div><div><i /><span>Computer</span><strong>4.9%</strong></div><div><i /><span>TV</span><strong>4.5%</strong></div></div>
          </article>

          <AudiencePercentageCard title="Age" subtitle="Since published · Views" rows={[["13–17 years", "0.0%"], ["18–24 years", "45.9%"], ["25–34 years", "54.1%"], ["35–44 years", "0.0%"], ["45–54 years", "0.0%"], ["55–64 years", "0.0%"], ["65+ years", "0.0%"]]} />
          <AudiencePercentageCard title="Gender" subtitle="Since published · Views" rows={[["Male", "100.0%"], ["Female", "0.0%"], ["User-specified", "0.0%"]]} />
          <AudiencePercentageCard title="Top geographies" subtitle="Views · Since published" rows={[["India", "42.0%"], ["Philippines", "5.7%"], ["United States", "2.7%"]]} />
          <AudiencePercentageCard title="Top subtitle/CC languages" subtitle="Views · Since published" rows={[["No subtitles/CC", "96.9%"], ["English", "3.1%"]]} />
          <AudiencePercentageCard title="Watch time from subscribers" subtitle="Watch time (hours) · Since published" rows={[["Not subscribed", "98.6%"], ["Subscribed", "1.4%"]]} />
        </section>
      ) : <section className="analytics-coming-card"><h2>{analyticsTab}</h2><p>Analytics details will appear here.</p></section>}
    </section>
  );
}

const studioPages: Record<Exclude<PageName, "Dashboard">, { title: string; subtitle: string; cards: Array<[string, string, string]> }> = {
  Content: {
    title: "Content",
    subtitle: "Your latest uploads",
    cards: [
      ["Earn Dollars through Whop 🤑🤑", "11 views", "Published"],
      ["Funding Pips @fundingpipscom", "8 views", "Published"],
      ["How creators grow online", "5 views", "Draft"],
    ],
  },
  Analytics: {
    title: "Analytics",
    subtitle: "Last 28 days",
    cards: [
      ["Views", "2.4K", "About the same as usual"],
      ["Watch time (hours)", "9.0", "About the same as usual"],
      ["Subscribers", "+12", "28% more than previous period"],
    ],
  },
  Community: {
    title: "Community",
    subtitle: "Comments and mentions",
    cards: [
      ["Comments", "1", "No unresponded comments"],
      ["Mentions", "0", "No new mentions"],
      ["Subscribers", "2,328", "Your channel community"],
    ],
  },
  Earn: {
    title: "Earn",
    subtitle: "Channel monetization",
    cards: [
      ["Estimated revenue", "$0.00", "Last 28 days"],
      ["Watch page ads", "Not active", "Keep growing your channel"],
      ["Fan funding", "Not active", "Eligibility requirements apply"],
    ],
  },
};

function StudioSectionPage({ page }: { page: Exclude<PageName, "Dashboard"> }) {
  const data = studioPages[page];
  return (
    <section className="studio-section-page">
      <div className="section-page-heading"><h1>{data.title}</h1><span>{data.subtitle}</span></div>
      {page === "Content" && <div className="content-filter-row"><button className="selected">Videos</button><button>Shorts</button><button>Live</button></div>}
      <div className="section-page-cards">
        {data.cards.map(([label, value, note], index) => (
          <article className="section-data-card" key={label}>
            {page === "Content" && <div className={`mini-video-thumb variant-${index + 1}`}><SvgIcon name="youtube-play" size={24} /></div>}
            <div className="section-card-copy"><span>{label}</span><strong>{value}</strong><p>{note}</p></div>
            <ChevronRight size={22} aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}

const LICENSE_RECHECK_MS = 30_000;

export default function Home() {
  const [licenseState, setLicenseState] = useState<"checking" | "locked" | "unlocked">("checking");
  const [accessCode, setAccessCode] = useState("");
  const [accessMessage, setAccessMessage] = useState("");
  const [accessBusy, setAccessBusy] = useState(false);
  const [activePage, setActivePage] = useState<PageName>("Dashboard");
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [videoAnalyticsOpen, setVideoAnalyticsOpen] = useState(false);
  const [videoAnalyticsTab, setVideoAnalyticsTab] = useState<VideoAnalyticsTab>("Overview");
  const [avatar, setAvatar] = useState<{ file: File | null; src: string }>({ file: null, src: "/top-icons/profile-emoji.svg" });
  const [cardImages, setCardImages] = useState<Array<{ file: File | null; src: string } | undefined>>([]);
  const [editMode, setEditMode] = useState(false);
  const [topGapEnabled, setTopGapEnabled] = useState(false);
  const [savedText, setSavedText] = useState<Partial<Record<string, string[]>>>({});
  const [videoGraphs, setVideoGraphs] = useState<Record<number, VideoGraphData>>({});
  const canvasRef = useRef<HTMLElement>(null);
  const editContextKey = selectedVideoIndex === null ? activePage : videoAnalyticsOpen ? `VideoAnalytics-${selectedVideoIndex}-${videoAnalyticsTab}` : `VideoDetail-${selectedVideoIndex}`;

  useEffect(() => {
    let cancelled = false;
    let checkInFlight = false;

    const unlock = () => { if (!cancelled) setLicenseState("unlocked"); };
    const lock = () => {
      if (cancelled) return;
      clearLicenseSession();
      setLicenseState("locked");
    };

    const validateLicense = async () => {
      if (cancelled || checkInFlight) return;
      checkInFlight = true;
      try {
        const session = loadLicenseSession();
        if (!session) {
          lock();
          return;
        }

        if (licenseHasExpired(session)) {
          lock();
          return;
        }

        try {
          if (new Date(session.expiresAt) <= new Date()) {
            await refreshLicense(session);
          } else {
            await getLicenseStatus(session.token);
          }
          unlock();
        } catch (error) {
          if (canRefreshLicense(error)) {
            try {
              await refreshLicense(session);
              unlock();
            } catch (refreshError) {
              if (isDefinitiveLicenseFailure(refreshError)) lock();
              else unlock();
            }
          } else if (isDefinitiveLicenseFailure(error)) {
            lock();
          } else {
            // Keep a locally valid activation during temporary network or relay failures.
            unlock();
          }
        }
      } catch {
        lock();
      } finally {
        checkInFlight = false;
      }
    };

    const recheckWhenVisible = () => {
      if (document.visibilityState === "visible") void validateLicense();
    };

    void validateLicense();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") void validateLicense();
    }, LICENSE_RECHECK_MS);
    window.addEventListener("focus", recheckWhenVisible);
    document.addEventListener("visibilitychange", recheckWhenVisible);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", recheckWhenVisible);
      document.removeEventListener("visibilitychange", recheckWhenVisible);
    };
  }, []);

  function editableElements() {
    const root = canvasRef.current?.querySelector(".page-content");
    if (!root) return [] as HTMLElement[];
    const selector = "h1,h2,h3,p,span,strong,b,small";
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((element) =>
      !element.querySelector(selector) && !element.matches("[data-no-edit]") && !element.closest("[data-no-edit='true']"),
    );
  }

  useEffect(() => {
    const syncScale = () => {
      const reservedTopSpace = topGapEnabled ? PHONE_TOP_GAP_PX : 0;
      const scale = Math.min(1, window.innerWidth / 436, Math.max(0, window.innerHeight - reservedTopSpace) / 932);
      document.documentElement.style.setProperty("--app-scale", String(scale));
    };
    syncScale();
    window.addEventListener("resize", syncScale);
    return () => window.removeEventListener("resize", syncScale);
  }, [topGapEnabled]);

  useEffect(() => {
    canvasRef.current?.querySelector<HTMLElement>(".screen-scroll")?.scrollTo({ top: 0 });
    try {
      const stored = window.localStorage.getItem(textStorageKey);
      if (stored) setSavedText(JSON.parse(stored));
      const storedGraphs = window.localStorage.getItem("creator-studio-video-graphs-v1");
      if (storedGraphs) setVideoGraphs(JSON.parse(storedGraphs));
      const storedCardImages = window.localStorage.getItem(cardImageStorageKey);
      if (storedCardImages) {
        const sources = JSON.parse(storedCardImages) as Array<string | null>;
        setCardImages(sources.map((src) => src ? { file: null, src } : undefined));
      }
      setTopGapEnabled(window.localStorage.getItem(topGapStorageKey) === "true");
    } catch {
      // Keep editing available even when browser storage is disabled.
    }
  }, []);

  function toggleTopGap() {
    setTopGapEnabled((current) => {
      const next = !current;
      try { window.localStorage.setItem(topGapStorageKey, String(next)); } catch { /* Keep the setting for this session. */ }
      return next;
    });
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const elements = editableElements();
      const values = savedText[editContextKey];
      // Saved text is positional. Only restore it when the stored layout still
      // matches the current page so newly added sections cannot inherit labels
      // from an older layout.
      if (values?.length === elements.length) {
        values.forEach((value, index) => {
          elements[index].innerHTML = value;
        });
      }
      elements.forEach((element) => {
        element.contentEditable = editMode ? "true" : "false";
        element.spellcheck = editMode;
      });
      const root = canvasRef.current?.querySelector(".page-content");
      if (root && !editMode) syncReachPercentageBars(root);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [editContextKey, editMode, savedText]);

  useEffect(() => {
    if (Object.keys(videoGraphs).length === 0) return;
    const saveTimer = window.setTimeout(() => {
      try { window.localStorage.setItem("creator-studio-video-graphs-v1", JSON.stringify(videoGraphs)); } catch { /* Keep graph changes for this session. */ }
    }, 160);
    return () => window.clearTimeout(saveTimer);
  }, [videoGraphs]);

  function toggleTextEditing() {
    if (!editMode) {
      setEditMode(true);
      return;
    }

    const nextSaved = { ...savedText, [editContextKey]: editableElements().map((element) => element.innerHTML) };
    setSavedText(nextSaved);
    setEditMode(false);
    try {
      window.localStorage.setItem(textStorageKey, JSON.stringify(nextSaved));
    } catch {
      // The current page still retains saved text for this session.
    }
  }

  function selectPage(page: PageName) {
    if (editMode) return;
    setSelectedVideoIndex(null);
    setVideoAnalyticsOpen(false);
    setActivePage(page);
    document.querySelector(".screen-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openVideo(index: number) {
    if (editMode) return;
    setSelectedVideoIndex(index);
    setVideoAnalyticsOpen(false);
    setVideoAnalyticsTab("Overview");
    document.querySelector(".screen-scroll")?.scrollTo({ top: 0 });
  }

  function closeVideo() {
    if (editMode) toggleTextEditing();
    setSelectedVideoIndex(null);
    setVideoAnalyticsOpen(false);
    document.querySelector(".screen-scroll")?.scrollTo({ top: 0 });
  }

  function openVideoAnalytics() {
    if (editMode || selectedVideoIndex === null) return;
    setVideoAnalyticsOpen(true);
    setVideoAnalyticsTab("Overview");
    document.querySelector(".screen-scroll")?.scrollTo({ top: 0 });
  }

  function closeVideoAnalytics() {
    if (editMode) toggleTextEditing();
    setVideoAnalyticsOpen(false);
    document.querySelector(".screen-scroll")?.scrollTo({ top: 0 });
  }

  function updateGraph(videoIndex: number, key: keyof VideoGraphData, data: number[]) {
    setVideoGraphs((current) => {
      const next = { ...current, [videoIndex]: { ...(current[videoIndex] || defaultVideoGraphs), [key]: data } };
      return next;
    });
  }

  function updateCardImage(videoIndex: number, file: File, src: string) {
    setCardImages((current) => {
      const next = [...current];
      next[videoIndex] = { file, src };
      try { window.localStorage.setItem(cardImageStorageKey, JSON.stringify(next.map((image) => image?.src ?? null))); } catch { /* Keep uploaded images synced for this session. */ }
      return next;
    });
  }

  function updateAccessCode(value: string) {
    const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
    setAccessCode(raw.match(/.{1,4}/g)?.join("-") ?? raw);
  }

  async function submitAccessCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (accessBusy) return;
    setAccessBusy(true);
    setAccessMessage("");
    try {
      await activateLicense(accessCode);
      setLicenseState("unlocked");
    } catch (error) {
      setAccessMessage(error instanceof Error ? error.message : "Activation failed.");
    } finally {
      setAccessBusy(false);
    }
  }

  if (licenseState !== "unlocked") {
    return (
      <main className="access-gate">
        <section className="access-card" aria-live="polite">
          <img src="/youtube-studio-logo-white.svg" alt="Studio" />
          <p className="access-eyebrow">Youtube Insight</p>
          <h1>Enter Access Code</h1>
          {licenseState === "checking" ? <p className="access-checking">Checking your access…</p> : (
            <form onSubmit={submitAccessCode}>
              <label htmlFor="youtube-insight-access-code">Access Code</label>
              <input id="youtube-insight-access-code" value={accessCode} onChange={(event) => updateAccessCode(event.target.value)} placeholder="A8KD-4F9Q-LX7P" maxLength={14} autoComplete="off" autoCapitalize="characters" spellCheck={false} required autoFocus />
              {accessMessage && <p className="access-error" role="alert">{accessMessage}</p>}
              <button type="submit" disabled={accessBusy || accessCode.length !== 14}>{accessBusy ? "Activating…" : "Activate"}</button>
            </form>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className={`reference-canvas${editMode ? " text-edit-mode" : ""}${topGapEnabled ? " phone-top-gap" : ""}`} ref={canvasRef}>
      <div className="screen-scroll">
        {selectedVideoIndex === null && <TopHeader avatarSrc={avatar.src} editMode={editMode} topGapEnabled={topGapEnabled} onToggleEdit={toggleTextEditing} onToggleTopGap={toggleTopGap} />}
        <div className="page-content">
          {selectedVideoIndex !== null ? (
            videoAnalyticsOpen ? (
              <VideoAnalyticsPage video={publishedVideos[selectedVideoIndex]} imageSrc={cardImages[selectedVideoIndex]?.src} graphData={videoGraphs[selectedVideoIndex] || defaultVideoGraphs} analyticsTab={videoAnalyticsTab} editMode={editMode} onBack={closeVideoAnalytics} onToggleEdit={toggleTextEditing} onAnalyticsTabChange={setVideoAnalyticsTab} onGraphChange={(key, data) => updateGraph(selectedVideoIndex, key, data)} />
            ) : (
              <VideoDetailPage video={publishedVideos[selectedVideoIndex]} imageSrc={cardImages[selectedVideoIndex]?.src} editMode={editMode} onBack={closeVideo} onToggleEdit={toggleTextEditing} onOpenAnalytics={openVideoAnalytics} onImageChange={(file, src) => updateCardImage(selectedVideoIndex, file, src)} />
            )
          ) : activePage === "Dashboard" ? (
            <DashboardPage avatarSrc={avatar.src} onAvatarChange={(file, src) => setAvatar({ file, src })} cardImages={cardImages} onCardImageChange={updateCardImage} onOpenVideo={openVideo} />
          ) : <StudioSectionPage page={activePage} />}
        </div>
      </div>
      <BottomNavigation active={activePage} onSelect={selectPage} />
    </main>
  );
}
