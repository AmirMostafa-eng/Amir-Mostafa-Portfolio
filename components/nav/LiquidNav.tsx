"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { site } from "@/data/site";
import { CONTAINER_PADDING_X, CONTAINER_PADDING_X_MOBILE } from "@/lib/layout";
import { buildNavPath, getShapeBox } from "./buildNavPath";
import { BAR_HEIGHT_DESKTOP, DOCK_AT, PILL_TOP, SPRING_BEAD, SPRING_DOCK, STRETCH, UNDOCK_AT } from "./nav-config";
import { navItems, type NavItemId } from "./nav-items";
import { createSpring, setSpringTarget, springSettled, stepSpring } from "./useSpring";

type ActiveId = NavItemId | null;
type Viewport = { width: number; height: number; svgHeight: number; containerPadding: number };

export function LiquidNav() {
  const pathname = usePathname();
  const routeProjects = pathname === "/projects" || pathname.startsWith("/projects/");
  const [active, setActive] = useState<ActiveId>(routeProjects ? "projects" : null);
  const activeRef = useRef<ActiveId>(routeProjects ? "projects" : null);
  const wrapperRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef(new Map<NavItemId, HTMLAnchorElement>());
  const initializedRef = useRef(false);
  const frameRef = useRef<((time: number, deltaTime: number) => void) | null>(null);
  const tickerRunningRef = useRef(false);
  const dockRef = useRef(createSpring(0, SPRING_DOCK));
  const xRef = useRef(createSpring(0, SPRING_BEAD));
  const widthRef = useRef(createSpring(0, SPRING_BEAD));
  const reducedMotionRef = useRef(false);
  const ignoreObserverUntilRef = useRef(0);
  const viewportRef = useRef<Viewport>({ width: 0, height: BAR_HEIGHT_DESKTOP, svgHeight: BAR_HEIGHT_DESKTOP + PILL_TOP, containerPadding: CONTAINER_PADDING_X });
  const lastBoxProgressRef = useRef<number | null>(null);

  const setActiveId = useCallback((id: ActiveId) => {
    activeRef.current = id;
    setActive(id);
  }, []);

  const measureBead = useCallback((instant = false) => {
    const link = activeRef.current ? itemRefs.current.get(activeRef.current) : null;
    if (!link) {
      setSpringTarget(widthRef.current, 0);
      if (instant) widthRef.current.value = 0;
      return;
    }
    const targetX = link.offsetLeft;
    const targetWidth = link.offsetWidth;
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
    if (!wrapper || !svg || !path) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;
    let mounted = true;
    const writeBox = (force = false) => {
      const { width, height } = viewportRef.current;
      const progress = dockRef.current.value;
      if (!force && lastBoxProgressRef.current === progress) return;
      const box = getShapeBox({ width, height, dockProgress: progress, containerPadding: viewportRef.current.containerPadding });
      wrapper.style.setProperty("--nav-left", `${box.left}px`);
      wrapper.style.setProperty("--nav-top", `${box.top}px`);
      wrapper.style.setProperty("--nav-width", `${box.width}px`);
      lastBoxProgressRef.current = progress;
    };
    const renderPath = (forceBox = false) => {
      const { width, height } = viewportRef.current;
      writeBox(forceBox);
      path.setAttribute("d", buildNavPath({ width, height, dockProgress: dockRef.current.value, containerPadding: viewportRef.current.containerPadding }));
    };
    const renderBead = (velocity = 0) => {
      if (!beadRef.current) return;
      const stretch = Math.min(0.35, Math.abs(velocity) * STRETCH);
      const scaleX = Math.min(1.35, 1 + stretch);
      const scaleY = Math.max(0.8, 1 - stretch * 0.6);
      beadRef.current.style.width = `${Math.max(0, widthRef.current.value)}px`;
      beadRef.current.style.transform = `translate3d(${xRef.current.value}px, 0, 0) scale(${scaleX}, ${scaleY})`;
    };
    const measureViewport = () => {
      const width = wrapper.clientWidth;
      const svgHeight = wrapper.clientHeight;
      const height = Math.max(0, svgHeight - PILL_TOP);
      const containerPadding = window.matchMedia("(max-width: 640px)").matches ? CONTAINER_PADDING_X_MOBILE : CONTAINER_PADDING_X;
      viewportRef.current = { width, height, svgHeight, containerPadding };
      svg.setAttribute("viewBox", `0 0 ${width} ${svgHeight}`);
      svg.setAttribute("width", `${width}`);
      svg.setAttribute("height", `${svgHeight}`);
      svg.setAttribute("preserveAspectRatio", "none");
      renderPath(true);
      measureBead(reducedMotionRef.current);
      renderBead();
      wake();
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
        dockRef.current.velocity = 0;
        renderPath(true);
        measureBead(true);
        renderBead();
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
        renderPath(true);
        renderBead();
      } else wake();
    };
    const dockedInitially = window.scrollY > DOCK_AT;
    dockRef.current.value = dockedInitially ? 1 : 0;
    dockRef.current.target = dockRef.current.value;
    const drawInitial = () => {
      measureViewport();
      measureBead(true);
      renderPath(true);
      renderBead();
      initializedRef.current = true;
      wrapper.setAttribute("data-ready", "true");
    };

    frameRef.current = (_time, deltaTime) => {
      const wasDockMoving = !springSettled(dockRef.current);
      const dt = Math.min(deltaTime / 1000, 0.12);
      const previousX = xRef.current.value;
      stepSpring(dockRef.current, dt);
      stepSpring(xRef.current, dt);
      stepSpring(widthRef.current, dt);
      const velocity = xRef.current.value - previousX;
      const dockNowSettled = springSettled(dockRef.current);
      if (wasDockMoving && dockNowSettled) {
        dockRef.current.value = dockRef.current.target;
        dockRef.current.velocity = 0;
        renderPath(true);
        measureBead(false);
      } else renderPath();
      renderBead(velocity);
      if (dockNowSettled && springSettled(xRef.current) && springSettled(widthRef.current)) {
        xRef.current.value = xRef.current.target;
        xRef.current.velocity = 0;
        widthRef.current.value = widthRef.current.target;
        widthRef.current.velocity = 0;
        renderBead();
        stop();
      }
    };
    drawInitial();

    const onScroll = () => updateDockTarget();
    const onResize = () => measureViewport();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    motionQuery.addEventListener("change", handleMotionPreference);
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(wrapper);
    }
    document.fonts?.ready.then(() => {
      if (!mounted) return;
      measureBead(reducedMotionRef.current);
      if (reducedMotionRef.current) renderBead();
      else wake();
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
      window.removeEventListener("resize", onResize);
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
      const { width, height } = viewportRef.current;
      pathRef.current?.setAttribute("d", buildNavPath({ width, height, dockProgress: dockRef.current.target, containerPadding: viewportRef.current.containerPadding }));
      if (beadRef.current) {
        beadRef.current.style.width = `${Math.max(0, widthRef.current.value)}px`;
        beadRef.current.style.transform = `translate3d(${xRef.current.value}px, 0, 0) scale(1, 1)`;
      }
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
      <div className="liquid-nav-content">
        <Link href="/" className="nav-brand" aria-label={`${site.name}, home`}>{site.name}</Link>
        <nav aria-label="Main">
          <ul className="nav-list">
            <li className="nav-bead-item" aria-hidden="true"><span ref={beadRef} className={`nav-bead${active ? " is-visible" : ""}`} /></li>
            {navItems.map(({ id, label, icon: Icon }) => {
              const selected = active === id;
              const currentPage = routeProjects && id === "projects";
              return (
                <li key={id}>
                  <Link
                    ref={(element) => { if (element) itemRefs.current.set(id, element); else itemRefs.current.delete(id); }}
                    className={`nav-item${selected ? " is-active" : ""}`}
                    href={currentHref(id)}
                    aria-current={selected ? (currentPage ? "page" : "true") : undefined}
                    onClick={(event) => onNavClick(id, event)}
                  >
                    <Icon className="nav-icon" aria-hidden="true" />
                    <span className="nav-label">{label}</span>
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
