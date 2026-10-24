"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent as ReactFocusEvent, PointerEvent as ReactPointerEvent } from "react";
import { timeline, type TimelineEvent } from "@/data/timeline";
import { buildRoadPath } from "@/lib/buildTimelineRoad";

type Road = { width: number; height: number; path: string };
type OpenPanel = { id: string; source: "hover" | "focus" | "click" };
type PanelPosition = { id: string; left: number; top: number };

const visibleEvents = timeline.filter((event) => event.show);

function formatDate(value: string): string {
  if (!/^\d{4}-\d{2}$/.test(value)) return value;
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

function eventPeriod(event: TimelineEvent) {
  return (
    <span className="timeline-period">
      <time dateTime={event.start}>{formatDate(event.start)}</time>
      <span aria-hidden="true"> – </span>
      {event.end ? <time dateTime={event.end}>{formatDate(event.end)}</time> : <span>Present</span>}
    </span>
  );
}

function isTimelineTrigger(target: EventTarget | null, eventId: string): boolean {
  return target instanceof Element && target.closest(`[data-timeline-trigger="${eventId}"]`) !== null;
}

export function AboutTimeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pointerActivationRef = useRef(false);
  const titleRefs = useRef(new Map<string, HTMLButtonElement>());
  const [openPanel, setOpenPanel] = useState<OpenPanel | null>(null);
  const openId = openPanel?.id ?? null;
  const [road, setRoad] = useState<Road>({ width: 0, height: 0, path: "" });
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);

  const measureRoad = useCallback(() => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return;

    const rootRect = root.getBoundingClientRect();
    const points = Array.from(list.querySelectorAll<HTMLElement>(".timeline-dot")).map((dot) => {
      const rect = dot.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - rootRect.left,
        y: rect.top + rect.height / 2 - rootRect.top,
      };
    });
    const next = {
      width: root.clientWidth,
      height: root.clientHeight,
      path: buildRoadPath(points),
    };

    setRoad((current) =>
      current.width === next.width && current.height === next.height && current.path === next.path ? current : next,
    );
  }, []);

  const positionPanel = useCallback(() => {
    if (!openId || window.matchMedia("(max-width: 640px)").matches) {
      setPanelPosition(null);
      return;
    }

    const root = rootRef.current;
    const title = titleRefs.current.get(openId);
    const panel = panelRef.current;
    if (!root || !title || !panel || panel.hidden) return;

    const rootRect = root.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const label = title.parentElement;
    if (!label) return;
    const labelRect = label.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const gap = 12;

    let desiredLeft = titleRect.left - labelRect.left - panelRect.width - gap;
    const minLeft = Math.max(12, 12 - rootRect.left);
    const maxLeft = Math.min(root.clientWidth - panelRect.width - 12, window.innerWidth - rootRect.left - panelRect.width - 12);
    const flippedLeft = titleRect.right - labelRect.left + gap;
    const minLocalLeft = minLeft - (labelRect.left - rootRect.left);
    const maxLocalLeft = maxLeft - (labelRect.left - rootRect.left);
    if (desiredLeft < minLocalLeft || desiredLeft > maxLocalLeft) desiredLeft = flippedLeft;
    const left = Math.max(minLocalLeft, Math.min(desiredLeft, maxLocalLeft));

    const desiredTop = titleRect.bottom - labelRect.top + gap;
    const aboveTitle = titleRect.top - labelRect.top - panelRect.height - gap;
    const minTop = Math.max(12, 12 - rootRect.top);
    const maxTop = Math.min(root.clientHeight - panelRect.height - 12, window.innerHeight - rootRect.top - panelRect.height - 12);
    const minLocalTop = minTop - (labelRect.top - rootRect.top);
    const maxLocalTop = maxTop - (labelRect.top - rootRect.top);
    const top = Math.max(minLocalTop, Math.min(desiredTop <= maxLocalTop ? desiredTop : aboveTitle, maxLocalTop));

    setPanelPosition((current) =>
      current?.id === openId && current.left === left && current.top === top
        ? current
        : { id: openId, left, top },
    );
  }, [openId]);

  useLayoutEffect(() => {
    measureRoad();
    positionPanel();
  }, [measureRoad, positionPanel, openId]);

  useEffect(() => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return;

    const observer = new ResizeObserver(() => {
      measureRoad();
      positionPanel();
    });
    observer.observe(root);
    observer.observe(list);
    list.querySelectorAll(".timeline-event").forEach((event) => observer.observe(event));

    const handleViewportChange = () => {
      measureRoad();
      positionPanel();
    };
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange);
    };
  }, [measureRoad, positionPanel]);

  useEffect(() => {
    if (!openId) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpenPanel(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenPanel(null);
      if (rootRef.current?.contains(document.activeElement)) {
        (document.activeElement as HTMLElement).blur();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openId]);

  const openOnMouseEnter = (eventId: string, event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") setOpenPanel({ id: eventId, source: "hover" });
  };

  const closeOnMouseLeave = (eventId: string, event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && openPanel?.id === eventId && openPanel.source === "hover" && !isTimelineTrigger(event.relatedTarget, eventId)) {
      setOpenPanel(null);
    }
  };

  const handleBlur = (eventId: string, event: ReactFocusEvent<HTMLButtonElement>) => {
    if (openPanel?.id === eventId && !isTimelineTrigger(event.relatedTarget, eventId)) setOpenPanel(null);
  };

  const markPointerActivation = () => {
    pointerActivationRef.current = true;
    requestAnimationFrame(() => {
      pointerActivationRef.current = false;
    });
  };

  const toggle = (eventId: string) => {
    setOpenPanel((current) => {
      if (current?.id !== eventId) return { id: eventId, source: "click" };
      if (current.source === "hover") return { id: eventId, source: "click" };
      return null;
    });
  };

  return (
    <div className="about-timeline" ref={rootRef}>
      <h3 className="timeline-heading">My journey</h3>
      <svg
        className="timeline-road"
        aria-hidden="true"
        focusable="false"
        viewBox={`0 0 ${road.width || 1} ${road.height || 1}`}
        preserveAspectRatio="none"
      >
        <path d={road.path} />
      </svg>
      <ol className="timeline-list" ref={listRef}>
        {visibleEvents.map((event, index) => {
          const side = index % 2 === 0 ? "left" : "right";
          const isOpen = openId === event.id;
          const panelId = `timeline-panel-${event.id}`;
          const titleId = `timeline-title-${event.id}`;
          const panelStyle = panelPosition?.id === event.id
            ? { left: `${panelPosition.left}px`, top: `${panelPosition.top}px` }
            : undefined;

          return (
            <li className={`timeline-event timeline-event--${side}${isOpen ? " timeline-event--open" : ""}`} key={event.id}>
              <span
                aria-hidden="true"
                className={`timeline-dot${event.size === "small" ? " timeline-dot--small" : ""}${event.end === null ? " timeline-dot--current" : ""}`}
                data-timeline-trigger={event.id}
                onClick={() => toggle(event.id)}
                onPointerEnter={(pointerEvent) => openOnMouseEnter(event.id, pointerEvent)}
                onPointerLeave={(pointerEvent) => closeOnMouseLeave(event.id, pointerEvent)}
              >
                {event.end === null && <span className="timeline-dot-core" aria-hidden="true" />}
              </span>
              <div className="timeline-label">
                <button
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="timeline-title"
                  data-timeline-trigger={event.id}
                  id={titleId}
                  onBlur={(blurEvent) => handleBlur(event.id, blurEvent)}
                  onClick={() => toggle(event.id)}
                  onFocus={() => {
                    if (!pointerActivationRef.current) setOpenPanel({ id: event.id, source: "focus" });
                  }}
                  onPointerDown={markPointerActivation}
                  onPointerEnter={(pointerEvent) => openOnMouseEnter(event.id, pointerEvent)}
                  onPointerLeave={(pointerEvent) => closeOnMouseLeave(event.id, pointerEvent)}
                  ref={(node) => {
                    if (node) titleRefs.current.set(event.id, node);
                    else titleRefs.current.delete(event.id);
                  }}
                  type="button"
                >
                  {event.title}
                </button>
                {eventPeriod(event)}
                <div
                  className="timeline-panel"
                  hidden={!isOpen}
                  id={panelId}
                  aria-labelledby={titleId}
                  ref={isOpen ? panelRef : undefined}
                  role="region"
                  style={panelStyle}
                >
                  <p>{event.detail}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
