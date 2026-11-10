"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import { BadgeFaces } from "./BadgeFaces";
import { integrate, solve, spinStep, swingAngle } from "./physics";
import type { Link, Pt, Spin } from "./physics";

const MATERIALS = {
  silverLight: "#f4efe4",
  silverMid: "#a8a090",
  silverDark: "#8f8778",
  silverEdge: "#ece6da",
};
const STRAP_SCRIPT_FONT = '"Segoe Script", "Brush Script MT", "Snell Roundhand", cursive';
const STRAP_WIDTH_RATIO = 0.08;

const strapWidthFor = (cw: number) => Math.max(14, Math.round(cw * STRAP_WIDTH_RATIO));

type BadgeData = {
  name: string;
  role: string;
  summary: string;
  fields: readonly { label: string; value: string }[];
  stack: readonly string[];
  strapText: string;
  strapLabel: string;
};

type LanyardBadgeProps = {
  data: BadgeData;
  photo: string | null;
  cardWidth?: number;
  height?: string;
  className?: string;
  flipButton?: boolean;
  style?: CSSProperties;
  "data-reveal-from"?: "left" | "right" | "up";
  "data-revealed"?: "true" | "false";
  "data-reveal-instant"?: "true" | "false";
};

type StrapOptions = {
  color: string;
  ink: string;
  text: string;
  label: string;
  fontFamily: string;
  plain?: boolean;
};

function measureSpacedText(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  return ctx.measureText(text).width + Math.max(0, text.length - 1) * spacing;
}

function fillSpacedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  for (const character of text) {
    ctx.fillText(character, x, y);
    x += ctx.measureText(character).width + spacing;
  }
}

function drawMandala(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(0.8, radius * 0.018);
  for (const scale of [1, 0.9, 0.62, 0.26]) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 16; i++) {
    ctx.save();
    ctx.rotate((i / 16) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.76, radius * 0.07, radius * 0.13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.rotate(Math.PI / 16);
    ctx.beginPath();
    ctx.arc(0, -radius * 0.95, radius * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i / 8) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.26);
    ctx.bezierCurveTo(radius * 0.12, -radius * 0.4, radius * 0.1, -radius * 0.52, 0, -radius * 0.6);
    ctx.bezierCurveTo(-radius * 0.1, -radius * 0.52, -radius * 0.12, -radius * 0.4, 0, -radius * 0.26);
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function makeStrap(length: number, width: number, dpr: number, options: StrapOptions) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(length * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Unable to create the lanyard strap texture.");
    return canvas;
  }

  ctx.setTransform(0, dpr, -dpr, 0, canvas.width, 0);
  ctx.fillStyle = options.color;
  ctx.fillRect(0, 0, length, width);
  ctx.strokeStyle = ctx.fillStyle = options.ink;

  if (!options.plain) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, length, width);
    ctx.clip();
    ctx.textBaseline = "middle";
    const textFont = `400 ${Math.round(width * 0.5)}px ${STRAP_SCRIPT_FONT}`;
    const labelFont = `700 ${Math.round(width * 0.36)}px ${options.fontFamily}`;
    ctx.font = textFont;
    const textWidth = ctx.measureText(options.text).width;
    ctx.font = labelFont;
    const labelSpacing = width * 0.045;
    const gap = width * 0.6;
    let x = width * 0.4;
    let direction = 1;
    while (x < length) {
      ctx.globalAlpha = 0.55;
      drawMandala(ctx, x + width * 1.3, width * (0.5 + direction * 0.28), width * 1.35);
      x += width * 2.8;
      ctx.globalAlpha = 0.95;
      ctx.font = textFont;
      ctx.fillText(options.text, x, width * 0.52);
      x += textWidth + gap;
      if (options.label) {
        ctx.font = labelFont;
        const label = `-  ${options.label.toUpperCase()}  -`;
        fillSpacedText(ctx, label, x, width * 0.53, labelSpacing);
        x += measureSpacedText(ctx, label, labelSpacing) + gap;
      }
      direction *= -1;
    }
    ctx.restore();
  }

  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 1.5);
  ctx.lineTo(length, 1.5);
  ctx.moveTo(0, width - 1.5);
  ctx.lineTo(length, width - 1.5);
  ctx.stroke();
  return canvas;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | number[],
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, width, height, radius);
  else ctx.rect(x, y, width, height);
}

