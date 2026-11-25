import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="page-main">
      <Container>
        <div className="nf404">
          <div className="nf404-grid">
            <Reveal from="up" delay={100}><div className="nf404-hero">
              <span className="nf404-num" data-text="404" aria-hidden="true">404</span>
              <span className="nf404-pill">HTTP 404</span>
            </div></Reveal>
            <Reveal from="up" delay={200}><div className="nf404-win" aria-hidden="true">
              <div className="nf404-bar">
                <span className="nf404-dots"><i /><i /><i /></span>
                <span>not-found.tsx</span>
              </div>
              <pre className="nf404-code">
                <span className="k">export default function</span> <span className="f">NotFound</span>() {"{"}
                {"\n  "}<span className="k">const</span> page = <span className="f">find</span>(<span className="s">&quot;/this-page&quot;</span>);
                {"\n  "}<span className="k">if</span> (!page) {"{"}
                {"\n    "}<span className="k">return</span> <span className="a">404</span>; <span className="m">{"// not here"}</span>
                {"\n  }\n}"}
              </pre>
            </div></Reveal>
          </div>
          <Reveal from="up" delay={300}><h1>Page not found</h1></Reveal>
          <Reveal from="up" delay={380}><p>The page you’re looking for may have moved or no longer exists.</p></Reveal>
          <Reveal from="up" delay={460}><div className="nf404-links">
            <Button href="/">Back to home</Button>
            <Link href="/projects" className="button button-secondary">Browse projects</Link>
          </div></Reveal>
        </div>
      </Container>
    </main>
  );
}
