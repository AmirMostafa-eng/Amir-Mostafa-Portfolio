import { About } from "@/components/landing/About";
import { FeaturedProjects } from "@/components/landing/FeaturedProjects";
import { Hero } from "@/components/landing/Hero";
import { Skills } from "@/components/landing/Skills";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Skills />
      <About />
      <FeaturedProjects />
    </main>
  );
}
