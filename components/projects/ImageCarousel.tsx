"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { ProjectImage } from "@/types";

type ImageCarouselProps = {
  title: string;
  images: ProjectImage[];
  priority: boolean;
};

export function ImageCarousel({ title, images, priority }: ImageCarouselProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const thumbnailRowRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollThumbnailIntoView = useCallback((index: number) => {
    const row = thumbnailRowRef.current;
    const thumbnail = thumbnailRefs.current[index];
    if (!row || !thumbnail) return;
    const left = thumbnail.offsetLeft - (row.clientWidth - thumbnail.clientWidth) / 2;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    row.scrollTo({ left, behavior });
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    viewer.scrollTo({ left: index * viewer.clientWidth, behavior });
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || images.length < 2) return;

    const observer = new IntersectionObserver((entries) => {
      const mostVisible = entries
        .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.6)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!mostVisible) return;
      const index = Number((mostVisible.target as HTMLElement).dataset.slideIndex);
      if (Number.isInteger(index)) setActiveIndex(index);
    }, { root: viewer, threshold: [0.6, 0.8, 1] });

    viewer.querySelectorAll<HTMLElement>("[data-slide-index]").forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [images.length]);

  useEffect(() => {
    if (images.length > 1) scrollThumbnailIntoView(activeIndex);
  }, [activeIndex, images.length, scrollThumbnailIntoView]);

  const handleViewerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" && activeIndex > 0) {
      event.preventDefault();
      scrollToIndex(activeIndex - 1);
    } else if (event.key === "ArrowRight" && activeIndex < images.length - 1) {
      event.preventDefault();
      scrollToIndex(activeIndex + 1);
    }
  };

  return (
    <div className="project-carousel">
      <div
        ref={viewerRef}
        className="project-carousel-viewer"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} screenshots`}
        tabIndex={0}
        onKeyDown={handleViewerKeyDown}
      >
        {images.map((image, index) => (
          <div
            className="project-carousel-slide"
            key={image.src}
            data-slide-index={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${images.length}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1248px) calc(100vw - 48px), 1200px"
              priority={priority && index === 0}
              loading={priority && index === 0 ? undefined : "lazy"}
            />
          </div>
        ))}
        {images.length > 1 ? (
          <>
            <button
              className="project-carousel-arrow project-carousel-arrow--previous"
              type="button"
              aria-label="Previous image"
              disabled={activeIndex === 0}
              onClick={() => scrollToIndex(activeIndex - 1)}
            >
              <FiChevronLeft aria-hidden="true" />
            </button>
            <button
              className="project-carousel-arrow project-carousel-arrow--next"
              type="button"
              aria-label="Next image"
              disabled={activeIndex === images.length - 1}
              onClick={() => scrollToIndex(activeIndex + 1)}
            >
              <FiChevronRight aria-hidden="true" />
            </button>
            <span className="project-carousel-counter" aria-live="polite">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="project-carousel-thumbnails" ref={thumbnailRowRef} role="group" aria-label="Choose an image">
          {images.map((image, index) => (
            <button
              ref={(element) => { thumbnailRefs.current[index] = element; }}
              className="project-carousel-thumbnail"
              key={image.src}
              type="button"
              aria-label={`Show image ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => {
                setActiveIndex(index);
                scrollToIndex(index);
              }}
            >
              <Image src={image.src} alt="" fill sizes="96px" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
