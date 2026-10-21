import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="page-main">
      <Container>
        <div className="not-found">
          <h1>Page not found</h1>
          <p>The page you’re looking for may have moved or no longer exists.</p>
          <div className="not-found-links">
            <Button href="/">Back to home</Button>
            <Link href="/projects" className="button button-secondary">Browse projects</Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
