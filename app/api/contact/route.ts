import { NextResponse } from "next/server";

type ContactPayload = { name?: unknown; email?: unknown; message?: unknown; website?: unknown };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
  const body = payload as ContactPayload;

  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!name || !emailPattern.test(email) || !message) {
    return NextResponse.json({ ok: false, error: "Name, a valid email, and a message are required." }, { status: 400 });
  }

  // TODO: Connect a real message delivery service in a later phase.
  return NextResponse.json({ ok: true });
}
