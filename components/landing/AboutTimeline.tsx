"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent as ReactFocusEvent, PointerEvent as ReactPointerEvent } from "react";
import { timeline, type TimelineEvent } from "@/data/timeline";
import { buildRoadPath } from "@/lib/buildTimelineRoad";
import { ROW_HEIGHT, ZIGZAG_MIN_WIDTH } from "@/lib/timelineLayout";

type Road = { width: number; height: number; path: string; clip: string };

// How far the road continues past the last dot's center, in px. The dot's outer
// ring is ~15px, so 20 leaves a short open tail ~5px past the dot. Raise it for
// a longer tail.
const ROAD_TAIL_LENGTH = 20;
type OpenPanel = { id: string; source: "hover" | "focus" | "click" };
type PanelPosition = { id: string; left: number; top: number };

const visibleEvents = timeline.filter((event) => event.show);
const compactLayoutStyles = `
@container about-timeline (max-width: ${ZIGZAG_MIN_WIDTH - 1}px) {
  .about-timeline .timeline-event { height: auto; min-height: var(--timeline-row-height); padding-left: 56px; --timeline-x: 28px; }
  .about-timeline .timeline-event--right { --timeline-x: 28px; }
  .about-timeline .timeline-label,
  .about-timeline .timeline-event--left .timeline-label,
  .about-timeline .timeline-event--right .timeline-label {
    position: relative; top: auto; right: auto; left: auto; width: auto; min-height: var(--timeline-row-height); box-sizing: border-box;
    display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
    padding: 8px 0; transform: none; text-align: left;
  }
  .about-timeline .timeline-title { justify-content: flex-start; text-align: left; }
  .about-timeline .timeline-panel { position: relative; width: 100%; max-width: 100%; max-height: none; margin-top: .75rem; }
}`;

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
      <span aria-hidden="true"> &rarr; </span>
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
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const bedPathRef = useRef<SVGPathElement>(null);
  const midPathRef = useRef<SVGPathElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pointerActivationRef = useRef(false);
  const titleRefs = useRef(new Map<string, HTMLButtonElement>());
  const [openPanel, setOpenPanel] = useState<OpenPanel | null>(null);
  const openId = openPanel?.id ?? null;
  const [road, setRoad] = useState<Road>({ width: 0, height: 0, path: "", clip: "" });
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);

  const measureRoad = useCallback(() => {
    const root = rootRef.current;
    const list = listRef.current;
    const svg = svgRef.current;
    const pathElement = pathRef.current;
    if (!root || !list || !svg || !pathElement) return;

    svg.style.visibility = "hidden";
    const rootRect = root.getBoundingClientRect();
    const measuredPoints = Array.from(list.querySelectorAll<HTMLElement>(".timeline-dot")).map((dot) => {
      const rect = dot.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - rootRect.left,
        y: rect.top + rect.height / 2 - rootRect.top,
      };
    });
    const isCompact = root.clientWidth < ZIGZAG_MIN_WIDTH;
    const points = isCompact && measuredPoints.length > 0
      ? measuredPoints.map((point) => ({ ...point, x: measuredPoints[0].x }))
      : measuredPoints;
    const basePath = buildRoadPath(points, root.clientWidth, ROW_HEIGHT);
    let path = basePath;
    let clip = "";
    if (points.length > 0) {
      pathElement.setAttribute("d", basePath);
      const totalLength = pathElement.getTotalLength();
      const tip = pathElement.getPointAtLength(totalLength);
      const beforeTip = pathElement.getPointAtLength(Math.max(0, totalLength - 6));
      const tangentLength = Math.hypot(tip.x - beforeTip.x, tip.y - beforeTip.y) || 1;
      const tx = (tip.x - beforeTip.x) / tangentLength;
      const ty = (tip.y - beforeTip.y) / tangentLength;
      // Open tail: keep the road running straight past the last dot, then cut it
      // flat and perpendicular to the road so the border and surface end together.
      const tailEndX = tip.x + tx * ROAD_TAIL_LENGTH;
      const tailEndY = tip.y + ty * ROAD_TAIL_LENGTH;
      path = `${basePath} L ${tailEndX.toFixed(2)} ${tailEndY.toFixed(2)}`;
      const nx = -ty;
      const ny = tx;
      clip = [
        `M ${(tailEndX - nx * 1200).toFixed(2)} ${(tailEndY - ny * 1200).toFixed(2)}`,
        `L ${(tailEndX + nx * 1200).toFixed(2)} ${(tailEndY + ny * 1200).toFixed(2)}`,
        `L ${(tailEndX + nx * 1200 - tx * 3000).toFixed(2)} ${(tailEndY + ny * 1200 - ty * 3000).toFixed(2)}`,
        `L ${(tailEndX - nx * 1200 - tx * 3000).toFixed(2)} ${(tailEndY - ny * 1200 - ty * 3000).toFixed(2)}`,
        "Z",
      ].join(" ");
    }
    const next = {
      width: root.clientWidth,
      height: root.clientHeight,
      path,
      clip,
    };

    svg.setAttribute("viewBox", `0 0 ${next.width || 1} ${next.height || 1}`);
    pathElement.setAttribute("d", next.path);
    bedPathRef.current?.setAttribute("d", next.path);
    midPathRef.current?.setAttribute("d", next.path);
    root.dataset.roadReady = "true";
    root.dataset.layout = isCompact ? "compact" : "zigzag";
    svg.style.visibility = "visible";
    setRoad((current) =>
      current.width === next.width && current.height === next.height && current.path === next.path && current.clip === next.clip ? current : next,
    );
  }, []);

  const positionPanel = useCallback(() => {
    const root = rootRef.current;
    if (!openId || !root || root.clientWidth < ZIGZAG_MIN_WIDTH) {
      setPanelPosition(null);
      return;
    }

    const title = titleRefs.current.get(openId);
    const panel = panelRef.current;
    if (!root || !title || !panel || panel.hidden) return;

    const rootRect = root.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const label = title.parentElement;
    if (!label) return;
    const labelRect = label.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const rootOffsetX = labelRect.left - rootRect.left;
    const gap = 12;
    const isLeftEvent = title.closest(".timeline-event--left") !== null;
    const desiredLeft = isLeftEvent
      ? titleRect.right - labelRect.left + gap
      : titleRect.left - labelRect.left - panelRect.width - gap;
    const minLocalLeft = 12 - rootOffsetX;
    const maxLocalLeft = root.clientWidth - panelRect.width - 12 - rootOffsetX;
    const left = Math.max(minLocalLeft, Math.min(desiredLeft, maxLocalLeft));

    const rootOffsetY = labelRect.top - rootRect.top;
    const roomBelowTitle = rootRect.bottom - titleRect.bottom;
    const shouldOpenUp = panelRect.height + gap > roomBelowTitle;
    const desiredTop = shouldOpenUp
      ? titleRect.top - labelRect.top - panelRect.height - gap
      : titleRect.bottom - labelRect.top + gap;
    const minLocalTop = 12 - rootOffsetY;
    const maxLocalTop = root.clientHeight - panelRect.height - 12 - rootOffsetY;
    const top = Math.max(minLocalTop, Math.min(desiredTop, maxLocalTop));

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
    <div className="about-timeline" ref={rootRef} style={{ "--timeline-row-height": `${ROW_HEIGHT}px` } as React.CSSProperties}>
      <style>{compactLayoutStyles}</style>
      <svg
        className="timeline-road"
        aria-hidden="true"
        focusable="false"
        ref={svgRef}
        viewBox={`0 0 ${road.width || 1} ${road.height || 1}`}
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id="timeline-road-end-clip" clipPathUnits="userSpaceOnUse">
            <path d={road.clip || "M 0 0"} />
          </clipPath>
        </defs>
        <path className="timeline-road-bed" d={road.path} ref={bedPathRef} clipPath="url(#timeline-road-end-clip)" />
        <path className="timeline-road-mid" d={road.path} ref={midPathRef} clipPath="url(#timeline-road-end-clip)" />
        <path d={road.path} ref={pathRef} />
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
                {eventPeriod(event)}
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
