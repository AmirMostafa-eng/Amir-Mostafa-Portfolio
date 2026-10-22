import { PILL_MAX_WIDTH, PILL_SIDE_MARGIN, PILL_TOP, SHOULDER_SIZE } from "./nav-config";

export type NavPathOptions = {
  width: number;
  height: number;
  dockProgress: number;
  notchX: number;
  notchWidth: number;
  velocity: number;
};

/**
 * Builds one continuously morphing bar path. Each state uses M, L, C, L, C,
 * L, C, L, C, Z in the same order. The docked bottom cubics turn inward to
 * form the concave shoulders; velocity/notch inputs are reserved for phase 2.
 */
export function buildNavPath({ width, height, dockProgress, notchX: _notchX, notchWidth: _notchWidth, velocity: _velocity }: NavPathOptions): string {
  // Phase 1 reserves these inputs for the optional liquid notch.
  void _notchX;
  void _notchWidth;
  void _velocity;
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  const t = Math.min(1, Math.max(0, dockProgress));
  const pillW = Math.min(Math.max(0, w - 2 * PILL_SIDE_MARGIN), PILL_MAX_WIDTH);
  const pillX = (w - pillW) / 2;
  const radius = Math.min(h / 2, pillW / 2);
  const pill = [
    pillX + radius, PILL_TOP,
    w - pillX - radius, PILL_TOP,
    w - pillX - radius + radius * 0.5523, PILL_TOP,
    w - pillX, PILL_TOP + radius - radius * 0.5523,
    w - pillX, PILL_TOP + radius,
    w - pillX, PILL_TOP + h - radius,
    w - pillX, PILL_TOP + h - radius + radius * 0.5523,
    w - pillX - radius + radius * 0.5523, PILL_TOP + h,
    w - pillX - radius, PILL_TOP + h,
    pillX + radius, PILL_TOP + h,
    pillX + radius - radius * 0.5523, PILL_TOP + h,
    pillX, PILL_TOP + h - radius + radius * 0.5523,
    pillX, PILL_TOP + h - radius,
    pillX, PILL_TOP + radius,
    pillX, PILL_TOP + radius - radius * 0.5523,
    pillX + radius - radius * 0.5523, PILL_TOP,
    pillX + radius, PILL_TOP,
  ];
  const shoulder = Math.min(SHOULDER_SIZE, h / 2, w / 4);
  const dock = [
    0, 0,
    w, 0,
    w, 0, w, 0, w, 0,
    w, h - shoulder,
    w, h - shoulder * 0.42,
    w - shoulder * 0.5, h,
    w - shoulder, h,
    shoulder, h,
    shoulder * 0.5, h,
    0, h - shoulder * 0.42,
    0, h - shoulder,
    0, 0,
    0, 0,
    0, 0,
  ];
  const p = pill.map((value, index) => value + (dock[index] - value) * t);
  const n = (value: number) => Number(value.toFixed(2));
  return `M ${n(p[0])} ${n(p[1])} L ${n(p[2])} ${n(p[3])} C ${n(p[4])} ${n(p[5])} ${n(p[6])} ${n(p[7])} ${n(p[8])} ${n(p[9])} L ${n(p[10])} ${n(p[11])} C ${n(p[12])} ${n(p[13])} ${n(p[14])} ${n(p[15])} ${n(p[16])} ${n(p[17])} L ${n(p[18])} ${n(p[19])} C ${n(p[20])} ${n(p[21])} ${n(p[22])} ${n(p[23])} ${n(p[24])} ${n(p[25])} L ${n(p[26])} ${n(p[27])} C ${n(p[28])} ${n(p[29])} ${n(p[30])} ${n(p[31])} ${n(p[32])} ${n(p[33])} Z`;
}
