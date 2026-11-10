import Image from "next/image";
import { useId } from "react";

const CARD_VIEW_WIDTH = 240;
const CARD_VIEW_HEIGHT = 360;
const BORDER_WIDTH = 10.2;
const INNER_RADIUS = 8.4;

type BadgeField = { label: string; value: string };

type BadgeFacesProps = {
  cardWidth: number;
  name: string;
  role: string;
  summary: string;
  fields: readonly BadgeField[];
  stack: readonly string[];
  photo: string | null;
};

function roundedRectPath(x: number, y: number, width: number, height: number, radius: number) {
  return [
    `M ${x + radius} ${y}`,
    `H ${x + width - radius}`,
    `A ${radius} ${radius} 0 0 1 ${x + width} ${y + radius}`,
    `V ${y + height - radius}`,
    `A ${radius} ${radius} 0 0 1 ${x + width - radius} ${y + height}`,
    `H ${x + radius}`,
    `A ${radius} ${radius} 0 0 1 ${x} ${y + height - radius}`,
    `V ${y + radius}`,
    `A ${radius} ${radius} 0 0 1 ${x + radius} ${y}`,
    "Z",
  ].join(" ");
}

function CardBorder() {
  const id = useId().replaceAll(":", "");
  const outerPath = roundedRectPath(0.5, 0.5, 239, 359, 18);
  const innerPath = roundedRectPath(
    BORDER_WIDTH,
    BORDER_WIDTH,
    CARD_VIEW_WIDTH - BORDER_WIDTH * 2,
    CARD_VIEW_HEIGHT - BORDER_WIDTH * 2,
    INNER_RADIUS,
  );

  return (
    <svg
      className="lanyard-card-border"
      aria-hidden="true"
      viewBox="0 0 240 360"
      fill="none"
    >
      <defs>
        <linearGradient id={`${id}-finish`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--deep)" />
          <stop offset=".43" stopColor="var(--deep)" />
          <stop offset=".5" stopColor="color-mix(in srgb, var(--deep) 72%, var(--link))" />
          <stop offset=".57" stopColor="var(--deep)" />
          <stop offset="1" stopColor="var(--deep)" />
        </linearGradient>
      </defs>
      <path d={`${outerPath} ${innerPath}`} fill={`url(#${id}-finish)`} fillRule="evenodd" />
      <g stroke="color-mix(in srgb, var(--link) 35%, var(--deep))" opacity=".7">
        <path d={outerPath} strokeWidth="1" />
        <path d={innerPath} strokeWidth="1" />
      </g>
    </svg>
  );
}

export function BadgeFaces({ cardWidth, name, role, summary, fields, photo }: BadgeFacesProps) {
  const scale = cardWidth / 240;
  const inset = BORDER_WIDTH * scale;
  const radius = INNER_RADIUS * scale;

  return (
    <>
      <div className="lanyard-face lanyard-face-front" aria-hidden="true">
        <CardBorder />
        <div
          className="lanyard-portrait"
          style={{ inset, borderRadius: radius }}
        >
          {photo ? (
            <Image
              src={photo}
              alt="Portrait of Amir Mostafa"
              fill
              priority
              draggable={false}
              sizes="(max-width: 767px) 236px, 352px"
              onDragStart={(event) => event.preventDefault()}
              style={{ objectFit: "cover", objectPosition: "50% 20%", transform: "translateZ(0)" }}
            />
          ) : (
            <span className="lanyard-placeholder-a" style={{ fontSize: cardWidth * 0.34 }}>A</span>
          )}
        </div>
      </div>
      <div className="lanyard-face lanyard-face-back" aria-hidden="true">
        <CardBorder />
        <div
          className="lanyard-back-panel"
          style={{
            inset,
            borderRadius: radius,
            padding: `${6 * scale}px ${8 * scale}px ${5 * scale}px`,
            gap: 3 * scale,
          }}
        >
          <div className="lanyard-back-heading">
            <strong className="lanyard-card-name" style={{ fontSize: Math.max(19.6, 21 * scale) }}>{name}</strong>
            <span className="lanyard-card-role" style={{ fontSize: Math.max(9, 9.5 * scale) }}>{role}</span>
          </div>
          <span className="lanyard-card-rule" />
          <p className="lanyard-back-summary" style={{ fontSize: Math.max(10.7, 11.5 * scale) }}>{summary}</p>
          <div className="lanyard-back-fields">
            {fields.map((field) => (
              <div className="lanyard-back-field" key={field.label}>
                <span className="lanyard-back-label" style={{ fontSize: Math.max(9, 9 * scale) }}>{field.label}</span>
                <span className="lanyard-back-value" style={{ fontSize: Math.max(10.7, 11.5 * scale) }}>{field.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
