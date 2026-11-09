import Image from "next/image";

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
        <div className="lanyard-front-copy" style={{ padding: `${10 * scale}px ${14 * scale}px` }}>
          <strong className="lanyard-card-name" style={{ fontSize: 20 * scale }}>{name}</strong>
          {/* <span className="lanyard-card-role" style={{ fontSize: 7 * scale }}>{role}</span>
          <span className="lanyard-card-rule" />
          <span className="lanyard-card-footer" style={{ fontSize: 6 * scale }}>
            <span>PORTFOLIO</span>
            <span>2026</span>
          </span> */}
        </div>
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
