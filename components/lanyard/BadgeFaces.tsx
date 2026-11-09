import Image from "next/image";

const SHOW_FRAME = true;

type BadgeFacesProps = {
  cardWidth: number;
  name: string;
  role: string;
  skills: string;
  location: string;
  status: string;
  photo: string | null;
};

export function BadgeFaces({
  cardWidth,
  name,
  role,
  skills,
  location,
  status,
  photo,
}: BadgeFacesProps) {
  const scale = cardWidth / 240;

  return (
    <>
      <div className="lanyard-face lanyard-face-front" aria-hidden="true">
        <div className="lanyard-portrait">
          {photo ? (
            <Image
              src={photo}
              alt="Portrait of Amir Mostafa"
              fill
              priority
              sizes="(max-width: 767px) 220px, 320px"
              style={{ objectFit: "cover", objectPosition: "50% 20%", transform: "translateZ(0)" }}
            />
          ) : (
            <span className="lanyard-placeholder-a" style={{ fontSize: cardWidth * 0.34 }}>A</span>
          )}
        </div>
        {SHOW_FRAME ? <CardFrame /> : null}
      </div>
      <div className="lanyard-face lanyard-face-back" aria-hidden="true">
        <div className="lanyard-back-copy" style={{ padding: `${31 * scale}px ${18 * scale}px` }}>
          <strong className="lanyard-card-name" style={{ fontSize: 19 * scale }}>{name}</strong>
          <span className="lanyard-card-role" style={{ fontSize: 7 * scale }}>{role}</span>
          <span className="lanyard-card-rule" />
          <span className="lanyard-back-detail" style={{ fontSize: 8 * scale }}>{skills}</span>
          <span className="lanyard-back-detail" style={{ fontSize: 8 * scale }}>{location}</span>
        </div>
        <div className="lanyard-status" style={{ minHeight: 55 * scale, padding: `${10 * scale}px ${14 * scale}px`, fontSize: 8 * scale }}>
          {status}
        </div>
      </div>
    </>
  );
}

function CardFrame() {
  const ornaments = (strokeWidth: number) => (
    <>
      {[{ x: 228, y: 12 }, { x: 12, y: 348 }].map(({ x, y }, index) => (
        <g key={index} transform={`translate(${x} ${y})`} strokeWidth={strokeWidth}>
          {[80, 72, 49.6, 20.8].map((radius) => (
            <circle key={radius} r={radius} />
          ))}
          {Array.from({ length: 16 }, (_, petal) => (
            <ellipse
              key={`petal-${petal}`}
              cy={-80 * 0.76}
              rx={80 * 0.07}
              ry={80 * 0.13}
              transform={`rotate(${(petal / 16) * 360})`}
            />
          ))}
          {Array.from({ length: 8 }, (_, petal) => (
            <path
              key={`leaf-${petal}`}
              d="M 0 -20.8 C 9.6 -32 8 -41.6 0 -48 C -8 -41.6 -9.6 -32 0 -20.8 Z"
              transform={`rotate(${(petal / 8) * 360})`}
            />
          ))}
          {Array.from({ length: 16 }, (_, bead) => (
            <circle key={`bead-${bead}`} cy={-76} r={1.44} transform={`rotate(${(bead / 16) * 360})`} />
          ))}
        </g>
      ))}
    </>
  );

  return (
    <svg
      className="lanyard-frame"
      aria-hidden="true"
      viewBox="0 0 240 360"
      fill="none"
      style={{ color: "var(--btn)" }}
    >
      <defs>
        <clipPath id="lanyard-frame-clip">
          <rect x="12" y="12" width="216" height="336" rx="14" />
        </clipPath>
      </defs>
      <g clipPath="url(#lanyard-frame-clip)">
        <g stroke="var(--deep)" strokeWidth="3" opacity=".3">
          <rect x="12" y="12" width="216" height="336" rx="14" />
          <rect x="17" y="17" width="206" height="326" rx="10" strokeWidth="1.5" />
          {ornaments(2.4)}
        </g>
        <g stroke="currentColor" opacity=".75">
          <rect x="12" y="12" width="216" height="336" rx="14" strokeWidth="1.5" />
          <rect x="17" y="17" width="206" height="326" rx="10" strokeWidth=".75" />
          {ornaments(1.2)}
        </g>
      </g>
    </svg>
  );
}
