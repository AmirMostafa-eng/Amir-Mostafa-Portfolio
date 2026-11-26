import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vault",
  robots: { index: false, follow: false },
};

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function dayLabel(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return DAY_LETTERS[d.getUTCDay()];
}

function fmtTime(iso: string | null): string {
  if (!iso) return "never";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
}

export default async function VaultPage() {
  const s = await getStats();
  const maxWeek = Math.max(1, ...s.week.map((d) => d.total));
  const cards: { label: string; value: number; hint: string }[] = [
    { label: "Unique devices", value: s.unique, hint: "distinct browsers that opened the site" },
    { label: "Total visits", value: s.total, hint: "one per browsing session, however many pages" },
    { label: "Returning visits", value: s.returning, hint: "visits from browsers seen before" },
    { label: "Today", value: s.today, hint: "visits since midnight UTC" },
  ];
  return (
    <main className="vault">
      <Container className="vault-inner">
        <p className="vault-eyebrow">Private Page</p>
        <h1 className="vault-title">
          Visitor <span className="vault-amber">vault</span>
        </h1>

        <section className="vault-cards" aria-label="Headline numbers">
          {cards.map((c) => (
            <div className="vault-card" key={c.label}>
              <span className="vault-card-value">{c.value}</span>
              <span className="vault-card-label">{c.label}</span>
              <span className="vault-card-hint">{c.hint}</span>
            </div>
          ))}
        </section>

        <section className="vault-panel" aria-label="Last 7 days">
          <h2 className="vault-panel-title">Visits, last 7 days</h2>
          <div className="vault-chart">
            {s.week.map((d) => (
              <div className="vault-bar-col" key={d.date}>
                <span className="vault-bar-value">{d.total}</span>
                <div className="vault-bar-track">
                  <div className="vault-bar" style={{ height: `${Math.round((d.total / maxWeek) * 100)}%` }} />
                </div>
                <span className="vault-bar-day">{dayLabel(d.date)}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="vault-lists">
          <VaultList title="Pages viewed" rows={s.pages} empty="no visits yet" />
          <VaultList title="Referrers (per visit)" rows={s.refs} empty="no referrers yet" />
          <VaultList title="Countries (per visit)" rows={s.countries} empty="no countries yet" />
        </div>

        <p className="vault-foot">
          Last visit: {fmtTime(s.lastVisit)} - refresh to see new numbers. Raw JSON lives at{" "}
          <code>/api/visitors</code>.
        </p>
      </Container>
    </main>
  );
}

function VaultList({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <section className="vault-panel" aria-label={title}>
      <h2 className="vault-panel-title">{title}</h2>
      {rows.length === 0 ? (
        <p className="vault-empty">{empty}</p>
      ) : (
        <ul className="vault-rows">
          {rows.map(([name, n]) => (
            <li className="vault-row" key={name}>
              <span className="vault-row-name">{name}</span>
              <span className="vault-row-count">{n}</span>
              <span className="vault-row-bar" style={{ width: `${Math.round((n / max) * 100)}%` }} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
