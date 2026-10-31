"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { FiDownload } from "react-icons/fi";
import { site } from "@/data/site";
import { CONTAINER_PADDING_X, CONTAINER_PADDING_X_MOBILE } from "@/lib/layout";
import { scrollToTarget } from "@/lib/scroll";
import { buildNavPath, getShapeBox } from "./buildNavPath";
import { BAR_HEIGHT_DESKTOP, DOCK_AT, NAV_COMPACT_QUERY, PILL_MAX_WIDTH_COMPACT, PILL_TOP, SPRING_BEAD, SPRING_DOCK, STRETCH, UNDOCK_AT } from "./nav-config";
import { navItems, type NavItemId } from "./nav-items";
import { createSpring, setSpringTarget, springSettled, stepSpring } from "./useSpring";
import Image from "next/image";

type ActiveId = NavItemId | null;
type Viewport = { width: number; height: number; svgHeight: number; containerPadding: number };
const MENU_ID = "compact-nav-menu";

function applyNavShape(path: SVGPathElement | null, glass: HTMLDivElement | null, d: string) {
  path?.setAttribute("d", d);
  if (!glass) return;
  const clipPath = `path("${d}")`;
  glass.style.setProperty("clip-path", clipPath);
  glass.style.setProperty("-webkit-clip-path", clipPath);
}

