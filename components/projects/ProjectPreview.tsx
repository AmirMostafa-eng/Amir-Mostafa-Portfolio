"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { ProjectImage, ProjectVideo } from "@/types";
import { ImageCarousel } from "@/components/projects/ImageCarousel";
import { VideoEmbed } from "@/components/projects/VideoEmbed";

type PreviewOption = "images" | "video";

type ProjectPreviewProps = {
  title: string;
  video: ProjectVideo;
  poster?: string;
  images?: ProjectImage[];
};

export function ProjectPreview({ title, video, poster, images = [] }: ProjectPreviewProps) {
  const hasVideo = video !== null;
  const hasImages = images.length > 0;
  const [selected, setSelected] = useState<PreviewOption>(hasVideo ? "video" : "images");
  const id = useId();
  const tabRefs = useRef<Record<PreviewOption, HTMLButtonElement | null>>({ images: null, video: null });

  if (!hasVideo && !hasImages) {
    return <VideoEmbed video={video} poster={poster} title={title} />;
  }

  const imageTabId = `${id}-images-tab`;
  const videoTabId = `${id}-video-tab`;
  const panelId = `${id}-panel`;

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const enabledOptions: PreviewOption[] = [];
    if (hasImages) enabledOptions.push("images");
    if (hasVideo) enabledOptions.push("video");
    const currentIndex = enabledOptions.indexOf(selected);
    let nextOption: PreviewOption | undefined;

    switch (event.key) {
      case "ArrowLeft":
        nextOption = enabledOptions[(currentIndex - 1 + enabledOptions.length) % enabledOptions.length];
        break;
      case "ArrowRight":
        nextOption = enabledOptions[(currentIndex + 1) % enabledOptions.length];
        break;
      case "Home":
        nextOption = enabledOptions[0];
        break;
      case "End":
        nextOption = enabledOptions[enabledOptions.length - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    if (nextOption) {
      setSelected(nextOption);
      tabRefs.current[nextOption]?.focus();
    }
  };

  return (
    <section className="project-preview" aria-label={`${title} preview`}>
      <div className="project-preview-tabs" role="tablist" aria-label="Preview options">
        <button
          ref={(element) => { tabRefs.current.images = element; }}
          className="project-preview-tab"
          id={imageTabId}
          type="button"
          role="tab"
          aria-selected={selected === "images"}
          aria-controls={panelId}
          tabIndex={selected === "images" ? 0 : -1}
          disabled={!hasImages}
          onClick={() => setSelected("images")}
          onKeyDown={handleTabKeyDown}
        >
          <span className="project-preview-tab-label">Images</span>
        </button>
        <button
          ref={(element) => { tabRefs.current.video = element; }}
          className="project-preview-tab"
          id={videoTabId}
          type="button"
          role="tab"
          aria-selected={selected === "video"}
          aria-controls={panelId}
          tabIndex={selected === "video" ? 0 : -1}
          disabled={!hasVideo}
          onClick={() => setSelected("video")}
          onKeyDown={handleTabKeyDown}
        >
          <span className="project-preview-tab-label">Demo video</span>
        </button>
      </div>
      <div
        className="project-preview-panel"
        id={panelId}
        role="tabpanel"
        aria-labelledby={selected === "images" ? imageTabId : videoTabId}
        tabIndex={0}
      >
        {selected === "images" ? (
          <ImageCarousel title={title} images={images} priority={!hasVideo} />
        ) : (
          <VideoEmbed video={video} poster={poster} title={title} />
        )}
      </div>
    </section>
  );
}
