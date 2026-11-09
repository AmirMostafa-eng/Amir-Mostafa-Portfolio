export type Pt = { x: number; y: number; px: number; py: number; w: number };
export type Link = [number, number, number];
export type Spin = { a: number; v: number };

export function integrate(pts: Pt[], dt: number, gravity: number, damping: number) {
  for (const p of pts) {
    if (!p.w) continue;
    const vx = (p.x - p.px) * damping;
    const vy = (p.y - p.py) * damping;
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + gravity * dt * dt;
  }
}

export function solve(pts: Pt[], links: Link[], iterations: number) {
  for (let k = 0; k < iterations; k++) {
    for (const [i, j, rest] of links) {
      const a = pts[i];
      const b = pts[j];
      const weights = a.w + b.w;
      if (!weights) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 1e-6;
      const correction = (distance - rest) / (distance * weights);
      a.x += dx * correction * a.w;
      a.y += dy * correction * a.w;
      b.x -= dx * correction * b.w;
      b.y -= dy * correction * b.w;
    }
  }
}

export function spinStep(spin: Spin, target: number, dt: number, drive: number) {
  spin.v += (-(spin.a - target) * 18 - spin.v * 3.2 + drive) * dt;
  spin.a += spin.v * dt;
}

export function swingAngle(top: Pt, bottom: Pt) {
  return Math.atan2(bottom.x - top.x, bottom.y - top.y);
}