export function LiquidNav() {
  const pathname = usePathname();
  const [active, setActive] = useState<ActiveId>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;
  const hasActiveLink = pathname === "/" && active !== null;
  const activeRef = useRef<ActiveId>(null);
  const entranceRef = useRef<HTMLDivElement>(null);
  const entranceTweenRef = useRef<gsap.core.Tween | null>(null);
  const wrapperRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const beadRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef(new Map<NavItemId, HTMLAnchorElement>());
  const initializedRef = useRef(false);
  const frameRef = useRef<((time: number, deltaTime: number) => void) | null>(null);
  const tickerRunningRef = useRef(false);
  const dockRef = useRef(createSpring(0, SPRING_DOCK));
  const xRef = useRef(createSpring(0, SPRING_BEAD));
  const widthRef = useRef(createSpring(0, SPRING_BEAD));
  const reducedMotionRef = useRef(false);
  const compactRef = useRef(false);
  const menuOpenedScrollYRef = useRef(0);
  const menuOpenedDockedRef = useRef(false);
  const ignoreObserverUntilRef = useRef(0);
  const viewportRef = useRef<Viewport>({ width: 0, height: BAR_HEIGHT_DESKTOP, svgHeight: BAR_HEIGHT_DESKTOP + PILL_TOP, containerPadding: CONTAINER_PADDING_X });
  const lastBoxProgressRef = useRef<number | null>(null);

  const setActiveId = useCallback((id: ActiveId) => {
    if (activeRef.current === id) return;

    const wasActive = activeRef.current !== null;
    const willBeActive = id !== null;

    if (!compactRef.current && !wasActive && willBeActive) {
      const link = itemRefs.current.get(id);
      if (link) {
        xRef.current.value = link.offsetLeft;
        xRef.current.target = link.offsetLeft;
        xRef.current.velocity = 0;
        widthRef.current.value = link.offsetWidth;
        widthRef.current.target = link.offsetWidth;
        widthRef.current.velocity = 0;
        if (beadRef.current) {
          beadRef.current.style.width = `${link.offsetWidth}px`;
          beadRef.current.style.transform = `translate3d(${link.offsetLeft}px, 0, 0) scale(1, 1)`;
        }
      }
    } else if (!compactRef.current && wasActive && !willBeActive) {
      xRef.current.target = xRef.current.value;
      xRef.current.velocity = 0;
      widthRef.current.target = widthRef.current.value;
      widthRef.current.velocity = 0;
    }

    activeRef.current = id;
    setActive(id);
  }, []);

  const measureBead = useCallback((instant = false) => {
    if (compactRef.current) return;
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
    const glass = glassRef.current;
    if (!wrapper || !svg || !path || !glass) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactQuery = window.matchMedia(NAV_COMPACT_QUERY);
    compactRef.current = compactQuery.matches;
    reducedMotionRef.current = motionQuery.matches;
    let mounted = true;
    const writeBox = (force = false) => {
      const { width, height } = viewportRef.current;
      const progress = dockRef.current.value;
      if (!force && lastBoxProgressRef.current === progress) return;
      const box = getShapeBox({
        width,
        height,
        dockProgress: progress,
        containerPadding: viewportRef.current.containerPadding,
        pillMaxWidth: compactRef.current ? PILL_MAX_WIDTH_COMPACT : undefined,
      });
      const menuWidth = Math.min(box.width, PILL_MAX_WIDTH_COMPACT);
      const menuLeft = box.left + (box.width - menuWidth) / 2;
      wrapper.style.setProperty("--nav-left", `${box.left}px`);
      wrapper.style.setProperty("--nav-top", `${box.top}px`);
      wrapper.style.setProperty("--nav-width", `${box.width}px`);
      wrapper.style.setProperty("--nav-menu-top", `${box.top + box.height + 8}px`);
      wrapper.style.setProperty("--nav-menu-left", `${menuLeft}px`);
      wrapper.style.setProperty("--nav-menu-width", `${menuWidth}px`);
      lastBoxProgressRef.current = progress;
    };
    const renderPath = (forceBox = false) => {
      const { width, height } = viewportRef.current;
      writeBox(forceBox);
      const d = buildNavPath({
        width,
        height,
        dockProgress: dockRef.current.value,
        containerPadding: viewportRef.current.containerPadding,
        pillMaxWidth: compactRef.current ? PILL_MAX_WIDTH_COMPACT : undefined,
      });
      applyNavShape(path, glass, d);
    };
    const renderBead = (velocity = 0) => {
      if (compactRef.current || !beadRef.current) return;
      const stretch = Math.min(0.35, Math.abs(velocity) * STRETCH);
      const scaleX = Math.min(1.35, 1 + stretch);
      const scaleY = Math.max(0.8, 1 - stretch * 0.6);
      beadRef.current.style.width = `${Math.max(0, widthRef.current.value)}px`;
      beadRef.current.style.transform = `translate3d(${xRef.current.value}px, 0, 0) scale(${scaleX}, ${scaleY})`;
    };
    const updateActiveSection = () => {
      if (pathname !== "/" || Date.now() < ignoreObserverUntilRef.current) return;

      // Match the center of the observer's existing 45%-50% activation band.
      const activationY = window.innerHeight * 0.475;
      let currentId = "hero";
      let currentTop = Number.NEGATIVE_INFINITY;
      ["hero", ...navItems.map(({ id }) => id)].forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        const top = section.getBoundingClientRect().top;
        if (top <= activationY && top > currentTop) {
          currentId = id;
          currentTop = top;
        }
      });

      setActiveId(currentId === "hero" ? null : currentId as NavItemId);
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
      if (!compactRef.current) {
        measureBead(reducedMotionRef.current);
        renderBead();
      }
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
        entranceTweenRef.current?.kill();
        entranceTweenRef.current = null;
        if (entranceRef.current) {
          entranceRef.current.dataset.entered = "true";
          entranceRef.current.style.removeProperty("will-change");
          gsap.set(entranceRef.current, { clearProps: "transform" });
        }
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
      const compact = compactRef.current;
      const wasDockMoving = !springSettled(dockRef.current);
      const dt = Math.min(deltaTime / 1000, 0.12);
      stepSpring(dockRef.current, dt);
      let velocity = 0;
      if (!compact) {
        const previousX = xRef.current.value;
        stepSpring(xRef.current, dt);
        stepSpring(widthRef.current, dt);
        velocity = xRef.current.value - previousX;
      }
      const dockNowSettled = springSettled(dockRef.current);
      if (wasDockMoving && dockNowSettled) {
        dockRef.current.value = dockRef.current.target;
        dockRef.current.velocity = 0;
        renderPath(true);
        if (!compact) measureBead(false);
      } else if (wasDockMoving) renderPath();
      if (!compact) renderBead(velocity);
      if (dockNowSettled && (compact || (springSettled(xRef.current) && springSettled(widthRef.current)))) {
        if (!compact) {
          xRef.current.value = xRef.current.target;
          xRef.current.velocity = 0;
          widthRef.current.value = widthRef.current.target;
          widthRef.current.velocity = 0;
          renderBead();
        }
        stop();
      }
    };
    drawInitial();

    const onScroll = () => {
      if (
        menuOpenRef.current &&
        (Math.abs(window.scrollY - menuOpenedScrollYRef.current) > 24 ||
          (window.scrollY > DOCK_AT) !== menuOpenedDockedRef.current)
      ) {
        setMenuOpen(false);
      }
      updateDockTarget();
      updateActiveSection();
    };
    const onResize = () => {
      compactRef.current = compactQuery.matches;
      measureViewport();
      updateActiveSection();
    };
    const onCompactChange = () => {
      compactRef.current = compactQuery.matches;
      if (!compactRef.current) setMenuOpen(false);
      measureViewport();
      if (compactRef.current && springSettled(dockRef.current)) stop();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    compactQuery.addEventListener("change", onCompactChange);
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
      observer = new IntersectionObserver(() => updateActiveSection(), { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      const hero = document.getElementById("hero");
      if (hero) observer.observe(hero);
      navItems.forEach(({ id }) => {
        const target = document.getElementById(id);
        if (target) observer?.observe(target);
      });
      updateActiveSection();
    }

    return () => {
      mounted = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      compactQuery.removeEventListener("change", onCompactChange);
      motionQuery.removeEventListener("change", handleMotionPreference);
      resizeObserver?.disconnect();
      observer?.disconnect();
      stop();
    };
  }, [measureBead, pathname, setActiveId]);

  useEffect(() => {
    const entrance = entranceRef.current;
    if (!entrance) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      entrance.dataset.entered = "true";
      return;
    }

    const styles = window.getComputedStyle(entrance);
    const duration = Number.parseFloat(styles.getPropertyValue("--nav-entrance-duration")) / 1000;
    const ease = styles.getPropertyValue("--nav-entrance-ease").trim();
    entranceTweenRef.current = gsap.fromTo(
      entrance,
      { y: -window.innerHeight },
      {
        y: 0,
        duration,
        ease,
        onStart: () => { entrance.style.willChange = "transform"; },
        onComplete: () => {
          entrance.dataset.entered = "true";
          entrance.style.removeProperty("will-change");
          gsap.set(entrance, { clearProps: "transform" });
          entranceTweenRef.current = null;
        },
      },
    );

    return () => {
      entranceTweenRef.current?.kill();
      entranceTweenRef.current = null;
      entrance.style.removeProperty("will-change");
    };
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (!active) return;
    if (compactRef.current) return;
    measureBead(reducedMotionRef.current);
    if (reducedMotionRef.current) {
      const { width, height } = viewportRef.current;
      const d = buildNavPath({ width, height, dockProgress: dockRef.current.target, containerPadding: viewportRef.current.containerPadding });
      applyNavShape(pathRef.current, glassRef.current, d);
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
    setActiveId(null);
    setMenuOpen(false);
  }, [pathname, setActiveId]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !menuButtonRef.current?.contains(target) &&
        !menuPanelRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const onNavClick = (id: NavItemId, event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    ignoreObserverUntilRef.current = Date.now() + 800;
    setActiveId(id);
    history.pushState(null, "", `/#${id}`);
    scrollToTarget(target);
  };

  const onLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    if (
      pathname !== "/" || event.button !== 0 || event.metaKey || event.ctrlKey ||
      event.shiftKey || event.altKey
    ) return;

    const hero = document.getElementById("hero");
    if (!hero) return;

    event.preventDefault();
    ignoreObserverUntilRef.current = 0;
    scrollToTarget(hero);
  };

  const currentHref = (id: NavItemId) => pathname === "/" ? `#${id}` : id === "projects" ? "/projects" : `/#${id}`;
  const onMenuLinkKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key !== " ") return;
    event.preventDefault();
    event.currentTarget.click();
  };
  const toggleMenu = () => {
    if (!window.matchMedia(NAV_COMPACT_QUERY).matches) return;
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    menuOpenedScrollYRef.current = window.scrollY;
    menuOpenedDockedRef.current = window.scrollY > DOCK_AT;
    setMenuOpen(true);
  };

  return (
    <div ref={entranceRef} className="nav-entrance" data-entered="false">
      <header
        ref={wrapperRef}
        className="liquid-nav"
        aria-label="Site navigation"
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (!(next instanceof Node) || !event.currentTarget.contains(next)) setMenuOpen(false);
        }}
      >
      <span className="nav-fallback-bg" aria-hidden="true" />
      <div ref={glassRef} className="nav-glass" aria-hidden="true" />
      <svg ref={svgRef} className="liquid-nav-shape" aria-hidden="true" focusable="false">
        <path ref={pathRef} fill="none" stroke="var(--nav-stroke)" strokeWidth="1" />
      </svg>
      <div className="liquid-nav-content">
        <Link href="/" className="nav-brand" aria-label={`${site.name}, home`} onClick={onLogoClick}>
          <Image src="/1793400310 (1).png" alt="Profile picture" width={40} height={40} className="nav-logo" />
          <span className="nav-name">{site.name}</span>
        </Link>
        <nav aria-label="Main">
          <ul className="nav-list">
            <li className="nav-bead-item" aria-hidden="true"><span ref={beadRef} className={`nav-bead${hasActiveLink ? " is-visible" : ""}`} /></li>
            {navItems.map(({ id, label }) => {
              const selected = pathname === "/" && active === id;
              return (
                <li key={id}>
                  <Link
                    ref={(element) => { if (element) itemRefs.current.set(id, element); else itemRefs.current.delete(id); }}
                    className={`nav-item${selected ? " is-active" : ""}`}
                    href={currentHref(id)}
                    aria-current={selected ? "true" : undefined}
                    onClick={(event) => onNavClick(id, event)}
                  >
                    <span className="nav-label">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link href={site.cvUrl} className="button button-primary button-small nav-cv">Download CV</Link>
        <button
          ref={menuButtonRef}
          type="button"
          className="nav-menu-button"
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={toggleMenu}
        >
          <span className="nav-menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
      <nav
        ref={menuPanelRef}
        id={MENU_ID}
        className="nav-menu-panel"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        data-open={menuOpen}
      >
        <ul className="nav-menu-list">
          {navItems.map(({ id, label }) => {
            const selected = pathname === "/" && active === id;
            return (
              <li key={id}>
                <Link
                  className={`nav-menu-link${selected ? " is-active" : ""}`}
                  href={currentHref(id)}
                  aria-current={selected ? "true" : undefined}
                  onKeyDown={onMenuLinkKeyDown}
                  onClick={(event) => {
                    setMenuOpen(false);
                    onNavClick(id, event);
                  }}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="nav-menu-divider" />
        <Link href={site.cvUrl} className="nav-menu-cv" download onKeyDown={onMenuLinkKeyDown}>
          <FiDownload aria-hidden="true" />
          <span>Download CV</span>
        </Link>
      </nav>
      </header>
    </div>
  );
}
