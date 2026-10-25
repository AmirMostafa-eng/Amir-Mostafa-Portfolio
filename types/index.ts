export type Tech = {
  slug: string;
  name: string;
  category: "framework" | "styling" | "tool" | "backend";
  featuredSkill: boolean;
};

export type ProjectVideo =
  | null
  | { provider: "youtube"; id: string }
  | { provider: "file"; url: string };

export type Project = {
  slug: string;
  title: string;
  summary: string; // About 160 characters is the recommended length; cards clamp the display to three lines.
  description: string;
  techs: string[];
  cover: string;
  screenshots?: string[];
  links: { live?: string; repo?: string };
  video: ProjectVideo;
  featured: boolean;
  year: number;
  learned?: string[];
};
