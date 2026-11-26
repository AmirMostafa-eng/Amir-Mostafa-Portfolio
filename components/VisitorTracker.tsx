"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
const KEY = "amir_visitor_id";
const SESSION_KEY = "amir_visit_session";

// Silent beacon: one random device ID in localStorage, one POST per page load.
// Renders nothing and shows nothing to visitors.
export function VisitorTracker() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      let id = localStorage.getItem(KEY);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(KEY, id);
      }
      // A visit = one browser session (tab). sessionStorage resets when the tab closes.
      const newVisit = !sessionStorage.getItem(SESSION_KEY);
      if (newVisit) sessionStorage.setItem(SESSION_KEY, "1");
      fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, page: pathname, newVisit, ref: document.referrer }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Storage blocked or fetch unavailable: skip counting, never break the page.
    }
  }, [pathname]);
  return null;
}
