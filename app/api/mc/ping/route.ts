import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

type Body = {
  sessionId: string;
  selectedPrice: number;
  landingPath?: string;
  referrer?: string;
  utm?: Partial<Record<"source" | "medium" | "campaign" | "content" | "term", string>>;
  click?: Partial<Record<"gclid" | "fbclid" | "msclkid", string>>;
};

const ALLOWED = new Set([0, 9, 19, 39, 59, 79]);

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = (body.sessionId || "").trim();
  const selectedPrice = body.selectedPrice;

  if (!sessionId || sessionId.length < 8) {
    return NextResponse.json({ ok: false, error: "Missing sessionId" }, { status: 400 });
  }
  if (!ALLOWED.has(selectedPrice)) {
    return NextResponse.json({ ok: false, error: "Invalid selectedPrice" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL missing" }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);
  const ua = req.headers.get("user-agent") || null;

  await sql`
    INSERT INTO mc_intent (
      session_id, selected_price,
      landing_path, referrer,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      gclid, fbclid, msclkid,
      user_agent
    ) VALUES (
      ${sessionId}, ${selectedPrice},
      ${body.landingPath ?? null}, ${body.referrer ?? null},
      ${body.utm?.source ?? null}, ${body.utm?.medium ?? null}, ${body.utm?.campaign ?? null},
      ${body.utm?.content ?? null}, ${body.utm?.term ?? null},
      ${body.click?.gclid ?? null}, ${body.click?.fbclid ?? null}, ${body.click?.msclkid ?? null},
      ${ua}
    )
    ON CONFLICT (session_id) DO UPDATE SET
      selected_price = EXCLUDED.selected_price,
      landing_path = EXCLUDED.landing_path,
      referrer = EXCLUDED.referrer,
      utm_source = EXCLUDED.utm_source,
      utm_medium = EXCLUDED.utm_medium,
      utm_campaign = EXCLUDED.utm_campaign,
      utm_content = EXCLUDED.utm_content,
      utm_term = EXCLUDED.utm_term,
      gclid = EXCLUDED.gclid,
      fbclid = EXCLUDED.fbclid,
      msclkid = EXCLUDED.msclkid,
      user_agent = EXCLUDED.user_agent
  `;

  return NextResponse.json({ ok: true });
}