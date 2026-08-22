"use client";

import { useState } from "react";

type Screen = "dashboard" | "content" | "analytics" | "community" | "earn" | "video" | "geography";
type AnalyticsTab = "Overview" | "Content" | "Audience" | "Trends";
type VideoTab = "Overview" | "Reach" | "Engagement" | "Audience";

const videos = [
  { title: "Going to red sun emoji reaction in Minecraft", views: "2.0K", color: "#34396f", date: "Aug 19, 2026" },
  { title: "The Ultimate Minecraft Glitch! Heavy Core", views: "72", color: "#735768", date: "Aug 17, 2026" },
  { title: "Going to lunar moon in Minecraft", views: "57", color: "#36537b", date: "Aug 15, 2026" },
  { title: "Poi poi poi Minecraft song", views: "51", color: "#657338", date: "Aug 12, 2026" },
  { title: "Enchanted table hack that you don’t know", views: "45", color: "#3f665a", date: "Aug 10, 2026" },
  { title: "Can we Hit EnderMan with a arrow?", views: "11", color: "#674448", date: "Aug 20, 2026" },
];

const navItems: { icon: string; label: string; screen: Screen }[] = [
  { icon:"⌂", label:"Dashboard", screen:"dashboard" },
  { icon:"▶", label:"Content", screen:"content" },
  { icon:"▥", label:"Analytics", screen:"analytics" },
  { icon:"♧", label:"Community", screen:"community" },
  { icon:"$", label:"Earn", screen:"earn" },
];

function Logo() { return <span className="logo"><i /> <b>Studio</b></span>; }

function Thumb({ color, tall = false }: { color: string; tall?: boolean }) {
  return (
    <span className={`thumb ${tall ? "tall" : ""}`} style={{ background: `linear-gradient(145deg, ${color}, #151515)` }}>
      <i>▶</i><em>▦</em>
    </span>
  );
}

function Bars({ purple = false }: { purple?: boolean }) {
  return <div className={`bars ${purple ? "purple" : ""}`}>{[8,14,6,20,11,24,9,18,13,22,7,16,25,10,18,12,23,8,19,14,21,11,24,18].map((h,i)=><i style={{height:`${h}px`}} key={i}/>)}</div>;
}

function TrendChart({ magenta = false }: { magenta?: boolean }) {
  return (
    <div className={`trend-chart ${magenta ? "magenta" : ""}`}>
      <span>1.5K</span><span>1.0K</span><span>500</span>
      <div className="trend-fill" />
      <div className="trend-line"><i/><i/><i/><i/><i/><i/><i/></div>
      <small>Jul 23</small><small>Aug 19</small>
    </div>
  );
}

function ProgressRow({ label, value, width = 50 }: { label: string; value: string; width?: number }) {
  return <div className="progress-row"><div><span>{label}</span><b>{value}</b></div><i><em style={{width:`${width}%`}} /></i></div>;
}

function TabBar<T extends string>({ items, active, onChange }: { items: readonly T[]; active: T; onChange: (tab:T)=>void }) {
  return <div className="tabs" role="tablist">{items.map(tab=><button role="tab" aria-selected={active===tab} className={active===tab?"active":""} onClick={()=>onChange(tab)} key={tab}>{tab}</button>)}</div>;
}

