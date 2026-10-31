"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiPlay } from "react-icons/fi";
import type { ProjectVideo as ProjectVideoType } from "@/types";

type VideoEmbedProps = { video: ProjectVideoType; title: string; poster?: string };

type ClickToLoadVideo = Extract<Exclude<ProjectVideoType, null>, { provider: "vimeo" | "wistia" }>;

function getEmbedUrl(video: ClickToLoadVideo): string {
  switch (video.provider) {
    case "vimeo":
      return `https://player.vimeo.com/video/${encodeURIComponent(video.id)}${video.hash ? `?h=${encodeURIComponent(video.hash)}&autoplay=1` : "?autoplay=1"}`;
    case "wistia":
      return `https://fast.wistia.net/embed/iframe/${encodeURIComponent(video.id)}?autoPlay=true`;
  }
}

export function VideoEmbed({ video, title, poster }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isPlaying) iframeRef.current?.focus();
  }, [isPlaying]);

  if (!video || video.provider === "youtube" || video.provider === "file") {
    return (
      <div className="video-placeholder" role="img" aria-label={`${title} demo video coming soon`}>
        {poster ? <Image src={poster} alt="" fill sizes="(max-width: 1200px) 100vw, 1200px" /> : null}
        <div className="video-overlay" aria-hidden="true">
          <span className="video-play"><FiPlay /></span>
          <span>Demo video coming soon</span>
        </div>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className="project-video-frame">
        <iframe
          ref={iframeRef}
          className="project-video-player"
          src={getEmbedUrl(video)}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          width="100%"
          height="100%"
          tabIndex={-1}
        />
      </div>
    );
  }

  return (
    <div className="project-video-frame">
      {poster ? <Image className="project-video-poster" src={poster} alt="" fill sizes="(max-width: 1200px) 100vw, 1200px" /> : null}
      <button
        className="project-video-control"
        type="button"
        aria-label={`Play video: ${title}`}
        onClick={() => setIsPlaying(true)}
      >
        <span className="project-video-play-icon" aria-hidden="true"><FiPlay /></span>
      </button>
    </div>
  );
}


