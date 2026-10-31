import type { Tech } from "@/types";

type TechListProps = { techs: Tech[]; label: string; maxItems?: number };

export function TechList({ techs, label, maxItems }: TechListProps) {
  const visibleTechs = maxItems ? techs.slice(0, maxItems) : techs;
  const remainingCount = techs.length - visibleTechs.length;
  const className = maxItems ? "tech-list project-tech-list" : "tech-list badge-list";

  return (
    <ul className={className} aria-label={label}>
      {visibleTechs.map((tech) => <li className="tech-badge" key={tech.slug}>{tech.name}</li>)}
      {remainingCount > 0 ? (
        <li className="tech-badge tech-badge-more">
          +{remainingCount}<span className="sr-only">and {remainingCount} more technologies</span>
        </li>
      ) : null}
    </ul>
  );
}
