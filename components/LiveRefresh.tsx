"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const EVERY_MS = 10_000;

// Re-renders the server page every 10s while the tab is visible, so the
// stats update without a manual refresh. Paused in background tabs.
export function LiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(tick, EVERY_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router]);
  return (
    <span className="vault-live">
      <span className="vault-live-dot" /> Live, updates every 10s
    </span>
  );
}
