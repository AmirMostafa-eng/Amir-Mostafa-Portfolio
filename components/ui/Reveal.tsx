"use client";

import { Children, cloneElement, isValidElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MutableRefObject, ReactElement, Ref } from "react";

export type RevealFrom = "left" | "right" | "up";
export type RevealTrigger = "mount" | "view";

type RevealProps = {
  from: RevealFrom;
  delay?: number;
  trigger?: RevealTrigger;
  children: ReactElement;
};

type RevealableProps = {
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLElement>;
  "data-reveal-from"?: RevealFrom;
  "data-revealed"?: "true" | "false";
  "data-reveal-instant"?: "true" | "false";
};

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function assignRef(ref: Ref<HTMLElement> | undefined, node: HTMLElement | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as MutableRefObject<HTMLElement | null>).current = node;
}

export function Reveal({ from, delay = 0, trigger = "mount", children }: RevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [instant, setInstant] = useState(false);
  const viewTargetRef = useRef<HTMLElement | null>(null);
  const child = Children.only(children);

  if (!isValidElement(child)) throw new Error("Reveal requires one element child.");
  const revealableChild = child as ReactElement<RevealableProps>;
  const originalRef = revealableChild.props.ref;
  const setViewTarget = useCallback((node: HTMLElement | null) => {
    viewTargetRef.current = node;
    assignRef(originalRef, node);
  }, [originalRef]);

  useBrowserLayoutEffect(() => {
    if (trigger !== "mount") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.scrollY > 100 || reduceMotion) {
      setInstant(true);
      setRevealed(true);
      return;
    }

    const frame = window.requestAnimationFrame(() => setRevealed(true));
    return () => window.cancelAnimationFrame(frame);
  }, [trigger]);

  useEffect(() => {
    if (trigger !== "view") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setInstant(true);
      setRevealed(true);
      return;
    }

    const target = viewTargetRef.current;
    if (!target) {
      setInstant(true);
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.15)) return;
      setRevealed(true);
      observer.disconnect();
    }, { threshold: 0.15 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [trigger]);

  const childProps = revealableChild.props;
  const mergedStyle = {
    ...childProps.style,
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;
  const revealProps: RevealableProps = {
    className: [childProps.className, "reveal"].filter(Boolean).join(" "),
    style: mergedStyle,
    "data-reveal-from": from,
    "data-revealed": revealed ? "true" : "false",
    "data-reveal-instant": instant ? "true" : "false",
  };

  if (trigger === "view") revealProps.ref = setViewTarget;
  return cloneElement(revealableChild, revealProps);
}