function measuredCardWidth(width: number) {
  return Math.max(224, Math.min(352, Math.round(width * 0.58)));
}

export function LanyardBadge({
  data,
  photo,
  cardWidth = 236,
  height = "calc(100svh - 76px)",
  className = "",
  flipButton = false,
  style,
  "data-reveal-from": revealFrom,
  "data-revealed": revealed,
  "data-reveal-instant": revealInstant,
}: LanyardBadgeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const assemblyRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<() => void>(() => {});
  const [cw, setCw] = useState(cardWidth);
  const [showBack, setShowBack] = useState(false);
  const [ready, setReady] = useState(false);
  const showBackRef = useRef(showBack);
  showBackRef.current = showBack;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const nextWidth = measuredCardWidth(root.clientWidth);
      setCw((current) => current === nextWidth ? current : nextWidth);
    });
    observer.observe(root);
    setCw(measuredCardWidth(root.clientWidth));
    return () => observer.disconnect();
  }, []);

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.repeat) return;
    event.preventDefault();
    flipRef.current();
  }, []);

  useEffect(() => {
    const rootRefValue = rootRef.current;
    const canvasRefValue = canvasRef.current;
    const assemblyRefValue = assemblyRef.current;
    const spinRefValue = spinRef.current;
    const clipRefValue = clipRef.current;
    const cardRefValue = cardRef.current;
    if (!rootRefValue || !canvasRefValue || !assemblyRefValue || !spinRefValue || !clipRefValue || !cardRefValue) {
      console.error("Unable to initialize the lanyard badge canvas.");
      return;
    }
    const root = rootRefValue;
    const canvas = canvasRefValue;
    const assembly = assemblyRefValue;
    const spinElement = spinRefValue;
    const card = cardRefValue;
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) {
      console.error("Unable to initialize the lanyard badge canvas context.");
      return;
    }
    const ctx: CanvasRenderingContext2D = canvasContext;

    const readToken = (name: string) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      if (!value) console.error(`Missing lanyard badge color token: ${name}`);
      return value;
    };
    const strapColor = readToken("--deep");
    const inkColor = readToken("--link");
    const cardColor = readToken("--btn");
    const cardInk = readToken("--btn-text");
    root.style.setProperty("--lanyard-card-color", cardColor);
    root.style.setProperty("--lanyard-card-ink", cardInk);
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    let alive = true;
    let initialized = false;
    let inViewport = false;
    let tabVisible = !document.hidden;
    let raf = 0;
    let lastTime: number | null = null;
    let accumulator = 0;
    let elapsed = 0;
    let currentWidth = 0;
    let currentHeight = 0;
    let dpr = 1;
    let particles: Pt[] = [];
    let links: Link[] = [];
    let leftStrand: number[] = [];
    let rightStrand: number[] = [];
    let lowerStrand: number[] = [];
    let buckleIndex = 0;
    let topIndex = 0;
    let cardIndex = 0;
    let strandRest = 1;
    let strapTexture: HTMLCanvasElement | null = null;
    let plainTexture: HTMLCanvasElement | null = null;
    let cardHeight = Math.round(cw * 1.5);
    const ringRadius = Math.max(7, Math.round(cw * 0.036));
    const clipHeight = Math.round(cw * 0.1);
    const step = 1 / 120;
    const gravity = 2400;
    const iterations = 18;
    const spin: Spin = { a: 0, v: 0 };
    let spinTarget = 0;
    let drag: {
      id: number;
      offsetX: number;
      offsetY: number;
      targetX: number;
      targetY: number;
      startX: number;
      startY: number;
      moved: boolean;
    } | null = null;
    let displayFont = "";
    let bodyFont = "";

    const stopLoop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastTime = null;
      accumulator = 0;
    };

    const place = () => {
      const top = particles[topIndex];
      const center = particles[cardIndex];
      if (!top || !center) return;
      const swing = swingAngle(top, center);
      assembly.style.transform =
        `translate3d(${(top.x - cw / 2).toFixed(2)}px,${(top.y + ringRadius).toFixed(2)}px,0) rotate(${-swing.toFixed(4)}rad)`;
      spinElement.style.transform = `perspective(1100px) rotateY(${spin.a.toFixed(4)}rad)`;
      card.style.setProperty("--lanyard-dim", (0.5 * (1 - Math.abs(Math.cos(spin.a)))).toFixed(3));
      card.style.setProperty("--lanyard-shine", `${(50 + Math.sin(spin.a) * 70 + swing * 90).toFixed(1)}%`);
    };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      root.style.setProperty("--lanyard-mobile-height", `${Math.max(560, Math.ceil(cw * 2.12))}px`);
      currentWidth = Math.max(1, root.clientWidth);
      currentHeight = Math.max(1, root.clientHeight);
      cardHeight = Math.round(cw * 1.5);
      const strapWidth = strapWidthFor(cw);
      const lowerLength = strapWidth * 2.2;
      const armLength = ringRadius * 2 + clipHeight + cardHeight * 0.55;
      root.style.setProperty("--lanyard-card-width", `${cw}px`);
      root.style.setProperty("--lanyard-card-height", `${cardHeight}px`);
      root.style.setProperty("--lanyard-card-radius", `${cw * 0.075}px`);
      root.style.setProperty("--lanyard-ring-radius", `${ringRadius}px`);
      root.style.setProperty("--lanyard-clip-height", `${clipHeight}px`);
      root.style.setProperty("--lanyard-clip-width", `${cw * 0.075}px`);
      root.style.setProperty("--lanyard-clip-total", `${clipHeight + cw * 0.05}px`);
      root.style.setProperty("--lanyard-clip-radius", `${cw * 0.02}px`);
      root.style.setProperty("--lanyard-card-top", `${ringRadius + clipHeight * 0.6}px`);
      const strandSegments = 14;
      canvas.width = Math.round(currentWidth * 2 * dpr);
      canvas.height = Math.round(currentHeight * dpr);
      particles = [];
      links = [];

      const addPoint = (x: number, y: number, weight: number) => {
        particles.push({ x, y, px: x, py: y, w: weight });
        return particles.length - 1;
      };
      const addStrand = (from: number, to: number, count: number, slack: number) => {
        const start = particles[from];
        const end = particles[to];
        const rest = (Math.hypot(end.x - start.x, end.y - start.y) * slack) / count;
        const indices = [from];
        for (let i = 1; i < count; i++) {
          indices.push(addPoint(
            start.x + ((end.x - start.x) * i) / count,
            start.y + ((end.y - start.y) * i) / count,
            1,
          ));
        }
        indices.push(to);
        for (let i = 0; i < count; i++) links.push([indices[i], indices[i + 1], rest]);
        return { indices, rest };
      };

      const centerX = currentWidth / 2;
      const spread = Math.min(currentWidth * 0.16, cw * 0.55);
      const topY = -strapWidth * 2;
      const buckleY = Math.max(
        currentHeight * 0.1,
        Math.min(
          currentHeight * 0.42,
          currentHeight - (lowerLength + ringRadius * 2 + clipHeight + cardHeight + 28 + cw * 0.55),
        ),
      ) + (Number.parseFloat(getComputedStyle(root).getPropertyValue("--hero-lanyard-strap-extension")) || 0);
      const leftAnchor = addPoint(centerX - spread, topY, 0);
      buckleIndex = addPoint(centerX, buckleY, 1.4);
      const left = addStrand(leftAnchor, buckleIndex, strandSegments, 1.03);
      const rightAnchor = addPoint(centerX + spread, topY, 0);
      const right = addStrand(rightAnchor, buckleIndex, strandSegments, 1.03);
      topIndex = addPoint(centerX, buckleY + lowerLength, 0.8);
      const lower = addStrand(buckleIndex, topIndex, 3, 1);
      cardIndex = addPoint(centerX, buckleY + lowerLength + armLength, 0.25);
      links.push([topIndex, cardIndex, armLength]);
      leftStrand = left.indices;
      rightStrand = right.indices;
      lowerStrand = lower.indices;
      strandRest = left.rest;

      const options: StrapOptions = {
        color: strapColor,
        ink: inkColor,
        text: data.strapText,
        label: data.strapLabel,
        fontFamily: displayFont,
      };
      strapTexture = makeStrap(strandRest * strandSegments + 4, strapWidth, dpr, options);
      plainTexture = makeStrap(lowerLength + 4, strapWidth * 0.8, dpr, { ...options, plain: true });

      spinTarget = showBackRef.current ? Math.PI : 0;
      spin.a = spinTarget;
      spin.v = 0;
      elapsed = 0;
      if (reducedMotion) {
        for (let i = 0; i < 900; i++) {
          integrate(particles, step, gravity, 0.98);
          solve(particles, links, iterations);
        }
      } else {
        particles[cardIndex].x += cw * 0.55;
        particles[cardIndex].px = particles[cardIndex].x - 2;
        spin.v = 5;
      }
      draw();
      place();
    };

    const ribbon = (indices: number[], texture: HTMLCanvasElement, rest: number, light: number) => {
      for (let i = 0; i < indices.length - 1; i++) {
        const start = particles[indices[i]];
        const end = particles[indices[i + 1]];
        const dx = (end.x - start.x) * dpr;
        const dy = (end.y - start.y) * dpr;
        const length = Math.hypot(dx, dy) || 1e-6;
        const tx = dx / length;
        const ty = dy / length;
        const nx = ty;
        const ny = -tx;
        const sourceY = i * rest * dpr;
        const sourceHeight = rest * dpr;
        const stretch = length / sourceHeight;
        ctx.setTransform(
          nx,
          ny,
          tx * stretch,
          ty * stretch,
          (start.x + currentWidth) * dpr - (nx * texture.width) / 2 - tx * stretch * sourceY,
          start.y * dpr - (ny * texture.width) / 2 - ty * stretch * sourceY,
        );
        const sliceHeight = Math.min(sourceHeight + 1.5, texture.height - sourceY);
        if (sliceHeight > 0) {
          ctx.drawImage(texture, 0, sourceY, texture.width, sliceHeight, 0, sourceY, texture.width, sliceHeight);
        }
        const shade = 0.22 * (1 - Math.max(0, nx * light));
        ctx.fillStyle = `rgba(0,0,0,${shade.toFixed(3)})`;
        ctx.fillRect(0, sourceY, texture.width, sourceHeight + 1);
      }
    };

    const metal = (x0: number, y0: number, x1: number, y1: number) => {
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, MATERIALS.silverLight);
      gradient.addColorStop(0.45, MATERIALS.silverMid);
      gradient.addColorStop(0.55, MATERIALS.silverDark);
      gradient.addColorStop(1, MATERIALS.silverEdge);
      return gradient;
    };

    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!strapTexture || !plainTexture) return;
      ctx.imageSmoothingEnabled = true;
      ribbon(leftStrand, strapTexture, strandRest, -1);
      ribbon(rightStrand, strapTexture, strandRest, 1);
      ribbon(lowerStrand, plainTexture, plainTexture.height / dpr / 3, 0);

      const buckle = particles[buckleIndex];
      const top = particles[topIndex];
      const angle = Math.atan2(top.x - buckle.x, top.y - buckle.y);
      const unit = strapWidthFor(cw) / 20;
      ctx.setTransform(dpr, 0, 0, dpr, (buckle.x + currentWidth) * dpr, buckle.y * dpr);
      ctx.rotate(-angle);
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 6 * dpr;
      ctx.shadowOffsetY = 2 * dpr;
      ctx.fillStyle = metal(-16 * unit, 0, 16 * unit, 0);
      roundedRect(ctx, -15 * unit, -14 * unit, 30 * unit, 17 * unit, 3 * unit);
      ctx.fill();
      roundedRect(ctx, -11 * unit, 1 * unit, 22 * unit, 15 * unit, [2 * unit, 2 * unit, 6 * unit, 6 * unit]);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(-10 * unit, -9 * unit, 20 * unit, 2.2 * unit);
      ctx.fillRect(-5 * unit, 6 * unit, 10 * unit, 3 * unit);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 0.8 * unit;
      ctx.beginPath();
      ctx.moveTo(-13 * unit, -12.5 * unit);
      ctx.lineTo(13 * unit, -12.5 * unit);
      ctx.stroke();

      ctx.setTransform(dpr, 0, 0, dpr, (top.x + currentWidth) * dpr, (top.y + ringRadius * 0.8) * dpr);
      ctx.lineWidth = Math.max(2.5, ringRadius * 0.38);
      ctx.strokeStyle = metal(-ringRadius, -ringRadius, ringRadius, ringRadius);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    const isSettled = () => {
      const top = particles[topIndex];
      const center = particles[cardIndex];
      if (!top || !center || drag) return false;
      const linearSpeed = Math.hypot(center.x - center.px, center.y - center.py) / step;
      const spinError = Math.abs(spin.a - spinTarget);
      return linearSpeed < 1.2 && Math.abs(spin.v) < 0.02 && spinError < 0.003;
    };

    let loopRequested = false;
    const tick = (now: number) => {
      raf = 0;
      if (!alive || !initialized || !inViewport || !tabVisible || (reducedMotion && !loopRequested)) {
        lastTime = null;
        return;
      }
      const delta = lastTime === null ? 0 : Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      accumulator += delta;
      let steps = 0;
      while (accumulator >= step && steps < 8) {
        accumulator -= step;
        steps++;
        elapsed += step;
        if (drag) {
          const target = particles[topIndex];
          target.px = target.x;
          target.py = target.y;
          target.x += (drag.targetX - target.x) * 0.35;
          target.y += (drag.targetY - target.y) * 0.35;
        }
        const center = particles[cardIndex];
        if (!reducedMotion && !drag) {
          center.x += (2 * Math.sin(elapsed * 0.7) + 1.2 * Math.sin(elapsed * 1.9)) * step * step;
        }
        integrate(particles, step, gravity, 0.992);
        solve(particles, links, iterations);
        const velocity = (center.x - center.px) / step;
        const ambientSpin = reducedMotion ? 0 : 0.03 * Math.sin(elapsed * 0.5);
        spinStep(spin, spinTarget, step, velocity * 0.03 + ambientSpin);
      }
      draw();
      place();
      if (reducedMotion && loopRequested && !drag && isSettled()) loopRequested = false;
      if (!reducedMotion || loopRequested) raf = requestAnimationFrame(tick);
      else lastTime = null;
    };

    const startLoop = () => {
      if (!initialized || !inViewport || !tabVisible || raf || (reducedMotion && !loopRequested)) return;
      lastTime = null;
      accumulator = 0;
      raf = requestAnimationFrame(tick);
    };
    const requestMotion = () => {
      loopRequested = true;
      startLoop();
    };

    const flip = () => {
      if (!initialized) return;
      spinTarget = spinTarget === 0 ? Math.PI : 0;
      setShowBack(spinTarget !== 0);
      requestMotion();
    };
    flipRef.current = flip;

    const pointerPosition = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!initialized || (event.pointerType === "mouse" && event.button !== 0)) return;
      if (!(event.currentTarget instanceof HTMLElement)) return;
      const point = pointerPosition(event);
      const target = particles[topIndex];
      drag = {
        id: event.pointerId,
        offsetX: target.x - point.x,
        offsetY: target.y - point.y,
        targetX: target.x,
        targetY: target.y,
        startX: point.x,
        startY: point.y,
        moved: false,
      };
      target.w = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
      root.dataset.dragging = "true";
      requestMotion();
    };
    const releasePointer = (event: PointerEvent, shouldFlip: boolean) => {
      if (!drag || event.pointerId !== drag.id) return;
      const wasTap = !drag.moved;
      drag = null;
      particles[topIndex].w = 0.8;
      delete root.dataset.dragging;
      if (event.currentTarget instanceof HTMLElement && event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (shouldFlip && wasTap) flip();
      else requestMotion();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const point = pointerPosition(event);
      drag.targetX = point.x + drag.offsetX;
      drag.targetY = point.y + drag.offsetY;
      if (Math.hypot(point.x - drag.startX, point.y - drag.startY) > 5) drag.moved = true;
      requestMotion();
    };
    const onPointerUp = (event: PointerEvent) => releasePointer(event, true);
    const onPointerCancel = (event: PointerEvent) => releasePointer(event, false);
    const onLostPointerCapture = (event: PointerEvent) => {
      if (drag?.id === event.pointerId) releasePointer(event, false);
    };
    const onVisibilityChange = () => {
      tabVisible = !document.hidden;
      if (!tabVisible) stopLoop();
      else if (!reducedMotion || loopRequested) startLoop();
    };
    const onMotionChange = () => {
      reducedMotion = reducedMotionQuery.matches;
      loopRequested = !reducedMotion;
      if (reducedMotion) {
        loopRequested = false;
        stopLoop();
      } else {
        startLoop();
      }
    };

    const fontElement = document.querySelector(".hero h1");
    displayFont = fontElement ? getComputedStyle(fontElement).fontFamily : getComputedStyle(root).fontFamily;
    bodyFont = getComputedStyle(document.body).fontFamily;
    const fontSize = Math.round(Math.max(14, cw * 0.1) * 0.5);
    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver((entries) => {
        inViewport = entries.some((entry) => entry.isIntersecting);
        if (inViewport && (!reducedMotion || loopRequested)) startLoop();
        else stopLoop();
      }, { threshold: 0 });
      intersectionObserver.observe(root);
    } else {
      inViewport = true;
    }
    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(1, root.clientWidth);
      const nextHeight = Math.max(1, root.clientHeight);
      const widthChanged = Math.abs(nextWidth - currentWidth) > 1;
      const heightChanged = Math.abs(nextHeight - currentHeight) > 1;
      if (widthChanged) {
        const nextCardWidth = measuredCardWidth(nextWidth);
        if (nextCardWidth !== cw) {
          setCw(nextCardWidth);
          return;
        }
      }
      if ((widthChanged || heightChanged) && initialized) {
        stopLoop();
        build();
        if (!reducedMotion) startLoop();
      }
    });
    resizeObserver.observe(root);
    assembly.addEventListener("pointerdown", onPointerDown);
    assembly.addEventListener("pointermove", onPointerMove);
    assembly.addEventListener("pointerup", onPointerUp);
    assembly.addEventListener("pointercancel", onPointerCancel);
    assembly.addEventListener("lostpointercapture", onLostPointerCapture);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotionQuery.addEventListener("change", onMotionChange);

    void (async () => {
      await document.fonts.ready;
      await Promise.all([
        document.fonts.load(`500 ${fontSize}px ${displayFont}`),
        document.fonts.load(`700 ${fontSize}px ${displayFont}`),
        document.fonts.load(`800 ${fontSize}px ${displayFont}`),
        document.fonts.load(`400 ${fontSize}px ${bodyFont}`),
        document.fonts.load(`600 ${fontSize}px ${bodyFont}`),
        document.fonts.load(`700 ${fontSize}px ${bodyFont}`),
      ]);
      if (!alive) return;
      initialized = true;
      build();
      setReady(true);
      if (!reducedMotion) startLoop();
    })();

    return () => {
      alive = false;
      stopLoop();
      if (drag && assembly.hasPointerCapture(drag.id)) assembly.releasePointerCapture(drag.id);
      intersectionObserver?.disconnect();
      resizeObserver.disconnect();
      assembly.removeEventListener("pointerdown", onPointerDown);
      assembly.removeEventListener("pointermove", onPointerMove);
      assembly.removeEventListener("pointerup", onPointerUp);
      assembly.removeEventListener("pointercancel", onPointerCancel);
      assembly.removeEventListener("lostpointercapture", onLostPointerCapture);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotionQuery.removeEventListener("change", onMotionChange);
      flipRef.current = () => {};
      root.style.removeProperty("--lanyard-card-color");
      root.style.removeProperty("--lanyard-card-ink");
      root.style.removeProperty("--lanyard-card-width");
      root.style.removeProperty("--lanyard-card-height");
      root.style.removeProperty("--lanyard-card-radius");
      root.style.removeProperty("--lanyard-mobile-height");
      root.style.removeProperty("--lanyard-ring-radius");
      root.style.removeProperty("--lanyard-clip-height");
      root.style.removeProperty("--lanyard-clip-width");
      root.style.removeProperty("--lanyard-clip-total");
      root.style.removeProperty("--lanyard-clip-radius");
      root.style.removeProperty("--lanyard-card-top");
      setReady(false);
    };
  }, [cw, data, height, photo]);

  const handleFlipButton = () => flipRef.current();
  const ariaLabel = `${data.name}, ${data.role}: badge. Drag to swing, press Enter or Space to flip.`;

  return (
    <div
      ref={rootRef}
      className={`lanyard-badge ${className}`.trim()}
      style={{ ...style, height }}
      data-ready={ready ? "true" : "false"}
      data-reveal-from={revealFrom}
      data-revealed={revealed}
      data-reveal-instant={revealInstant}
    >
      <noscript>
        <style>{`
          .lanyard-badge::before { position: absolute; top: 0; left: 50%; width: 14px; height: 20%; background: var(--deep); content: ""; transform: translateX(-50%); }
          .lanyard-badge .lanyard-assembly { left: 50%; top: 20%; transform: translateX(-50%) !important; visibility: visible !important; }
          .lanyard-badge .lanyard-card-spin { transform: none !important; }
          .lanyard-badge .lanyard-clip { visibility: visible !important; }
          .lanyard-badge .lanyard-card-hit { visibility: visible !important; }
          .lanyard-badge .lanyard-face-front { visibility: visible !important; }
          .lanyard-badge .lanyard-face-back { visibility: hidden !important; }
          .lanyard-badge .lanyard-card-sheen, .lanyard-badge canvas { display: none !important; }
        `}</style>
      </noscript>
      <canvas ref={canvasRef} className="lanyard-canvas" aria-hidden="true" />
      <div ref={assemblyRef} className="lanyard-assembly">
        <div
          ref={clipRef}
          className="lanyard-clip"
          aria-hidden="true"
          style={{ background: `linear-gradient(90deg, ${MATERIALS.silverLight}, ${MATERIALS.silverMid} 50%, ${MATERIALS.silverEdge})` }}
        />
        <div ref={spinRef} className="lanyard-card-spin">
          <div
            ref={cardRef}
            className="lanyard-card-hit"
            role="button"
            tabIndex={0}
            aria-label={ariaLabel}
            aria-pressed={showBack}
            onKeyDown={handleKeyDown}
            onDragStart={(event) => event.preventDefault()}
          >
            <BadgeFaces
              cardWidth={cw}
              name={data.name}
              role={data.role}
              summary={data.summary}
              fields={data.fields}
              stack={data.stack}
              photo={photo}
            />
            <div className="lanyard-card-sheen" aria-hidden="true" />
          </div>
        </div>
      </div>
      {flipButton ? (
        <button
          className="lanyard-flip-button"
          type="button"
          aria-pressed={showBack}
          onClick={handleFlipButton}
        >
          {showBack ? "Show front" : "Show back"}
        </button>
      ) : null}
    </div>
  );
}
