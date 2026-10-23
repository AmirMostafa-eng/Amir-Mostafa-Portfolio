export function scrollToTarget(target: Element | null, block: ScrollLogicalPosition = "start") {
  if (!target || typeof window === "undefined") return;

  const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
  target.scrollIntoView({ behavior, block });
}
