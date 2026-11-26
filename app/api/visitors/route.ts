import { NextRequest } from "next/server";
import { getStats, recordVisit } from "@/lib/stats";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  let body: { id?: unknown; page?: unknown; ref?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID_RE.test(id)) return new Response(null, { status: 400 });

  let page = typeof body.page === "string" ? body.page.split("?")[0] : "/";
  if (!page.startsWith("/") || page.length > 120) page = "/";
  // Never count the stats page itself or API calls.
  if (page.startsWith("/visitors") || page.startsWith("/api")) {
    return new Response(null, { status: 204 });
  }

  let ref = "direct";
  if (typeof body.ref === "string" && body.ref) {
    try {
      ref = new URL(body.ref).hostname.replace(/^www\./, "") || "direct";
    } catch {
      ref = "direct";
    }
  }
  const country = req.headers.get("x-vercel-ip-country") ?? "local";

  try {
    await recordVisit({ id, page, ref, country });
  } catch (e) {
    return Response.json({ debug: String(e) }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}

export async function GET() {
  try {
    const stats = await getStats();
    return Response.json({ ...stats, v: "debug1" });
  } catch (e) {
    return Response.json({ v: "debug1", debug: String(e) }, { status: 500 });
  }
}
