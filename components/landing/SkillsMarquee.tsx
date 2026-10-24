"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { skills, type Skill } from "@/data/skills";

function SkillList({ row, duplicate = false }: { row: 1 | 2; duplicate?: boolean }) {
  const rowSkills = skills.filter((skill) => skill.row === row);

  return (
    <ul className="skill-marquee-copy" aria-hidden={duplicate || undefined}>
      {rowSkills.map((skill: Skill) => {
        const Icon = skill.icon;
        return (
          <li
            className="skill-marquee-chip"
            key={`${row}-${skill.name}`}
            style={{ "--skill-color": skill.colorOnDark ?? skill.color ?? "var(--text)" } as CSSProperties}
          >
            <Icon className="skill-marquee-icon" aria-hidden="true" focusable="false" />
            <span>{skill.name}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function SkillsMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observedSection = marqueeRef.current?.closest("#skills");
    if (!observedSection) return;
    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    });
    observer.observe(observedSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="skills-marquee" ref={marqueeRef} data-paused={!isInView}>
      <div className="skill-marquee-rows">
        {[1, 2].map((row) => (
          <div className={`skill-marquee-row skill-marquee-row-${row}`} key={row} role="group" aria-label={`Skills row ${row}`}>
            <div className="skill-marquee-track">
              <SkillList row={row as 1 | 2} />
              {[0, 1, 2].map((copy) => <SkillList row={row as 1 | 2} duplicate key={copy} />)}
            </div>
          </div>
        ))}
      </div>
      <p className="skills-marquee-caption">
        Also: REST API integration, React Hooks and Context API, responsive design, cross-browser compatibility, Paymob payments
      </p>
    </div>
  );
}
