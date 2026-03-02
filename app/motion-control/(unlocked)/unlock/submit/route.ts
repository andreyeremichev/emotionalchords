import { NextResponse } from "next/server";
import { incrStep, incrAmount, incrIntent } from "@/lib/mcExperiment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AMOUNT_ALLOWED = new Set(["0", "9", "19", "39", "59", "79", "custom"]);
const INTENT_ALLOWED = new Set(["pay_now_if_possible", "pay_later_if_clicks", "free_or_browsing"]);

export async function POST(req: Request) {
  const url = new URL(req.url);
  const sp = Object.fromEntries(url.searchParams.entries());

  const form = await req.formData();
  const amount_bucket = String(form.get("amount_bucket") ?? "").trim();
  const intent = String(form.get("intent") ?? "").trim();

  if (!AMOUNT_ALLOWED.has(amount_bucket)) {
    return NextResponse.json({ ok: false, error: "invalid amount_bucket" }, { status: 400 });
  }
  if (!INTENT_ALLOWED.has(intent)) {
    return NextResponse.json({ ok: false, error: "invalid intent" }, { status: 400 });
  }

  await incrStep(sp, "unlock_complete");
  await incrAmount(sp, amount_bucket as any);
  await incrIntent(sp, intent as any);

  const qs = url.searchParams.toString();
  const extra = qs ? `&${qs}` : "";

  const amt = amount_bucket === "custom" ? "custom" : amount_bucket;

  // Redirect through a view-counter route for Full Arc
  const dest =
    `/motion-control/full-arc/view?unlocked=1&amt=${encodeURIComponent(amt)}&intent=${encodeURIComponent(intent)}${extra}`;

  return NextResponse.redirect(new URL(dest, req.url), 303);
}