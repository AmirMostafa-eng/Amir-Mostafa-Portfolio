export type TimelineRoadPoint = { x: number; y: number };

function formatCoordinate(value: number): string {
  return Number(value.toFixed(2)).toString();
}

export function buildRoadPath(points: readonly TimelineRoadPoint[]): string {
  if (points.length === 0) return "";

  const [first] = points;
  let path = `M ${formatCoordinate(first.x)} ${formatCoordinate(first.y)}`;

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const halfHeight = (end.y - start.y) / 2;
    const firstControl = { x: start.x, y: start.y + halfHeight };
    const secondControl = { x: end.x, y: end.y - halfHeight };

    path += ` C ${formatCoordinate(firstControl.x)} ${formatCoordinate(firstControl.y)}, ${formatCoordinate(secondControl.x)} ${formatCoordinate(secondControl.y)}, ${formatCoordinate(end.x)} ${formatCoordinate(end.y)}`;
  }

  return path;
}
