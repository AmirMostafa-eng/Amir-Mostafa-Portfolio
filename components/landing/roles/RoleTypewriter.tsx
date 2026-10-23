"use client";

import { useEffect, useState } from "react";
import type { RoleList } from "@/components/landing/HeroRole";
import { useRolePlayback } from "./useRolePlayback";

type RoleTypewriterProps = { roles: RoleList };
type Phase = "idle" | "typing" | "holding" | "deleting" | "pause";

export function RoleTypewriter({ roles }: RoleTypewriterProps) {
  const { roleRef, canAnimate, reducedMotion } = useRolePlayback();
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState(roles[0]);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (!canAnimate) return;
    if (phase === "idle") {
      setText("");
      setPhase("typing");
      return;
    }

    const role = roles[roleIndex];
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (phase === "typing") {
      if (text.length < role.length) {
        timer = setTimeout(() => setText(role.slice(0, text.length + 1)), 70);
      } else {
        setPhase("holding");
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("deleting"), 1800);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), 35);
      } else {
        setPhase("pause");
      }
    } else {
      timer = setTimeout(() => {
        setRoleIndex((index) => (index + 1) % roles.length);
        setPhase("typing");
      }, 300);
    }

    return () => { if (timer) clearTimeout(timer); };
  }, [canAnimate, phase, roleIndex, roles, text]);

  return (
    <>
      <span ref={roleRef} className="hero-role-visible role-typewriter" data-playing={canAnimate} data-phase={phase} aria-hidden="true">
        {reducedMotion ? roles[0] : text}
        {!reducedMotion ? <span className="role-caret" /> : null}
      </span>
      <span className="sr-only">{roles.join(", ")}</span>
    </>
  );
}
