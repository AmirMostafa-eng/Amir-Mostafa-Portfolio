"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AnimationEvent, CSSProperties } from "react";
import type { RoleList } from "@/components/landing/HeroRole";
import { useRolePlayback } from "./useRolePlayback";

type RoleRotateProps = { roles: RoleList };
type SlotStyle = CSSProperties & { "--role-from-width"?: string; "--role-to-width"?: string };

export function RoleRotate({ roles }: RoleRotateProps) {
  const { roleRef, canAnimate, reducedMotion } = useRolePlayback();
  const [roleIndex, setRoleIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [hasRotated, setHasRotated] = useState(false);
  const [widths, setWidths] = useState<number[]>([]);
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    const measure = () => {
      const nextWidths = measureRefs.current.map((element) => element?.getBoundingClientRect().width ?? 0);
      setWidths((current) => nextWidths.every((width, index) => Math.abs(width - (current[index] ?? -1)) < 0.5) ? current : nextWidths);
    };

    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      measureRefs.current.forEach((element) => element && observer.observe(element));
      return () => observer.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [roles]);

  useEffect(() => {
    if (!canAnimate || roles.length < 2 || nextIndex !== null) return;
    const timer = setTimeout(() => setNextIndex((roleIndex + 1) % roles.length), hasRotated ? 1750 : 2200);
    return () => clearTimeout(timer);
  }, [canAnimate, hasRotated, nextIndex, roleIndex, roles]);

  const finishRoll = (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.target !== event.currentTarget || event.animationName !== "role-slot-width" || nextIndex === null) return;
    setRoleIndex(nextIndex);
    setNextIndex(null);
    setHasRotated(true);
  };

  const style: SlotStyle = {};
  if (widths.length === roles.length) {
    style.width = `${widths[roleIndex]}px`;
    if (nextIndex !== null) {
      style["--role-from-width"] = `${widths[roleIndex]}px`;
      style["--role-to-width"] = `${widths[nextIndex]}px`;
    }
  }

  return (
    <>
      <span
        ref={roleRef}
        className="hero-role-visible role-rotate-slot"
        data-playing={canAnimate}
        data-changing={nextIndex !== null && !reducedMotion}
        data-measured={widths.length === roles.length}
        style={style}
        aria-hidden="true"
        onAnimationEnd={finishRoll}
      >
        <span className="role-rotate-current">{roles[roleIndex]}</span>
        {nextIndex !== null && !reducedMotion ? <span className="role-rotate-next">{roles[nextIndex]}</span> : null}
        <span className="role-width-measurements" aria-hidden="true">
          {roles.map((role, index) => <span key={`${index}-${role}`} ref={(node) => { measureRefs.current[index] = node; }}>{role}</span>)}
        </span>
      </span>
      <span className="sr-only">{roles.join(", ")}</span>
    </>
  );
}
