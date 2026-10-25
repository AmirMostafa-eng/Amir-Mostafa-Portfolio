"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FiArrowUp, FiDownload } from "react-icons/fi";
import { SiGmail } from "react-icons/si";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { scrollToTarget } from "@/lib/scroll";


export function Footer() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLSpanElement>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    const footer = footerRef.current;
    const watermark = watermarkRef.current;
    if (!footer || !watermark) return;

    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsMagnet = window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    const cleanups: Array<() => void> = [];
    let active = true;

    const context = gsap.context(() => {
      if (!reducedMotion) {
        gsap.fromTo(watermark,
          { yPercent: 25, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              start: "top 85%",
              end: "top 15%",
              scrub: 0.6,
            },
          },
        );
      }

      if (!supportsMagnet) return;

      footer.querySelectorAll<HTMLAnchorElement>("[data-magnetic]").forEach((target) => {
        const quickX = gsap.quickTo(target, "x", { duration: 0.4, ease: "power2.out", overwrite: "auto" });
        const quickY = gsap.quickTo(target, "y", { duration: 0.4, ease: "power2.out", overwrite: "auto" });
        const quickScale = gsap.quickTo(target, "scale", { duration: 0.4, ease: "power2.out", overwrite: "auto" });
        let centerX = 0;
        let centerY = 0;

        const onPointerEnter = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          const bounds = target.getBoundingClientRect();
          centerX = bounds.left + bounds.width / 2;
          centerY = bounds.top + bounds.height / 2;
          quickScale(1.04);
        };
        const onPointerMove = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          quickX((event.clientX - centerX) * 0.3);
          quickY((event.clientY - centerY) * 0.3);
        };
        const onPointerLeave = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          quickX(0);
          quickY(0);
          quickScale(1);
        };

        target.addEventListener("pointerenter", onPointerEnter);
        target.addEventListener("pointermove", onPointerMove);
        target.addEventListener("pointerleave", onPointerLeave);
        cleanups.push(() => {
          target.removeEventListener("pointerenter", onPointerEnter);
          target.removeEventListener("pointermove", onPointerMove);
          target.removeEventListener("pointerleave", onPointerLeave);
          gsap.killTweensOf(target);
        });
      });
    }, footer);

    document.fonts?.ready.then(() => {
      if (active) ScrollTrigger.refresh();
    });

    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, [pathname]);


  const handleBackToTop = () => {
    if (pathname === "/") {
      scrollToTarget(document.getElementById("hero"));
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  return (
    <footer className="site-footer" id="contact" ref={footerRef}>
      <span className="footer-watermark" aria-hidden="true" ref={watermarkRef}>AMIR</span>
      <Container className="footer-container">
        <div className="footer-main">
          
          <Reveal from="up" trigger="view" delay={80}>
            <h2 className="footer-title">Let’s work together</h2>
          </Reveal>
          <Reveal from="up" trigger="view" delay={160}>
            <p className="footer-blurb">{site.footerBlurb}</p>
          </Reveal>
          <Reveal from="up" trigger="view" delay={240}>
            <div className="footer-contact-links">
              <a className="footer-contact-pill" href={site.socials.github} target="_blank" rel="noopener noreferrer" data-magnetic>
                <FaGithub aria-hidden="true" /><span>GitHub</span><span className="sr-only">(opens in a new tab)</span>
              </a>
              <a className="footer-contact-pill" href={site.socials.linkedin} target="_blank" rel="noopener noreferrer" data-magnetic>
                <FaLinkedin aria-hidden="true" /><span>LinkedIn</span><span className="sr-only">(opens in a new tab)</span>
              </a>
              <a className="footer-contact-pill" href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noopener noreferrer" data-magnetic>
                <FaWhatsapp aria-hidden="true" /><span>WhatsApp</span><span className="sr-only">(opens in a new tab)</span>
              </a>
              <a className="footer-contact-pill" href={`mailto:${site.email}`} data-magnetic>
                <SiGmail aria-hidden="true" /><span>Email</span>
              </a>
            </div>
          </Reveal>
          <Reveal from="up" trigger="view" delay={320}>
            <p className="footer-email">{site.email}</p>
          </Reveal>
          <Reveal from="up" trigger="view" delay={400}>
            <a className="button button-primary footer-cv-button" href={site.cvUrl} data-magnetic>
              <FiDownload aria-hidden="true" />Download CV
            </a>
          </Reveal>
        </div>

        <Reveal from="up" trigger="view" delay={450}>
          <div className="footer-bottom-row">
            <p className="footer-copyright">© {year} {site.name} • All rights reserved.</p>
            <button className="footer-back-top" type="button" aria-label="Back to top" onClick={handleBackToTop}>
              <FiArrowUp aria-hidden="true" />
            </button>
          </div>
        </Reveal>
      </Container>
    </footer>
  );
}
