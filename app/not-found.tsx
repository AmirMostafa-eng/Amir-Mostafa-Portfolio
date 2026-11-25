import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="page-main">
      <Container>
        <div className="nf404">
          <div className="nf404-grid">
            <div className="nf404-hero">
              <span className="nf404-num" data-text="404" aria-hidden="true">404</span>
              <span className="nf404-pill">HTTP 404</span>
            </div>
            <div className="nf404-win" aria-hidden="true">
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
            </div>
          </div>
          <h1>Page not found</h1>
          <p>The page you’re looking for may have moved or no longer exists.</p>
          <div className="nf404-links">
            <Button href="/">Back to home</Button>
            <Link href="/projects" className="button button-secondary">Browse projects</Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
