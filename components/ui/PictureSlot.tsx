import Image from "next/image";
import type { CSSProperties, Ref } from "react";
import type { RevealFrom } from "./Reveal";

type PictureSlotProps = {
  src: string | null;
  alt?: string;
  className?: string;
  sizes?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
  "data-reveal-from"?: RevealFrom;
  "data-revealed"?: "true" | "false";
  "data-reveal-instant"?: "true" | "false";
};

export function PictureSlot({
  src,
  alt = "",
  className = "",
  sizes = "(max-width: 640px) 100vw, 45vw",
  style,
  ref,
  "data-reveal-from": revealFrom,
  "data-revealed": revealed,
  "data-reveal-instant": revealInstant,
}: PictureSlotProps) {
  return (
    <div
      ref={ref}
      className={`picture-slot ${className}`.trim()}
      style={style}
      data-reveal-from={revealFrom}
      data-revealed={revealed}
      data-reveal-instant={revealInstant}
      aria-hidden={src ? undefined : true}
    >
      {src ? <Image src={src} alt={alt} fill sizes={sizes} /> : null}
      {/* <Image src="/images/Developer Avatar Coding in Chair.png" alt={alt} fill sizes={sizes} /> */}
    </div>
  );
}
