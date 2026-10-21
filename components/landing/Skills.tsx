import { FiCode, FiDatabase, FiGitBranch, FiLayout, FiWind, FiZap, FiEye } from "react-icons/fi";
import type { ComponentType, SVGProps } from "react";
import { getFeaturedSkills } from "@/lib/projects";
import { site } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";

const icons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  react: FiCode,
  nextjs: FiLayout,
  typescript: FiCode,
  tailwindcss: FiWind,
  javascript: FiZap,
  nodejs: FiCode,
  firebase: FiDatabase,
  git: FiGitBranch,
  accessibility: FiEye,
};

export async function Skills() {
  const skills = await getFeaturedSkills();
  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <Container>
        <SectionHeading title="Tools I work with" description={site.skillsIntro} id="skills-title" />
        <div className="skills-grid">
          {skills.map((skill) => {
            const Icon = icons[skill.slug] ?? FiCode;
            return <div className="skill-tile" key={skill.slug}><Icon className="skill-icon" aria-hidden="true" /><span>{skill.name}</span></div>;
          })}
        </div>
      </Container>
    </section>
  );
}
