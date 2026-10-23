import { CONTAINER_MAX_WIDTH, CONTAINER_PADDING_X, CONTAINER_PADDING_X_MOBILE } from "@/lib/layout";
import { BAR_HEIGHT_DESKTOP, BAR_HEIGHT_MOBILE, DOCKED_CORNER_STYLE, DOCKED_RADIUS, DOCKED_SHOULDER_SIZE, PILL_MAX_WIDTH, PILL_SIDE_MARGIN, PILL_TOP } from "./nav-config";

export type ShapeBox = { left: number; top: number; width: number; height: number };
export type ShapeBoxOptions = { width: number; height?: number; dockProgress: number; containerPadding?: number };
export type NavPathOptions = { width: number; height: number; dockProgress: number; containerPadding?: number; notchX?: number; notchWidth?: number; velocity?: number };
type Point = readonly [number, number];

/** Layout shared by the path and the foreground nav content. */
export function getShapeBox({ width, height, dockProgress, containerPadding }: ShapeBoxOptions): ShapeBox {
  const viewportWidth = Math.max(0, width);
  const progress = Math.min(1, Math.max(0, dockProgress));
  const barHeight = height ?? (viewportWidth < 768 ? BAR_HEIGHT_MOBILE : BAR_HEIGHT_DESKTOP);
  const horizontalPadding = containerPadding ?? (viewportWidth <= 640 ? CONTAINER_PADDING_X_MOBILE : CONTAINER_PADDING_X);
  const pillWidth = Math.min(PILL_MAX_WIDTH, Math.max(0, viewportWidth - PILL_SIDE_MARGIN * 2));
  const pillLeft = (viewportWidth - pillWidth) / 2;
  const dockedWidth = Math.min(CONTAINER_MAX_WIDTH, Math.max(0, viewportWidth - horizontalPadding * 2));
  const dockedLeft = (viewportWidth - dockedWidth) / 2;

  return {
    left: pillLeft + (dockedLeft - pillLeft) * progress,
    top: PILL_TOP * (1 - progress),
    width: pillWidth + (dockedWidth - pillWidth) * progress,
    height: barHeight,
  };
}

function pillPoints(box: ShapeBox): Point[] {
  const { left, top, width, height } = box;
  const right = left + width;
  const bottom = top + height;
  const radius = Math.min(height / 2, width / 2);
  const c = radius * 0.5523;

  // Both ends are generated from the same quarter-circle geometry and mirror.
  return [
    [left + radius, top],
    [right - radius, top],
    [right - radius + c, top], [right, top + radius - c], [right, top + radius],
    [right, bottom - radius],
    [right, bottom - radius + c], [right - radius + c, bottom], [right - radius, bottom],
    [left + radius, bottom],
    [left + radius - c, bottom], [left, bottom - radius + c], [left, bottom - radius],
    [left, top + radius],
    [left, top + radius - c], [left + radius - c, top], [left + radius, top],
  ];
}

function dockedPoints(box: ShapeBox): Point[] {
  const { left, top, width, height } = box;
  const right = left + width;
  const bottom = top + height;
  const radius = Math.min(DOCKED_RADIUS, height / 2, width / 2);
  const c = radius * 0.5523;
  const shoulder = Math.min(DOCKED_SHOULDER_SIZE, height / 2, width / 4);
  const useShoulder = DOCKED_CORNER_STYLE === "shoulder";
  const corner = useShoulder ? shoulder : radius;
  const handle = useShoulder ? shoulder * 0.42 : c;
  const horizontalHandle = useShoulder ? shoulder * 0.5 : radius - c;

  // Top corners remain square. The constant can switch the bottom pair back
  // to inward shoulder curves without changing this path's command sequence.
  return [
    [left, top],
    [right, top],
    [right, top], [right, top], [right, top],
    [right, bottom - corner],
    [right, bottom - corner + handle], [right - horizontalHandle, bottom], [right - corner, bottom],
    [left + corner, bottom],
    [left + horizontalHandle, bottom], [left, bottom - corner + handle], [left, bottom - corner],
    [left, top],
    [left, top], [left, top], [left, top],
  ];
}

const mirrorPairs = [[0, 1], [2, 15], [3, 14], [4, 13], [5, 12], [6, 11], [7, 10], [8, 9], [16, 1]] as const;

function assertPillSymmetry(points: Point[], box: ShapeBox) {
  const centerTwice = 2 * box.left + box.width;
  return mirrorPairs.every(([leftIndex, rightIndex]) => {
    const left = points[leftIndex];
    const right = points[rightIndex];
    return Math.abs(left[0] + right[0] - centerTwice) < 0.001 && Math.abs(left[1] - right[1]) < 0.001;
  });
}

/**
 * Returns one path with a constant M/L/C command sequence. All dimensions
 * share the measured wrapper coordinate system, so SVG units equal CSS pixels.
 * Notch inputs are reserved for phase 2 and intentionally ignored in phase 1.
 */
export function buildNavPath({ width, height, dockProgress, containerPadding, notchX: _notchX, notchWidth: _notchWidth, velocity: _velocity }: NavPathOptions): string {
  void _notchX;
  void _notchWidth;
  void _velocity;
  const pillBox = getShapeBox({ width, height, dockProgress: 0, containerPadding });
  const dockBox = getShapeBox({ width, height, dockProgress: 1, containerPadding });
  const pill = pillPoints(pillBox);
  const dock = dockedPoints(dockBox);
  const t = Math.min(1, Math.max(0, dockProgress));
  if (process.env.NODE_ENV === "development" && t === 0) {
    console.assert(assertPillSymmetry(pill, pillBox), "The floating nav pill path must be horizontally symmetric.");
  }
  const points = pill.map((point, index) => [point[0] + (dock[index][0] - point[0]) * t, point[1] + (dock[index][1] - point[1]) * t] as Point);
  const n = (value: number) => Number(value.toFixed(2));
  const xy = ([x, y]: Point) => `${n(x)} ${n(y)}`;
  const [start, topRight, tr1, tr2, trEnd, rightBottomStart, br1, br2, rightBottomEnd, leftBottomStart, bl1, bl2, leftBottomEnd, leftTopStart, tl1, tl2, close] = points;
  return [
    `M ${xy(start)} L ${xy(topRight)} C ${xy(tr1)} ${xy(tr2)} ${xy(trEnd)}`,
    `L ${xy(rightBottomStart)} C ${xy(br1)} ${xy(br2)} ${xy(rightBottomEnd)}`,
    `L ${xy(leftBottomStart)} C ${xy(bl1)} ${xy(bl2)} ${xy(leftBottomEnd)}`,
    `L ${xy(leftTopStart)} C ${xy(tl1)} ${xy(tl2)} ${xy(close)} Z`,
  ].join(" ");
}
