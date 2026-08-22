"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MiniSidebar from "./MiniSidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(true);
  const [railOpen, setRailOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // routes that hide the inline sidebar (immersive)
  const immersive = pathname.startsWith("/watch") || pathname.startsWith("/shorts");
  const overlayMode = !isDesktop || immersive;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onMenuClick = () => {
    if (overlayMode) setDrawerOpen((o) => !o);
    else setRailOpen((o) => !o);
  };

  const showMiniRail = isDesktop && !immersive && !railOpen;
  const showFullRail = isDesktop && !immersive && railOpen;

  return (
    <div className="min-h-screen bg-yt-bg">
      <Header onMenuClick={onMenuClick} />

      {/* Overlay drawer (mobile + immersive pages) */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-60 bg-yt-bg pt-14 animate-fade-in"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setDrawerOpen(false);
            }}
          >
            <Sidebar />
          </aside>
        </>
      )}

      <div className="flex pt-14">
        {showFullRail && (
          <aside className="fixed bottom-0 left-0 top-14 z-30 w-60">
            <Sidebar />
          </aside>
        )}
        {showMiniRail && (
          <aside className="fixed bottom-0 left-0 top-14 z-30 w-[72px] overflow-y-auto">
            <MiniSidebar />
          </aside>
        )}

        <main
          className={`min-w-0 flex-1 ${
            showFullRail ? "lg:ml-60" : showMiniRail ? "lg:ml-[72px]" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
