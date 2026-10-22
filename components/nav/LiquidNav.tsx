"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { site } from "@/data/site";
import { buildNavPath } from "./buildNavPath";
import { BAR_HEIGHT_DESKTOP, BAR_HEIGHT_MOBILE, BEAD_PADDING_X, DOCK_AT, PILL_TOP, SPRING_BEAD, SPRING_DOCK, STRETCH, UNDOCK_AT } from "./nav-config";
import { navItems, type NavItemId } from "./nav-items";
import { createSpring, setSpringTarget, springSettled, stepSpring } from "./useSpring";

type ActiveId = NavItemId | null;

export function LiquidNav() {
  const pathname = usePathname();
  const routeProjects = pathname === "/projects" || pathname.startsWith("/projects/");
  const [active, setActive] = useState<ActiveId>(routeProjects ? "projects" : null);
  const activeRef = useRef<ActiveId>(routeProjects ? "projects" : null);
  const wrapperRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const beadRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef(new Map<NavItemId, HTMLSpanElement>());
  const initializedRef = useRef(false);
  const frameRef = useRef<((time: number, deltaTime: number) => void) | null>(null);
  const tickerRunningRef = useRef(false);
  const dockRef = useRef(createSpring(0, SPRING_DOCK));
  const xRef = useRef(createSpring(0, SPRING_BEAD));
  const widthRef = useRef(createSpring(0, SPRING_BEAD));
  const reducedMotionRef = useRef(false);
  const ignoreObserverUntilRef = useRef(0);
  const viewportRef = useRef({ width: 0, height: BAR_HEIGHT_DESKTOP });

  const setActiveId = useCallback((id: ActiveId) => {
    activeRef.current = id;
    setActive(id);
  }, []);

  const measureBead = useCallback((instant = false) => {
    const label = activeRef.current ? itemRefs.current.get(activeRef.current) : null;
    const content = contentRef.current;
    if (!label || !content) {
      setSpringTarget(widthRef.current, 0);
      if (instant) widthRef.current.value = 0;
      return;
    }
    const labelRect = label.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const targetWidth = labelRect.width + BEAD_PADDING_X * 2;
    const targetX = labelRect.left - contentRect.left + labelRect.width / 2;
    setSpringTarget(xRef.current, targetX);
    setSpringTarget(widthRef.current, targetWidth);
    if (instant) {
      xRef.current.value = targetX;
      xRef.current.velocity = 0;
      widthRef.current.value = targetWidth;
      widthRef.current.velocity = 0;
    }
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const bead = beadRef.current;
    if (!wrapper || !svg || !path || !bead) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;
    let mounted = true;
    const measureViewport = () => {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      viewportRef.current = { width: window.innerWidth, height: mobile ? BAR_HEIGHT_MOBILE : BAR_HEIGHT_DESKTOP };
      svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${viewportRef.current.height + PILL_TOP}`);
      svg.setAttribute("width", `${window.innerWidth}`);
      svg.setAttribute("height", `${viewportRef.current.height + PILL_TOP}`);
      measureBead(reducedMotionRef.current);
      renderPath();
      wake();
    };

    const renderPath = (velocity = 0) => {
      if (!pathRef.current) return;
      const { width, height } = viewportRef.current;
      pathRef.current.setAttribute("d", buildNavPath({ width, height, dockProgress: dockRef.current.value, notchX: 0, notchWidth: 0, velocity }));
    };
    const renderBead = (velocity = 0) => {
      if (!beadRef.current) return;
      const stretch = Math.min(0.35, Math.abs(velocity) * STRETCH);
      const scaleX = Math.min(1.35, 1 + stretch);
      const scaleY = Math.max(0.8, 1 - stretch * 0.6);
      beadRef.current.style.transform = `translate3d(${xRef.current.value - widthRef.current.value / 2}px, -50%, 0) scale(${Math.max(0, widthRef.current.value) * scaleX}, ${scaleY})`;
    };
    const renderContent = () => {
      if (contentRef.current) contentRef.current.style.transform = `translate3d(-50%, ${PILL_TOP * (1 - dockRef.current.value)}px, 0)`;
    };
    function wake() {
      if (reducedMotionRef.current || !frameRef.current || tickerRunningRef.current) return;
      gsap.ticker.add(frameRef.current);
      tickerRunningRef.current = true;
    }
    function stop() {
      if (!frameRef.current || !tickerRunningRef.current) return;
      gsap.ticker.remove(frameRef.current);
      tickerRunningRef.current = false;
    }
    const updateDockTarget = () => {
      const y = window.scrollY;
      const currentTarget = dockRef.current.target;
      if (y > DOCK_AT && currentTarget !== 1) setSpringTarget(dockRef.current, 1);
      else if (y < UNDOCK_AT && currentTarget !== 0) setSpringTarget(dockRef.current, 0);
      if (reducedMotionRef.current) {
        dockRef.current.value = dockRef.current.target;
        renderPath();
        renderContent();
      }
      wake();
    };
    const handleMotionPreference = () => {
      reducedMotionRef.current = motionQuery.matches;
      if (reducedMotionRef.current) {
        stop();
        dockRef.current.value = dockRef.current.target;
        dockRef.current.velocity = 0;
        xRef.current.value = xRef.current.target;
        xRef.current.velocity = 0;
        widthRef.current.value = widthRef.current.target;
        widthRef.current.velocity = 0;
        renderPath();
        renderContent();
        renderBead();
      } else wake();
    };
    const dockedInitially = window.scrollY > DOCK_AT;
    dockRef.current.value = dockedInitially ? 1 : 0;
    dockRef.current.target = dockRef.current.value;
    const drawInitial = () => {
      measureViewport();
      measureBead(true);
      renderPath();
      renderContent();
      renderBead();
      initializedRef.current = true;
      wrapper.setAttribute("data-ready", "true");
    };
    frameRef.current = (_time, deltaTime) => {
      const dt = Math.min(deltaTime / 1000, 0.12);
      const previousX = xRef.current.value;
      stepSpring(dockRef.current, dt);
      stepSpring(xRef.current, dt);
      stepSpring(widthRef.current, dt);
      const velocity = xRef.current.value - previousX;
      renderPath(velocity);
      renderContent();
      renderBead(velocity);
      if (springSettled(dockRef.current) && springSettled(xRef.current) && springSettled(widthRef.current)) stop();
    };
    // First draw is synchronous so the SVG replaces the fallback without a flash.
    drawInitial();

    const onScroll = () => updateDockTarget();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measureViewport);
    motionQuery.addEventListener("change", handleMotionPreference);
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => { measureBead(reducedMotionRef.current); wake(); });
      if (contentRef.current) resizeObserver.observe(contentRef.current);
      itemRefs.current.forEach((item) => resizeObserver?.observe(item));
    }
    document.fonts?.ready.then(() => {
      if (!mounted) return;
      measureBead(reducedMotionRef.current);
      wake();
    });

    let observer: IntersectionObserver | null = null;
    if (pathname === "/" && "IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        if (Date.now() < ignoreObserverUntilRef.current) return;
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible && navItems.some((item) => item.id === visible.target.id)) setActiveId(visible.target.id as NavItemId);
      }, { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.1, 0.25, 0.5, 1] });
      navItems.forEach(({ id }) => {
        const target = document.getElementById(id);
        if (target) observer?.observe(target);
      });
    }

    return () => {
      mounted = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureViewport);
      motionQuery.removeEventListener("change", handleMotionPreference);
      resizeObserver?.disconnect();
      observer?.disconnect();
      stop();
    };
  }, [measureBead, pathname, setActiveId]);

  useEffect(() => {
    if (!initializedRef.current) return;
    measureBead(reducedMotionRef.current);
    if (reducedMotionRef.current) {
      const path = pathRef.current;
      if (path) path.setAttribute("d", buildNavPath({ width: window.innerWidth, height: viewportRef.current.height, dockProgress: dockRef.current.target, notchX: 0, notchWidth: 0, velocity: 0 }));
      if (beadRef.current) beadRef.current.style.transform = `translate3d(${xRef.current.value - widthRef.current.value / 2}px, -50%, 0) scale(${Math.max(0, widthRef.current.value)}, 1)`;
    } else if (frameRef.current && !tickerRunningRef.current) {
      gsap.ticker.add(frameRef.current);
      tickerRunningRef.current = true;
    }
  }, [active, measureBead]);

  useEffect(() => {
    setActiveId(routeProjects ? "projects" : null);
  }, [pathname, routeProjects, setActiveId]);

  const onNavClick = (id: NavItemId, event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    ignoreObserverUntilRef.current = Date.now() + 800;
    setActiveId(id);
    history.pushState(null, "", `/#${id}`);
    target.scrollIntoView({ behavior: reducedMotionRef.current ? "instant" : "smooth", block: "start" });
  };

  const currentHref = (id: NavItemId) => pathname === "/" ? `#${id}` : id === "projects" ? "/projects" : `/#${id}`;

  return (
    <header ref={wrapperRef} className="liquid-nav" aria-label="Site navigation">
      <span className="nav-fallback-bg" aria-hidden="true" />
      <svg ref={svgRef} className="liquid-nav-shape" aria-hidden="true" focusable="false">
        <path ref={pathRef} fill="var(--deep)" stroke="var(--line)" strokeWidth="1" />
      </svg>
      <div ref={contentRef} className="liquid-nav-content">
        <span ref={beadRef} className={`nav-bead${active ? " is-visible" : ""}`} aria-hidden="true" />
        <Link href="/" className="nav-brand" aria-label={`${site.name}, home`}>{site.name}</Link>
        <nav aria-label="Main">
          <ul className="nav-list">
            {navItems.map(({ id, label, icon: Icon }) => {
              const selected = active === id;
              const currentPage = routeProjects && id === "projects";
              return (
                <li key={id}>
                  <Link
                    className={`nav-item${selected ? " is-active" : ""}`}
                    href={currentHref(id)}
                    aria-current={selected ? (currentPage ? "page" : "true") : undefined}
                    onClick={(event) => onNavClick(id, event)}
                  >
                    <Icon className="nav-icon" aria-hidden="true" />
                    <span className="nav-label" ref={(element) => { if (element) itemRefs.current.set(id, element); else itemRefs.current.delete(id); }}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link href={site.cvUrl} className="button button-primary button-small nav-cv">Download CV</Link>
      </div>
    </header>
  );
}
