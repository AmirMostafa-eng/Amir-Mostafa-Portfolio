import Image from "next/image";

type PictureSlotProps = {
  src: string | null;
  alt?: string;
  className?: string;
  sizes?: string;
};

export function PictureSlot({ src, alt = "", className = "", sizes = "(max-width: 640px) 100vw, 45vw" }: PictureSlotProps) {
  return (
    <div className={`picture-slot ${className}`.trim()} aria-hidden={src ? undefined : true}>
      {src ? <Image src={src} alt={alt} fill sizes={sizes} /> : null}
    </div>
  );
}
