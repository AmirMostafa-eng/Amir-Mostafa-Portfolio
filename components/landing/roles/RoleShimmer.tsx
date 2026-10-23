"use client";

import { useState } from "react";
import type { AnimationEvent } from "react";
import type { RoleList } from "@/components/landing/HeroRole";
import { useRolePlayback } from "./useRolePlayback";

type RoleShimmerProps = { roles: RoleList };

export function RoleShimmer({ roles }: RoleShimmerProps) {
  const { roleRef, canAnimate, reducedMotion } = useRolePlayback();
  const [roleIndex, setRoleIndex] = useState(0);

  const advanceRole = (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.animationName !== "role-shimmer" || !canAnimate || roles.length < 2) return;
    setRoleIndex((index) => (index + 1) % roles.length);
  };

  return (
    <>
      <span
        ref={roleRef}
        className="hero-role-visible role-shimmer"
        data-playing={canAnimate}
        aria-hidden="true"
        onAnimationIteration={advanceRole}
      >
        {roles[reducedMotion ? 0 : roleIndex]}
      </span>
      <span className="sr-only">{roles.join(", ")}</span>
    </>
  );
}
