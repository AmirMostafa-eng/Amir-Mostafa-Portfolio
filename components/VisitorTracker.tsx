"use client";

import { useEffect } from "react";

const KEY = "amir_visitor_id";

// Silent beacon: one random device ID in localStorage, one POST per page load.
// Renders nothing and shows nothing to visitors.
export function VisitorTracker() {
  useEffect(() => {
    try {
      let id = localStorage.getItem(KEY);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(KEY, id);
      }
      fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, page: window.location.pathname, ref: document.referrer }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Storage blocked or fetch unavailable: skip counting, never break the page.
    }
  }, []);
  return null;
}
