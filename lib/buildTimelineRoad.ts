export type TimelineRoadPoint = { x: number; y: number };

function formatCoordinate(value: number): string {
  return Number(value.toFixed(2)).toString();
}

export function buildRoadPath(points: readonly TimelineRoadPoint[], measuredWidth: number, rowHeight: number): string {
  if (points.length === 0) return "";

  const [first] = points;
  const xInBounds = (x: number) => Math.min(measuredWidth, Math.max(0, x));
  let path = `M ${formatCoordinate(xInBounds(first.x))} ${formatCoordinate(first.y)}`;

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const verticalSpan = end.y - start.y;
    const direction = Math.sign(verticalSpan);
    const halfHeight = verticalSpan === 0 ? rowHeight / 2 : Math.abs(verticalSpan) / 2;
    const startX = xInBounds(start.x);
    const endX = xInBounds(end.x);
    const firstControl = { x: startX, y: start.y + direction * halfHeight };
    const secondControl = { x: endX, y: end.y - direction * halfHeight };

    path += ` C ${formatCoordinate(firstControl.x)} ${formatCoordinate(firstControl.y)}, ${formatCoordinate(secondControl.x)} ${formatCoordinate(secondControl.y)}, ${formatCoordinate(endX)} ${formatCoordinate(end.y)}`;
  }

  return path;
}