function Card({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return <article className={`panel ${className}`}>{children}</article>;
}

function Dashboard({ openAnalytics, openVideo, openContent }: { openAnalytics:()=>void; openVideo:()=>void; openContent:()=>void }) {
  return (
    <section className="page dashboard">
      <div className="welcome"><div><p>Welcome back,</p><h1>Mythpat Minecraft</h1></div><span className="channel-avatar">M</span></div>
      <div className="summary-grid">
        <Card className="metric-card">
          <div className="metric-head"><h2>Channel analytics</h2><span>Last 28 days</span></div>
          <strong>1,286</strong><p>Views</p><TrendChart />
          <div className="mini-stats"><span><b>4.2</b>Watch time (hours)</span><span><b className="green">+3</b>Subscribers</span></div>
          <button className="link-button" onClick={openAnalytics}>GO TO CHANNEL ANALYTICS</button>
        </Card>
        <Card className="metric-card latest">
          <div className="metric-head"><h2>Latest published content</h2><span>First 6 hours 14 minutes</span></div>
          <button className="latest-video" onClick={openVideo}><Thumb color="#674448" /><div><b>Can we Hit EnderMan with a arrow?</b><small>Short</small></div></button>
          <div className="row-stat"><span>Views</span><b>11</b></div><div className="row-stat"><span>Average percentage viewed</span><b>19.8%</b></div><div className="row-stat"><span>Likes</span><b>1</b></div>
          <button className="link-button" onClick={openVideo}>GO TO VIDEO ANALYTICS</button>
        </Card>
      </div>
      <Card className="content-panel"><div className="metric-head"><h2>Your top content</h2><span>Last 28 days</span></div>{videos.slice(0,5).map(video=><div className="video-row" key={video.title}><Thumb color={video.color}/><p>{video.title}</p><b>{video.views}</b></div>)}<button className="link-button" onClick={openContent}>GO TO CONTENT</button></Card>
      <Card className="realtime"><h2>Realtime</h2><strong>161</strong><span>Views · 48 hours</span><Bars />{videos.slice(0,3).map(video=><div className="video-row compact" key={video.title}><Thumb color={video.color}/><p>{video.title}</p><b>{video.views}</b></div>)}</Card>
      <Card className="news"><div className="roundup">Creator<br/><b>RoundUp</b></div><h2>Monthly Creator Roundup</h2><p>Catch up on the latest news, features, and trending updates from YouTube Creators to help your channel grow.</p><small>9 days ago</small></Card>
    </section>
  );
}

function Content({ openVideo }: { openVideo:()=>void }) {
  return (
    <section className="page content-page">
      <h1>Channel content</h1>
      <div className="filter-row"><button className="filter-icon">☷ <b>1</b></button><button>Sort by: Most viewed⌄</button><button>Visibility⌄</button><button>Views⌄</button></div>
      <div className="content-grid">{videos.map((video,i)=><button className="content-tile" onClick={openVideo} key={video.title}><Thumb color={video.color} tall/><div><h2>{video.title}</h2><p>{video.date} · Published</p><span>▥ {video.views}</span><span>♡ {i===0?"53":i===5?"1":"0"}</span><span>▢ 0</span></div></button>)}</div>
    </section>
  );
}

function OverviewAnalytics() {
  return <><div className="kpi-grid"><Card><span>Views</span><strong>1,286</strong><small>— Typical performance</small></Card><Card><span>Watch time (hours)</span><strong>4.2</strong><small>0.8 more than usual</small></Card><Card><span>Subscribers</span><strong className="green">+3</strong><small>200% more than previous 28 days</small></Card></div><Card className="wide-card"><h2>Your channel got 1,286 views in the last 28 days</h2><TrendChart/><div className="chart-legend"><span>Views</span><b>1,286</b></div></Card><div className="analytics-columns"><Card><h2>Your top content in this period</h2>{videos.slice(0,5).map(v=><div className="video-row compact" key={v.title}><Thumb color={v.color}/><p>{v.title}</p><b>{v.views}</b></div>)}</Card><Card className="realtime"><h2>Realtime</h2><strong>161</strong><span>Views · 48 hours</span><Bars/></Card></div></>;
}

function ContentAnalytics() {
  return <><Card className="wide-card"><h2>How viewers find your content</h2><p className="subtle">Views · Last 28 days</p><div className="traffic-list"><ProgressRow label="Shorts feed" value="78.4%" width={78}/><ProgressRow label="YouTube search" value="8.2%" width={8}/><ProgressRow label="Browse features" value="5.7%" width={6}/><ProgressRow label="Channel pages" value="4.1%" width={4}/><ProgressRow label="Other" value="3.6%" width={4}/></div></Card><div className="analytics-columns"><Card><h2>Impressions and how they led to watch time</h2><div className="funnel"><span>Impressions <b>6.1K</b></span><span>2.7% click-through rate</span><span>Views from impressions <b>165</b></span><span>1:14 average view duration</span></div></Card><Card><h2>Top remixed</h2><p className="empty-state">No remixes to show for this period</p></Card></div></>;
}

function AudienceAnalytics({ openGeography }: { openGeography:()=>void }) {
  return <><div className="kpi-grid"><Card><span>Monthly audience</span><strong>1K</strong><TrendChart magenta/></Card><Card><span>Subscribers</span><strong className="green">+3</strong><TrendChart magenta/></Card></div><Card className="wide-card"><h2>Audience by watch behavior</h2><p className="subtle">Monthly audience · Aug 19, 2026</p><ProgressRow label="New viewers" value="95.3%" width={95}/><ProgressRow label="Casual viewers" value="4.6%" width={5}/><ProgressRow label="Regular viewers" value="< 0.1%" width={1}/></Card><div className="analytics-columns"><Card><h2>Popular with new viewers</h2><p className="subtle">Views · Last 28 days</p>{videos.slice(0,5).map(v=><div className="video-row compact" key={v.title}><Thumb color={v.color}/><p>{v.title}</p><b>{v.views}</b></div>)}</Card><Card><div className="metric-head"><h2>Geography</h2><span>Views · Last 28 days</span></div><ProgressRow label="Philippines" value="7.0%" width={7}/><ProgressRow label="Indonesia" value="5.1%" width={5}/><ProgressRow label="India" value="4.1%" width={4}/><button className="link-button" onClick={openGeography}>SEE MORE</button></Card><Card><h2>When your viewers are on YouTube</h2><p className="subtle">Your local time (GMT +0530) · Last 28 days</p><p className="empty-state">Not enough data to show this report</p></Card><Card><h2>Watch time from subscribers</h2><ProgressRow label="Not subscribed" value="99.3%" width={99}/><ProgressRow label="Subscribed" value="0.7%" width={1}/></Card></div></>;
}

function TrendsAnalytics() { return <><Card className="wide-card"><h2>What your audience is searching for</h2><p className="subtle">Based on searches across YouTube · Last 28 days</p><div className="search-chips"><span>minecraft shorts</span><span>mythpat minecraft</span><span>minecraft hacks</span><span>ender dragon</span></div></Card><Card><h2>Breakout videos</h2>{videos.slice(0,4).map(v=><div className="video-row compact" key={v.title}><Thumb color={v.color}/><p>{v.title}</p><b>High</b></div>)}</Card></> }

function Analytics({ openGeography }: { openGeography:()=>void }) {
  const [tab,setTab]=useState<AnalyticsTab>("Overview");
  return <section className="page analytics-page"><div className="title-row"><h1>Channel analytics</h1><button className="date-button">Last 28 days⌄<small>Jul 23 – Aug 19, 2026</small></button></div><TabBar items={["Overview","Content","Audience","Trends"] as const} active={tab} onChange={setTab}/>{tab==="Overview"&&<OverviewAnalytics/>}{tab==="Content"&&<ContentAnalytics/>}{tab==="Audience"&&<AudienceAnalytics openGeography={openGeography}/>} {tab==="Trends"&&<TrendsAnalytics/>}</section>;
}

function Geography({ back }: { back:()=>void }) {
  return <section className="page detail-page"><div className="back-title"><button onClick={back} aria-label="Back">←</button><h1>Geography</h1></div><div className="filter-row"><button>28D⌄</button><button className="selected">All</button><button>Videos</button><button>Shorts</button></div><Card className="wide-card geography-card"><div className="metric-head"><h2>Views by geography</h2><span>Views</span></div>{[["Philippines","7.0%",7],["Indonesia","5.1%",5],["India","4.1%",4],["United States","3.5%",3.5],["Pakistan","3.0%",3],["Nepal","2.3%",2.3],["Bangladesh","2.0%",2]].map(([l,v,w])=><ProgressRow key={String(l)} label={String(l)} value={String(v)} width={Number(w)*7}/>)}</Card></section>;
}

function VideoOverview() { return <><div className="kpi-grid"><Card><span>Views</span><strong>11</strong></Card><Card><span>Watch time (hours)</span><strong>0.1</strong></Card><Card><span>Subscribers</span><strong>0</strong></Card></div><Card className="wide-card"><h2>Views</h2><TrendChart magenta/><div className="chart-legend"><span>First 24 hours</span><b>11</b></div></Card><Card><h2>Audience Retention</h2><b className="retention-number">0:37 (76.6%)</b><p className="subtle">Average view duration · Lifetime</p><TrendChart magenta/></Card><Card><h2>Realtime</h2><strong>0</strong><p className="subtle">Views · 48 hours</p><p className="empty-state">Nothing to show for these dates</p></Card></> }

function VideoReach() { return <><div className="kpi-grid"><Card><span>Shown in feed</span><strong>21</strong></Card><Card><span>Viewed vs swiped away</span><strong>84.8%</strong></Card></div><Card><h2>External sites or apps</h2><p className="subtle">Views · Since published</p><p className="empty-state">Not enough traffic data to show this report</p></Card><Card><h2>YouTube search terms</h2><ProgressRow label="minecraft" value="7.5%" width={75}/><ProgressRow label="shorts" value="2.7%" width={27}/><ProgressRow label="mythpat minecraft" value="1.9%" width={19}/></Card></> }

function VideoEngagement() { return <><Card><h2>Hype</h2><p className="subtle">First 7 days</p><div className="mini-stats"><span><b>0</b>Hype points</span><span><b>0</b>Hypes</span></div></Card><Card><h2>How viewers engaged</h2><p className="subtle">Since published</p><div className="engagement-bar"><i/><em/></div><div className="split-values"><b>84.8%<small>Stayed to watch</small></b><b>15.2%<small>Swiped away</small></b></div></Card><Card><h2>Audience Retention <b className="retention-number">0:37 (76.6%)</b></h2><TrendChart magenta/></Card></> }

function VideoAudience() { return <><Card><h2>Top geographies</h2><p className="subtle">Views · Since published</p><ProgressRow label="India" value="83.6%" width={84}/><ProgressRow label="Pakistan" value="8.0%" width={8}/><ProgressRow label="Nepal" value="3.7%" width={4}/></Card><Card><h2>Top subtitle/CC languages</h2><ProgressRow label="No subtitles/CC" value="99.3%" width={99}/><ProgressRow label="Hindi" value="0.7%" width={1}/></Card><Card><h2>Watch time from subscribers</h2><ProgressRow label="Not subscribed" value="99.9%" width={100}/><ProgressRow label="Subscribed" value="0.1%" width={1}/></Card></> }

function VideoDetails({ back }: { back:()=>void }) {
  const [tab,setTab]=useState<VideoTab>("Overview");
  return <section className="page analytics-page detail-page"><div className="video-detail-title"><button onClick={back} aria-label="Back">←</button><Thumb color="#674448"/><div><h1>Can we Hit EnderMan with a arrow?</h1><p>Published Aug 20, 2026</p></div></div><TabBar items={["Overview","Reach","Engagement","Audience"] as const} active={tab} onChange={setTab}/>{tab==="Overview"&&<VideoOverview/>}{tab==="Reach"&&<VideoReach/>}{tab==="Engagement"&&<VideoEngagement/>}{tab==="Audience"&&<VideoAudience/>}</section>;
}

function Placeholder({ type }: { type:"community"|"earn" }) {
  const earn=type==="earn"; return <section className="page placeholder-page"><div className="placeholder-icon">{earn?"$":"♧"}</div><h1>{earn?"Earn on YouTube":"Community"}</h1><p>{earn?"Your channel is growing. Keep creating to unlock more earning opportunities.":"Connect with your audience and keep conversations going."}</p><Card><h2>{earn?"Your progress":"Latest comments"}</h2>{earn?<><ProgressRow label="Subscribers" value="3 / 500" width={6}/><ProgressRow label="Public watch hours" value="4 / 3,000" width={2}/></>:videos.slice(0,3).map((v,i)=><div className="comment" key={v.title}><span>{["A","R","K"][i]}</span><div><b>{["Alex Gamer","Riya Plays","Kunal"][i]}</b><p>{["Great short! 🔥","How did you do that?","Amazing Minecraft trick"][i]}</p></div></div>)}</Card></section>;
}

export default function Home() {
  const [screen,setScreen]=useState<Screen>("dashboard");
  const [toast,setToast]=useState("");
  const showToast=(message:string)=>{setToast(message); window.setTimeout(()=>setToast(""),1800)};
  const activeMain:Screen = screen==="video"?"content":screen==="geography"?"analytics":screen;
  return (
    <main className="studio-shell">
      <header className="topbar"><button className="logo-button" onClick={()=>setScreen("dashboard")} aria-label="Studio dashboard"><Logo/></button><div className="top-actions"><button aria-label="Create" onClick={()=>showToast("Create tools opened")}>＋</button><button aria-label="Notifications" onClick={()=>showToast("You’re all caught up")}>♧<em/></button><button className="avatar" aria-label="Account" onClick={()=>showToast("Mythpat Minecraft")}>😎</button></div></header>
      {screen==="dashboard"&&<Dashboard openAnalytics={()=>setScreen("analytics")} openVideo={()=>setScreen("video")} openContent={()=>setScreen("content")}/>} {screen==="content"&&<Content openVideo={()=>setScreen("video")}/>} {screen==="analytics"&&<Analytics openGeography={()=>setScreen("geography")}/>} {screen==="geography"&&<Geography back={()=>setScreen("analytics")}/>} {screen==="video"&&<VideoDetails back={()=>setScreen("content")}/>} {screen==="community"&&<Placeholder type="community"/>} {screen==="earn"&&<Placeholder type="earn"/>}
      <nav className="bottom-nav" aria-label="Main navigation">{navItems.map(item=><button className={activeMain===item.screen?"active":""} onClick={()=>setScreen(item.screen)} key={item.label}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>
      {toast&&<div className="toast" role="status">{toast}</div>}
    </main>
  );
}
