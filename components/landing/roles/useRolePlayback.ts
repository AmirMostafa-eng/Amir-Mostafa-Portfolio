"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useRolePlayback() {
  const roleRef = useRef<HTMLSpanElement>(null);
  const [entranceDone, setEntranceDone] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useBrowserLayoutEffect(() => {
    const role = roleRef.current;
    if (!role) return;

    const hero = role.closest<HTMLElement>("#hero");
    const revealTargets = hero ? Array.from(hero.querySelectorAll<HTMLElement>(".reveal")) : [];
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let revealObserver: MutationObserver | undefined;
    let heroObserver: IntersectionObserver | undefined;
    const finishedReveals = new Set<HTMLElement>();

    const updateMotion = () => {
      const reduce = motionQuery.matches;
      setReducedMotion(reduce);
      if (reduce) setEntranceDone(true);
    };
    const updateTab = () => setTabVisible(document.visibilityState !== "hidden");
    const updateReveal = () => {
      if (revealTargets.length === 0) {
        setEntranceDone(true);
        return;
      }
      const allFinished = revealTargets.every((target) =>
        target.dataset.revealed === "true" &&
        (target.dataset.revealInstant === "true" || finishedReveals.has(target)),
      );
      if (allFinished) setEntranceDone(true);
    };
    const onRevealTransitionEnd = (event: TransitionEvent) => {
      if (!(event.target instanceof HTMLElement) || event.propertyName !== "transform" || !revealTargets.includes(event.target)) return;
      finishedReveals.add(event.target);
      updateReveal();
    };

    updateMotion();
    updateTab();
    motionQuery.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateTab);

    if (revealTargets.length > 0 && hero) {
      hero.addEventListener("transitionend", onRevealTransitionEnd);
      revealObserver = new MutationObserver(updateReveal);
      revealObserver.observe(hero, { attributes: true, subtree: true, attributeFilter: ["data-revealed", "data-reveal-instant"] });
      updateReveal();
    } else {
      setEntranceDone(true);
    }

    if (!hero) {
      setHeroVisible(true);
    } else if (!("IntersectionObserver" in window)) {
      setHeroVisible(true);
    } else {
      const rect = hero.getBoundingClientRect();
      setHeroVisible(rect.bottom > 0 && rect.top < window.innerHeight);
      heroObserver = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0 });
      heroObserver.observe(hero);
    }

    return () => {
      motionQuery.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateTab);
      hero?.removeEventListener("transitionend", onRevealTransitionEnd);
      revealObserver?.disconnect();
      heroObserver?.disconnect();
    };
  }, []);

  return {
    roleRef,
    reducedMotion,
    canAnimate: entranceDone && heroVisible && tabVisible && !reducedMotion,
  };
}
