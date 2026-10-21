import { About } from "@/components/landing/About";
import { Contact } from "@/components/landing/Contact";
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
      <Contact />
    </main>
  );
}
