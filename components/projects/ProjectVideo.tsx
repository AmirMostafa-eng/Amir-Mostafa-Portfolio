import Image from "next/image";
import { FiPlay } from "react-icons/fi";
import type { ProjectVideo as ProjectVideoType } from "@/types";

type ProjectVideoProps = { video: ProjectVideoType; cover: string; title: string };

export function ProjectVideo({ video, cover, title }: ProjectVideoProps) {
  if (video) {
    // TODO: Add a provider switch for YouTube and file videos in a later phase.
  }

  return (
    <div className="video-placeholder" role="img" aria-label={`${title} demo video coming soon`}>
      <Image src={cover} alt="" fill sizes="(max-width: 1200px) 100vw, 1200px" />
      <div className="video-overlay" aria-hidden="true">
        <span className="video-play"><FiPlay /></span>
        <span>Demo video coming soon</span>
      </div>
    </div>
  );
}
